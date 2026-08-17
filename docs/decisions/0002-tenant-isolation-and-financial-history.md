# ADR-0002: Enforce shared-schema tenancy with RLS and immutable financial history

Date: 2026-08-14
Status: Accepted

## Context

AutoCare stores customer PII, vehicle history, repair approvals, debt, payments, internal costs, and garage profit for multiple independent garages. A garage must never see another garage's business records, and customers must never see unrelated customers or a garage's internal cost and profit. Quotations can change during a repair, but issued versions and customer authorization must remain provable. Cashbook corrections must not make prior financial activity disappear.

## Options considered

- One database per garage: provides a strong physical boundary but makes onboarding, migrations, operations, and a cross-garage customer portal expensive at pilot scale.
- Shared schema with application-only tenant filters: simple initially, but one missed filter can leak sensitive cross-garage data.
- Shared schema with RLS plus application authorization: preserves low operational cost while enforcing isolation independently of UI query correctness.

## Decision

Use one shared Postgres schema with a required `garage_id` on every tenant-owned business record. Global authentication identities are separate from garage-owned customer and vehicle records. Staff receive access through explicit garage memberships and roles; customer access derives from explicit customer/job relationships. The customer portal may aggregate records the authenticated customer is entitled to see, but that never grants one garage visibility into another garage's relationship with the same person.

Enable deny-by-default RLS on every exposed table and private storage bucket. Back it with application-level authorization, tenant-consistent foreign keys, and automated cross-tenant tests. No service-role credential may be present in browser code. Multi-record commands use atomic, security-invoker database functions where appropriate so caller identity and RLS remain effective.

Issued quotations and invoices are immutable snapshots; changes create linked revisions. Approval records identify the quotation revision, decision, method, actor, and time. Payments and cashbook entries are never silently updated or deleted after posting; corrections use reversal or compensating entries with reasons. Store Uganda-shilling amounts as integers, never floating-point values. Maintain an append-only activity history for sensitive approval and financial actions.

## Consequences

- A UI or query bug alone should not expose another tenant's records.
- RLS policy design, composite tenant integrity, and authorization tests become mandatory for every new business table.
- Customer identity can span garages without making garage business data global.
- Financial totals are reproducible from durable source entries, at the cost of explicit reversal and revision workflows.
- Ownership transfers cannot be implemented by reassigning a vehicle row and exposing its old history; they require a separately approved access and transfer policy.
- Revisit database-per-tenant isolation if contractual enterprise customers require physical separation, or if tenant-specific residency and restore requirements emerge.
