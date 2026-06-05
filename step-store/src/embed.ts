/**
 * STORY-001 #3: the embedding pipeline.
 *
 * Meaning is derived, not authored — a step's identity is its embedding.
 * We embed agent-side (in this process, before insert), locally, with no
 * hosted service: all-MiniLM-L6-v2 via Transformers.js.
 *
 *   model:      Xenova/all-MiniLM-L6-v2
 *   dimensions: 384  (must match step.embedding vector(384) in schema.sql)
 *   normalized: yes  (unit vectors, so cosine distance is well-behaved)
 */
import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';

export const EMBED_MODEL = 'Xenova/all-MiniLM-L6-v2';
export const EMBED_DIMS = 384;

let extractor: Promise<FeatureExtractionPipeline> | null = null;

/** Embed a step phrase into a 384-dim unit vector. */
export async function embed(text: string): Promise<number[]> {
  extractor ??= pipeline('feature-extraction', EMBED_MODEL);
  const out = await (await extractor)(text, { pooling: 'mean', normalize: true });
  const v = Array.from(out.data as Float32Array);
  if (v.length !== EMBED_DIMS) {
    throw new Error(`embedding has ${v.length} dims, expected ${EMBED_DIMS} (model ${EMBED_MODEL})`);
  }
  return v;
}

/** pgvector accepts a `'[a,b,c]'` text literal for a vector value. */
export function toVectorLiteral(v: number[]): string {
  return `[${v.join(',')}]`;
}

// Self-test: `npm run embed -- "some phrase"` prints the dimension + preview.
if (import.meta.url === `file://${process.argv[1]}`) {
  const phrase = process.argv[2] ?? 'click the login button';
  const v = await embed(phrase);
  console.log(JSON.stringify({ phrase, dims: v.length, preview: v.slice(0, 4) }, null, 2));
}
