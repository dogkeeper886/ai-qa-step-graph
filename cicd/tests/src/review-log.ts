/**
 * STORY-002 #37: on-fail AI log-reviewer — advisory triage, never a verdict.
 *
 * The deterministic runner has already decided pass/fail. On a *failing* run,
 * this reviews each failed test's log and surfaces the likely cause(s), each
 * citing a log line — to help a human triage. It never gates, never re-judges,
 * and only looks at failures.
 *
 * Built on the official Anthropic SDK, which reads ANTHROPIC_API_KEY /
 * ANTHROPIC_AUTH_TOKEN / ANTHROPIC_BASE_URL from the environment — so pointing
 * it at a local Anthropic-compatible endpoint (e.g. Ollama) is pure config:
 *   ANTHROPIC_BASE_URL=http://localhost:11434  ANTHROPIC_AUTH_TOKEN=ollama
 *
 * Controls:
 *   AI_REVIEW=off          → disabled.
 *   no key/token/base_url  → cleanly skipped (no surprise API calls).
 *   AI_REVIEW_MODEL=...    → override the model (default claude-opus-4-8).
 *
 * Run: npm run review            (reviews the latest results dir)
 *      npm run review -- <dir>   (reviews a specific results dir)
 */
import Anthropic from '@anthropic-ai/sdk';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TestReport, TestSummary } from './types.js';

const RESULTS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'results');
const MODEL = process.env.AI_REVIEW_MODEL ?? 'claude-opus-4-8';
const MAX_LOG_CHARS = 12000;

function latestResultsDir(): string | null {
  if (!existsSync(RESULTS_DIR)) return null;
  const dirs = readdirSync(RESULTS_DIR)
    .map((d) => join(RESULTS_DIR, d))
    .filter((p) => statSync(p).isDirectory())
    .sort();
  return dirs.length ? dirs[dirs.length - 1] : null;
}

function readLog(dir: string, report: TestReport): string {
  for (const p of [report.logFile, join(dir, `${report.testId}.log`)]) {
    if (p && existsSync(p)) {
      const text = readFileSync(p, 'utf8').trim();
      if (text) return text;
    }
  }
  // Fall back to the captured step output.
  return report.steps
    .map((s) => `=== ${s.name} (exit ${s.exitCode}) ===\n${s.stdout}\n${s.stderr}`)
    .join('\n');
}

async function review(client: Anthropic, report: TestReport, log: string): Promise<string> {
  const clipped = log.length > MAX_LOG_CHARS ? log.slice(-MAX_LOG_CHARS) : log;
  const prompt = `You are triaging a FAILED automated test for a developer. The deterministic runner already decided FAIL — do not re-judge pass/fail. From the log, identify the LIKELY CAUSE(S) of the failure. For each, quote the exact log line it rests on. Be concise (a few bullets). These are advisory "possible problems", not a verdict.

Test: ${report.testId} — ${report.name}
Runner's reason: ${report.reason}

--- LOG (last ${clipped.length} chars) ---
${clipped}
--- END LOG ---`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

async function main() {
  if ((process.env.AI_REVIEW ?? '').toLowerCase() === 'off') {
    console.log('[review] AI_REVIEW=off — skipped.');
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN && !process.env.ANTHROPIC_BASE_URL) {
    console.log('[review] no ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN / ANTHROPIC_BASE_URL — skipped (advisory, not required).');
    return;
  }

  const dir = process.argv[2] ?? latestResultsDir();
  if (!dir || !existsSync(join(dir, 'summary.json'))) {
    console.log(`[review] no results to review${dir ? ` in ${dir}` : ''}.`);
    return;
  }

  const summary: TestSummary = JSON.parse(readFileSync(join(dir, 'summary.json'), 'utf8'));
  const readReport = (p: string): TestReport | null => {
    try {
      return JSON.parse(readFileSync(p, 'utf8')) as TestReport;
    } catch {
      return null; // a truncated/corrupt report shouldn't abort triage of the others
    }
  };
  const failed: TestReport[] = summary.tests
    .map((id) => join(dir, `${id}.json`))
    .filter(existsSync)
    .map(readReport)
    .filter((r): r is TestReport => r !== null && !r.pass);

  if (failed.length === 0) {
    console.log(`[review] ${dir}: no failures — nothing to review (this reviewer is on-fail only).`);
    return;
  }

  console.log(`[review] ${failed.length} failed test(s) in ${dir} — triaging with ${MODEL} (advisory)\n`);
  const client = new Anthropic();
  for (const report of failed) {
    console.log('='.repeat(64));
    console.log(`FAILED  ${report.testId}: ${report.name}`);
    console.log('='.repeat(64));
    try {
      console.log(await review(client, report, readLog(dir, report)));
    } catch (err) {
      console.log(`[review] could not reach the model (${(err as Error).message}) — skipping this one.`);
    }
    console.log('');
  }
  console.log('[review] advisory only — these do not change the deterministic verdict.');
}

main().catch((err) => {
  // Advisory tool: never fail the caller.
  console.error('[review] error:', (err as Error).message);
});
