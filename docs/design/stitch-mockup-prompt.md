# AutoCare MVP — Google Stitch mockup prompt

Paste the prompt below into a new Google Stitch project. Keep all exploration and refinement in the same project so the design agent retains context.

## Master prompt

Design a high-fidelity, clickable, responsive web-app prototype for **AutoCare**, a garage-management platform for small independent garages in Uganda. This is an authenticated operational product, not a marketing website.

### Product outcome

AutoCare replaces memory, paper, calls, and scattered WhatsApp messages with a traceable workflow from vehicle intake through diagnosis, customer approval, repair, payment, and history. The design must make the **next required action unmistakable** while keeping administration very light.

The product will be piloted by 3–5 garages. Most staff use modest Android phones in busy, sometimes bright or dirty workshop environments with intermittent connectivity. Owners and supervisors perform the detailed administrative steps. Mechanics should make only short, touch-friendly updates. Customers need clarity and trust, not workshop complexity.

### Users and permissions

Design distinct experiences for:

1. **Owner/manager** — oversees jobs, grants delegated finance access, approves release of money for parts, records or corrects finances, reconciles daily cash, follows debt, and sees internal costs and profit.
2. **Supervisor/service advisor** — books/checks in vehicles, records diagnoses, builds quotations, assigns work, records customer approvals, and records deposits/payments. Broader finance access requires an explicit grant.
3. **Mechanic** — sees assigned work and makes very short diagnosis, finding, parts-used, progress, and completion updates. Never show garage profit, cashbook, customer debt, or unrelated internal finance.
4. **Delegated finance admin** — can post payments, income/expenses, reversals, reconciliation, and see internal costs/profit. Cannot grant permissions, change garage ownership/security, or approve their own fund request.
5. **Customer** — requests bookings, approves exact quotation revisions, sees meaningful progress, invoices, payments, balances, and only the vehicle-history records they are entitled to see. Never show internal parts cost, internal labour cost, garage expenses, cashbook, or profit.

### UX principles

- Mobile first at **360 px**, then show responsive adaptations at **768 px and 1280 px**.
- Optimize for low digital literacy, minimal typing, one obvious primary action, plain language, familiar icons with text labels, and progressive disclosure.
- Minimum 44 px touch targets, strong visible focus, WCAG AA contrast, semantic form labels, and no color-only meaning.
- Preserve form values after errors. Make loading, empty, success, partial failure, expired session, and offline/retry states explicit.
- Do not queue financial, approval, or repair writes offline. Show a clear “Not saved” state with a safe retry action.
- Show money as **UGX**, using realistic examples such as `UGX 850,000`; timestamps should feel local to Kampala.
- Use realistic Ugandan names, phone numbers in `+256` format, vehicle registrations, and common vehicle makes. Do not use lorem ipsum.
- Prefer compact cards, timelines, checklists, status chips, sticky mobile actions, and short step-based forms over dense tables and long dashboards.
- On mobile, use at most 4–5 primary navigation destinations and put infrequent actions behind “More.” On desktop, adapt to a restrained sidebar without changing the information hierarchy.
- Make audit/history details available without letting them dominate routine work.

### Visual direction

The product should feel **trustworthy, practical, calm, transparent, and locally approachable**—a dependable workshop tool, not a luxury-car app, fintech trading dashboard, or generic dark admin template.

Start with a light interface suitable for outdoor visibility. Explore a restrained palette built around deep petrol green or blue-green, warm amber for attention, off-white surfaces, charcoal text, and semantic red/green used accessibly. Use a highly legible sans-serif typeface, modest rounding, restrained shadows, and simple automotive/workshop imagery only when it improves recognition. Avoid neon colors, excessive gradients, glassmorphism, tiny gray text, decorative gauges, racing motifs, and stock photos that consume useful space.

Create a small reusable design system: color and typography tokens, spacing grid, buttons, inputs, amount display, status chips, alert banners, cards, timeline items, tabs, bottom navigation, desktop sidebar, dialogs/bottom sheets, skeletons, toasts, and print styles. Keep component behavior consistent across roles.

### Critical rules the UI must communicate

- A vehicle must have a completed intake/job record before repair begins.
- Every added customer cost needs authorization before work: either explicit approval or remaining emergency allowance.
- Emergency allowance is a **cumulative ceiling**, not permission for unrelated work. Show used and remaining values clearly.
- Quotations and invoices are versioned snapshots; issued versions are not silently overwritten.
- A phone/in-person approval recorded by staff must look different from a customer’s direct in-app approval and show who recorded it and when.
- Customer deposits may fund parts. A supervisor can request a job-funds release; an owner/manager or delegated finance admin approves/releases it; the recipient cannot approve their own request. Show released, spent, and unreconciled amounts separately.
- Posted financial records are corrected by reversal with a reason; do not present destructive edit/delete actions.
- Customers retain access only to jobs they participated in. A new vehicle owner does not automatically receive old history; any selected history release is an explicit owner/manager action with scope and reason.

### Phase 1 — explore before converging

First create **three materially different visual and navigation directions**, each showing these two mobile screens with the same realistic data:

