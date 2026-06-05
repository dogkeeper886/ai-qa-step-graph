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

const phrase = process.argv.slice(2).join(' ').trim() || 'log in';
const url = process.env.MCP_HTTP_URL ?? 'http://localhost:3000/';

const client = new Client({ name: 'query', version: '0.1.0' });
await client.connect(new StreamableHTTPClientTransport(new URL(url)));

const res = await client.callTool({ name: 'search_step', arguments: { phrase } });
const payload = JSON.parse((res as any).content[0].text);

if (!payload.match) {
  console.log(`no match for "${phrase}"`);
} else {
  console.log(`nearest to "${phrase}":`);
  for (const h of payload.hits) console.log(`  ${h.distance.toFixed(3)}  ${h.text}`);
}

await client.close();
