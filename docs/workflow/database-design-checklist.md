# Database Design Checklist

## Modelling
- [ ] Entities match the PRD's data section; no speculative tables
- [ ] Every table: primary key, `created_at`, `updated_at`
- [ ] Foreign keys with explicit `ON DELETE` behaviour chosen, not defaulted
- [ ] Enums/lookup values constrained (DB enum or check constraint), not free text
- [ ] Money as integer minor units or `numeric` — never float
- [ ] Timestamps in UTC (`timestamptz`); timezone handling decided once, recorded
- [ ] Soft delete vs hard delete decided per table; audit trail for
      sensitive mutations (Tier 3: mandatory)

## Multi-tenant / multi-user isolation
- [ ] Tenant key (`organization_id` or equivalent) on every tenant table
- [ ] Every query scoped by tenant key at the app layer
- [ ] RLS policies (or DB-level equivalent) as the backstop — Tier 3 mandatory,
      Tier 2 strongly preferred on Supabase since it's nearly free
- [ ] A test proving user A cannot read user B's data

## Indexes & performance
- [ ] Index the columns in your actual `WHERE` / `ORDER BY` / join patterns
- [ ] Composite indexes match query column order
- [ ] No unbounded queries: pagination (`LIMIT`) on every list
- [ ] Known hot paths checked with `EXPLAIN ANALYZE` before launch (Tier 2+)

## Migrations
- [ ] Every schema change is a migration file, versioned in git
- [ ] Migrations apply cleanly to a fresh DB (test it)
- [ ] Rollback plan stated per migration; irreversible ones flagged loudly
- [ ] Destructive changes use expand–migrate–contract: add new →
      backfill → switch reads → remove old, in separate deploys
- [ ] Never push schema changes directly to a shared/production DB

## Data protection
- [ ] PII fields identified and minimised (don't store what you don't need)
- [ ] Secrets/tokens hashed or encrypted, never plain text
- [ ] Backup strategy exists and restore has been tested once (Tier 2+)
- [ ] Retention: what gets deleted, when, and how a user deletes their data
