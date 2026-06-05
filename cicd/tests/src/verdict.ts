/**
 * Deterministic verdict — assert-first.
 *
 * Pass/fail comes straight from what the executor observed; there is no judge
 * layer and no LLM in the gate (STORY-002 #35). A test passes when:
 *   1. every step exited 0,
 *   2. every expected pattern was found and no rejected pattern appeared,
 *   3. no error pattern shows up in the logs (minus the known exclusions).
 *
 * (An on-fail LLM *log review* is a separate, advisory, on-demand step — #37 —
 * never part of this verdict.)
 */

import { TestResult, Judgment } from './types.js';
import { ERROR_PATTERNS, ERROR_EXCLUSIONS } from './config.js';

/** Decide pass/fail for one executed test, deterministically. */
export function evaluate(result: TestResult): Judgment {
  const reasons: string[] = [];

  const failedSteps = result.steps.filter((s) => s.exitCode !== 0);
  if (failedSteps.length > 0) {
    reasons.push(
      `${failedSteps.length} step(s) exited non-zero: ${failedSteps.map((s) => `${s.name}(${s.exitCode})`).join(', ')}`,
    );
  }

  for (const step of result.steps) {
    if (!step.patternMatches) continue;
    const missing = step.patternMatches.expected.filter((p) => !p.found);
    if (missing.length > 0) {
      reasons.push(`Step "${step.name}" missing expected: ${missing.map((p) => p.pattern).join(', ')}`);
    }
    const found = step.patternMatches.rejected.filter((p) => p.found);
    if (found.length > 0) {
      reasons.push(`Step "${step.name}" hit rejected: ${found.map((p) => p.pattern).join(', ')}`);
    }
  }

  const combinedLogs = result.logs + '\n' + result.steps.map((s) => s.stdout + s.stderr).join('\n');
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.test(combinedLogs) && !ERROR_EXCLUSIONS.some((exc) => exc.test(combinedLogs))) {
      reasons.push(`Error pattern in logs: ${pattern.source}`);
      break;
    }
  }

  const pass = reasons.length === 0;
  return {
    testId: result.testCase.id,
    pass,
    reason: pass ? 'exit 0, patterns matched, no error patterns' : reasons.join('; '),
    evidence: pass ? undefined : reasons[0],
  };
}

/** Evaluate a batch. */
export function evaluateAll(results: TestResult[]): Judgment[] {
  return results.map(evaluate);
}
