# Technical Spec: AutoCare MVP

Links: [PRD](prd.md) · [ADR-0001](decisions/0001-stack.md) · [ADR-0002](decisions/0002-tenant-isolation-and-financial-history.md) · [ADR-0003](decisions/0003-authentication-and-email.md) · Tier 3

Status: Approved on 2026-08-17 — implementation remains gated on the representative UI/UX walkthrough defined below.

## Summary

Build the six PRD workflows as a phone-first React/Vite single-page application backed by Supabase Auth, Postgres, private Storage, database functions, and narrowly scoped Edge Functions. The application is a modular monolith organized by business capability; sensitive multi-record commands live in transactional database functions while reads and simple writes use typed Supabase queries behind domain-facing repositories/actions. Every tenant-owned row carries `garage_id`, exposed tables and storage are deny-by-default under RLS, and all approval and financial history is append-only or revised rather than overwritten.

Delivery is sequenced as tracer-bullet vertical slices. Each slice includes its schema, authorization, application behavior, responsive UI, automated tests, and documentation, and its affected tests must pass before the next slice begins.

## Confirmed policies and assumptions

- Use Node 24 LTS and npm, pinned in the repository. Confirm exact compatible package versions during scaffolding; commit the lockfile.
- Use React Router Data Mode for a static SPA: it supplies route loaders, actions, and pending states without introducing a server-rendering framework.
- Store timestamps as `timestamptz` in UTC and display garage-local time in `Africa/Kampala` for the pilot.
- Store UGX amounts as non-negative `bigint` minor-unit integers (one UGX is the smallest unit used by the product); represent direction and reversals explicitly rather than with floating-point arithmetic.
- Customer self-service requires a verified account. Staff can create phone-ahead and walk-in customers without a portal account; linking later requires a single-use invitation or explicit claim.
- A valid phone number is mandatory and normalized to E.164. It remains marked unverified during the pilot.
- Emergency allowance is a cumulative ceiling for additional customer-facing charges discovered after intake. Each use consumes the remaining allowance, appears on a quotation revision, and is communicated; over-limit or unrelated work requires explicit approval.
- Owners/managers retain financial authority. Supervisors can record deposits and customer payments by default. An owner/manager can grant or revoke a predefined `finance_admin` capability set that permits payments, other cashbook entries, reversals, reconciliation, and internal-cost/profit access, but not capability grants, ownership changes, or garage security administration. Grants, revocations, and financial actions are audited.
- A lightweight job-funds workflow is in MVP: a supervisor requests funds for a job; an owner/manager or delegated finance admin approves and records release; the eventual expense is recorded separately and linked; unreconciled value remains visible. A recipient cannot approve their own request.
- Self-service vehicle ownership transfer is outside MVP. Customers retain access only to jobs and financial records in which they participated. A new owner receives no earlier history unless an authorized garage records a specific, documented history release; a vehicle row is never reassigned in a way that exposes prior-customer data.
- Issued quotations and invoices are immutable snapshots. Posted payments, releases, expenses, and cashbook entries are corrected only through linked reversal or compensating entries with actor, time, and reason.
- Static assets may be cached, but repair, approval, and financial writes are never queued offline. Connectivity failures remain visible, preserve entered form data, and support an explicit retry.
- Printable invoices and receipts use accessible print layouts and browser PDF output for MVP. WhatsApp sharing opens a prefilled share action containing a sign-in link, not sensitive data or bearer tokens.

## Architecture and module boundaries

Use one deployable application with capability modules under `src/features/`: `auth`, `garages`, `customers`, `vehicles`, `intake`, `quoting`, `workshop`, `finance`, `history`, `notifications`, and `reporting`. Shared UI primitives, configuration, typed result/error handling, and Supabase adapters live under `src/shared/`; generated database types live in a generated-only path and are never hand-edited.

Business rules are implemented once in domain services or transactional SQL functions, not duplicated in components, RLS policies, and ad hoc event handlers. RLS remains the independent data-access backstop. Authorization decisions query current membership and capability rows rather than mutable user metadata in JWTs, avoiding stale permission grants after revocation.

