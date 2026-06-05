/**
 * STORY-004 #26: read the canonical test docs into the step-store.
 *
 * The markdown under tests/ is the source of truth (files stay canonical); the
 * step-store is a *derived* index over it — the same discipline as regen.ts.
 * Each step row of a test doc (one `Action — Expected Result`) becomes one step
 * row, embedded for search, with provenance linking back to its {namespace, TS,
 * TC, story, script, doc} parent (the parent-document pattern). Re-running
 * replaces this repo's test-doc rows, so it is idempotent.
 *
 * Run: npm run load-tests   (needs the stack up: `make up`)
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from './db.js';
import { embed, toVectorLiteral } from './embed.js';
import { readScenario, scenarioFiles, stepText } from './testdoc.js';

const TESTS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'tests');

interface TestStep {
  text: string; // "Action — Expected Result"
  namespace: string;
  provenance: Record<string, unknown>;
}

/** Pull every step out of one scenario file, with parent-linkage provenance. */
function docSteps(file: string, relPath: string): TestStep[] {
  const { frontMatter: fm, cases } = readScenario(file);
  const namespace = fm.namespace ?? 'default';
  const out: TestStep[] = [];
  for (const c of cases) {
    c.steps.forEach((s, i) => {
      out.push({
        text: stepText(s),
        namespace,
        provenance: {
          namespace, ts: fm.id, tc: c.tc, tc_title: c.title,
          story: fm.story ?? null, script: c.script, doc: relPath, step: i + 1,
        },
      });
    });
  }
  return out;
}

/** Read every tests/*.md (except README), in stable order. */
function loadAll(): TestStep[] {
  const out: TestStep[] = [];
  for (const f of scenarioFiles(TESTS_DIR)) {
    out.push(...docSteps(join(TESTS_DIR, f), `tests/${f}`));
  }
  return out;
}

async function load() {
  const steps = loadAll();
  const namespaces = [...new Set(steps.map((s) => s.namespace))];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Idempotent: drop the prior test-doc rows for the namespaces this load
    // covers, then re-insert. (Limitation: rows under a namespace no longer
    // present in tests/ — e.g. a doc's namespace was renamed or every doc
    // removed — are not swept here; that needs a per-repo owned-namespace,
    // tracked as a follow-up.)
    await client.query(
      `DELETE FROM step WHERE src = 'test-doc' AND namespace = ANY($1)`,
      [namespaces],
    );
    for (const s of steps) {
      const v = toVectorLiteral(await embed(s.text));
      await client.query(
        `INSERT INTO step (text, embedding, conf, src, kind, namespace, provenance)
         VALUES ($1, $2::vector, 1.0, 'test-doc', 'step', $3, $4::jsonb)`,
        [s.text, v, s.namespace, JSON.stringify(s.provenance)],
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  console.error(
    `[load-tests] indexed ${steps.length} step(s) from ${namespaces.length} namespace(s): ${namespaces.join(', ')}`,
  );
  await pool.end();
}

load().catch((err) => {
  console.error('[load-tests] failed:', err);
  process.exit(1);
});
