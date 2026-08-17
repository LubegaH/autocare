# Stack Profile: React + TypeScript + Node + Supabase (the default)

Your default hypothesis for web products. Confirm or reject it through
stack-decision-framework.md — never skip the evaluation, even when the
answer is obviously this.

## The profile
- Next.js (App Router) · React · TypeScript strict · Tailwind
- Supabase: Postgres, Auth, Storage, RLS
- ORM: Prisma or Supabase client (pick per project, record in ADR;
  Prisma buys migrations discipline and types, Supabase client buys
  RLS-native simplicity)
- Zod at every boundary · Shadcn/Radix for UI
- Vercel hosting · Resend (email) · Sentry (errors, Tier 2+)
- Testing: Vitest + Testing Library; Playwright for E2E (Tier 2+)

## Where it excels
CRUD-and-dashboards SaaS, auth-gated multi-role apps, MVPs needing speed,
solo/small-team maintenance, low-ops serverless deployment.

## Known limits — check BEFORE committing, not after
- Long-running work: serverless function timeouts make heavy jobs
  awkward — plan queues/workers (or different hosting) if jobs exceed
  platform limits
- Realtime at scale: Supabase Realtime fine for presence/small fanout;
  heavy websocket loads need dedicated infra
- Heavy compute / ML: wrong platform; separate service
- Complex reporting over big data: Postgres will carry you far, but plan
  read replicas / warehouse export beyond that
- Mobile-first native: this is a web profile; Expo/React Native is a
  different decision
- Vendor coupling: RLS + Auth + Storage on Supabase is real lock-in;
  accept it consciously in the ADR

## Defaults that travel with this profile
- RLS on from the first table for any multi-user data (cheap now,
  painful later)
- Migrations from day one, even solo — `db push` only against local
  throwaway DBs
- Server-side data access by default; client fetch is the exception
- `.env.example` maintained from the first secret
