Goal: refactor the target I name, behaviour unchanged.

Context: the smell being removed (duplication, God function, misleading
name, wrong-layer logic, dead code) and the tests covering the area.

Constraints: hard gate — tests covering affected behaviour pass NOW, or
characterisation tests get written first. Clean tree; refactor commits
never mixed with feature commits. Small named steps (extract, rename,
move, inline), tests green after each, commit each. Bugs found mid-way:
note, finish the refactor, fix separately with a failing test first.
Don't swap crude duplication for a clever abstraction that reads worse.

Done when: goal met, tests green, report of what measurably improved and
what you deliberately left alone.
