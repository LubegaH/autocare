---
name: ai-dev-implement
description: Implement an approved plan in tested vertical slices while following repository conventions. Use only after the implementation plan is approved and the feature branch is confirmed.
---

# Implement The Approved Plan

Read the approved plan, `AGENTS.md`, and `docs/memory.md` before editing.

## Work In Vertical Slices

For each unit of work:

1. Implement the smallest complete slice.
2. Add or update its tests.
3. Run affected tests and fix failures before continuing.
4. Follow existing codebase patterns over personal preference.

If the approved plan proves wrong, stop and present options instead of silently changing the architecture. Ask before adding a dependency. Commit only at working checkpoints using conventional messages, and never commit broken state.

Do not merge or ship. The `$ai-dev-review` and `$ai-dev-ship` workflows own those gates.

Finish when every slice is complete and the full test suite and build pass. Tell the user the work is ready for `$ai-dev-review`.