1. Owner “Today” dashboard: active vehicles, decisions waiting, missing workflow steps, fund requests, unreconciled releases, debts, and daily reconciliation status.
2. New walk-in intake: customer/phone, vehicle, mileage, complaint, visible condition, arrival details, and emergency allowance, with a clear completion summary.

The alternatives must differ in hierarchy and interaction model, not merely color. Label each direction and briefly explain its strengths and risks for workshop speed, low digital literacy, and outdoor phone use. **Stop after presenting the three directions and ask me to select or combine one before creating the full prototype.**

### Phase 2 — expand the selected direction

After I choose a direction, apply one consistent design system and build/link these prototype flows:

#### Flow A: phone-ahead/walk-in to active job

- Owner/supervisor “Today” dashboard.
- Booking list with request/confirmed states and a “Create walk-in intake” action.
- Short multi-step intake with validation, duplicate-customer suggestion, condition capture, emergency allowance, review, success, and offline-not-saved variants.
- Active job overview showing the next required step.

#### Flow B: diagnose, quote, approve, deposit

- Staff job workspace with customer/vehicle summary, timeline, and clear workflow stage.
- Diagnosis and itemized quotation builder for labour, parts, and other charges.
- Issued quotation version preview showing required deposit and share actions.
- Customer mobile approval screen for one exact revision, with approve/reject, itemized total, deposit, and consequence of the decision.
- Staff-recorded phone approval variant showing method, recording actor, time, and evidence note.

#### Flow C: repair and additional cost

- Mechanic “My work” list and a one-handed assigned-job screen with large actions for finding, status, part used, and complete.
- Supplementary-cost screen showing the original approved scope, newly discovered work, emergency allowance used/remaining, and whether explicit customer approval is required.
- Customer decision-required notification state and updated progress timeline.

#### Flow D: job-funds release

- Supervisor fund request with job, purpose, amount, and recipient.
- Owner/finance-admin decision screen showing deposit received, prior releases, recorded spend, requested amount, and unreconciled balance.
- Explicit self-approval-blocked state.
- Release record and later expense reconciliation with released, spent, and remaining amounts.

#### Flow E: invoice, payment, debt, and correction

- Final invoice review with approved scope, fitted parts, charges, deposits/payments, and outstanding balance.
- Payment entry for cash, bank, MTN MoMo, and Airtel Money; include partial payment and optional reference.
- Mobile receipt plus a clean printable A4 receipt/invoice.
- Debt queue and customer outstanding-balance view.
- Reversal flow that requires a reason and previews the compensating effect; never show “delete payment.”

#### Flow F: daily cash and profit

- Finance dashboard with cash in/out, debt, job profit, unreconciled fund releases, and filters.
- Daily reconciliation optimized for phone entry by payment method, expected versus counted amounts, variance, and notes.
- Permission-management screen where an owner grants/revokes the predefined finance-admin responsibility and sees its audit history.

#### Flow G: customer progress and history privacy

- Customer home with decision-required, in-progress, ready, invoice/balance, and recent-history cards.
- Vehicle repair history with mileage, diagnosis, approved work, fitted parts, customer prices, dates, and recommendations—but no internal costs/profit.
- New-owner view with prior history hidden.
- Owner/manager manual “Release selected history” flow that chooses specific jobs, records a reason, previews exactly what the recipient will see, and supports audited revocation.

### State and accessibility board

Create a separate board using the selected design system showing loading, empty, validation error, partial data, permission denied, expired session, offline/not saved, retrying, success, destructive-looking action replaced by reversal, disabled action with explanation, and high-priority decision-required states. Include focus, keyboard, contrast, and screen-reader annotation notes for the key controls.

### Prototype and handoff output

- Connect screens into clickable flows with believable back, cancel, retry, and success behavior.
- Annotate which information is hidden or read-only for each role.
- Show responsive examples for the dashboard, job workspace, intake form, customer approval, reconciliation, and printable invoice at 360/768/1280 px.
- Identify any workflow that feels too long or confusing and propose a simpler alternative without weakening authorization, tenant isolation, or audit history.
- Produce a portable `DESIGN.md` containing design tokens, typography, spacing, component rules, navigation patterns, responsive behavior, accessibility rules, and role-specific visibility rules.
- Treat generated frontend code only as a visual reference. Do not invent backend behavior, payment integrations, automated WhatsApp, inventory, payroll, tax accounting, or multi-branch features.

The final result should look cohesive enough for pilot usability testing and precise enough that a React/Tailwind implementation team can reproduce it without guessing.

## Suggested refinement prompts

After selecting a direction, use these one at a time if Stitch drifts:

1. “Audit every screen for the single most important next action. Reduce competing buttons and replace technical language with plain workshop language without removing audit details.”
2. “Review the mechanic flow for one-handed use on a 360 px Android screen in bright light. Increase touch targets and contrast, shorten updates, and remove all nonessential finance information.”
3. “Review customer screens for accidental exposure of internal parts cost, internal labour cost, cashbook entries, expenses, or profit. Remove any exposure and annotate the visibility rule.”
4. “Add realistic loading, empty, offline/not-saved, expired-session, validation, partial-failure, and safe-retry states while preserving entered values.”
5. “Check the added-cost and job-funds flows for ambiguous authorization. Make actor, method, exact revision, amount, remaining allowance, self-approval prevention, and timestamps unmistakable.”
