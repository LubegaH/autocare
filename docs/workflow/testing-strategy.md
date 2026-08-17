# Testing Strategy

A feature is not complete until its tests exist and pass. Tests are
written alongside the code — per unit of work, not at the end of the
feature. This is the workflow's strongest lever on quality (fast feedback
loops are the single most consistent predictor of delivery performance).

## What to test, in priority order
1. Business logic — calculations, rules, state transitions. Pure
   functions, unit tested exhaustively (edges, boundaries, invalid input).
2. Authorisation — every role that should be rejected, is. Every tenant
   isolation boundary holds (user A cannot read user B's data).
3. API/action contracts — success path, each error path, validation
   (valid passes, invalid fails with the right message).
4. Integration — actions/endpoints against a real local DB, not mocks
   of the ORM. Mock only true externals (email, payments).
5. E2E — the 2–5 workflows the product exists for, nothing more.
   (Tier 2+; skip for Tier 1.) Slow suites stop getting run.

## Per tier
- Tier 1: smoke-test the core path; unit-test any tricky logic. Done.
- Tier 2: full priority list above; migrations verified against a fresh
  DB; CI runs the suite on every push.
- Tier 3: Tier 2 plus tenant-isolation tests as a named suite, migration
  rollback rehearsal, and a load sanity check on hot paths.

## Rules
- A bug fix starts with a failing test that reproduces it. No exceptions —
  it's the only proof you actually fixed it and the only guard against
  its return.
- Test behaviour, not implementation: assert on outputs and effects,
  not internal calls. Refactoring shouldn't break tests.
- Flaky test = broken test. Fix or delete the same day.
- Coverage: don't chase a number. Chase "the priority list is covered".

## Manual QA (before ship, per feature)
- Walk each affected workflow as each role, on mobile width once
- Try to break it: double-click submit, back button mid-flow, expired
  session, empty data, absurd input
- Check the five UI states actually render (loading/empty/error/success/partial)
