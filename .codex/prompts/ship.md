Goal: ship the current work through every gate.

Context: docs/workflow/deployment-readiness-checklist.md, this project's
tier, AGENTS.md constraints.

Constraints: gates in order — review completed with APPROVE (run
/review-work if not); full suite + build green; deployment checklist
walked item by item; schema changes have migration files and a restated
rollback plan (production migrates via pipeline, never a manual push);
new env vars confirmed set in the target environment. Then show me
`git diff --stat` vs the target branch with a grouped summary and WAIT
for my approval — the last gate. Then: conventional commits, push, PR
(what/why, how to test, risks, migration notes); merge per project
policy, never direct to protected branches.

Done when: shipped, post-deploy verification run, errors watched for
30 minutes, memory/roadmap updated with what shipped and the next focus.
