---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document summarising the current conversation so a fresh
agent can continue the work.

Save it to `docs/handoffs/YYYY-MM-DD-[short-topic].md` inside the
repository — never a temp directory. Handoffs are project state and must
survive the machine and be visible to the next session. Create the
directory if missing. Use `docs/workflow/handoff-template.md` if present.

Always include: current branch and uncommitted-change state, build/test
status, work in flight and exactly where it stopped, ordered next steps,
decisions made this session not yet recorded elsewhere, gotchas, and a
"suggested skills/commands" section for the next agent.

Do not duplicate content already captured in other artifacts (PRDs,
plans, ADRs, issues, commits, diffs). Reference them by path instead.

Redact any sensitive information: API keys, passwords, personal data.

If the user passed arguments, treat them as a description of what the
next session will focus on and tailor the doc accordingly.
