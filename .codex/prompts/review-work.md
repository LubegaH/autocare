Goal: review the current branch/session diff before it ships.

Context: run the built-in /review against the base branch if available;
either way, apply code_review.md (which points at
docs/workflow/code-review-standards.md) in full. Security-sensitive
diffs also get docs/workflow/security-review-checklist.md, findings
reported first.

Constraints: read changed files in full. 🔴 fix automatically; 🟡 present
each trade-off and wait for my call; 🟢 list without blocking. After
fixes: full suite + build must pass. Do not commit or push.

Done when: verdict delivered (APPROVE / APPROVE WITH FIXES / REQUEST
CHANGES) and remaining pre-ship items listed.
