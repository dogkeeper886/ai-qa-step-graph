/**
 * STORY-001 #4: the MCP step-store server.
 *
 * Two tools the agent reaches over MCP:
 *   search_step(phrase) -> nearest confirmed step(s), or a clear "no match"
 *   add_step(text, ...) -> a confirmed step, findable by meaning next query
 *
 * Transport is selectable (the #1 decision: support both):
 *   MCP_TRANSPORT=stdio  (default) — for a local agent
 *   MCP_TRANSPORT=http             — Streamable HTTP on MCP_HTTP_PORT (3000)
 *
 * On stdio the JSON-RPC stream owns stdout, so all logs go to stderr.
 */
import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import {
  searchStep,
  searchCases,
  addStep,
  outline,
  getCase,
  DEFAULT_MAX_DISTANCE,
} from './store.js';

/** Build an MCP server with the step-store tools registered. */
function buildServer(): McpServer {
  const server = new McpServer({ name: 'step-store', version: '0.1.0' });

  server.registerTool(
    'search_step',
    {
      title: 'Find confirmed steps by meaning',
      description:
        'Return the confirmed step(s) whose meaning is nearest the given phrase, ' +
        'or a clear "no match" when nothing is close enough.',
      inputSchema: {
        phrase: z.string().describe('the step phrase to look up'),
        k: z.number().int().positive().max(50).optional().describe('max results (default 5)'),
        max_distance: z
          .number()
          .positive()
          .optional()
          .describe(`cosine-distance cutoff for a match (default ${DEFAULT_MAX_DISTANCE})`),
        namespace: z
          .string()
          .optional()
          .describe('scope the search to one repo/tenant (default: all namespaces)'),
      },
    },
    async ({ phrase, k, max_distance, namespace }) => {
      const hits = await searchStep(
        phrase,
        k ?? 5,
        max_distance ?? DEFAULT_MAX_DISTANCE,
        namespace ?? null,
      );
      const payload =
        hits.length === 0
          ? { match: false, message: 'no match', hits: [] }
          : { match: true, hits };
      return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
    },
  );

  server.registerTool(
    'add_step',
    {
      title: 'Add a confirmed step',
      description:
        'Add a confirmed step so it becomes findable by meaning on the next search. ' +
        'If the step already exists by meaning, the existing node is reinforced ' +
        'instead of duplicated (the result says whether it was added or resolved).',
      inputSchema: {
        text: z.string().describe('the step phrase'),
        conf: z.number().min(0).max(1).optional().describe('confidence (default 1.0)'),
        src: z.string().optional().describe('where the step came from'),
        provenance: z.record(z.string(), z.unknown()).optional().describe('free-form trace'),
        namespace: z
          .string()
          .optional()
          .describe(
            'file the step under one repo/tenant (default: the global namespace). ' +
              'A namespaced step resolves only against its own namespace and is never ' +
              'wiped by `regen` (which rebuilds only the un-namespaced canonical space). ' +
              'If `src` is omitted it defaults to the namespace.',
          ),
      },
    },
    async ({ text, conf, src, provenance, namespace }) => {
      // A namespaced step is owned by its slice: default its src to the namespace
      // so it carries a real lifecycle label (never null) for slice-replace.
      const { id, resolved } = await addStep(
        text,
        conf ?? 1.0,
        src ?? namespace ?? null,
        provenance ?? null,
        namespace ?? null,
      );
      // added=true → new node; resolved=true → reinforced an existing one.
      return {
        content: [
          { type: 'text', text: JSON.stringify({ added: !resolved, id, resolved }, null, 2) },
        ],
      };
    },
  );

  server.registerTool(
    'search_cases',
    {
      title: 'Find test cases by what they verify',
      description:
        'Return the test case(s) whose objective (what the case verifies) is nearest the ' +
        'given phrase, or a clear "no match". Use this to check whether a behaviour is ' +
        'already covered before authoring a new test — coverage converges instead of ' +
        'duplicating. Each hit carries its ts/tc; read it in full with get_case.',
      inputSchema: {
        phrase: z.string().describe('the behaviour / objective to look up'),
        k: z.number().int().positive().max(50).optional().describe('max results (default 5)'),
        max_distance: z
          .number()
          .positive()
          .optional()
          .describe(`cosine-distance cutoff for a match (default ${DEFAULT_MAX_DISTANCE})`),
        namespace: z
          .string()
          .optional()
          .describe('scope the search to one repo/tenant (default: all namespaces)'),
      },
    },
    async ({ phrase, k, max_distance, namespace }) => {
      const hits = await searchCases(
        phrase,
        k ?? 5,
        max_distance ?? DEFAULT_MAX_DISTANCE,
        namespace ?? null,
      );
      const payload =
        hits.length === 0
          ? { match: false, message: 'no match', hits: [] }
          : { match: true, hits };
      return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
    },
  );

  server.registerTool(
    'outline',
    {
      title: 'Outline the test suite (the folded map)',
      description:
        'Return the suite folded to scenarios → cases with their objectives and no step ' +
        'bodies, so the shape of many cases fits in a small response. Use it to orient ' +
        'before drilling into a case with get_case. Optionally scope to one namespace.',
      inputSchema: {
        namespace: z
          .string()
          .optional()
          .describe('scope to one repo/tenant (default: all namespaces)'),
      },
    },
    async ({ namespace }) => {
      const scenarios = await outline(namespace ?? null);
      return { content: [{ type: 'text', text: JSON.stringify({ scenarios }, null, 2) }] };
    },
  );

  server.registerTool(
    'get_case',
    {
      title: 'Read one whole test case',
      description:
        'Return one case in full — its objective and ordered steps (action — expected ' +
        'result) — to read it in context or reuse as a template. Returns a clear ' +
        '"not found" if the ts/tc is unknown.',
      inputSchema: {
        ts: z.string().describe('the scenario id, e.g. "TS-01"'),
        tc: z.string().describe('the case id, e.g. "TC-01"'),
        namespace: z
          .string()
          .optional()
          .describe('disambiguate when the same id exists in more than one repo'),
      },
    },
    async ({ ts, tc, namespace }) => {
      const detail = await getCase(ts, tc, namespace ?? null);
      const payload = detail ?? { found: false, message: `no case ${ts}/${tc}` };
      return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
    },
  );

  return server;
}

