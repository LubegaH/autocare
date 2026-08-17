# PRD: AutoCare Garage Management Platform

14 August 2026 · Product team · Tier 3 · Approved

## Problem

Small independent garages in Uganda lose revenue and customer trust because repair work is managed informally through memory, paper, phone calls, and WhatsApp. Owners often control vehicle intake, customer communication, quotations, invoicing, and the release of customer deposits used to buy parts, but they lack a reliable view of work in progress, cash, costs, debt, and job profit. Customers cannot easily see what was diagnosed, what they approved, when their vehicle will be ready, which parts were replaced, or what they still owe. The product must introduce enough structure to make each job and its money traceable without imposing a heavy administrative burden on owners, supervisors, or mechanics.

## Users & roles

| Role | Who they are | What they need to do |
|---|---|---|
| Garage owner/manager | The primary operator in a small independent garage; often controls intake, customers, invoices, and cash | Oversee jobs, approve the release of money, reconcile cash, monitor debts, and understand job profit |
| Mechanic supervisor/service advisor | The staff member responsible for receiving vehicles and coordinating work | Create walk-in or phone-ahead intake records, document diagnoses, prepare quotations, assign work, and keep customers informed |
| Mechanic | A workshop staff member, usually using a smartphone and expected to perform minimal administration | See assigned work and make quick diagnosis, status, parts-used, and completion updates |
| Customer/vehicle owner | A private vehicle owner seeking repair or maintenance | Request a booking, approve costs, follow repair progress, view invoices and balances, and retain vehicle repair history |

The pilot target is 3–5 garages, approximately 10–25 garage staff and 100–300 customers. If validated, the next target is 25–50 garages.

## Core workflows (MVP)

### 1. Book or check in a vehicle

A customer may request a booking, call a garage or mechanic to say they are coming, or arrive without notice. For bookings, the garage confirms the request. For calls and walk-ins, an owner or supervisor creates the intake directly. Before any repair work begins, staff record the customer, valid phone number, vehicle, mileage, complaint, visible condition, arrival details, and any emergency spending allowance. The workflow succeeds when the vehicle has an active job record and the garage and customer can identify the next step.

### 2. Diagnose, quote, approve, and fund the work

A supervisor or mechanic records the diagnosis and proposed labour, parts, and other charges. The garage issues an itemized quotation and may require a deposit because customer funds are often needed to buy parts. The customer approves or rejects the work, and staff record any deposit received and its payment method. The workflow succeeds when the approved scope, approval actor and time, required deposit, payment received, and remaining balance are traceable.

### 3. Repair, revise costs, and communicate progress

The supervisor assigns work and mechanics update a small set of clear statuses, findings, and parts used through short touch-oriented actions. If opening the vehicle reveals another cost, the garage creates a supplementary or revised quotation rather than overwriting the original. Every new cost must be authorized: a cost within the explicit allowance agreed at intake is already pre-approved and must still be recorded and communicated; a cost outside it requires new customer approval before that additional work starts. The customer can see meaningful progress and knows when a decision is required or the vehicle is ready.

### 4. Invoice, collect, and follow up debt

When work is complete, the garage produces an itemized final invoice showing approved labour, parts, other charges, deposits, payments, and the outstanding balance. Staff record full or partial payments made by cash, bank, MTN MoMo, or Airtel Money and issue a receipt. Outstanding balances remain visible for follow-up and can trigger email reminders. The workflow succeeds when the garage and customer agree on the final account and every payment or debt has a durable record.

### 5. Retain vehicle repair history

After completion, the customer and authorized garage staff can retrieve the vehicle's completed work, diagnoses, fitted parts, costs, dates, mileage, and recommended future maintenance. Customers see their prices, payments, balances, and repair information, but never the garage's internal costs or profit. The workflow succeeds when a later visit can begin from an accurate, understandable history rather than memory.

### 6. Track garage cash and job profit

