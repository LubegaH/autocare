---
name: ai-dev-plan
description: Produce an approved implementation plan in vertical slices before coding. Use for feature, fix, or refactor requests that require repository investigation, explicit assumptions, sequencing, or a technical specification.
---

# Plan Work Before Coding

Treat the remaining user prompt as the task to plan. Do not implement it.

## Investigate

1. Read relevant files and identify established patterns.
2. Read `docs/memory.md` and applicable ADRs.
3. Verify APIs for fast-moving libraries against official documentation.
4. Consult the relevant `docs/workflow/` checklist for schema, API, frontend, or backend changes.
5. Confirm the feature branch before implementation starts.

For ambiguous or high-risk work involving schema, authentication, or money, interview the user one question at a time and include a recommended answer. State all assumptions explicitly.

## Write The Plan

Organize the plan as vertical slices. Each slice must include implementation, its tests, and affected tests passing before the next slice. Use a paragraph for small work and `docs/workflow/technical-spec-template.md` for features expected to exceed one day.

Finish only after the user explicitly approves the plan.
