# Security Review Checklist

Run before first deploy (Tier 2+), and per release (Tier 3). This is an
OWASP-informed working list, not a compliance certificate.

## Authentication
- [ ] Auth handled by a maintained provider/library — never hand-rolled
      password storage or session logic
- [ ] Sessions expire; logout actually invalidates
- [ ] Password reset / magic links: single-use, expiring, don't reveal
      whether an account exists
- [ ] Rate limiting on login, signup, reset

## Authorisation
- [ ] Every route/action checks authz server-side; UI hiding is not a control
- [ ] Object-level checks: caller owns/may access the specific resource
      (IDOR — the most common real-world hole)
- [ ] Multi-tenant: isolation enforced in at least two layers (query
      scoping + RLS/policies), with a test proving it
- [ ] Privilege changes (role grants, admin actions) are themselves
      restricted and logged

## Input & output
- [ ] All input validated server-side against schemas
- [ ] SQL only via parameterised queries/ORM — no string concatenation
- [ ] User content escaped on output; no `dangerouslySetInnerHTML`/`innerHTML`
      with user data (XSS)
- [ ] File uploads: type and size validated, stored outside the web root /
      in object storage, never executed

## Secrets & config
- [ ] No secrets in code, git history, client bundles, or logs
- [ ] Env vars for all secrets; different values per environment
- [ ] Anything ever committed by accident: rotated, not just removed
- [ ] Webhook signatures and cron secrets verified

## Dependencies
- [ ] `npm audit` (or ecosystem equivalent) clean of high/critical, or
      exceptions documented with a reason
- [ ] New dependencies vetted: maintained, popular enough, no typo-squats

## Data protection
- [ ] PII inventory: what's held, why, where; minimise ruthlessly
- [ ] Transport encrypted (HTTPS everywhere, including callbacks)
- [ ] Backups exist; restore tested; user data deletion path works
- [ ] Error messages and logs don't leak internals or personal data
