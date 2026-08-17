# AutoCare MVP UI/UX Acceptance Contract

Status: Approved; pre-coding usability walkthrough completed — 2026-08-17  
Authority: This document overrides all generated screenshot text, data, navigation, state behavior, and HTML. Screenshots are visual/layout references only.

## Accepted visual system

- Use the Industrial Neo-Brutalist / High-Visibility Utility direction from `high_visibility_utility/DESIGN.md`.
- Product name is **AutoCare**. Branding remains separable; do not use “AutoCare Pro.”
- Core palette: petrol green, high-visibility amber, off-white/gray, charcoal/black, and semantic red/green.
- Use Inter, strong hierarchy, flat surfaces, square geometry, 2px structural borders, restrained 3px emphasis borders, and no decorative shadows.
- Preserve outdoor readability, 44px minimum targets, visible focus, WCAG AA contrast, text labels with icons, and 96px mobile bottom safe area.
- Heavy borders and uppercase text may be reduced where they impair dense mobile forms, long descriptions, zoom, or localization.
- Use realistic workshop imagery sparingly. User/profile photographs are optional and never required for comprehension.

## Canonical fixture for implementation examples

- Garage: AutoCare Central, Kampala; timezone Africa/Kampala.
- Job: #8492; customer Kato Samuel; phone +256 700 123456.
- Vehicle: Toyota Hilux, UBA 123X; mileage 145,000 km.
- Initial quote revision #1: labour UGX 45,000, parts UGX 180,000, consumables UGX 10,000; total UGX 235,000; required deposit UGX 100,000.
- Emergency allowance: UGX 150,000; used UGX 0 on the initial quote.
- Dates use 2026. Currency is always UGX. Distances are kilometres.

Other realistic Ugandan fixtures may be used, but a connected flow must never change identity, vehicle, currency, amounts, units, or dates without explicitly starting a different job.

## Role-aware navigation and disclosure

- Owner/manager: Today, Jobs, Finance, More.
- Supervisor: Today, Jobs, Customers, More; payment recording appears contextually. Finance appears only when the user has the delegated capability.
- Mechanic: My Work, Jobs, More. Never render Finance, debt, customer payment history, cashbook, internal costs, or profit.
- Delegated finance admin: Today, Jobs, Finance, More; no permission-administration or garage-security controls.
- Customer: Home, Jobs, History, Account. Never render Finance, internal costs, cashbook, expenses, profit, staff audit notes, or unrelated customer/job data.

Routes and actions must enforce the same restrictions server-side; navigation hiding is not authorization.

## Workflow screen contracts

### Intake

1. Customer & vehicle: required valid phone, customer identity, registration/vehicle; duplicate suggestions remain within the garage tenant.
2. Complaint & visible condition: customer-reported complaint, visible condition, and optional private attachment.
3. Arrival & review: mileage, arrival/source details, emergency allowance, and complete review.

No active job ID exists until final online submission succeeds. Offline forms preserve entered values only in the current form session; they do not queue writes or claim they will sync. Final submission is disabled while offline and provides explicit retry after reconnection. Diagnosis begins only after job creation.

### Job workspace and mechanic update

- Staff workspace shows customer/vehicle context, original/used/remaining allowance, workflow stage, missing next action, and attributable timeline.
- Mechanic view is one-handed and exposes only assigned scope, findings, parts used, status, pause, and completion. No “Inventory” workflow or finance data.
- Sticky navigation/actions never cover content. Icons require labels or accessible names and tested fallbacks.

### Quotation and approval

- Initial quotation shows allowance available but used = UGX 0.
- Customer approval shows garage, job, vehicle/plate, exact immutable revision, issue time, every line, total, required deposit, and approval consequence.
- Approval is separate from external payment. Work begins only after the approved scope and any garage-required deposit are recorded.
- Staff-recorded phone/in-person decisions identify recorder, method, time, exact revision, outcome, and evidence note.

### Supplementary work

- Within allowance: create the next quotation revision, identify eligible added lines, allocate the cumulative allowance, show used/remaining, record authorization method as allowance, and provide a **Record & communicate** action. Communication is essential email or a manual phone/WhatsApp share—not paid SMS.
- Over allowance: show remaining allowance and excess clearly, block work, and route to direct customer approval or staff-recorded decision for the exact revision.

