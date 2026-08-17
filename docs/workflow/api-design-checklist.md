# API Design Checklist

Applies to REST endpoints, RPC routes, and server actions alike.

## Shape & naming
- [ ] Nouns for resources, consistent plurality; verbs only for true actions
- [ ] One consistent response envelope everywhere, decided once
      (e.g. `{ success, data?, error? }`) — and errors never leak
      internals (stack traces, ORM messages, SQL)
- [ ] Error responses distinguish: validation (400), unauthenticated (401),
      unauthorised (403), missing (404), conflict (409), server (500)
- [ ] Pagination on every collection (cursor preferred for large sets);
      default and max page sizes enforced server-side
- [ ] Versioning strategy decided before first external consumer

## Input handling
- [ ] Every input validated server-side with a schema (Zod or equivalent) —
      client validation is UX, not security
- [ ] Unknown fields rejected or stripped, not silently stored
- [ ] IDs validated for format AND ownership (can this caller touch this
      resource? — the classic IDOR check)

## Semantics
- [ ] Mutations that could be retried are idempotent or protected
      (idempotency key, unique constraint, or upsert)
- [ ] Multi-step writes wrapped in a transaction
- [ ] Long work (>2s) moved to a background job with a status the client
      can poll — not a hanging request

## Security & operations
- [ ] Auth required by default; public endpoints are the explicit exception
- [ ] Authorisation checked per resource, at the handler, every time
- [ ] Rate limiting on auth endpoints and anything expensive (Tier 2+)
- [ ] Requests logged with correlation context (who, what, when — not
      passwords, not tokens, not full PII)
- [ ] Webhooks verified by signature; cron endpoints by secret
