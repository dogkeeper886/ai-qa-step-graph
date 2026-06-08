/**
 * STORY-007 #77/#78/#79: end-to-end test of the case-retrieval surface and the
 * full CRUD loop over the MCP channel.
 *
 *   #77  search_cases finds a case by its OBJECTIVE, and search_step never
 *        returns the case row (the cross-kind guard).
 *   #78  outline returns the folded map (no step bodies); get_case returns one
 *        case in full with ordered steps.
 *   #79  create → read → update → delete on a canonical test doc + re-index is
 *        findable at each stage, then gone.
 *
 * Hermetic: writes a throwaway doc under docs/tests/ in this repo's own
 * namespace (so a re-index sweeps it on delete) and always cleans it up.
 * Run: npm run smoke:cases   (needs the stack up: `make up`).
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { parseToolResult as parse } from './mcp.js';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TESTS_DIR = join(PKG_ROOT, '..', 'docs', 'tests');
const NS = 'ai-qa-step-graph'; // share TS-01's namespace so a re-index sweeps our doc on delete
const DOC = join(TESTS_DIR, 'TS-90-cases-smoke.md');

function check(name: string, ok: boolean, detail: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
  if (!ok) process.exitCode = 1;
}

/** Re-index docs/tests/ into the store (the canonical → derived-index step). */
function loadTests() {
  return spawnSync('npx', ['tsx', 'src/load-tests.ts'], {
    cwd: PKG_ROOT,
    encoding: 'utf8',
    env: { ...process.env },
  });
}

type Case = { title: string; objective: string; action: string; expected: string };
function writeDoc(c: Case) {
  writeFileSync(
    DOC,
    `---
id: TS-90
title: Cases smoke (throwaway)
namespace: ${NS}
story: STORY-007
status: green
---

## Why this scenario exists

Throwaway fixture for the case-retrieval + CRUD smoke (#77-#79). The test deletes it.

### TC-01: ${c.title}

- **Objective:** ${c.objective}

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | ${c.action} | ${c.expected} |
`,
  );
}

// An objective phrased at INTENT level, deliberately unlike its mechanical step.
const create: Case = {
  title: 'Self-service recovery',
  objective: 'a locked-out user can regain access on their own without contacting support',
  action: 'Click "Forgot password?" and follow the emailed link',
  expected: 'the dashboard loads, signed in',
};
const CREATE_QUERY = 'a locked-out user regains access without contacting support';

const updated: Case = {
  title: 'Account lockout',
  objective: 'an administrator can lock a user account after repeated failed logins',
  action: create.action,
  expected: create.expected,
};
const UPDATE_QUERY = 'lock an account after too many failed sign-in attempts';

const ts90 = (hits: any[] | undefined) => (hits ?? []).filter((h) => h.ts === 'TS-90');

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['tsx', 'src/server.ts'],
  cwd: PKG_ROOT,
  env: { ...process.env, MCP_TRANSPORT: 'stdio' } as Record<string, string>,
});
const client = new Client({ name: 'smoke-cases', version: '0.1.0' });
await client.connect(transport);

try {
  // ── C(reate): author a canonical doc, then index it ───────────────────────
  writeDoc(create);
  check('create: load-tests indexed the new doc', loadTests().status === 0, 'exit 0');

  // ── R(ead) #77: found by OBJECTIVE; the case row never leaks to step search ─
  const byObj = parse(
    await client.callTool({ name: 'search_cases', arguments: { phrase: CREATE_QUERY, namespace: NS } }),
  );
  check(
    'search_cases finds the case by its objective',
    byObj.match === true && ts90(byObj.hits).some((h) => h.tc === 'TC-01'),
    `match=${byObj.match} hits=${byObj.hits?.length}`,
  );
  const asSteps = parse(
    await client.callTool({ name: 'search_step', arguments: { phrase: CREATE_QUERY, namespace: NS } }),
  );
  check(
    'search_step never returns the case row (cross-kind guard)',
    !(asSteps.hits ?? []).some((h: any) => (h.text ?? '').includes(create.objective)),
    `step hits=${asSteps.hits?.length ?? 0}`,
  );

  // ── R(ead) #78: outline folded (no step bodies); get_case full ────────────
  const out = parse(await client.callTool({ name: 'outline', arguments: { namespace: NS } }));
  const sc = (out.scenarios ?? []).find((s: any) => s.ts === 'TS-90');
  check(
    'outline lists TS-90 with its objective',
    !!sc && sc.cases.some((c: any) => c.tc === 'TC-01' && /regain access/.test(c.objective ?? '')),
    `scenarios=${out.scenarios?.length}`,
  );
  check(
    'outline carries no step bodies (folded)',
    !JSON.stringify(out).includes(create.action) && !JSON.stringify(out).includes(create.expected),
    'no Action/Expected text in outline',
  );
  const full = parse(await client.callTool({ name: 'get_case', arguments: { ts: 'TS-90', tc: 'TC-01' } }));
  check(
    'get_case returns objective + ordered steps',
    /regain access/.test(full.objective ?? '') &&
      full.steps?.length === 1 &&
      full.steps[0].step === 1 &&
      /Forgot password/.test(full.steps[0].text),
    `objective="${full.objective}" steps=${full.steps?.length}`,
  );

  // ── U(pdate): change the objective, re-index, find by the NEW wording ─────
  writeDoc(updated);
  loadTests();
  const afterUpdate = parse(
    await client.callTool({ name: 'search_cases', arguments: { phrase: UPDATE_QUERY, namespace: NS } }),
  );
  check('update: case found by its new objective', ts90(afterUpdate.hits).length > 0, `match=${afterUpdate.match}`);
  const oldQuery = parse(
    await client.callTool({ name: 'search_cases', arguments: { phrase: CREATE_QUERY, namespace: NS } }),
  );
  check('update: old objective no longer matches TS-90', ts90(oldQuery.hits).length === 0, `stale hits=${ts90(oldQuery.hits).length}`);

  // ── D(elete): remove the doc, re-index, confirm it's gone ─────────────────
  rmSync(DOC);
  loadTests();
  const afterDelete = parse(
    await client.callTool({ name: 'search_cases', arguments: { phrase: UPDATE_QUERY, namespace: NS } }),
  );
  check('delete: case no longer found after removal + re-index', ts90(afterDelete.hits).length === 0, `hits=${ts90(afterDelete.hits).length}`);
  const goneCase = parse(await client.callTool({ name: 'get_case', arguments: { ts: 'TS-90', tc: 'TC-01' } }));
  check('delete: get_case reports not found', goneCase.found === false, `found=${goneCase.found}`);
} finally {
  // Always clean up the fixture and its rows, even on a mid-test failure.
  if (existsSync(DOC)) {
    rmSync(DOC);
    loadTests();
  }
  await client.close();
}

console.log(process.exitCode ? '\nCASES FAILED' : '\nCASES PASSED');
process.exit(process.exitCode ?? 0);
