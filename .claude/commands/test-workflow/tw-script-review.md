# Review Test Script

Review automated test scripts against documented test cases to verify coverage.

```
Compare Robot Framework test scripts against markdown test case documentation:

{{input}}

## Process

### Phase 1: Gather Source Information
1. Get the Jira ticket for the test script review task
2. Read ticket comments to find Jenkins log URLs or test run references
3. Identify the corresponding test case documentation folder in this repository

### Phase 2: Access Robot Framework Logs
1. For internal Jenkins URLs (10.x.x.x), use curl instead of WebFetch:
   ```bash
   # Get build summary
   curl -s "http://[jenkins-url]/robot/api/json" | jq .

   # Get console output for test names
   curl -s "http://[jenkins-url]/consoleText" | grep -E "^\[" | head -50

   # Download full robot log
   curl -s "http://[jenkins-url]/robot/report/log.html" -o /tmp/robot_log.html
   ```
2. Extract test execution details from log.html using grep patterns:
   - Test case names: `strings /tmp/robot_log.html | grep -E "test-name-pattern"`
   - Parameter values: `grep -oE "pattern" /tmp/robot_log.html`
   - Verification steps: Look for `Should Be Equal`, `Should Contain`, etc.

### Phase 3: Read Test Case Documentation
1. Navigate to the project's test_cases/ folder
2. Read each test scenario file (TS-01, TS-02, etc.)
3. Extract for each test case:
   - Test objective
   - Preconditions
   - Test steps and expected results
   - Priority level

### Phase 4: Create Coverage Comparison
For each documented test case, verify:

| Check | What to Compare |
|-------|-----------------|
| **Name Match** | Does script test name align with documented TC name? |
| **Objective Coverage** | Does script test the documented objective? |
| **Portal/Config Types** | Are all documented variants tested? |
| **Parameter Values** | Are documented values used in script? |
| **Verification Steps** | Does script verify expected results? |

### Phase 5: Generate Review Report
Create a coverage review report with:

1. **Executive Summary**
   - Total documented vs automated test cases
   - Coverage percentage
   - Pass/Fail status from execution

2. **Coverage by Test Suite**
   - Table showing each suite's automation status
   - Fully Covered / Partially Covered / Not Automated

3. **Detailed Test Case Comparison**
   - For each automated test case:
     - Markdown specification summary
     - Robot script implementation details
     - Coverage assessment (PASS/FAIL with reason)

4. **Non-Automated Test Cases**
   - List test cases not in automation
   - Reason why (if applicable)

5. **Overall Assessment**
   - Key findings
   - Recommendation (APPROVED / NEEDS WORK)

## Output Location

Save the review report to:
```
[project]/test_cases/Test_Script_Coverage_Review.md
```

## Key Tools

| Tool | Purpose |
|------|---------|
| `mcp__mcp-atlassian__jira_get_issue` | Get Jira ticket with comments |
| `curl` (via Bash) | Fetch internal Jenkins URLs |
| `grep` / `strings` | Extract data from robot log.html |
| `Read` | Read markdown test case files |
| `Write` | Create coverage review report |
| `TodoWrite` | Track multi-step review progress |

## Example Workflow

```
User: Review test scripts for PROJ-12345

1. Get Jira ticket PROJ-12345
   → Find Jenkins URLs in comments

2. Fetch Robot log from Jenkins
   → curl http://10.x.x.x:8080/.../robot/report/log.html

3. Extract test details
   → 9 test cases: CREATE-SELF, CREATE-HOST, etc.
   → maxDevices values: -1, 50, 100, 500, 1000

4. Read markdown test cases
   → /completed/PROJ-12345_.../test_cases/TS-02_*.md
   → 14 documented test cases across 6 suites

5. Compare and create report
   → 9/14 automated (64% coverage)
   → All core functionality covered
   → Recommendation: APPROVED
```

## Success Criteria

- All automated test cases mapped to documented test cases
- Clear assessment of whether each objective is covered
- Identified gaps explained with reasoning
- Actionable recommendation provided
```
