/**
 * STORY-001 #5: end-to-end smoke test of the agent <-> store channel.
 *
 * Spawns the MCP server over stdio (the same way an agent reaches it),
 * then proves the channel: add a step, find it by a paraphrase (hit),
 * and confirm an unrelated phrase returns a clear no-match (miss).
 *
 * Run: npm run smoke   (needs the stack up: `docker compose up -d`)
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { pool } from './db.js';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SRC = 'smoke-test';

function parse(result: unknown): any {
  const text = (result as any)?.content?.[0]?.text ?? '{}';
  return JSON.parse(text);
}

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
check('add_step', added.added === true && typeof added.id === 'number', `id=${added.id}`);

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

await client.close();
await pool.query('DELETE FROM step WHERE src = $1', [SRC]);
await pool.end();

console.log(process.exitCode ? '\nSMOKE FAILED' : '\nSMOKE PASSED');
