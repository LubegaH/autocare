---
name: ai-dev-discover
description: Run product discovery for an idea and produce an agreed project brief or PRD. Use before architecture or implementation when requirements, users, scope, risks, or project tier are not yet established.
---

# Discover The Project

Treat the remaining user prompt as the product idea. Produce an agreed brief before architecture or code.

## Run Discovery

1. Read `docs/workflow/project-discovery.md` and follow its question order.
2. If `docs/workflow/` is missing, ask the user to install the shared ai-dev-workflow documents first.
3. Research answers from the workspace or authoritative sources when possible.
4. Ask one question per turn and include a recommended answer with each question.
5. Declare a tier using `docs/workflow/project-tiers.md` and confirm it with the user.

Do not discuss stack or architecture; `$ai-dev-architect` owns that decision.

## Record The Outcome

Create `docs/prd.md` for Tier 2 or higher using the PRD template, or `docs/brief.md` for Tier 1. Record every unvalidated assumption. Finish only when the user agrees with the document.