/**
 * DNS-rebinding floor (#69). Once the HTTP transport is reachable beyond
 * localhost, a page open in a browser on the LAN can be tricked — via DNS
 * rebinding — into POSTing to the server and driving `add_step`/`search_step`.
 * A browser always attaches an `Origin` header to such a request, so we reject
 * any request whose Origin is not allow-listed. A request with NO Origin is a
 * non-browser MCP client (Claude Code, curl, the stdio bridge) for which the
 * rebinding threat does not apply, so it passes. (The SDK's built-in
 * `enableDnsRebindingProtection` is `@deprecated` in favour of exactly this
 * external check.) localhost is always allowed; add LAN/browser origins via
 * `MCP_ALLOWED_ORIGINS` (comma-separated).
 */
function allowedOrigins(port: number): Set<string> {
  const defaults = [`http://localhost:${port}`, `http://127.0.0.1:${port}`];
  const extra = (process.env.MCP_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set([...defaults, ...extra]);
}

function originAllowed(origin: string | undefined, allow: Set<string>): boolean {
  if (!origin) return true; // non-browser client; DNS rebinding needs a browser
  return allow.has(origin);
}

/**
 * Bearer-token auth (#70). Constant-time check of `Authorization: Bearer <token>`
 * against the configured token. The lengths are compared first because
 * `timingSafeEqual` requires equal-length buffers; the token *value* is then
 * compared in constant time. A length mismatch returns early, so only the
 * token's length — never its bytes — is timing-distinguishable, which is
 * acceptable for a high-entropy secret. The scheme keyword is case-insensitive
 * per RFC 6750; the token itself stays case-sensitive.
 */
function tokenValid(authHeader: string | undefined, token: string): boolean {
  if (!authHeader) return false;
  const m = /^Bearer (.+)$/i.exec(authHeader);
  if (!m) return false;
  const got = Buffer.from(m[1]);
  const want = Buffer.from(token);
  return got.length === want.length && timingSafeEqual(got, want);
}

async function main() {
  const transport = (process.env.MCP_TRANSPORT ?? 'stdio').toLowerCase();

  if (transport === 'http') {
    // Stateless Streamable HTTP: a fresh server + transport per request.
    const port = Number(process.env.MCP_HTTP_PORT ?? 3000);
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
      throw new Error(`invalid MCP_HTTP_PORT: ${process.env.MCP_HTTP_PORT}`);
    }
    // Bearer-token auth (#70): a token is mandatory in http mode — refuse to
    // start rather than silently serving an open, writable store over the
    // network. stdio is exempt (local; credentials come from the environment
    // per the MCP spec).
    const token = process.env.MCP_AUTH_TOKEN ?? '';
    if (!token) {
      throw new Error(
        'MCP_AUTH_TOKEN is required in http mode (refusing to start an unauthenticated ' +
          'server). Set it in the environment — `make up` generates one into .env.',
      );
    }
    const allow = allowedOrigins(port);
    const http = createServer(async (req, res) => {
      // Unauthenticated liveness probe — no Origin/auth, so health reflects
      // real reachability (a 401 must not read as "healthy"). See #70.
      if (req.method === 'GET' && req.url?.split('?')[0] === '/healthz') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }
      // Reject a foreign Origin before any tool handler runs (the floor, #69).
      if (!originAllowed(req.headers.origin, allow)) {
        res.writeHead(403, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'forbidden: origin not allowed' }));
        return;
      }
      // Require a valid bearer token before any tool runs (#70).
      if (!tokenValid(req.headers.authorization, token)) {
        res.writeHead(401, { 'content-type': 'application/json', 'www-authenticate': 'Bearer' });
        res.end(JSON.stringify({ error: 'unauthorized' }));
        return;
      }
      const server = buildServer();
      const httpTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => {
        httpTransport.close();
        server.close();
      });
      try {
        await server.connect(httpTransport);
        await httpTransport.handleRequest(req, res);
      } catch (err) {
        console.error('[step-store] request error:', err);
        if (!res.headersSent) res.writeHead(500).end();
      }
    });
    http.on('error', (err) => {
      console.error('[step-store] HTTP server error:', err);
      process.exit(1);
    });
    http.listen(port, () => console.error(`[step-store] MCP over HTTP on :${port}`));
  } else {
    await buildServer().connect(new StdioServerTransport());
    console.error('[step-store] MCP over stdio');
  }
}

main().catch((err) => {
  console.error('[step-store] fatal:', err);
  process.exit(1);
});