### Funds and finance

- Fund request shows job, purpose, requester, recipient, amount, and related approved scope.
- Neither requester nor recipient may approve or release the request. Only a non-conflicted owner/manager or delegated finance admin may do so.
- Decision shows deposit, previous releases, spend, funds available, request, and resulting surplus/shortfall.
- Reconciliation distinguishes **released**, **spent**, **unreconciled positive balance**, and **overspend**. A negative value is labelled overspend, never “negative unreconciled.”
- Finance-admin capability can be granted/revoked only by an active owner/manager. Delegated finance admins cannot delegate. Every change has actor, time, target, and reason; revocation affects authorization immediately.

### Invoice, payments, and daily reconciliation

- Invoice/receipt uses the canonical job/customer/vehicle and itemized approved charges, deposits, payments, and balance. No barcode is required.
- Payment method is cash, bank, MTN MoMo, or Airtel Money. Reference is required for non-cash and optional for cash; partial payments are explicit.
- Daily reconciliation stacks expected, counted/confirmed, variance, and notes per method at 360px. It records reconciler/time and creates an auditable snapshot corrected through adjustment, not destructive editing.

### Customer progress and vehicle history

- Customer progress uses meaningful stages and decision-required actions without exposing staff navigation or restricted finance.
- Customer history is authenticated private data, never a “public” view. It shows diagnosis, approved work, fitted parts, customer charges/payments/balance, mileage, dates, and recommendations.
- Staff history may show authorized internal costs/profit and operational notes according to role/capability.
- A former customer retains only jobs they participated in. A new owner sees no earlier history by default.
- Owner/manager-selected history release must preview exact jobs and fields, record recipient/scope/reason/actor/time, and support audited revocation. Reassigning a vehicle never grants old history.

## State behavior

Every data screen has loading, helpful empty, validation error, recoverable server/network error, success, and partial-read states where relevant. Also define permission denied and expired session.

Offline behavior is strict:

- Static assets and already loaded read-only information may remain visible.
- Approval, financial, repair, intake, and history-access writes are never cached, queued, partially synchronized, or described as syncing later.
- Preserve unsent form values in memory, show **Not saved**, disable unsafe submission, and offer explicit retry after reconnection.

Do not use irrelevant telemetry, ECU, calibration, master-server, loyalty, warranty, inventory, automated SMS, tax, or advanced-analytics examples.

## Responsive contract

- 360px: one primary column; financial comparisons stack; no horizontal table scrolling for core actions; safe area protects sticky actions.
- 768px: use two columns where it reduces scrolling without separating labels from values or actions from context.
- 1280px: restrained sidebar/top navigation and bounded content width; preserve the same workflow hierarchy rather than introducing desktop-only analytics.
- Printable A4 documents remove application navigation and controls and include garage/customer/vehicle/document identity, issue date, items, totals, payment/balance, and page-safe margins.

## Implementation acceptance tests

- Automated axe/contrast checks on auth, intake, job workspace, approval, mechanic, finance, reconciliation, and history routes.
- Visual tests at 360/768/1280px and print CSS; no clipped totals, fields, or sticky actions.
- Role matrix proves restricted destinations and fields are absent and server access is denied.
- Offline E2E proves form preservation, Not saved messaging, disabled write, explicit retry, and no queued request after reconnection.
- E2E covers direct/staff-recorded approval, within/over allowance, delegated finance revocation, fund conflict, partial payment, reconciliation variance, and history release/revocation.

## Completed pre-coding validation

Walk a clickable or narrated prototype through these tasks with at least one representative garage owner/supervisor and one mechanic:

1. Create a walk-in job and explain the emergency allowance.
2. Find and resolve an approval-required job.
3. Record a mechanic finding and completion update.
4. Request, approve, and reconcile job funds.
5. Record a partial payment and reconcile the day.

The walkthrough was completed on 2026-08-17. No material findings required changes to this contract or the technical plan. Participants preferred to evaluate a live system and provide feedback from use. See `docs/design/usability-walkthrough-2026-08-17.md`.
