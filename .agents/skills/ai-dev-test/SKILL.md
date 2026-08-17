---
name: ai-dev-test
description: Write or improve behavior-focused tests using the repository's established patterns and risk priorities. Use for business logic, authorization, contracts, database integration, regressions, and core end-to-end workflows.
---

# Add Risk-Focused Tests

Treat the remaining user prompt as the code or behavior to test. Read `docs/workflow/testing-strategy.md`, the project tier, and existing test patterns.

Prioritize coverage in this order:

1. Business logic.
2. Authorization and isolation.
3. Contracts: success, every error path, and validation.
4. Integration against a real local database.
5. End-to-end coverage for core workflows only.

Mock only true external systems and test behavior rather than implementation. If the schema changed, verify migrations against a fresh database.

Run the tests and finish with a report of covered behavior and deliberately skipped coverage, including reasons.
