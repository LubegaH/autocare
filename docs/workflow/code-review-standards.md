# Code Review Standards

Review the diff as a sceptical senior engineer reviewing a capable but
occasionally careless colleague. Read changed files in full, not just
hunks. Be specific: file, line, suggested fix. No generic advice.

## Priority order
1. **Security & data safety** — authz on every new path, tenant/user
   isolation, input validation, secrets, injection, leaky errors.
   Always 🔴 when found.
2. **Correctness** — logic errors, unhandled failure paths, missing
   transactions, race conditions, off-by-one/boundary issues.
3. **Tests** — new logic without tests, bug fixes without a regression
   test, tests that assert implementation rather than behaviour.
4. **Simplicity** — flag BOTH directions:
   - Overengineering: abstractions with one caller, speculative config,
     patterns imported from bigger systems than this one
   - Underengineering: copy-paste that should be a function, magic
     values, God functions doing five jobs
5. **Maintainability** — naming that lies or vagues ("data", "handle",
   "misc"), separation of concerns, dead code, file organisation
   consistent with the codebase's existing pattern.
6. **Error handling & UX of failure** — user sees something helpful,
   logs see something diagnostic.
7. **Performance** — only flag what's plausibly hot: N+1s, unbounded
   queries, sequential awaits that should be parallel. Don't
   micro-optimise cold paths.
8. **Docs** — README/env/API docs stale relative to this diff?

## Output format
- 🔴 Critical — must fix before merge (what, where, how)
- 🟡 Judgment call — the trade-off in two sentences, then a recommendation
- 🟢 Minor — one line each
- Verdict: APPROVE / APPROVE WITH FIXES / REQUEST CHANGES

## Refactoring rules (when the review triggers one)
- Refactor only with green tests before and after; behaviour unchanged
- Small named steps (extract function, rename, move) — not a rewrite
- Refactor commits separate from feature commits
