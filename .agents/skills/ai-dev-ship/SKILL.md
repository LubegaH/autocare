---
name: ai-dev-ship
description: Ship the current work through review, testing, deployment-readiness, approval, pull request, deployment, and post-deploy verification gates. Use only when the user explicitly asks to ship completed work.
---

# Ship Through Every Gate

Read `docs/workflow/deployment-readiness-checklist.md`, the project tier, and `AGENTS.md` constraints.

Complete these gates in order:

1. Confirm `$ai-dev-review` completed with APPROVE; run that workflow if needed.
2. Run the full test suite and build.
3. Walk the deployment-readiness checklist item by item.
4. For schema changes, verify migration files and restate the rollback plan. Production migrations must use the pipeline, never a manual push.
5. Confirm new environment variables exist in the target environment.
6. Show `git diff --stat` against the target branch with a grouped summary, then wait for explicit user approval.
7. After approval, create conventional commits, push, and open a pull request covering what, why, testing, risks, and migration notes.
8. Merge according to project policy; never commit directly to a protected branch.
9. Run post-deploy verification and monitor errors for 30 minutes.
10. Update memory or roadmap records with what shipped and the next focus.

Do not pass an approval gate implicitly.
