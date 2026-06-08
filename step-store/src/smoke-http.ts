/**
 * #69: prove the DNS-rebinding floor on the HTTP transport.
 *
 * Spawns the server in http mode on a test port, then asserts the Origin gate
 * discriminates:
 *   - a request carrying a foreign Origin is rejected 403 before any tool runs;
 *   - a request with no Origin (a non-browser MCP client) passes the gate.
 *
 * No DB or running stack needed: the Origin check precedes all tool handling,
 * so the server answers both probes without ever touching Postgres.
 *
 * Run: npm run smoke:http
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3939; // distinct from the :3000 stack so this runs without `make up`
const URL = `http://127.0.0.1:${PORT}/`;

let failed = false;
function check(name: string, ok: boolean, detail: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
  if (!ok) failed = true;
}

// A minimal-but-valid MCP request so the allowed probe reaches real handling.
const body = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 't', version: '0' } },
});
const baseHeaders = {
  'content-type': 'application/json',
  accept: 'application/json, text/event-stream',
};

const server = spawn('npx', ['tsx', 'src/server.ts'], {
  cwd: PKG_ROOT,
  env: { ...process.env, MCP_TRANSPORT: 'http', MCP_HTTP_PORT: String(PORT), MCP_ALLOWED_ORIGINS: '' },
  stdio: ['ignore', 'ignore', 'inherit'],
});

/** Poll until the server is listening (or give up). */
async function waitForListening(attempts = 50): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      await fetch(URL, { method: 'POST', headers: baseHeaders, body });
      return true; // any HTTP response means it's up
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return false;
}

try {
  const up = await waitForListening();
  check('server listening on http', up, up ? `:${PORT}` : 'never came up');

  if (up) {
    const foreign = await fetch(URL, {
      method: 'POST',
      headers: { ...baseHeaders, origin: 'http://evil.example' },
      body,
    });
    check('foreign Origin rejected before any tool', foreign.status === 403, `status=${foreign.status}`);

    const allowed = await fetch(URL, { method: 'POST', headers: baseHeaders, body });
    // 200, not merely "not 403": a foreign Origin is the only thing that yields
    // 403, so === 200 proves the gate opened AND the request reached real MCP
    // handling (a broken server returning 500 would not false-pass).
    check('no-Origin client passes the gate', allowed.status === 200, `status=${allowed.status}`);
  }
} finally {
  server.kill();
}

console.log(failed ? '\nHTTP GUARD FAILED' : '\nHTTP GUARD PASSED');
process.exit(failed ? 1 : 0);
