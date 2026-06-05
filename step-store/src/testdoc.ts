/**
 * STORY-004: the one parser for a tests/ scenario doc.
 *
 * Shared by the loader (#26) and the bind audit (#25) so there is a single
 * reading of the format — two parsers would be their own drift risk.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';

export interface TestCase {
  tc: string;        // "TC-01"
  title: string;
  script: string | null; // the bound cicd YAML path, or null if unbound
  steps: { action: string; expected: string }[];
}

export interface Scenario {
  frontMatter: Record<string, string>;
  cases: TestCase[];
}

/** Parse `key: value` front-matter between the first pair of `---` fences. */
export function parseFrontMatter(md: string): Record<string, string> {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  const fm: Record<string, string> = {};
  if (!m) return fm;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*?)\s*$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}

/**
 * Split a markdown table row into trimmed cells. Splits on *unescaped* pipes
 * only and unescapes `\|`, so a cell may legitimately contain a literal pipe
 * (a regex like `ok|healthy`, a shell `... || echo`).
 */
function tableCells(row: string): string[] {
  return row
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.replace(/\\\|/g, '|').trim());
}

/** The scenario docs in a tests/ dir, in stable order ([] if the dir is absent). */
export function scenarioFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').sort();
}

/** Parse a scenario file into its front-matter and cases (each with its steps). */
export function parseScenario(md: string): Scenario {
  const frontMatter = parseFrontMatter(md);
  const cases: TestCase[] = [];

  // Each `### TC-NN: title` starts a case; its block runs to the next ### or EOF.
  const tcRe = /^###\s+(TC-\d+):\s*(.*)$/gm;
  const matches = [...md.matchAll(tcRe)];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : md.length;
    const block = md.slice(start, end);

    const steps: TestCase['steps'] = [];
    for (const line of block.split('\n')) {
      if (!line.trim().startsWith('|')) continue;
      const cells = tableCells(line);
      // skip header (`# | Action | …`) and separator; data rows start with a number
      if (cells.length < 3 || !/^\d+$/.test(cells[0])) continue;
      steps.push({ action: cells[1], expected: cells[2] });
    }

    cases.push({
      tc: matches[i][1],
      title: matches[i][2].trim(),
      script: block.match(/\*\*Script:\*\*\s*(\S+)/)?.[1] ?? null,
      steps,
    });
  }
  return { frontMatter, cases };
}

/** Read and parse a scenario file from disk. */
export function readScenario(file: string): Scenario {
  return parseScenario(readFileSync(file, 'utf8'));
}

/** The searchable step text for one row: "Action — Expected" (or just Action). */
export function stepText(s: { action: string; expected: string }): string {
  return s.expected && s.expected !== '—' ? `${s.action} — ${s.expected}` : s.action;
}
