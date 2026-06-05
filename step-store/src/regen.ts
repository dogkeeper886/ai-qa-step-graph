/**
 * STORY-001 #6: derived-index discipline.
 *
 * The canonical confirmed steps live in files (steps/*.jsonl) — those are the
 * source of truth. The pgvector store is a *derived* index: this command wipes
 * it and rebuilds it from the canonical files, so it never becomes a second
 * source of truth. Re-running it yields the same queryable result.
 *
 * Run: npm run regen   (needs the stack up: `docker compose up -d`)
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from './db.js';
import { embed, toVectorLiteral } from './embed.js';

const STEPS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'steps');

interface CanonicalStep {
  text: string;
  conf?: number;
  src?: string;
  provenance?: unknown;
}

/** Load every confirmed step from the canonical .jsonl files, in stable order. */
function loadCanonical(): CanonicalStep[] {
  const steps: CanonicalStep[] = [];
  for (const file of readdirSync(STEPS_DIR).filter((f) => f.endsWith('.jsonl')).sort()) {
    const lines = readFileSync(join(STEPS_DIR, file), 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) steps.push(JSON.parse(line));
  }
  return steps;
}

async function regen() {
  const steps = loadCanonical();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Rebuild only the canonical slice. Test-doc rows are a separate derived
    // index (load-tests.ts, src='test-doc') and own their own rows — don't wipe them.
    await client.query(`DELETE FROM step WHERE src IS DISTINCT FROM 'test-doc'`);
    for (const s of steps) {
      const v = toVectorLiteral(await embed(s.text));
      await client.query(
        `INSERT INTO step (text, embedding, conf, src, provenance)
         VALUES ($1, $2::vector, $3, $4, $5::jsonb)`,
        [s.text, v, s.conf ?? 1.0, s.src ?? 'canonical',
         s.provenance == null ? null : JSON.stringify(s.provenance)],
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  console.error(`[regen] rebuilt store from ${steps.length} canonical step(s)`);
  await pool.end();
}

regen().catch((err) => {
  console.error('[regen] failed:', err);
  process.exit(1);
});