Use a consistent application action result: `{ success: true, data }` or `{ success: false, error: { code, message, fieldErrors? } }`. Validate every external input with Zod at the application boundary and again with database constraints. Map validation, unauthenticated, unauthorized, missing, conflict, and unexpected failures to stable error codes without leaking SQL, tokens, or personal data.

## Data model

All tenant tables have a primary key, `garage_id`, `created_at`, and `updated_at`; composite foreign keys include `garage_id` to prevent cross-tenant relationships. Statuses and methods use constrained lookup values. Sensitive records are archived or superseded, never hard-deleted through the product.

### Identity, tenancy, and access

- `profiles`: global profile tied one-to-one to `auth.users`; name, required normalized phone, phone-verification state.
- `garages`: tenant identity, contact details, timezone, operational settings.
- `garage_memberships`: user-to-garage membership and base role (`owner`, `manager`, `supervisor`, `mechanic`), lifecycle state, inviter, accepted time.
- `membership_capability_grants`: currently `finance_admin`; grantor, granted/revoked times, revoker, and reason. Only an active owner/manager can administer grants.
- `staff_invitations`: hashed single-use token metadata, garage, intended email/role, expiry, redemption and revocation audit.
- `garage_customers`: garage-owned customer/contact record, optionally linked to a global profile; no email-only auto-linking.
- `customer_claims`: hashed single-use invitation/claim, target garage customer, expiry, issuer, redemption and revocation metadata.

### Vehicle access and intake

- `vehicles`: garage-owned vehicle record with registration/VIN fields as available, make/model/year, archive state.
- `customer_vehicle_relationships`: customer-to-vehicle relationship with effective dates and relationship type; ending one relationship does not transfer historical access.
- `vehicle_history_releases`: explicit grant of selected prior job records to a new relationship, with grantor, scope, reason, and revocation state.
- `bookings`: customer request or staff-entered phone-ahead record, requested time, complaint, confirmation status, and source.
- `jobs`: active/completed intake record linking tenant-consistent customer and vehicle, source, mileage, complaint, visible condition, arrival details, emergency allowance, and current state.
- `job_status_events`, `job_assignments`, `diagnoses`, and `attachments`: attributable append-only operational history; attachments use private tenant-scoped Storage paths and metadata.

### Quoting and workshop

- `quotation_series`: stable job-level quotation identity.
- `quotation_versions`: numbered immutable issued snapshots, currency, totals, superseded link, issued actor/time, and status.
- `quotation_items`: typed labour/part/other customer-facing lines with description, quantity, unit charge, and computed total; internal costs are stored separately.
- `quotation_decisions`: decision for one exact version, method (`customer_portal`, `phone`, `in_person`, `allowance`), customer or recording staff actor, time, and evidence note.
- `allowance_allocations`: links eligible additional quotation items to the intake allowance and preserves cumulative consumption.
- `work_items`, `parts_used`, and `job_recommendations`: approved work, mechanic assignments/updates, fitted parts, internal part/labour/other cost, and future-maintenance advice. Internal cost columns are never exposed through customer-readable views or functions.

### Funds, invoices, and cashbook

- `job_fund_requests`: job, requester/recipient, purpose, requested amount, status, and decision metadata.
- `job_fund_releases`: approved/released amount, method/reference, releaser, time, and reversal link; database rules prevent self-approval and release beyond approval.
- `job_expenses`: actual job cost linked optionally to a fund release; unreconciled release is derived, not overwritten.
- `invoice_series`, `invoice_versions`, and `invoice_items`: numbered immutable final-account snapshots linked to approved quote/work records.
- `payments` and `payment_allocations`: append-only receipts/deposits/settlements with method (`cash`, `bank`, `mtn_momo`, `airtel_money`), optional external reference, invoice/job allocation, posting actor, and reversal link.
- `cashbook_entries`: append-only derived entries for payments/releases/job expenses plus manually entered other income/expense; origin uniqueness prevents duplicate posting.
- `daily_reconciliations`: garage business date, expected and counted totals by method, variance, notes, reconciler, and completion time.
- `activity_events`: append-only security/audit events for approvals, invitations, capability changes, issued documents, sensitive status changes, and financial actions. Store identifiers and safe metadata, not bulk PII.

