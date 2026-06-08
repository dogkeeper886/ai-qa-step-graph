/**
 * STORY-003 #15: a quick semantic lookup from the CLI.
 *
 * Calls the running MCP server's search_step over HTTP and prints the result,
 * proving the channel works end to end.
 *
 *   npm run query -- "log in"        (default phrase: "log in")
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

const client = new Client({ name: 'query', version: '0.1.0' });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(url), opts));
  const res = await client.callTool({ name: 'search_step', arguments: { phrase } });
  const payload = parseToolResult(res);
  if (!payload.match) {
    console.log(`no match for "${phrase}"`);
  } else {
    console.log(`nearest to "${phrase}":`);
    for (const h of payload.hits) console.log(`  ${h.distance.toFixed(3)}  ${h.text}`);
  }
} catch (err) {
  console.error(`Could not reach the MCP server at ${url} — is the stack up? (run \`make up\`)`);
  console.error(`  ${(err as Error).message}`);
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
}
