# Project Discovery

Purpose: turn a fuzzy idea into a one-page project brief before any
architecture or code. Method: the grilling interview — one question at a
time, recommended answer offered with each, codebase/market explored
instead of asked where possible.

## Questions to resolve (in this order)

1. **Problem** — What hurts today, for whom, how often? What do they do
   about it now (the current workaround is your real competitor)?
2. **Users** — Who exactly? Roles? Technical level? How many at launch,
   how many if it works?
3. **Core workflows** — The 2–5 things a user must be able to do. Walk
   each one end to end in words.
4. **MVP in** — The smallest set of workflows that delivers the value.
5. **MVP out** — Named exclusions with a reason each. An MVP without an
   exclusion list isn't minimal, it's just unfinished.
6. **Assumptions to validate** — What are we believing without evidence?
   Which assumption, if wrong, kills the project? Test that one first.
7. **Risks** — Technical, adoption, data, dependency. Likelihood ×
   impact, top three only.
8. **Data** — What entities exist? What's sensitive (PII, money, health)?
   What must never be lost? What must never leak between users?
9. **Integrations** — What existing systems must this talk to? Auth
   provider? Email? Payments? For each: needed at MVP or later?
10. **Success** — What measurable thing is true in 3 months if this
    worked? What would make you kill it?
11. **Tier** — Declare Tier 1/2/3 per project-tiers.md.

## Output
Fill product-requirements-template.md (Tier 2+) or a one-page brief
(Tier 1). See examples/example-new-project-brief.md.

Do not proceed to stack selection until the brief is agreed.
