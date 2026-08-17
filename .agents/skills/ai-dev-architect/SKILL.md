---
name: ai-dev-architect
description: Recommend a project stack and architecture, explain trade-offs, and record approved decisions as ADRs. Use after discovery has produced docs/prd.md or docs/brief.md and before scaffolding or implementation.
---

# Architect The Project

Recommend a stack and architecture for the project, explain the trade-offs, and record the approved design as ADRs.

## Gather Context

1. Read `docs/prd.md` or `docs/brief.md`. Stop and request `$ai-dev-discover` if neither exists.
2. Read `docs/workflow/stack-decision-framework.md`.
3. Read `docs/workflow/stack-profiles/react-typescript-supabase.md` when present.

## Evaluate The Design

- Evaluate the default profile against every framework criterion; do not rubber-stamp it.
- Check every documented known limit against the brief explicitly.
- Prefer boring, familiar technology unless a requirement objects.
- Introduce at most one unfamiliar major component.
- State load assumptions and identify the growth point that invalidates the design.

Present the recommendation and wait for user agreement before writing ADRs.

## Complete The Workflow

Create `docs/decisions/0001-stack.md` from the ADR template. Add separate ADRs for decisions that required debate, such as data isolation or authentication. Finish only after the user approves the recorded decisions.
