/**
 * TypeScript interfaces for the test framework.
 */

// ============================================
// Test Case Definitions (from YAML)
// ============================================

/**
 * A single step within a test case.
 */
export interface TestStep {
  /** Human-readable step name */
  name: string;
  /** Shell command to execute */
  command: string;
  /** Step-specific timeout in ms (overrides test case timeout) */
  timeout?: number;
  /** Regex patterns that MUST appear in stdout/stderr */
  expectPatterns?: string[];
  /** Regex patterns that must NOT appear in stdout/stderr */
  rejectPatterns?: string[];
  /** Capture variables from step output for use in later steps */
  capture?: Record<string, string>;
}

/**
 * A complete test case definition.
 */
export interface TestCase {
  /** Unique test case ID (e.g., TC-BUILD-001) */
  id: string;
  /** Human-readable test name */
  name: string;
  /** Test suite */
  suite: string;
  /** Execution priority (lower = runs first) */
  priority: number;
  /** Default timeout for all steps in ms */
  timeout: number;
  /** Test IDs that must pass before this test runs */
  dependencies: string[];
  /** Tags for filtering (e.g., feature name, capability area) */
  tags?: string[];
  /** Test steps to execute */
  steps: TestStep[];
  /** Human-readable intent (documentation only; the verdict is the asserts) */
  criteria?: string;
  /** Short goal statement (documentation only, optional) */
  goal?: string;
}

// ============================================
// Execution Results
// ============================================

/**
 * Pattern matching result for a single pattern.
 */
export interface PatternMatch {
  pattern: string;
  found: boolean;
}

/**
 * Result of executing a single test step.
 */
export interface StepResult {
  /** Step name */
  name: string;
  /** Command that was executed */
  command: string;
  /** Captured stdout */
  stdout: string;
  /** Captured stderr */
  stderr: string;
  /** Process exit code */
  exitCode: number;
  /** Execution duration in ms */
  duration: number;
  /** Pattern matching results (if patterns were defined) */
  patternMatches?: {
    expected: PatternMatch[];
    rejected: PatternMatch[];
  };
}

/**
 * Result of executing an entire test case.
 */
export interface TestResult {
  /** The test case that was executed */
  testCase: TestCase;
  /** Results for each step */
  steps: StepResult[];
  /** Total execution duration in ms */
  totalDuration: number;
  /** Extracted logs for this test (from LogCollector) */
  logs: string;
  /** Path to the full log file */
  logFile: string;
}

// ============================================
// Judge System
// ============================================

/**
 * The deterministic verdict on a test result (assert-first; no judge layer).
 */
export interface Judgment {
  /** Test case ID */
  testId: string;
  /** Pass/fail verdict */
  pass: boolean;
  /** Explanation of the verdict */
  reason: string;
  /** Evidence log line (required when pass=false) */
  evidence?: string;
}

// ============================================
// Reports
// ============================================

/**
 * Structured step result for JSON output.
 */
export interface StepReportEntry {
  /** Step name */
  name: string;
  /** Command executed */
  command: string;
  /** Exit code */
  exitCode: number;
  /** Duration in ms */
  duration: number;
  /** Captured stdout */
  stdout: string;
  /** Captured stderr */
  stderr: string;
  /** Whether step passed */
  pass: boolean;
}

/**
 * Complete report for a single test.
 */
export interface TestReport {
  /** Test case ID */
  testId: string;
  /** Test name */
  name: string;
  /** Test suite */
  suite: string;
  /** Pass/fail (deterministic asserts) */
  pass: boolean;
  /** Reason for the verdict */
  reason: string;
  /** Execution duration in ms */
  duration: number;
  /** Structured step results */
  steps: StepReportEntry[];
  /** Path to full log file */
  logFile: string;
  /** The deterministic verdict */
  verdict: Judgment;
}

/**
 * Summary of a test run.
 */
export interface TestSummary {
  /** Run identifier (ISO timestamp) */
  runId: string;
  /** Suite that was run (or 'all') */
  suite: string;
  /** When the run started */
  timestamp: string;
  /** Total duration in ms */
  duration: number;
  /** Total number of tests */
  total: number;
  /** Number of passing tests */
  passed: number;
  /** Number of failing tests */
  failed: number;
  /** Environment info */
  environment: {
    hostname: string;
    nodeVersion: string;
    dockerVersion?: string;
  };
  /** List of test IDs in execution order */
  tests: string[];
}

// ============================================
// Configuration
// ============================================

/**
 * CLI run configuration.
 */
export interface RunConfig {
  /** Filter by suite */
  suite?: string;
  /** Filter by specific test ID */
  testId?: string;
  /** Filter by tag */
  tag?: string;
  /** Show what would run without executing */
  dryRun: boolean;
  /** Output directory for results */
  outputDir: string;
  /** Output format */
  outputFormat: 'console' | 'json';
  /** Working directory (project root) */
  workingDir: string;
  /** Path to docker-compose directory for log collection */
  dockerComposePath: string;
}
