# Stack Decision Framework

The default profile (stack-profiles/react-typescript-supabase.md) is the
starting hypothesis, never the automatic answer. Evaluate first, then
either confirm the default or argue for something else — in an ADR either
way.

## Evaluate against the brief

| Criterion | Questions |
|---|---|
| Requirements fit | Realtime? Heavy computation? Offline? Mobile-first? File processing? ML? Each of these strains a default web stack differently. |
| Complexity | CRUD + auth + dashboards → default stack excels. Complex domain logic, queues, heavy background work → consider a separate backend service. |
| Team | Solo intermediate dev: favour boring technology you already run in production (your React/TS/Supabase experience is a real asset — count it). New tech budget: max one unfamiliar major component per project. |
| Hosting & ops | Who's on call? Serverless (Vercel) minimises ops for Tier 1–2. Long-running jobs, websockets at scale, or heavy cron → check platform limits BEFORE committing. |
| Auth | Standard email/social → Supabase Auth fine. Enterprise SSO/SAML, complex org hierarchies → evaluate dedicated auth. |
| Database | Relational data (most apps) → Postgres. Genuinely document-shaped or graph-shaped data → say so in the ADR and justify. Multi-tenant → RLS capability matters. |
| Security & compliance | Regulated data changes hosting, logging, and residency options. Decide before, not after. |
| Scale | Design for 10× current expectation, not 1000×. Kleppmann's lesson: state your load assumptions (users, requests/s, data volume) so future-you knows when the design expires. |
| Cost | Free tiers are fine for Tier 1. For Tier 2+, price the realistic month-12 bill, including the DB you'll outgrow. |
| Speed to MVP | Weeks matter more than elegance at MVP. Familiar and shipped beats optimal and unshipped. |

## Decision rules
- Prefer boring, familiar technology unless a requirement demands otherwise.
- One unfamiliar major component maximum per project.
- Every deviation from the default profile needs one sentence of
  justification in the ADR. So does choosing the default.
- Record what would make the choice wrong ("if we need X, revisit").

## Output
architecture-decision-template.md → docs/decisions/0001-stack.md
