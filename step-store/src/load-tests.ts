/**
 * STORY-004 #26: read the canonical test docs into the step-store.
 *
 * The markdown under docs/tests/ is the source of truth (files stay canonical); the
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
import { readScenario, scenarioFiles, stepText, caseText } from './testdoc.js';

const TESTS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'tests');

interface TestRow {
  text: string; // step: "Action — Expected Result"; case: "Title — Objective"
  kind: 'step' | 'case';
  namespace: string;
  provenance: Record<string, unknown>;
}

/**
 * Pull every indexable row out of one scenario file, with parent-linkage
 * provenance. Two kinds (the parent-document pattern):
 *   - one `case` row per TC — its title + objective, *what the case verifies*
 *   - one `step` row per Steps-table row — its action + expected result
 */
function docRows(file: string, relPath: string): TestRow[] {
  const { frontMatter: fm, cases } = readScenario(file);
  const namespace = fm.namespace ?? 'default';
  const out: TestRow[] = [];
  for (const c of cases) {
    out.push({
      text: caseText(c),
      kind: 'case',
      namespace,
      provenance: {
        namespace, ts: fm.id, tc: c.tc, tc_title: c.title, objective: c.objective,
        story: fm.story ?? null, script: c.script, doc: relPath,
      },
    });
    c.steps.forEach((s, i) => {
      out.push({
        text: stepText(s),
        kind: 'step',
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

/** Read every docs/tests/*.md (except README), in stable order. */
function loadAll(): TestRow[] {
  const out: TestRow[] = [];
  for (const f of scenarioFiles(TESTS_DIR)) {
    out.push(...docRows(join(TESTS_DIR, f), `docs/tests/${f}`));
  }
  return out;
}

async function load() {
  const rows = loadAll();
  const namespaces = [...new Set(rows.map((s) => s.namespace))];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Idempotent: drop the prior test-doc rows for the namespaces this load
    // covers, then re-insert. (Limitation: rows under a namespace no longer
    // present in docs/tests/ — e.g. a doc's namespace was renamed or every doc
    // removed — are not swept here; that needs a per-repo owned-namespace,
    // tracked as a follow-up.)
    await client.query(
      `DELETE FROM step WHERE src = 'test-doc' AND namespace = ANY($1)`,
      [namespaces],
    );
    for (const s of rows) {
      const v = toVectorLiteral(await embed(s.text));
      await client.query(
        `INSERT INTO step (text, embedding, conf, src, kind, namespace, provenance)
         VALUES ($1, $2::vector, 1.0, 'test-doc', $3, $4, $5::jsonb)`,
        [s.text, v, s.kind, s.namespace, JSON.stringify(s.provenance)],
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  const caseCount = rows.filter((r) => r.kind === 'case').length;
  console.error(
    `[load-tests] indexed ${rows.length} row(s) (${caseCount} case(s) + ${rows.length - caseCount} step(s)) ` +
      `from ${namespaces.length} namespace(s): ${namespaces.join(', ')}`,
  );
  await pool.end();
}

load().catch((err) => {
  console.error('[load-tests] failed:', err);
  process.exit(1);
});
