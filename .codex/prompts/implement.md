Goal: implement the approved plan.

Context: the plan's vertical slices, AGENTS.md conventions,
docs/memory.md gotchas.

Constraints: after each unit — write its tests, run affected tests, fix
before moving on; never accumulate untested code. Follow existing
codebase patterns over personal preference. If the plan proves wrong
mid-way, stop and present options; don't silently improvise architecture.
New dependencies need my approval first. Commit at working checkpoints
with conventional messages; never commit broken state. Do not merge or
ship — /review and /ship own those gates.

Done when: all slices complete, full test suite and build green, and
you've told me it's ready for /review.
