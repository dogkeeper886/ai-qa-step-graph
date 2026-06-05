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
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from './db.js';
import { embed, toVectorLiteral } from './embed.js';

const TESTS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'tests');

interface TestStep {
  text: string; // "Action — Expected Result"
  namespace: string;
  provenance: Record<string, unknown>;
}

/** Parse `key: value` front-matter between the first pair of `---` fences. */
function parseFrontMatter(md: string): Record<string, string> {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  const fm: Record<string, string> = {};
  if (!m) return fm;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*?)\s*$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}

/** Split a markdown table row into trimmed cells (drops the leading/trailing |). */
function tableCells(row: string): string[] {
  return row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
}

/** Pull every step out of one scenario file. */
function parseDoc(file: string, relPath: string): TestStep[] {
  const md = readFileSync(file, 'utf8');
  const fm = parseFrontMatter(md);
  const namespace = fm.namespace ?? 'default';
  const steps: TestStep[] = [];

  // Each `### TC-NN: title` starts a case; its block runs to the next ### or EOF.
  const tcRe = /^###\s+(TC-\d+):\s*(.*)$/gm;
  const matches = [...md.matchAll(tcRe)];
  for (let i = 0; i < matches.length; i++) {
    const tc = matches[i][1];
    const tcTitle = matches[i][2].trim();
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : md.length;
    const block = md.slice(start, end);

    const script = block.match(/\*\*Script:\*\*\s*(\S+)/)?.[1] ?? null;

    let n = 0;
    for (const line of block.split('\n')) {
      if (!line.trim().startsWith('|')) continue;
      const cells = tableCells(line);
      // skip header (`# | Action | …`) and separator (`---`); data rows start with a number
      if (cells.length < 3 || !/^\d+$/.test(cells[0])) continue;
      n++;
      const [, action, expected] = cells;
      const text = expected && expected !== '—' ? `${action} — ${expected}` : action;
      steps.push({
        text,
        namespace,
        provenance: {
          namespace, ts: fm.id, tc, tc_title: tcTitle,
          story: fm.story ?? null, script, doc: relPath, step: n,
        },
      });
    }
  }
  return steps;
}

/** Read every tests/*.md (except README), in stable order. */
function loadAll(): TestStep[] {
  const out: TestStep[] = [];
  for (const f of readdirSync(TESTS_DIR).filter((f) => f.endsWith('.md') && f !== 'README.md').sort()) {
    out.push(...parseDoc(join(TESTS_DIR, f), `tests/${f}`));
  }
  return out;
}

async function load() {
  const steps = loadAll();
  const namespaces = [...new Set(steps.map((s) => s.namespace))];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Idempotent: drop this repo's prior test-doc rows, then re-insert.
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
