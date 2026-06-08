/**
 * #69 + #70: prove the HTTP transport's security gate — Origin floor and bearer
 * token — before any tool runs.
 *
 * Spawns the server in http mode on a test port with a known token, then asserts:
 *   - GET /healthz is unauthenticated and returns 200 (liveness, #70);
 *   - a foreign Origin is rejected 403 even with a valid token (the floor, #69);
 *   - a request with no token is rejected 401 (#70);
 *   - a request with a wrong token is rejected 401 (#70);
 *   - a valid token with no Origin passes (200) and reaches real MCP handling.
 *
 * The 401/403 are returned before buildServer()/handleRequest(), so a rejected
 * request structurally runs no tool — that is the "no add_step write" guarantee.
 * No DB or running stack needed: every gate precedes tool handling.
 *
 * Run: npm run smoke:http
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3939; // distinct from the :3000 stack so this runs without `make up`
const URL = `http://127.0.0.1:${PORT}/`;
const HEALTH = `http://127.0.0.1:${PORT}/healthz`;
const TOKEN = 'smoke-http-test-token';

let failed = false;
function check(name: string, ok: boolean, detail: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
  if (!ok) failed = true;
}

// A minimal-but-valid MCP request so the authorized probe reaches real handling.
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
const auth = { Authorization: `Bearer ${TOKEN}` };

const server = spawn('npx', ['tsx', 'src/server.ts'], {
  cwd: PKG_ROOT,
  env: {
    ...process.env,
    MCP_TRANSPORT: 'http',
    MCP_HTTP_PORT: String(PORT),
    MCP_ALLOWED_ORIGINS: '',
    MCP_AUTH_TOKEN: TOKEN,
  },
  stdio: ['ignore', 'ignore', 'inherit'],
});

/** Poll the unauthenticated liveness probe until the server is listening. */
async function waitForListening(attempts = 50): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(HEALTH);
      if (r.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

try {
  const up = await waitForListening();
  check('server listening (GET /healthz, unauthenticated)', up, up ? `:${PORT}` : 'never came up');

  if (up) {
    const foreign = await fetch(URL, {
      method: 'POST',
      headers: { ...baseHeaders, ...auth, origin: 'http://evil.example' },
      body,
    });
    check('foreign Origin rejected even with a valid token', foreign.status === 403, `status=${foreign.status}`);

    const noToken = await fetch(URL, { method: 'POST', headers: baseHeaders, body });
    check('missing token rejected before any tool', noToken.status === 401, `status=${noToken.status}`);

    const badToken = await fetch(URL, {
      method: 'POST',
      headers: { ...baseHeaders, Authorization: 'Bearer wrong-token' },
      body,
    });
    check('wrong token rejected before any tool', badToken.status === 401, `status=${badToken.status}`);

    const ok = await fetch(URL, { method: 'POST', headers: { ...baseHeaders, ...auth }, body });
    // 200, not merely "not 401/403": proves the gate opened AND the request
    // reached real MCP handling (a broken server returning 500 would not pass).
    check('valid token passes the gate', ok.status === 200, `status=${ok.status}`);
  }
} finally {
  server.kill();
}

console.log(failed ? '\nHTTP GUARD FAILED' : '\nHTTP GUARD PASSED');
process.exit(failed ? 1 : 0);
