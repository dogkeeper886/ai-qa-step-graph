#!/usr/bin/env bash
#
# STORY-002 #38: gate merges on the deterministic checks.
#
# Makes the assert-first suite (tests.yml) and the drift gate (qa-drift.yml)
# REQUIRED status checks on `main`, so a red check blocks the merge. The on-fail
# AI log-reviewer (#37) is deliberately NOT required — it never gates.
#
# Run this ONCE the two checks have reported green at least once on a PR (so the
# context names exist). enforce_admins=false leaves an admin escape hatch.
#
#   ./cicd/scripts/protect-main.sh [owner/repo]
#
# The contexts are the job *names* — if GitHub shows different check names on
# your first green run, update the contexts below to match.
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

gh api -X PUT "repos/${REPO}/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["assert-first suite", "story↔test drift"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON

echo "Branch protection set on ${REPO}@main — required: 'assert-first suite', 'story↔test drift'."
