/**
 * STORY-007 #77: a quick case-level lookup from the CLI — the objective side of
 * `query`. Calls the running MCP server's search_cases over HTTP and prints the
 * matching test cases, so the qa-workflow can ask "is this behaviour already
 * covered?" before authoring a new one.
 *
 *   npm run query-cases -- "limit guest connection duration"
 *   MCP_HTTP_URL=http://host:3000/   to point elsewhere
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { parseToolResult } from './mcp.js';

const phrase = process.argv.slice(2).join(' ').trim() || 'log in';
const url = process.env.MCP_HTTP_URL ?? 'http://localhost:3000/';

// The http server requires a bearer token (#70); send it when configured.
const token = process.env.MCP_AUTH_TOKEN;
const opts = token
  ? { requestInit: { headers: { Authorization: `Bearer ${token}` } } }
  : undefined;

const client = new Client({ name: 'query-cases', version: '0.1.0' });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(url), opts));
  const res = await client.callTool({ name: 'search_cases', arguments: { phrase } });
  const payload = parseToolResult(res);
  if (!payload.match) {
    console.log(`no case matches "${phrase}"`);
  } else {
    console.log(`cases nearest to "${phrase}":`);
    for (const h of payload.hits) {
      console.log(`  ${h.distance.toFixed(3)}  ${h.ts}/${h.tc}  ${h.title ?? ''}`);
    }
  }
} catch (err) {
  console.error(`Could not reach the MCP server at ${url} — is the stack up? (run \`make up\`)`);
  console.error(`  ${(err as Error).message}`);
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
}