### Notifications and reporting

- `notification_outbox` and `notification_deliveries`: essential transactional message type, recipient reference, idempotency key, scheduled/sent/failed state, provider identifier, retry count, and safe failure summary.
- Security-invoker views or RLS-aware functions provide bounded job lists, customer history, debt, daily cash, job profitability, fund reconciliation, and pilot metrics. Every list is paginated and indexes match `garage_id`, access keys, status, and ordering columns.

Every migration must apply from a fresh local database and include a stated rollback approach. Additive migrations may roll back by removing newly introduced objects before data is live; changes involving issued, approval, history, or financial records are treated as irreversible in production and use forward repair/compensation rather than destructive rollback.

## API and actions

The browser uses the Supabase client with the publishable key and the signed-in user's session. Simple RLS-safe reads use typed repositories; commands that validate state transitions or write several rows use atomic, security-invoker database functions. Edge Functions are limited to secrets-bearing integrations such as Resend delivery and scheduled reminder dispatch.

Core commands:

- Identity/access: `create_garage`, `invite_staff`, `accept_staff_invitation`, `grant_finance_admin`, `revoke_finance_admin`, `issue_customer_claim`, `redeem_customer_claim`.
- Intake: `request_booking`, `confirm_booking`, `create_intake_job`, `assign_job`, `record_diagnosis`, `append_job_status`.
- Authorization of work: `issue_quotation_version`, `decide_quotation_version`, `allocate_emergency_allowance`, `create_supplementary_quotation`.
- Workshop: `record_work_update`, `record_part_used`, `record_recommendation`, `complete_work`.
- Funds/finance: `request_job_funds`, `decide_job_funds`, `release_job_funds`, `record_job_expense`, `post_payment`, `reverse_payment`, `post_other_cashbook_entry`, `reverse_cashbook_entry`, `complete_daily_reconciliation`.
- Completion/history: `issue_invoice_version`, `share_document`, `release_selected_vehicle_history`, and paginated customer/garage history and reporting reads.
- Notifications: enqueue within the originating transaction; deliver idempotently from a scheduled function; record provider outcomes and surface exhausted failures to authorized staff.

Each command checks authentication, active membership or customer relationship, specific resource ownership, capability, current state, and idempotency. Conflicting stale transitions return a conflict result; retried financial/document commands use client-generated idempotency keys plus unique database constraints.

## UI structure

- Public/auth: sign up, email verification, sign in, recovery, staff invitation acceptance, and customer claim.
- Staff shell: role-aware garage switcher, today/dashboard, bookings/intake, active jobs, job workspace, customers/vehicles, finance, and reports.
- Job workspace: compact overview plus diagnosis, quote/approval, work, funds/costs, invoice/payments, and activity tabs; mechanics receive a reduced action surface.
- Customer shell: bookings, decision-required queue, live job progress, invoices/balances, and permitted vehicle history.
- Finance: payment entry, job-fund request/approval/reconciliation, cashbook, debt list, daily reconciliation, and job/period profit views, gated by capability.
- Documents: responsive on-screen quotation/invoice/receipt plus print stylesheet; WhatsApp share action never embeds protected record data.

Every data view implements loading, empty, recoverable error, success, and partial states. Forms preserve values on failure, prevent duplicate submission, and expose connectivity failures explicitly. Verify 360px, 768px, and 1280px layouts; minimum touch target is 44px; key routes receive automated axe checks and keyboard/manual QA.

Before scaffolding, validate these structures with a clickable high-fidelity prototype covering the owner/supervisor, mechanic, delegated finance-admin, and customer perspectives. Use the brief in `design/stitch-mockup-prompt.md`; select a visual direction only after comparing alternatives, then test the core flows with representative pilot users. Record the accepted design tokens, navigation, responsive patterns, workflow changes, and unresolved usability risks in a portable `DESIGN.md` or equivalent handoff. Generated frontend code is reference material, not production code.