Deposits and invoice payments automatically contribute to money received. Authorized staff record other income and expenses, while each repair job separately tracks parts cost, customer-facing labour charges, internal labour cost, and other costs. The owner performs a simple daily reconciliation and can view cash in, cash out, customer debt, and estimated profit by job and period. This is an operational cashbook and job-costing tool, not a formal accounting system.

## Explicitly out of MVP

| Excluded | Why | Revisit when |
|---|---|---|
| Formal accounting, tax filing, and audited statements | The pilot only needs an operational cashbook and job-level profitability | Cashbook use is reliable and garages require statutory reporting |
| Payroll and mechanic commissions | Employment and compensation rules add complexity unrelated to validating the core job workflow | Staff and job records are reliable enough to calculate compensation |
| Full inventory and supplier procurement | The MVP records parts used and their cost but does not manage stock, purchase orders, or supplier accounts | Parts usage data demonstrates demand for stock control |
| Insurance claims and fleet management | These introduce different buyers, approval chains, and reporting needs | The independent-garage and private-customer workflow is proven |
| Multi-branch management | Each pilot garage can be managed independently | A participating business operates multiple branches |
| Direct mobile-money or online payment collection | Paid or operationally complex integrations conflict with the near-zero-cost pilot | Manual payment records are validated and transaction volume justifies integration |
| Full WhatsApp Business automation and paid SMS | The pilot must cost almost zero and cannot depend on paid messaging | A sustainable messaging budget and provider are established |
| Automated customer-support chatbot | Direct contact and structured updates cover the pilot need | Repeated support questions create a measurable workload |
| Advanced analytics and predictive maintenance | These require trustworthy historical data that does not yet exist | The platform has enough complete repair history to support them |

## Data

Each garage is a tenant with its own staff and roles. A customer may have one or more vehicles; each vehicle may have bookings, intake records, and repair jobs. A repair job connects diagnoses, work items, assignments, statuses, parts used, quotation versions, approvals, emergency allowance, deposits, invoice, payments, debts, income or expense entries, attachments, and an activity history. Cashbook entries may originate from a job or represent other garage income and expenses.

Customer names, phone numbers, email addresses, vehicle identifiers and histories, and staff identities are sensitive personal information. Quotations, internal costs, payments, debts, cashbook entries, and profitability are sensitive financial information.

Repair history, quotation versions and approvals, fitted parts, invoices, payments, balances, and cashbook entries must never be lost. Corrections to approvals and financial records must preserve the original value, the actor, the time, and the reason rather than silently erase history.

One garage must never access another garage's customers, jobs, or finances. A customer must never access an unrelated customer's information. Customers may see their quoted prices, approved work, fitted parts, payments, balances, and vehicle history, but must never see the garage's internal parts cost, internal labour cost, expenses, or profit. Access to a vehicle's history must be reassessed when custody or ownership changes; the pilot policy for ownership transfer remains unvalidated.

## Integrations

| System | Purpose | MVP or later |
|---|---|---|
| Email identity and delivery service | Account verification, sign-in, approval requests, status notifications, invoices, and debt reminders | MVP, using a free allowance suitable for the pilot |
| WhatsApp share action | Let staff manually share quotations, updates, and invoices through a customer's required phone number | MVP; no automated WhatsApp Business integration |
| Printable/downloadable documents | Provide invoices and receipts that can be saved or handed to customers | MVP |
| Cash, bank, MTN MoMo, and Airtel Money | Record the method and reference for payments collected outside the platform | MVP, manual recording only |
| MTN MoMo and Airtel Money APIs | Collect and reconcile payments directly | Later |
| WhatsApp Business and SMS providers | Automate transactional messages | Later |
| Accounting, tax, payroll, supplier, and parts-catalog systems | Extend back-office operations | Later |

## Assumptions & risks

### Assumptions to validate

The make-or-break assumption is that garage owners will enforce digital record-keeping when the system gives them control over intake, customer approvals, invoicing, cash received, and release of money for parts. This will be tested first through a four-week digital pilot in three garages; the validation targets are at least 80% of accepted vehicles recorded before work, 80% of added costs carrying recorded authorization, and 80% of completed jobs carrying a final invoice and payment or balance entry.

