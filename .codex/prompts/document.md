Goal: bring project documentation in line with the current code.

Context: README, .env.example, docs/architecture.md, docs/database.md,
docs/api.md, docs/deployment.md, docs/known-issues.md — creating from
docs/workflow/ templates where missing.

Constraints: document what IS, not what should be (aspirations under a
marked heading). Verify setup steps and env vars against actual code and
config, not memory. Delete stale content — wrong docs are worse than
none. Link to ADRs rather than restating them.

Done when: docs updated and a report of every place code and docs
disagreed.
