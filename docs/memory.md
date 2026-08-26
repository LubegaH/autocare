# Project Memory — AutoCare

## Facts

- Tier: 3 — multi-tenant production product with real customer, vehicle, approval, and financial data
- Stage: architecture and implementation plan complete; ADRs accepted on 14 August 2026 and MVP technical plan approved on 17 August 2026
- Initial market: small independent garages and private vehicle owners in Uganda
- Pilot target: 3–5 garages, approximately 10–25 staff and 100–300 customers
- Pilot operating-cost constraint: almost zero; paid SMS and automated WhatsApp are excluded
- Stack: React/Vite on Cloudflare Pages with Supabase and Resend; see ADR-0001

## Decisions index

- ADR-0001, React/Vite modular monolith with Supabase — accepted
- ADR-0002, shared-schema tenant isolation and immutable financial history — accepted
- ADR-0003, verified email/password authentication with Resend — accepted
- AutoCare MVP technical specification and vertical-slice plan — approved 17 August 2026
- High-Visibility Utility UI direction and `docs/design/ui-ux-acceptance.md` — approved 17 August 2026; the representative pre-coding walkthrough was completed with no material findings

## Conventions that aren't obvious from the code

- Design the operating workflow around owner/supervisor control of intake, approvals, cash, and invoicing; mechanics should perform only short operational updates.
- A vehicle must have an intake/job record before repair work begins, including walk-ins and customers who only called ahead.
- Every new cost requires customer authorization: either explicit pre-approval within the intake emergency allowance or a supplementary approval before additional work begins.
- Separate customer-facing labour charges from internal labour costs.
- The MVP cashbook supports operational bookkeeping and job profit, not formal accounting, payroll, or tax filing.
- A valid customer phone number is mandatory even though pilot identity and automated notifications use email.
- Never expose a garage's internal costs or profit to customers.

## What the agent gets wrong on this project

- Nothing recorded yet.

## Gotchas

- Garage operations are informal and may begin through a booking, a phone call, or an unannounced arrival; do not design intake as customer self-service only.
- Garages may depend on customer deposits to buy parts before repair begins.
- Opening a vehicle may reveal additional work; quotation versions and approvals must not be overwritten.
- Email adoption by staff and customers is unvalidated and must be measured during the pilot.

## Current focus

- Architecture, the MVP implementation plan, and the pre-coding usability gate are complete. Slice 1 tenant-safe identity and delegated access is implemented on `feat/slice-1-identity-access`: verified profiles, owner onboarding, staff invitations, explicit customer claims, and revocable `finance_admin` grants.
- Local disk space is constrained. Prefer GitHub Actions' disposable Supabase stack for fresh resets, pgTAP, and Playwright verification; keep local non-Docker checks fast and run hosted-development commands only against the dedicated synthetic-data project.
