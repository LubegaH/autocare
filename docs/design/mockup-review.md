# AutoCare MVP Mockup Review

Date: 2026-08-15  
Reviewed artifacts: `autocare_pro_master_specification_design.md` and 14 PNG files in `MVP mockup screenshots/`  
Verdict: **Visual direction provisionally accepted; UI/UX gate not passed**

## What is working

- The high-visibility industrial direction fits workshop conditions better than a generic dense admin dashboard.
- Large amounts, bordered sections, strong hierarchy, and mostly large actions are easy to scan on narrow phones.
- The mechanic work list and job-update concepts minimize typing and prioritize operational actions.
- The fund-decision concept surfaces financial context and makes self-approval blocking prominent.
- Invoice, payment, debt, and daily-reconciliation concepts use understandable UGX examples.
- Customer-facing approval is visually distinct from the staff workspace.

The zero-radius, heavy-border aesthetic is acceptable as a direction, subject to measured contrast, focus, text-size, and density checks on real low-cost Android devices.

## Blocking findings

### 1. Approval and payment behavior contradicts the MVP

The customer screen says **“Approve & Pay Deposit”**, implying payment collection inside AutoCare, but the MVP records external cash, bank, MTN MoMo, or Airtel Money payments manually. It also says work begins immediately after approval even when a required deposit may not yet have been received.

Required revision: separate **Approve quotation** from payment. After approval, show the required deposit and instructions to pay the garage outside the platform, with a “Waiting for garage to record deposit” state. Work may begin only when the approved scope and any garage-required funding condition are satisfied.

### 2. The customer is not shown the exact complete quotation revision

The quotation builder totals labour UGX 45,000, parts UGX 180,000, and consumables UGX 10,000 to UGX 235,000. The customer approval screen shows only labour and parts while retaining the UGX 235,000 total. The screen also lacks a visible quotation revision identifier and issue metadata.

Required revision: show every charged line, the exact revision number, issue date, garage, job/vehicle, total, required deposit, approval consequence, and a link to compare a superseded revision when applicable. Never approve a total whose visible lines do not reconcile.

### 3. Customer approval is presented as optional in the quotation builder

The “Customer approval required” toggle suggests staff may bypass authorization. The business rule is that every cost must be authorized either directly or through recorded remaining emergency allowance.

Required revision: remove the bypass toggle. Let staff choose the valid authorization path: direct customer decision, staff-recorded phone/in-person decision, or eligible allowance allocation. Each path must show actor, method, exact revision, amount, and time.

### 4. Mechanics can see a Finance destination

Both mechanic mockups include **Finance** in bottom navigation, contradicting the role model and increasing the risk of accidental disclosure.

Required revision: use role-specific navigation. Mechanics should see only work-relevant destinations such as Today/My Work, Jobs, and More/Profile. Finance routes must also reject mechanic access server-side.

### 5. Emergency allowance is not actionable or auditable

The job workspace shows a single UGX 150k allowance but not original, used, remaining, allocated items, or whether new work still needs explicit approval.

Required revision: show original allowance, cumulative authorized use, remaining allowance, and a clear authorization badge beside each supplementary item. Add the over-limit decision-required state.

### 6. Fund-request examples are internally inconsistent

The fund request is for brake pads on Job #8492, while the manager decision for the same job describes an engine overhaul. The screen does not clearly distinguish requester from recipient or show available job funding/shortfall. When self-approval is blocked, it still offers “Deny request”; the conflicted actor should withdraw or leave the decision to another authorized person.

Required revision: keep job, purpose, amount, requester, recipient, and quote context consistent. Show deposit received, prior releases, recorded spend, funds currently available, requested amount, and resulting shortfall/surplus. A conflicted actor gets **Withdraw request**, not approve/deny.

### 7. Required safety-critical flows are absent

The supplied set has 14 images, including one design-system board, while the specification describes 19 product screens. It does not demonstrate:

- dashboard and the three intake steps;
- staff-recorded phone/in-person approval;
- supplementary quotation and within/over-allowance states;
- job-fund expense reconciliation;
- receipt/print output;
- finance-admin grant and immediate revocation;
- customer home/progress;
- former-owner, new-owner-hidden-history, selected-release preview, and revocation;
- loading, empty, validation, partial failure, offline/not-saved, retry, permission-denied, and expired-session states.

Required revision: add these as annotated screens before implementation. Full polish is unnecessary for every state, but information hierarchy, actions, role visibility, and failure behavior must be explicit.

### 8. The performance report exceeds validated MVP scope

Customer ratings, “on target,” yesterday comparison, and efficiency metrics introduce data and target definitions absent from the PRD. Advanced analytics are explicitly outside MVP.

Required revision: replace this with scoped operational measures: cash in/out, customer debt, estimated job/period profit, unreconciled fund releases, intake-before-work rate, added-cost authorization rate, completed-job documentation rate, and reconciliation completion. Do not show ratings or targets unless their collection and meaning are separately approved.

## Important revisions

- Payment reference is labelled optional but described as required for mobile money and bank. Make the field conditionally required and explain the rule inline.
- Rename “Net cash position” if it combines physical cash and non-cash methods; use “Net money movement.” Reserve “cash on hand” for physical cash.
- Daily reconciliation needs expected and counted values by method, variance, notes, attribution, and a confirmation that closing creates a durable record rather than an editable reset.
- “Diagnosis” must occur after intake/job creation. Intake captures complaint and visible condition; do not imply repair diagnosis is a prerequisite to creating the job.
- “Inventory & materials” on the mechanic screen implies inventory management, which is outside MVP. Use “Parts used.”
- “AutoCare Pro” differs from the approved product name “AutoCare.” Use “AutoCare” until branding is explicitly changed.
- Remove tax UI until the garage's VAT/tax policy is defined. Formal tax accounting is outside MVP, and a permanent “Tax 0%” line can imply unsupported compliance behavior.
- Normalize examples to the 2026 pilot context and keep job, customer, vehicle, plate, invoice, and date data consistent across connected screens.
- The staff history screen needs diagnosis, fitted parts, mileage, recommendations, charges/payments/balance, and explicit role context. The customer version must omit restricted internal data and the “New service” staff action.
- Keep navigation and top-bar patterns consistent across role shells. The history mockup currently switches to an unrelated four-item navigation model.

## Accessibility and responsive evidence still required

- Measure actual foreground/background contrast; several muted labels and disabled/button text combinations cannot be accepted by appearance alone.
- Provide visible keyboard-focus and logical focus-order annotations for desktop/tablet layouts.
- Verify text remains legible at 200% zoom and with longer names, descriptions, and translated/familiar wording.
- Show responsive compositions at 768px and 1280px for the dashboard, job workspace, intake, approval, reconciliation, and print document.
- Verify sticky bottom navigation and actions do not cover content or device safe areas.
- Test the dense heavy-border treatment on a 360px low-resolution device; reduce border/density where it competes with the primary action.

## Gate to acceptance

The UI/UX gate passes when:

1. All blocking findings above are resolved in revised screens or explicit annotations.
2. Restricted finance data and routes are absent for mechanics and customers.
3. Quotation, allowance, payment, fund-release, reversal, and history-release screens reflect the approved business rules exactly.
4. Critical failure/offline states and responsive layouts are demonstrated.
5. A short usability walkthrough is completed with at least one garage owner/supervisor and one mechanic; findings and resulting changes are recorded.
6. The final design specification is updated to match the accepted screens and linked from the technical plan.
