Goal: write a handoff so a fresh session or another agent continues
without re-deriving context. If I pass arguments, that's the next
session's focus.

Context: docs/workflow/handoff-template.md.

Constraints: save to docs/handoffs/YYYY-MM-DD-[topic].md in the repo,
never a temp dir. Must include: branch + uncommitted state, build/test
status, in-flight work and exactly where it stopped, ordered next steps
starting cold, decisions not yet recorded elsewhere, gotchas, suggested
first commands for the next session. Reference artefacts by path; don't
duplicate. Redact secrets and personal data.

Done when: the file exists and you've shown me the next-steps section.
