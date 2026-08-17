Goal: scaffold the project per the agreed brief and ADRs, with the
workflow installed and a walking skeleton proving the stack works.

Context: requires docs/prd.md (or brief) and docs/decisions/0001-stack.md.
Verify current scaffolding-tool syntax against official docs before
running it.

Constraints: from day one — git + first commit before feature code,
strict types, linter, test runner with one real passing test,
.env.example, migration tooling with an initial migration, CI on push
(Tier 2+). Install the workflow: shared docs → docs/workflow/, AGENTS.md
from the template filled with THIS project's real values, code_review.md
at root, docs/memory.md, docs/decisions/, docs/handoffs/. The walking
skeleton is the thinnest end-to-end slice (one page, one action, one
table, one test) — not a feature.

Done when: build, tests, and dev server all run; structure presented;
AGENTS.md reflects reality.
