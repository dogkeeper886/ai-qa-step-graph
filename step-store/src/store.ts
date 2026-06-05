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

/** Add a confirmed step; returns its id. */
export async function addStep(
  text: string,
  conf = 1.0,
  src: string | null = null,
  provenance: unknown = null,
): Promise<number> {
  const v = toVectorLiteral(await embed(text));
  const { rows } = await pool.query(
    `INSERT INTO step (text, embedding, conf, src, provenance)
     VALUES ($1, $2::vector, $3, $4, $5::jsonb)
     RETURNING id`,
    [text, v, conf, src, provenance === null ? null : JSON.stringify(provenance)],
  );
  return Number(rows[0].id);
}