Current design artifacts: `design/autocare_pro_master_specification_design.md`, `design/MVP mockup screenshots/`, and `design/design revisions/`. Review history is recorded in `design/mockup-review.md`, `design/design-revision-review.md`, and `design/v2-design-review.md`. The authoritative implementation design contract is `design/ui-ux-acceptance.md`: it accepts the visual system and selected layout patterns while overriding unsafe or inconsistent generated content. Design definition is complete; a representative owner/supervisor and mechanic walkthrough remains the final pre-coding usability gate.

## Authentication and authorization

Supabase Auth provides verified email/password sessions and recovery. Public signup creates only a customer-capable identity; staff access requires an owner-issued invitation. Customer record linking requires a single-use claim token or an authorized manual flow and never trusts matching email text.

RLS is enabled and deny-by-default on every exposed table and private bucket. Policies derive staff access from active `garage_memberships` and customer access from explicit customer/job relationships and scoped history releases. Application actions independently check authorization. Customer-facing queries select only explicit safe columns; they never select internal cost, cashbook, or profit fields and never depend on UI filtering.

Capability grants are effective immediately because authorization reads the database, not cached user-controlled metadata. Only owners/managers can grant or revoke `finance_admin`; neither a delegated finance admin nor a supervisor can delegate onward. Tests cover every allowed role, every rejected role, cross-garage access, cross-customer access, expired/revoked invitations, stale sessions, and revoked history/capability grants.

## Milestones and vertical slices

### Pre-implementation gate — UI/UX exploration and workflow validation

Generate three materially different visual directions for the most important mobile screens, choose one direction, and expand it into a clickable prototype of intake, approval, mechanic updates, job-funds release, invoicing/payment, reconciliation, and customer history. Test it on a modest Android-sized viewport with at least one representative owner/supervisor and one mechanic; include a customer when feasible. Capture task completion, hesitation, misunderstood labels, missed authorization steps, accidental disclosure, and connectivity/failure comprehension. Revise this specification wherever the prototype changes workflow or information architecture, then obtain explicit plan approval.

Gate: the prototype uses realistic UGX data; each role can find its next action; customer and mechanic surfaces hide restricted finance data; mandatory intake, added-cost authorization, fund self-approval prevention, and correction history are understandable; 360px layouts, 44px touch targets, keyboard order, contrast, loading/empty/error/offline states, and print views have been reviewed. The approved design system and annotated screens are saved or linked from `docs/design/` before Slice 0.

### Slice 0 — Repository and quality foundation

Initialize Git, create a non-default feature branch, scaffold the React/Vite strict-TypeScript SPA and local Supabase project, pin Node/npm, and establish formatting, linting, environment validation, generated database types, Vitest/Testing Library, Playwright, pgTAP, axe, and CI. Add the modular folder boundaries, common result/error contract, responsive application shell, Sentry boundary, synthetic seed data, `.env.example`, and replace placeholders in `AGENTS.md` including the correct review-document path.

Tests/gate: clean install; typecheck, lint, unit smoke test, Playwright smoke test, `supabase db reset`, pgTAP smoke test, production build, and secret scan all pass. Document local setup and branch/promotion conventions before Slice 1.

### Slice 1 — Tenant-safe identity and delegated access

Deliver owner onboarding, garage creation, staff invitations, customer signup/claim, membership roles, the `finance_admin` capability grant/revoke flow, and a minimal authenticated dashboard. Add global profiles, tenant membership/customer tables, all composite tenant constraints, RLS, private storage baseline, audit events, rate-limit/CAPTCHA configuration hooks, and local Mailpit coverage.

Tests/gate: auth service unit tests; invitation/claim contract and expiry tests; pgTAP constraints/RLS matrix; integration tests proving cross-garage, cross-customer, and unauthorized capability denial; component accessibility tests; E2E owner invite, staff acceptance, customer claim, grant, and immediate revocation. Run all Slice 0–1 tests and build before Slice 2.

### Slice 2 — Booking through mandatory intake

Deliver authenticated customer booking requests plus staff-created phone-ahead/walk-in intake. Staff can confirm a booking, create/find a garage-owned customer and vehicle, record mandatory mileage/complaint/condition/arrival/phone/allowance data, and create the active job. Add paginated booking and active-job views with obvious missing-step and connectivity states.

