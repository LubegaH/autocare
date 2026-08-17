Goal: produce an approved implementation plan for the task I describe —
before any code.

Context: read the relevant files and identify existing patterns to
follow; read docs/memory.md and ADRs touching this area; verify current
APIs for fast-moving libraries against official docs. For ambiguous or
high-risk work (schema, auth, money): interview me one question at a
time, recommended answer with each, until we share an understanding —
or I'll use Plan mode and you ask your clarifying questions there.

Constraints: plan in vertical slices — each unit is code + its tests +
affected tests green before the next. Scale the write-up to the task
(paragraph for small, docs/workflow/technical-spec-template.md for
features over a day). Consult the relevant docs/workflow/ checklist for
any schema, API, frontend, or backend surface the plan touches. State
assumptions explicitly. Feature branch confirmed before work starts.

Done when: I approve the plan. Not before.
