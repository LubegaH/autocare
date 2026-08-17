# AutoCare — Agent Guide

## Project

AutoCare is a Tier 3 multi-tenant garage-management platform for small independent garages in Uganda. The pilot handles sensitive customer, vehicle, approval, and financial records. Tenant isolation, customer privacy, and immutable approval/financial history must never break.

## Repo layout

- `src/features/` — product slices, grouped by domain workflow
- `src/shared/` — cross-cutting config, database client/types, and small contracts
- `tests/e2e/` — focused Playwright workflow tests
- `supabase/migrations/` — versioned database schema changes
- `supabase/tests/` — pgTAP database and RLS tests
- `docs/decisions/` — accepted architecture decisions
- `docs/design/` — authoritative UI/UX contract and reference artifacts
- `docs/workflow/` — lifecycle checklists and quality standards
- `docs/handoffs/` — session continuation notes

## How to run

```bash
npm ci
npm run db:start
cp .env.example .env # replace the publishable key with `db:start` output
npm run db:reset
npm run dev

npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run db:test
npm run build
```

Node 22.22.3 and npm 10.9.8 are pinned. Local Supabase requires a Docker-compatible runtime. Run affected tests after each unit; run `npm run check`, database tests, relevant E2E, and a fresh migration reset before declaring work done.

## Engineering conventions

Use strict TypeScript with no `any`, Zod at runtime boundaries, typed `Result` values for expected failures, and human-readable recoverable UI errors. Keep product code inside a feature module; promote code to `shared` only after it has genuine cross-feature use. Components should stay near 150 lines, touch targets are at least 44px, and every data view handles loading, empty, error, success, and relevant partial/offline states.

All tenant tables carry `garage_id`, use tenant-consistent foreign keys, and enable deny-by-default RLS. App-layer authorization and RLS are both mandatory. Store money as integer minor units or exact numeric values and timestamps as `timestamptz`; sensitive records use append/reverse history, never silent overwrite or deletion.

## Constraints — do not

- Never apply schema changes directly to shared or production databases; add reviewed migrations.
- Never add a dependency or change an accepted ADR without owner approval.
- Never commit directly to `main`; use feature branches and pull requests.
- Never expose internal garage costs, cashbook data, expenses, or profit to customers or mechanics.
- Never queue offline intake, approval, repair, financial, or history-access writes.
- Never commit secrets; never log tokens or personal data.

## Definition of done

A task is done when the plan was approved before coding; code and tests exist for every unit; affected tests, the full suite, database reset/tests, E2E, and build pass; findings from `code_review.md` are applied; and touched docs are current. Security-sensitive diffs also pass `docs/workflow/security-review-checklist.md`.

## Workflow docs

Consult the relevant checklist in `docs/workflow/` before the corresponding work. In particular, read the database checklist before schema changes, frontend checklist before UI work, testing strategy when defining coverage, and deployment checklist before release work.

## Memory

Long-term project memory is `docs/memory.md`. Record accepted decisions in `docs/decisions/`, recurring agent mistakes in memory, and session handoffs in `docs/handoffs/`.
