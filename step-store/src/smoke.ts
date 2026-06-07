/**
 * STORY-001 #5: end-to-end smoke test of the agent <-> store channel.
 *
 * Spawns the MCP server over stdio (the same way an agent reaches it),
 * then proves the channel: add a step, find it by a paraphrase (hit),
 * and confirm an unrelated phrase returns a clear no-match (miss).
 *
 * Run: npm run smoke   (needs the stack up: `docker compose up -d`)
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { pool } from './db.js';
import { parseToolResult as parse } from './mcp.js';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SRC = 'smoke-test';

function check(name: string, ok: boolean, detail: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
  if (!ok) process.exitCode = 1;
}

// Keep the test idempotent: clear any rows a previous run left behind.
await pool.query('DELETE FROM step WHERE src = $1', [SRC]);

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['tsx', 'src/server.ts'],
  cwd: PKG_ROOT,
  env: { ...process.env, MCP_TRANSPORT: 'stdio' } as Record<string, string>,
});
const client = new Client({ name: 'smoke', version: '0.1.0' });
await client.connect(transport);

const added = parse(await client.callTool({
  name: 'add_step',
  arguments: { text: 'click the login button', src: SRC, provenance: { test: 'smoke' } },
}));
check('add_step', typeof added.id === 'number', `id=${added.id}`);

// Entity resolution: a near-identical phrasing reinforces the same node rather
// than creating a duplicate — the two adds converge on one node id.
const again = parse(await client.callTool({
  name: 'add_step',
  arguments: { text: 'click on the login button', src: SRC, provenance: { test: 'smoke' } },
}));
check(
  'add_step resolves to one node (no duplicate)',
  again.resolved === true && again.id === added.id,
  `resolved=${again.resolved} id=${again.id} (first id=${added.id})`,
);

const hit = parse(await client.callTool({
  name: 'search_step',
  arguments: { phrase: 'press the sign-in button' },
}));
check(
  'search hit (paraphrase)',
  hit.match === true && hit.hits[0]?.text === 'click the login button',
  `nearest="${hit.hits?.[0]?.text}" dist=${hit.hits?.[0]?.distance?.toFixed(3)}`,
);

const miss = parse(await client.callTool({
  name: 'search_step',
  arguments: { phrase: 'the weather is sunny today' },
}));
check('search miss (unrelated)', miss.match === false, `message="${miss.message}"`);

// Namespace (#67): a step filed under a namespace is found by a search scoped to
// that namespace and by the default all-namespace search, but not by a search
// scoped to a different one — partitioning is a filter on top of meaning.
const NS = 'smoke-ns';
const nsPhrase = 'enable two-factor authentication for the account';
const nsAdded = parse(await client.callTool({
  name: 'add_step',
  arguments: { text: nsPhrase, src: SRC, namespace: NS, provenance: { test: 'smoke' } },
}));
check('add_step under a namespace', typeof nsAdded.id === 'number', `id=${nsAdded.id} ns=${NS}`);

const nsHit = parse(await client.callTool({
  name: 'search_step',
  arguments: { phrase: nsPhrase, namespace: NS },
}));
check(
  'search scoped to the namespace finds it',
  nsHit.match === true && nsHit.hits[0]?.id === nsAdded.id && nsHit.hits[0]?.namespace === NS,
  `match=${nsHit.match} ns=${nsHit.hits?.[0]?.namespace}`,
);

const nsDefault = parse(await client.callTool({
  name: 'search_step',
  arguments: { phrase: nsPhrase },
}));
check(
  'default search also surfaces the namespaced step',
  nsDefault.match === true && nsDefault.hits.some((h: { id: number }) => h.id === nsAdded.id),
  `hits=${nsDefault.hits?.length}`,
);

const nsOther = parse(await client.callTool({
  name: 'search_step',
  arguments: { phrase: nsPhrase, namespace: 'smoke-ns-other' },
}));
check(
  'search scoped to a different namespace misses it',
  !(nsOther.hits ?? []).some((h: { id: number }) => h.id === nsAdded.id),
  `hits=${nsOther.hits?.length ?? 0}`,
);

// Concurrency (#48): firing the same brand-new step many times at once must
// still leave exactly one node — the advisory lock serializes resolve+insert.
const RACE = 'race-test';
await pool.query('DELETE FROM step WHERE src = $1', [RACE]);
const racePhrase = 'provision the staging database cluster (smoke race probe)';
const results = await Promise.all(
  Array.from({ length: 8 }, () =>
    client.callTool({ name: 'add_step', arguments: { text: racePhrase, src: RACE } })),
);
// All eight must land on one node id — whether they inserted it or resolved to
// an existing one. (Convergence is robust; a src row-count would false-fail if
// the probe ever resolved to a pre-existing node instead of inserting.)
const ids = results.map((r) => parse(r).id);
check(
  'concurrent adds → one node',
  ids.every((id) => id === ids[0]),
  `${new Set(ids).size} distinct id(s) from 8 concurrent adds`,
);
await pool.query('DELETE FROM step WHERE src = $1', [RACE]);

// regen ownership (#67): a rebuild touches only the un-namespaced canonical
// space; a namespaced step is durable across it — src or no src. Add a probe
// under a namespace with NO src, confirm src defaults to the namespace, rebuild,
// and confirm it survives. (Before this change, regen wiped everything but 'test-doc'.)
const PROBE_NS = 'regen-probe-ns';
await pool.query('DELETE FROM step WHERE namespace = $1', [PROBE_NS]);
const probe = parse(await client.callTool({
  name: 'add_step',
  // no src on purpose — a namespaced step must be durable without one.
  arguments: { text: 'rotate the signing key (regen probe)', namespace: PROBE_NS },
}));
const { rows: labelled } = await pool.query('SELECT src FROM step WHERE id = $1', [probe.id]);
check('add_step defaults src to the namespace', labelled[0]?.src === PROBE_NS, `src=${labelled[0]?.src}`);

const regen = spawnSync('npx', ['tsx', 'src/regen.ts'], {
  cwd: PKG_ROOT,
  encoding: 'utf8',
  env: { ...process.env },
});
const { rows: survived } = await pool.query('SELECT id FROM step WHERE namespace = $1', [PROBE_NS]);
check(
  'regen preserves a namespaced step (no src needed)',
  regen.status === 0 && survived.some((r: { id: string }) => Number(r.id) === probe.id),
  `regen exit=${regen.status} rows after rebuild=${survived.length}`,
);
await pool.query('DELETE FROM step WHERE namespace = $1', [PROBE_NS]);

await client.close();
await pool.query('DELETE FROM step WHERE src = $1', [SRC]);
await pool.end();

console.log(process.exitCode ? '\nSMOKE FAILED' : '\nSMOKE PASSED');
