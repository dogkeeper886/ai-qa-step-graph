# step-store

STORY-001: an agent-reachable **pgvector step-store over MCP**. The agent finds and
reuses test steps *by meaning* — a step's identity is its embedding, and cosine
similarity collapses equivalent phrasings to one node.

## Decisions (issue #1)

| Choice | Decision | Why |
|--------|----------|-----|
| Transport | **both stdio + HTTP**, selectable via `MCP_TRANSPORT` | stdio is simplest for a local agent; HTTP is ready for a non-local one |
| MCP server | **purpose-built** (TypeScript, `@modelcontextprotocol/sdk`) | control over step-store semantics |
| Embedding | **local, agent-side** — `all-MiniLM-L6-v2` via Transformers.js, 384 dims, normalized | no hosted service; "runs locally" |
| Store | **Postgres + pgvector** (`pgvector/pgvector:pg17`) via Docker | local, reproducible; the store is a *derived* index |

## One-time setup

```bash
docker compose up -d          # from the repo root: Postgres + pgvector
cd step-store && npm install  # deps (downloads the embedding model on first embed)
```

The MCP connection itself is committed in [`../.mcp.json`](../.mcp.json) — once the
stack is up, the agent reaches the store every session with no per-run fiddling.

## Tools

- **`search_step(phrase, k?, max_distance?, namespace?)`** → nearest confirmed step(s)
  by cosine distance, or a clear `{ "match": false }`. Cutoff defaults to `0.35`
  (calibrated: paraphrases land < 0.30, different steps > 0.50). `namespace` scopes the
  search to one repo/tenant; omit it to search across all.
- **`add_step(text, conf?, src?, provenance?, namespace?)`** → adds a confirmed step,
  findable by meaning on the next search. `namespace` files it under one repo/tenant (a
  namespaced step resolves only against its own namespace); `src` records where it came
  from.

### Contributing steps from another repo

`namespace` is how a second repo's steps stay distinct from this one's: file them under
your own `namespace`, then `search_step(..., namespace: "<yours>")` returns only yours
(the default all-namespace search still finds them). Embedding happens here, server-side,
so a consumer needs only to call the tool — no model on its side.

Durability is structural: `regen` rebuilds only the un-namespaced canonical space, so
**any step filed under a namespace survives a rebuild** — you don't have to manage `src`
for it (omit `src` and it defaults to the namespace). Only bare, un-namespaced adds are
ephemeral scratch that `regen` sweeps.

## Commands

```bash
npm run server                       # MCP over stdio (default)
MCP_TRANSPORT=http npm run server    # MCP over HTTP on :3000 (MCP_HTTP_PORT)
npm run smoke                        # end-to-end channel test: add -> hit -> miss
npm run regen                        # rebuild the store from canonical steps/ files
npm run embed -- "a phrase"          # print the embedding dimension
```
