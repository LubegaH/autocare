---
name: ai-dev-resume
description: Resume a project session from handoffs, memory, task state, and git status while verifying a healthy working state. Use at the start of a continuation session before changing files.
---

# Resume Work Safely

Read the newest document in `docs/handoffs/` when it is newer than the last recorded completion. Also read `docs/memory.md`, the roadmap or task list, and current git status.

If pre-existing uncommitted changes exist, list them and ask whether to commit, stash, or discard them. If pending work is on a protected branch, create the appropriate feature branch. Run the build quietly and resolve build failures before any other work; defer the full suite until review.

Do not modify project files until the user says to proceed.

Deliver a briefing containing the last completed work, current focus, immediate next action, and queue depth.