Tests/gate: intake validation and transition units; tenant-consistent FK and RLS tests; action integration tests for all three origins, duplicate submission, invalid phone, and missing mandatory fields; responsive/axe component tests; E2E customer booking and staff walk-in tracer bullets. Run all affected and prior suites plus build before Slice 3.

### Slice 3 — Diagnose, quote, approve, deposit, and release job funds

Deliver diagnoses, itemized quotation snapshots, direct customer and staff-recorded decisions, required deposits, cumulative emergency-allowance allocation, and supplementary quotation creation. Add payment posting for deposits and the lightweight request/approve/release/reconcile job-funds flow with delegated finance authority and self-approval prevention. Approval-required email and WhatsApp share actions point to authenticated application state.

Tests/gate: exhaustive quote totals, allowance boundary, approval-state, idempotency, fund balance, and self-approval unit tests; immutable-snapshot/append-only database tests; role/capability and isolation matrix; transactional integration tests for partial failure and retries; E2E customer approval, phone-recorded approval, allowance within/over limit, deposit, and delegated fund release. All prior suites and build pass before Slice 4.

### Slice 4 — Controlled repair execution and revised costs

Deliver mechanic assignments, short touch-first status/finding/parts-used updates, supervisor coordination, attachment handling, extra-cost gating, and customer-visible progress. Work may begin only against an authorized scope; supplemental work cannot start until allowance or explicit approval is recorded. Internal costs remain hidden from mechanics unless separately authorized and always hidden from customers.

Tests/gate: job-state and scope-authorization units; upload type/size/path and storage RLS tests; mechanic/supervisor/customer authorization integration tests; no-work-before-intake/approval regression tests; mobile mechanic and supplemental-cost E2E journeys. All prior suites and build pass before Slice 5.

### Slice 5 — Final invoice, receipts, payments, and debt

Deliver work completion, immutable itemized invoice issuance, printable invoices/receipts, full and partial payments, outstanding balances, reversal workflows, and a paginated debt queue. Final totals derive from approved scope and recorded work; retries cannot duplicate invoices, receipts, payments, or cashbook origins.

Tests/gate: totals/allocation/debt/reversal units; issued-document immutability and origin uniqueness database tests; capability, customer visibility, cross-tenant, transaction, and retry integration tests; print-layout visual/manual check; E2E complete job, partial payment, receipt, balance, and correction. All prior suites and build pass before Slice 6.

### Slice 6 — Cashbook, reconciliation, job profit, and reminders

Deliver derived cash-in/cash-out entries, delegated other income/expense posting, daily expected-versus-counted reconciliation, unreconciled job-fund visibility, debt reminders, job/period profit, and owner exception/pilot-metric dashboards. Schedule small idempotent reminder batches; monitor volume, bounces, failures, and the 80/day and 2,400/month guardrails.

Tests/gate: cash/profit/variance/pilot-metric units; append-only and reversal database tests; finance capability and customer non-disclosure tests; reminder idempotency/failure/retry integration tests with Resend mocked; E2E delegated finance workflow and owner daily reconciliation. Run all suites and build before Slice 7.

### Slice 7 — Durable repair history and controlled history release

Deliver completed vehicle history for garage staff and entitled customers, including diagnosis, approved work, fitted parts, charges, payments, dates, mileage, and recommendations. Ended customer relationships preserve access only to participated jobs. Add an owner/manager-only manual flow to release explicitly selected earlier job records to a new relationship, with reason, audit, and revocation; never reassign a vehicle to expose its entire history.

Tests/gate: history projection units; ownership-period, selected-release, revocation, customer-price visibility, internal-cost exclusion, and cross-garage RLS/integration matrices; E2E former-owner, new-owner-without-history, selected-release, and revocation scenarios. All suites and build pass before Slice 8.

### Slice 8 — Pilot operations and release hardening

