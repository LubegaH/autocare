---
name: ai-dev-scaffold
description: Scaffold a project from an approved brief and architecture ADRs, install workflow artifacts, and prove the stack with a walking skeleton. Use only after discovery and architecture decisions are approved.
---

# Scaffold The Approved Project

Require `docs/prd.md` or `docs/brief.md` and `docs/decisions/0001-stack.md`. Verify current scaffolding-tool syntax against official documentation before running it.

Set up from the first commit:

- Git and an initial commit before feature code.
- Strict types, linter, test runner, and one real passing test.
- `.env.example`.
- Migration tooling and an initial migration.
- CI on push for Tier 2 or higher.
- Shared workflow documents, populated `AGENTS.md`, `code_review.md`, `docs/memory.md`, `docs/decisions/`, and `docs/handoffs/`.

Build the thinnest end-to-end walking skeleton: one page, one action, one table, and one test. Do not turn it into a feature.

Finish when the build, tests, and development server run. Present the resulting structure and confirm that `AGENTS.md` describes reality.
