/**
 * Project configuration for the test framework.
 * 
 * Customize this file for your project's needs.
 */

/**
 * Available test suites - extend this array for your project.
 * Examples: ['build', 'integration', 'e2e'] or ['build', 'runtime', 'inference', 'models']
 */
export const SUITES: string[] = ['build', 'integration', 'e2e'];
export type Suite = string;

/**
 * Project configuration.
 */
export const CONFIG = {
  // Project identification
  projectName: 'ai-qa-step-graph',

  // Session file prefix for log collection
  sessionPrefix: 'test-session',

  // Default timeouts (in milliseconds)
  defaultTimeout: 60000,
  defaultStepTimeout: 30000,

  // Log collection settings
  logs: {
    cleanupAge: 24 * 60 * 60 * 1000, // 24 hours
    maxBuffer: 50 * 1024 * 1024, // 50MB
  },

  // MCP client settings (for projects using mcp-client.ts)
  mcp: {
    serverCommand: 'node dist/mcpServer.js', // Override via MCP_SERVER_COMMAND env var
  },
};

/**
 * Catastrophic-failure markers scanned in logs as a last-resort safety net.
 *
 * Assert-first: the verdict comes from exit codes + per-step expect/reject
 * patterns, so this list is deliberately narrow — only crashes that a passing
 * exit code could mask. Broad words like "error"/"failed" are NOT here: real
 * Postgres/MCP logs contain them benignly, and an explicit `rejectPatterns`
 * on the step is the right tool when a specific string must be absent.
 */
export const ERROR_PATTERNS: RegExp[] = [
  /segmentation fault/i,
  /out of memory/i,
  /\bpanic:/i,
  /\bFATAL\b/,
];

/**
 * Patterns that indicate a test should NOT be failed (exclude false positives).
 */
export const ERROR_EXCLUSIONS: RegExp[] = [
  /expected.*(error|fatal)/i,
];
