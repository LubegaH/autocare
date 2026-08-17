Goal: find and fix the root cause of the bug I describe.

Context: reproduce first — expected vs actual, exact trigger conditions.
Then evidence: the code path, recent commits to it, logs,
docs/memory.md gotchas.

Constraints: no code changes until the root cause is confirmed — 2–3
ranked hypotheses, tested cheapest-first; "symptom gone" is not a root
cause, explain the mechanism. Can't reproduce → say so and list what you
need; don't guess-fix. The fix starts with a failing test that captures
the bug, then the smallest change that passes it. Check whether the same
defect pattern exists elsewhere.

Done when: new test green, affected tests green, original reproduction
clean, one-sentence root cause stated, and any systemic fix or AGENTS.md
lesson proposed separately.
