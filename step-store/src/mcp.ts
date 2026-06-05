/** Shared MCP client helpers. */

/** Unwrap an MCP tool result's first text payload as parsed JSON. */
export function parseToolResult(result: unknown): any {
  const text = (result as any)?.content?.[0]?.text ?? '{}';
  return JSON.parse(text);
}
