Goal: onboard the ai-dev-workflow onto this EXISTING codebase without
changing any product code.

Context: survey the repo (structure, stack + versions, build/test/run
commands, CI, migrations, deploy target); read existing docs and note
staleness; infer the conventions ACTUALLY in use from the code.

Constraints: document reality, not aspiration — AGENTS.md must describe
the codebase as it is (aspirations under a marked heading) so the agent
doesn't fight the existing style. Identify the 3–5 riskiest areas (auth,
payments, isolation, untested load-bearing code). Declare a tier. Quick
scan against the security checklist headings. Propose characterisation
tests pinning current behaviour for risky untested areas — no refactoring
ahead of those. Present everything and wait for approval before writing
files.

Done when: survey + risk map presented; on approval: docs/workflow/
installed, AGENTS.md + code_review.md created from observed conventions,
docs/memory.md seeded, ADR-0001 backfilled for the existing stack.
