# Backend Quality Checklist

## Structure
- [ ] Business logic lives in one layer (services/actions), not scattered
      across handlers, components, and DB triggers
- [ ] Dependencies point inward: domain logic does not import framework,
      transport, or UI code (the Clean Architecture rule that actually
      pays rent — everything else is negotiable)
- [ ] No duplicated business rules — one function, one source of truth

## Error handling
- [ ] Every external call (DB, API, email, storage) has a failure path
      that is handled, not just logged
- [ ] Errors caught at the boundary and translated: internal detail to
      logs, human-readable message to users
- [ ] Failures leave data consistent — transactions around multi-step
      writes; partial failures either roll back or are explicitly resumable

## Logging & observability
- [ ] Errors logged with context: operation name, relevant IDs, the error
- [ ] No secrets, tokens, passwords, or bulk PII in logs
- [ ] Tier 2+: a way to answer "what happened for user X at time Y"
      (structured logs or an error-tracking service like Sentry)
- [ ] Health check endpoint if anything monitors the service

## Background work
- [ ] Anything slow, retryable, or third-party-dependent (email, exports,
      syncs) runs as a job, not inline in a request
- [ ] Jobs are idempotent (safe to run twice) and record failures somewhere
      a human will see
- [ ] Scheduled jobs are secured (secret/signature) and monitored for
      "didn't run" — silence is the failure mode nobody notices

## Configuration
- [ ] All config via environment variables; a documented `.env.example`
      kept current
- [ ] The app fails fast and loudly on missing required config, at boot,
      not at first use
