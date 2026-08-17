---
name: ai-dev-document
description: Bring project documentation into agreement with the current code and configuration. Use when setup, architecture, API, database, deployment, environment, or known-issue documentation is missing or stale.
---

# Align Documentation With Reality

Review `README.md`, `.env.example`, and the architecture, database, API, deployment, and known-issues documentation. Create missing documents from `docs/workflow/` templates where available.

## Rules

- Document what exists, not what should exist. Put aspirations under an explicitly marked heading.
- Verify setup commands and environment variables against code and configuration.
- Delete stale claims; wrong documentation is worse than missing documentation.
- Link to ADRs instead of restating their decisions.

Finish with a report of every disagreement found between code and documentation and how it was resolved.
