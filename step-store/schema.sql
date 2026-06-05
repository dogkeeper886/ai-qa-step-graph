-- STORY-001 #2: the step-store schema.
-- A "step" row's identity is its embedding; cosine similarity collapses
-- equivalent phrasings to one node. First cut holds one step per row.

CREATE EXTENSION IF NOT EXISTS vector;

-- 384 dims = all-MiniLM-L6-v2 (the local embedding model, #3).
CREATE TABLE IF NOT EXISTS step (
  id         bigserial PRIMARY KEY,
  text       text        NOT NULL,
  embedding  vector(384) NOT NULL,
  conf       real        NOT NULL DEFAULT 1.0,  -- confidence the step is confirmed
  src        text,                              -- where the step came from
  provenance jsonb,                             -- free-form trace (run, ticket, ...)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- STORY-004 #26: test-doc steps are a derived index over tests/**/*.md.
--   namespace  scopes rows by repo/tenant (a search filter, not isolation)
--   kind       distinguishes a step row from other row kinds
-- Both are nullable so rows written before this column existed are unaffected.
ALTER TABLE step ADD COLUMN IF NOT EXISTS namespace text;
ALTER TABLE step ADD COLUMN IF NOT EXISTS kind text;

-- HNSW index for fast nearest-neighbour by cosine distance.
CREATE INDEX IF NOT EXISTS step_embedding_cosine_idx
  ON step USING hnsw (embedding vector_cosine_ops);
