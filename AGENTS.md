# [Project name] — Agent Guide

<!-- Generated from ai-dev-workflow. Replace every [bracket]. Keep short
and accurate; move detail into docs/ and reference it. Codex loads this
automatically; the closest AGENTS.md to the working directory wins. -->

## Project
[What this is, who uses it, tier (1/2/3). If production: what must never
break. 2–4 sentences.]

## Repo layout
[Directory map, one line each]

## How to run
```bash
[dev / build / test / lint / migration commands]
```
Run the affected tests after each unit of work; run the full suite and
build before declaring any task done.

## Engineering conventions
[Strictness, validation, error shape, logging, component/function size
limits — the codebase's real conventions. Short.]

## Constraints — do not
- [e.g. never push schema changes directly to shared/production DBs —
  migration files only]
- [e.g. never add a dependency without asking]
- [e.g. never commit directly to main/dev — feature branches + PR]
- Never commit secrets; never log tokens or personal data

## Definition of done
A task is done when: the plan was approved before coding; code + tests
exist for every unit; affected tests and full build pass; the review in
`code_review.md` has been applied; docs touched by the change are updated.

## Workflow docs
Lifecycle checklists and templates live in docs/workflow/ (discovery,
stack decision, database/api/frontend/backend checklists, testing
strategy, security review, deployment readiness). Consult the relevant
one before the corresponding work — e.g. read
docs/workflow/database-design-checklist.md before any schema change.

## Review
Before finishing any task, review the diff per code_review.md (also used
by /review). Security-sensitive diffs additionally get
docs/workflow/security-review-checklist.md.

## Memory
Long-term project memory: docs/memory.md — decisions index, conventions,
gotchas, and "what the agent gets wrong" (add to it when a mistake
recurs). Session handoffs: docs/handoffs/.
