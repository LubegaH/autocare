---
name: ai-dev-refactor
description: Refactor specified code without changing behavior, using characterization coverage and small test-verified steps. Use when removing duplication, oversized functions, misleading names, misplaced logic, or dead code.
---

# Refactor Without Behavior Changes

Treat the remaining user prompt as the refactoring target and intended smell to remove.

Before editing, require affected behavior tests to pass. If coverage is insufficient, add characterization tests first. Confirm a clean worktree so refactoring commits do not mix with feature work.

Proceed in small named steps such as extract, rename, move, or inline. Run affected tests after each step and commit each working checkpoint. Do not replace obvious duplication with an abstraction that is harder to read.

If a bug appears during the refactor, record it, finish the behavior-preserving work, and fix the bug separately starting with a failing test.

Finish with passing tests and report what measurably improved and what was deliberately left alone.
