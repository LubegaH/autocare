# AutoCare

AutoCare is a phone-first garage-management platform for small independent garages in Uganda. The repository currently contains the Slice 0 foundation and Slice 1 tenant-safe identity and delegated-access workflows.

## Prerequisites

- Node 22.22.3 (see `.nvmrc`)
- npm 10.9.8
- A Docker-compatible runtime for local Supabase
- Gitleaks 8.30.1 for optional local secret scanning (CI installs a verified copy)

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
npm run secrets:scan
npm run db:test
npm run test:e2e
```

Database types are generated from Supabase. Run `npm run db:types` after starting local Supabase, then commit the generated output; repeat this after every migration. Never put production credentials in a `VITE_` variable because browser variables are public by design.

If local disk space prevents running containers, push a feature branch and use the `database` GitHub Actions job as the fresh-reset, pgTAP, generated-types, and Playwright gate. The job runs its own disposable local Supabase stack on a hosted runner. It does not apply migrations to a shared or production database.

### Hosted development project

Developers who need an interactive database without a local container runtime may use a dedicated, synthetic-data-only Supabase development project. Configure `.env`, authenticate the CLI, and link the repository to that project before running:

```bash
npx supabase db push --linked --dry-run
npx supabase db push --linked --include-seed
npm run db:types:linked
```

The CLI's pgTAP runner still requires Docker even with `--linked`, so `npm run db:test` and fresh local resets remain mandatory in CI. Never link these development commands to production, and never run `db reset --linked` without independently verifying the disposable target project.

## Branch and promotion convention

Work on a non-default feature branch and open a pull request into `main`. CI runs on pushes and pull requests. Hosted Supabase/Cloudflare environments are not provisioned by this scaffold; promotion and production data require separate approval and the deployment-readiness checklist.
