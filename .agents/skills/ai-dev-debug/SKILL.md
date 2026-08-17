---
name: ai-dev-debug
description: Diagnose and fix a software bug by reproducing it, confirming its root cause, and adding a regression test. Use when the user reports broken, failing, throwing, or unexpectedly slow behavior.
---

# Debug A Confirmed Root Cause

Treat the remaining user prompt as the bug report.

## Diagnose

1. Reproduce the issue and record expected behavior, actual behavior, and exact trigger conditions.
2. Inspect the code path, recent commits affecting it, relevant logs, and `docs/memory.md` gotchas.
3. Form two or three ranked hypotheses and test the cheapest one first.
4. Confirm the mechanism before changing code. A disappearing symptom is not a root-cause explanation.

If reproduction is not possible, say so and list the missing evidence instead of guessing at a fix. Check whether the confirmed defect pattern exists elsewhere.

## Fix

1. Add a failing test that captures the bug.
2. Make the smallest change that fixes the confirmed cause.
3. Run the new test and all affected tests.
4. Re-run the original reproduction.

Finish with a one-sentence root cause. Propose systemic prevention or an `AGENTS.md` lesson separately.