Add pilot onboarding/responsibility guidance, support/runbook material, data retention/deletion and correction procedures, backup/restore rehearsal, audit review tools, performance indexes, bounded query checks, Sentry alerts, uptime/spend monitoring, and deployment/rollback automation. Benchmark Frankfurt versus Mumbai before production provisioning and complete the Ugandan data-transfer/PDPO review. Configure separate local/staging/production environments, Resend SMTP/domain authentication, protected-branch promotion, and Supabase Pro backups before real data enters production.

Tests/gate: fresh migration and rollback rehearsal; named full tenant-isolation suite; role-by-role E2E of all six PRD workflows; restore verification; load sanity check for login, active-job list, job workspace, approval, payment, reconciliation, and history; security review; code review; deployment-readiness checklist; full typecheck/lint/test/build. Release only after all findings are applied.

## Testing approach

- Unit-test pure domain rules exhaustively: money totals, allowance consumption, state transitions, permissions, idempotency, reversals, reconciliation, debt, profit, and pilot metrics.
- Use pgTAP for schema, constraints, function behavior, immutable-record protections, and RLS. Maintain a named tenant-isolation matrix for every tenant table and storage policy.
- Use TypeScript integration tests against a real local Supabase stack with unique test identities. Mock only Resend/Sentry and other true externals.
- Keep Playwright focused on the six product workflows plus identity/capability and ownership-history security cases. Run key paths at mobile width and include accessibility assertions.
- CI runs formatting/linting, typechecking, unit/component tests, fresh database reset, database/RLS tests, integration tests, focused E2E, and production build. Release adds full E2E, migration rollback rehearsal, dependency/security scan, and load sanity checks.
- Manual QA covers each role at mobile width, print/PDF results, WhatsApp share handoff, offline/retry behavior, double submission, expired sessions, empty/partial/error states, and email delivery through staging.

## Risks and open questions

- Email adoption remains a pilot hypothesis. Instrument verification, invitation redemption, approval completion, delivery, and bounce rates; revisit ADR-0003 at its stated thresholds.
- Before Slice 4, define attachment types, size limits, malware-risk handling, and retention. Default to images/PDF only, conservative size limits, and no public bucket.
- Before Slice 7, document who qualifies as an “authorized garage” actor for selected history release and the evidence that must be recorded. The implementation defaults this to owner/manager only.
- Before Slice 8, approve retention/deletion periods, legal basis and privacy notices, incident response, Uganda PDPO/data-transfer review, and the Frankfurt-versus-Mumbai result.
- Supabase database backups do not cover Storage objects. The release plan must add and test a separate private-attachment backup/restore procedure.
- Browser-generated print/PDF output must be validated with pilot printers/devices; introduce server-side document rendering only if this fails acceptance testing.
- Package versions and service limits are fast-moving. Re-check official Vite, React Router, Supabase, Cloudflare Pages, and Resend documentation at scaffolding and again before launch.

## Definition of done

- The approved design direction, responsive patterns, critical-flow prototype, and usability findings are linked from `docs/design/`, and implementation matches the accepted UX unless a documented change is approved.
- All eight slices have passed their individual gates, and all six PRD workflows operate end to end for every applicable role.
- Tenant and customer isolation is enforced by application checks plus RLS and demonstrated by the named isolation suite.
- Issued documents, approvals, payments, cashbook records, job-fund activity, capability grants, and corrections retain durable attributable history.
- Delegated finance access works and is immediately revocable without allowing onward delegation or garage-security administration.
- Customer views never expose internal costs, cashbook data, garage expenses, or profit; vehicle-history access follows the confirmed ownership policy.
- Fresh migrations, forward/rollback procedures, backup and restore, hot-path performance, and all local/staging/production runbooks are verified.
- Code and security reviews have no unresolved critical findings; affected tests, full suite, typecheck, lint, and production build pass.
- Product, operating, support, privacy, deployment, and handoff documentation is current, and every PRD success/pivot metric is reportable.

## Approval gate

Approved by the project owner on 2026-08-17. The representative pre-coding usability walkthrough was completed on 2026-08-17 with no material findings; subsequent scaffolding and implementation are authorized according to these slices. This approval does not authorize provisioning production services, processing real customer data, or changing the accepted ADRs without a separate explicit decision.
