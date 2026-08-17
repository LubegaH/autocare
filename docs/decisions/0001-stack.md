# ADR-0001: Use a React/Vite modular monolith with Supabase

Date: 2026-08-14
Status: Accepted

## Context

AutoCare is a Tier 3 multi-tenant product for a 3–5 garage pilot, with a 10× design target of 50 garages, 250 staff, 3,000 active customers, 250 jobs per day, and a peak near 30 requests per second. Its workload is relational CRUD, authorization, document generation, light reporting, and transactional email; the MVP has no heavy computation, large realtime fan-out, or long-running jobs. The interface must be phone-first and low-data, while the pilot infrastructure should cost almost nothing without sacrificing recoverability of real financial and repair records. A live pilot therefore needs managed backups even if development remains on free services.

## Options considered

- Next.js on Vercel with Supabase: matches the default profile, but server rendering adds little to authenticated dashboards and Vercel's free Hobby plan is restricted to non-commercial use.
- React/Vite on Cloudflare Pages with Supabase: keeps the frontend static and inexpensive while retaining managed Postgres, Auth, Storage, and RLS.
- React with a custom Node API and managed Postgres: offers maximum control but adds a service, deployment surface, and operational burden before the domain requires them.

## Decision

Build a modular monolith using React, strict TypeScript, Vite, React Router, Tailwind, shadcn/Radix, and Zod. Host static assets on Cloudflare Pages. Use Supabase Postgres, Auth, private Storage, database functions, and narrowly scoped Edge Functions; use the Supabase client and generated database types rather than Prisma. Use Resend for custom SMTP and transactional email, Sentry for error monitoring, Vitest and Testing Library for component tests, Playwright for end-to-end tests, and database integration tests for migrations and RLS.

Use SQL migrations from day one and keep privileged service credentials out of the browser. Provision the production database in Frankfurt unless pre-provisioning latency tests and the data-transfer review justify Mumbai. Development may use free services, but a live pilot with real data uses Supabase Pro, currently establishing an expected base cost of about USD 25/month plus a domain.

## Consequences

- Authenticated workflows ship quickly without operating a standalone API or application server.
- Cloudflare Pages keeps static hosting near zero cost, while Supabase provides one managed relational backend.
- The application accepts Supabase coupling through Auth, RLS, Storage, and database functions; portable SQL migrations and modular domain code preserve a practical exit path.
- The MVP caches static application assets but does not queue offline financial, approval, or repair writes. Failed connectivity must be explicit and retryable.
- Small scheduled reminder batches may use managed functions. A durable queue or separate worker is introduced only when integrations require retries or jobs become long-running.
- Revisit if reliable offline writes become mandatory, reporting harms transactional performance, workload exceeds roughly 500 garages or 100 sustained requests per second, or a native mobile client becomes essential.
