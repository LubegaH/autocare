# Project Tiers

Declare a tier during discovery. It decides which quality gates apply, so
a weekend prototype doesn't carry SaaS ceremony and a production system
doesn't skip it. Record the tier in the project's memory file. Re-tier
when reality changes (a prototype getting real users is now Tier 2).

## Tier 1 — Prototype / spike
Goal: learn something fast. Disposable by default.
- Gates: plan before code (short), working demo, README with run steps
- Skip: ADRs (one paragraph in memory is enough), full test pyramid
  (smoke test the core path), security review (unless it handles real
  user data — then it's not Tier 1), deployment checklist
- Rule: if it stores real people's data or takes payments, it cannot be
  Tier 1 no matter what you call it.

## Tier 2 — Production, single team / small user base
Goal: real users, real data, one team maintaining it.
- Gates: discovery brief, ADR for stack + any non-obvious choice, tech
  spec for features over a day's work, tests per testing-strategy.md,
  code review loop, security-review-checklist before first deploy,
  deployment-readiness-checklist, docs + handoff current
- This is the default tier for most of your projects.

## Tier 3 — Multi-tenant, regulated, or high-stakes
Everything in Tier 2 plus:
- Defence in depth on data isolation (e.g. RLS + app-layer scoping)
- Migration rollback plans, expand–migrate–contract for destructive changes
- Audit logging for sensitive actions; data retention decisions recorded
- Security review repeated per release, not once
- Load/perf check on hot paths before launch
