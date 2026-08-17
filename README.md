# AutoCare

AutoCare is a phone-first garage-management platform for small independent garages in Uganda. This repository currently contains the Slice 0 foundation and a walking skeleton that reads one synthetic status row from local Supabase.

## Prerequisites

- Node 22.22.3 (see `.nvmrc`)
- npm 10.9.8
- A Docker-compatible runtime for local Supabase

## Local setup

```bash
npm ci
npm run db:start
cp .env.example .env
```

Replace `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env` with the publishable/anonymous key printed by `npm run db:start`, then run:

```bash
npm run db:reset
npm run dev
```

The application is served at `http://localhost:5173`. Supabase Studio is available at `http://127.0.0.1:54323`.

## Quality checks

```bash
npm run check
npm run db:test
npm run test:e2e
```

The initial type contract is derived from the migration because no container runtime was available during scaffolding. Run `npm run db:types` after starting local Supabase, then commit the official generated output; repeat this after every migration. Never put production credentials in a `VITE_` variable because browser variables are public by design.

## Branch and promotion convention

Work on a non-default feature branch and open a pull request into `main`. CI runs on pushes and pull requests. Hosted Supabase/Cloudflare environments are not provisioned by this scaffold; promotion and production data require separate approval and the deployment-readiness checklist.
