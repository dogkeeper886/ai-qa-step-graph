/**
 * STORY-001 #4: the step-store operations behind the MCP tools.
 *
 * searchStep — find confirmed steps whose meaning is nearest the phrase.
 * addStep    — add a confirmed step so it is findable by meaning next time.
 */
import { pool } from './db.js';
import { embed, toVectorLiteral } from './embed.js';

/** Default cosine-distance cutoff for "this means the same step". */
export const DEFAULT_MAX_DISTANCE = 0.35;

/**
 * Cosine-distance cutoff for "this IS a step already stored" — entity
 * resolution on add. Much tighter than the search cutoff on purpose: measured
 * on this model, near-identical phrasings (casing, articles, minor word order,
 * verb swaps, hyphenation) all fall ≤ ~0.11, while *antonym* steps that share
 * wording — "start the containers" vs "stop the containers" ≈ 0.21 — sit closer
 * than genuine loose paraphrases ("log in" vs "sign in" ≈ 0.25). So distance
 * alone cannot tell same-from-opposite in that looser band; 0.15 collapses the
 * true duplicates and stops short of the danger zone. See #8.
 */
export const DEFAULT_RESOLUTION_DISTANCE = 0.15;

/** Fixed key for the advisory lock that serializes add_step's resolve+insert
 *  (#48). Arbitrary, but must stay unique among advisory locks in this DB. */
const ADD_STEP_LOCK = 770845;

export interface StepHit {
  id: number;
  text: string;
  conf: number;
  src: string | null;
  namespace: string | null;
  distance: number; // cosine distance (0 = identical meaning)
}

/**
 * Return confirmed steps nearest `phrase` by meaning, closest first.
 * `namespace` scopes the search to one repo/tenant when given (a filter, not
 * isolation); omit it to search across all namespaces.
 */
export async function searchStep(
  phrase: string,
  k = 5,
  maxDistance = DEFAULT_MAX_DISTANCE,
  namespace: string | null = null,
): Promise<StepHit[]> {
  const v = toVectorLiteral(await embed(phrase));
  const { rows } = await pool.query(
    `SELECT id, text, conf, src, namespace, (embedding <=> $1::vector) AS distance
       FROM step
      WHERE (embedding <=> $1::vector) <= $3
        AND ($4::text IS NULL OR namespace = $4)
      ORDER BY embedding <=> $1::vector
      LIMIT $2`,
    [v, k, maxDistance, namespace],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    text: r.text,
    conf: Number(r.conf),
    src: r.src,
    namespace: r.namespace,
    distance: Number(r.distance),
  }));
}

export interface AddResult {
  id: number;
  /** true = reinforced a step that already existed by meaning (no new row). */
  resolved: boolean;
}

/**
 * Add a confirmed step. If a step within `DEFAULT_RESOLUTION_DISTANCE` already
 * exists by meaning, reinforce that node instead of inserting a duplicate;
 * otherwise insert a new node. Returns the node id and whether it resolved.
 *
 * Merge on resolve: keep the first-seen text and provenance (the canonical
 * node), raise its confidence to the higher of the two. Richer accumulation
 * (a reinforcement count, appended provenance) would need a schema column and
 * is left out of this core (#52).
 *
 * Concurrency (#48): pgvector has no "unique-if-near" index, so a bare
 * search-then-insert races — two concurrent adds of the same meaning both miss
 * and both insert. The resolve+insert runs in a transaction holding a single
 * advisory lock, making that section atomic; the embedding is computed before
 * the lock, so only the two fast queries serialize. A global lock (over a
 * per-embedding bucket) is deliberate: bucketing near-identical vectors has an
 * LSH boundary problem — neighbours can fall in different buckets and still
 * race — and the locked section is tiny. The lock serializes add-vs-add only;
 * regen/load-tests rebuild in their own transactions and assume no concurrent
 * live adds.
 */
export async function addStep(
  text: string,
  conf = 1.0,
  src: string | null = null,
  provenance: unknown = null,
  namespace: string | null = null,
): Promise<AddResult> {
  const v = toVectorLiteral(await embed(text)); // outside the lock — the slow part
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [ADD_STEP_LOCK]);
    // Resolve: is this the same step as one already stored *in the same namespace*?
    // Scoped like searchStep — a live add (namespace NULL) resolves against
    // canonical/other live steps, never against a namespaced test-doc row (which
    // load-tests rebuilds, and would otherwise swallow the add).
    const { rows: near } = await client.query(
      `SELECT id FROM step
        WHERE (embedding <=> $1::vector) <= $2
          AND namespace IS NOT DISTINCT FROM $3
        ORDER BY embedding <=> $1::vector
        LIMIT 1`,
      [v, DEFAULT_RESOLUTION_DISTANCE, namespace],
    );
    if (near.length) {
      const id = Number(near[0].id);
      await client.query(`UPDATE step SET conf = GREATEST(conf, $2) WHERE id = $1`, [id, conf]);
      await client.query('COMMIT');
      return { id, resolved: true };
    }
    const { rows } = await client.query(
      `INSERT INTO step (text, embedding, conf, src, namespace, provenance)
       VALUES ($1, $2::vector, $3, $4, $5, $6::jsonb)
       RETURNING id`,
      [text, v, conf, src, namespace, provenance === null ? null : JSON.stringify(provenance)],
    );
    await client.query('COMMIT');
    return { id: Number(rows[0].id), resolved: false };
  } catch (err) {
    // The connection may be dead (the original error); don't let a failing
    // ROLLBACK mask the real cause.
    try {
      await client.query('ROLLBACK');
    } catch {
      /* keep the original error */
    }
    throw err;
  } finally {
    client.release();
  }
}
