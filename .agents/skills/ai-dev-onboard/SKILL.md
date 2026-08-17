---
name: ai-dev-onboard
description: Onboard the ai-dev-workflow onto an existing codebase by surveying reality, risks, conventions, and missing workflow artifacts without changing product code. Use when adopting this workflow in an established repository.
---

# Onboard An Existing Codebase

Do not change product code.

## Survey

1. Inspect repository structure, stack and versions, run/build/test commands, CI, migrations, and deployment target.
2. Read existing documentation and identify stale claims.
3. Infer conventions from actual code.
4. Identify the three to five riskiest areas, such as auth, payments, isolation, or untested load-bearing code.
5. Declare a project tier and scan the security checklist headings.
6. Propose characterization tests for risky untested behavior before any refactoring.

Document reality, not aspiration. Put aspirations under a marked heading.

Present the survey and risk map, then wait for approval before writing files. On approval, install `docs/workflow/`, populate `AGENTS.md` and `code_review.md` from observed conventions, seed `docs/memory.md`, create `docs/decisions/` and `docs/handoffs/`, and backfill ADR 0001 for the existing stack.
