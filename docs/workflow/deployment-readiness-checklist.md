# Deployment Readiness Checklist

## Environments
- [ ] Local, staging (Tier 2+), production — separate configs and DBs
- [ ] Promotion path defined: what merges where, what deploys when
- [ ] Staging resembles production (same platform, same migrations)

## Configuration
- [ ] `.env.example` lists every variable with a one-line description
- [ ] All production values set and verified before deploy
- [ ] App fails fast at boot on missing config

## Database
- [ ] Migrations applied via migration files, in the deploy pipeline,
      before or with the code that needs them
- [ ] Rollback plan for this release's migrations restated
- [ ] Backups running; restore tested at least once

## Release process
- [ ] Deploys from a protected branch via PR, never a direct push
- [ ] Version tagged; human-readable changelog updated
- [ ] Rollback procedure known and takes minutes, not hours
      (previous deploy re-promotable)

## Post-deploy verification (do these, every release)
- [ ] Log in as each role; exercise the core workflow once
- [ ] Error tracker / logs watched for the first 30 minutes
- [ ] Background/cron jobs confirmed running on schedule

## Operations baseline (Tier 2+)
- [ ] Error tracking wired (e.g. Sentry) with alerts reaching a human
- [ ] Uptime check on the main URL
- [ ] Platform spend alerts configured
- [ ] Known issues and operational quirks recorded in the runbook/docs
