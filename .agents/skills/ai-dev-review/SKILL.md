---
name: ai-dev-review
description: Review the current branch or session diff against repository standards and the originating specification before shipping. Use after implementation is complete and before commits are pushed or deployed.
---

# Review Work Before Shipping

Review the diff against the base branch when available. Read every changed file in full and apply `code_review.md`, including `docs/workflow/code-review-standards.md`. For security-sensitive changes, also apply `docs/workflow/security-review-checklist.md`.

Report findings first by severity:

- Red: fix automatically.
- Yellow: present each trade-off and wait for the user's decision.
- Green: list as non-blocking.

After fixes, run the full test suite and build. Do not commit or push.

Finish with one verdict: APPROVE, APPROVE WITH FIXES, or REQUEST CHANGES. List all remaining pre-ship work.
