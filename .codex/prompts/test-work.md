Goal: write or improve tests for the code I name.

Context: docs/workflow/testing-strategy.md, this project's tier, the
existing test patterns in the repo (extend them; don't invent parallel
conventions).

Constraints: priority order — business logic → authorisation/isolation →
contracts (success, each error path, validation) → integration against a
real local DB → E2E for core workflows only. Mock only true externals.
Test behaviour, not implementation. If the schema changed, verify
migrations against a fresh DB.

Done when: tests written, run, and green; report of what's covered and
what was deliberately skipped, with reasons.