The following assumptions are also unvalidated:

- Owners and supervisors can carry the mandatory administrative steps while mechanics reliably make only short operational updates.
- A low-data, phone-first experience with clear labels, familiar graphics, large touch targets, defaults, and minimal typing is sufficient to overcome workflow friction and differences in digital literacy.
- Pilot staff and customers have suitable smartphones and sufficiently reliable connectivity.
- Staff and customers will use email for verification, sign-in, approvals, and automated notifications even though calls and WhatsApp may be more familiar.
- Customers will regard recorded digital approvals and revised quotations as clearer and more trustworthy than verbal agreements.
- Owners and authorized staff will enter income, payments, labour cost, parts cost, and other expenses accurately enough for reconciliation and profit estimates.
- Required customer phone numbers will usually be valid and remain current.
- Better visibility of balances and reminders will improve debt collection.
- Three suitable garages will participate long enough to measure eight consecutive weeks of active use.
- At least two pilot garages will perceive enough value to pay a modest monthly fee after the pilot.
- The near-zero-cost constraint can be maintained without compromising required reliability, privacy, or data protection.
- Vehicle ownership or custody can be established well enough to give customers appropriate repair-history access; the transfer and dispute process is not yet defined.

### Top risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Staff bypass the workflow and perform work or spend money before recording it | High | High | Keep actions short; give owners oversight; highlight missing steps; provide daily exception summaries; measure completion in the assisted pilot |
| Income, expenses, or payments are incomplete or misleading, making debt and profit figures untrustworthy | Medium | High | Derive entries from jobs where possible; preserve attribution and history; separate customer charges from internal costs; require daily owner reconciliation |
| Connectivity, shared devices, sign-in friction, or limited digital literacy cause abandonment | High | Medium–high | Use low-data, phone-first flows; minimize typing; use recognizable visuals; make staff actions attributable; test in real garage conditions |

## Success criteria

By the end of week 12 after the pilot launches:

- At least 3 garages have used the product actively for 8 consecutive weeks.
- At least 80% of accepted vehicles are recorded before repair work begins.
- At least 80% of added costs have recorded prior authorization, either through the intake allowance or a supplementary approval.
- At least 80% of completed jobs include parts, a final invoice, and payment or outstanding-balance records.
- Participating owners reconcile garage cash at least 5 days per week and can explain job-level profit using the recorded data.
- At least 2 of the 3 pilot garages choose to continue and indicate willingness to pay a modest monthly fee.
- Customer feedback indicates that approvals, progress, invoices, and repair history are clearer than calls and verbal records alone.

The project should be stopped or materially pivoted if, after assisted onboarding and reasonable interface improvements, fewer than 50% of jobs are recorded completely or fewer than 2 pilot garages want to continue because the workflow creates more effort than value.

## Definition of done (MVP)

- [ ] All six core workflows operate end to end for owner/manager, supervisor, mechanic, and customer roles.
- [ ] Pilot onboarding, responsibility boundaries, and the daily reconciliation routine are documented.
- [ ] Every workflow has tests appropriate to Tier 3 under `docs/workflow/testing-strategy.md`, including authorization and tenant-isolation coverage.
- [ ] Cross-garage and cross-customer isolation is enforced and verified in depth.
- [ ] Approval and sensitive financial changes produce attributable, durable history.
- [ ] Backup, restoration, retention, vehicle-history access, and correction policies are defined and tested where applicable.
- [ ] The review in `docs/workflow/code-review-standards.md` has been completed and findings applied.
- [ ] `docs/workflow/security-review-checklist.md` has passed for the release.
- [ ] `docs/workflow/deployment-readiness-checklist.md` has passed, including rollback and migration plans.
- [ ] A load/performance check has passed for expected pilot hot paths.
- [ ] Product, support, operating, and handoff documentation is current.
- [ ] Pilot measurement can report every success and pivot criterion above.
