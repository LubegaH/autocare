---
name: ai-dev-handoff
description: Write a durable repository handoff so a fresh session or another agent can continue without re-deriving context. Use when pausing work, changing agents, ending a session, or explicitly requesting a handoff.
---

# Write A Durable Handoff

Treat any remaining user prompt as the next session's focus. Read `docs/workflow/handoff-template.md` when present.

Save the handoff to `docs/handoffs/YYYY-MM-DD-[topic].md` inside the repository, never a temporary directory. Include:

- Current branch and uncommitted-change state.
- Build and test status.
- Work in flight and exactly where it stopped.
- Ordered next steps that work from a cold start.
- Decisions not recorded elsewhere.
- Gotchas.
- Suggested first commands or skills for the next session.

Reference existing artifacts by path instead of duplicating them. Redact secrets and personal data. Finish by showing the user the handoff's next-steps section.
