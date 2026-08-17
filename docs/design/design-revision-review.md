# AutoCare MVP Design Revision Review

Date: 2026-08-15  
Reviewed artifacts: 13 revised screen/code pairs, revised `DESIGN.md`, and the master specification under `design revisions/`  
Verdict: **Material improvement; UI/UX gate still open**

## Resolved from the first review

- Customer approval and deposit collection are separated. The screen now says work waits until the garage records the external deposit.
- The customer approval total includes labour, parts, and consumables, and the visible lines reconcile to UGX 235,000.
- The quotation bypass toggle is gone.
- Finance is removed from mechanic navigation and “Inventory & materials” is renamed “Parts used.”
- The staff workspace shows original, used, and remaining emergency allowance.
- The fund-decision screen separates requester and recipient, shows available funds and the shortfall, blocks approval, and offers withdrawal.
- Payment reference becomes conditionally required in the generated interaction when a non-cash method is selected.
- “Net cash position” is renamed “Net money movement.”
- An owner dashboard, three intake concepts, staff-recorded decision, and within-allowance supplementary-cost concept were added.

## Remaining blockers

### 1. The initial quotation incorrectly consumes emergency allowance

The quotation builder subtracts the full initial UGX 235,000 quotation from a UGX 500,000 emergency allowance. The customer screen instead shows UGX 15,000 used from a UGX 50,000 allowance. Both conflict with the agreed rule: allowance applies only to eligible **additional costs discovered after intake**, not the original quotation.

Required revision: initial quotation screens show the intake allowance as “available for later unexpected work,” with **used = UGX 0**. Only supplementary items may allocate allowance. Keep the same allowance value across connected screens.

### 2. Connected-flow data is still contradictory and sometimes non-Ugandan

Job #8492 alternates between a Toyota Hilux/brake-pad job and a Ford F-150/engine-overhaul or rust-repair job. Screens mix UGX with dollars, Kampala context with EST, Ugandan phone/plate formats with US phone/VIN/miles, and 2026 project context with 2023 dates. The master specification still uses “AutoCare Pro,” tax logic, in-product deposit payment, customer ratings, and intake “Diagnosis.”

Required revision: use one canonical Job #8492 fixture across the connected flow—Kato Samuel, Toyota Hilux, UBA 123X, Kampala time, 2026 dates, kilometres, and UGX. Use “AutoCare.” Update the master specification to match the revised product rules and screens.

### 3. Intake sequencing remains incorrect and mandatory data is missing

The concepts label intake step 2 “Diagnosis,” show a job number before job creation, duplicate complaint/condition entry across steps, and proceed directly to estimate. They do not clearly capture the required customer phone, mileage, arrival details, emergency allowance, and final offline-safe submission. One offline screen still exposes “Create job & start diagnosis” without a retry/reconnection action.

Required revision: use three coherent steps: **Customer & vehicle → Complaint & condition → Arrival, allowance & review**. The final online action creates the active job; only then can diagnosis begin. When offline, preserve values, disable final submission, and show retry/reconnection behavior. Never imply an unsaved job exists.

### 4. Customer approval still lacks immutable-revision evidence

The revised customer screen fixes the item total but still does not visibly show the quotation revision, issue date, garage identity, and vehicle/registration. The allowance shown does not map to a specific additional line.

Required revision: add exact quotation revision, issue time/date, garage, job, vehicle/plate, complete items, total, deposit, and approval consequence. On an initial quote, do not show allowance as consumed. On a supplementary quote, identify which added items are allowance-authorized.

### 5. Supplementary-cost authorization is unsafe and not mobile responsive

Only a within-allowance variant exists. It uses dollars and US vehicle data, labels the job number as the “revision,” offers Approve/Reject even though it claims the charge is already pre-authorized, and its table and total overflow/clamp beneath mobile navigation.

Required revision: create two variants:

- **Within allowance:** “Record & notify customer,” showing the new quotation revision, added items, allocation, used/remaining allowance, and communication status. It does not ask the customer to approve again.
- **Over allowance:** block work and require direct or staff-recorded customer approval of the exact supplementary revision.

Both variants must fit 360px without horizontal scrolling or sticky-navigation overlap.

### 6. Mechanic safe-area and icon rendering remain broken

The mechanic screen renders the literal text `arrow_back`, shows an extremely small parts icon, and the bottom navigation obscures the next green action—likely “Mark complete.”

Required revision: render tested icons with accessible labels/fallbacks, give icons adequate size, and reserve enough bottom safe area so navigation never covers content or sticky actions.

### 7. Reconciliation still overflows and lacks a complete per-method closeout

The expected amounts are visible, but the counted/confirmed and variance controls extend beyond the captured mobile width. Only physical cash can be understood completely; notes, attribution, and durable-close confirmation remain absent.

Required revision: stack expected, counted/confirmed, and variance per payment method at 360px; add reconciliation notes, actor/time, and confirmation that closing records an auditable snapshot corrected later through an explicit adjustment.

### 8. Required access/privacy and failure-state evidence is still missing

No revised artifact demonstrates:

- fund-release-to-expense reconciliation;
- invoice/receipt print layouts;
- finance-admin grant, immediate revocation, and audit;
- customer home/progress;
- staff versus customer history;
- former-owner access, new-owner hidden history, selected-history release preview, and revocation;
- an over-allowance decision;
- loading, empty, validation, partial failure, permission denied, expired session, offline retry, and success as a state board;
- 768px and 1280px responsive compositions.

Required revision: add annotated wireframes if producing every missing screen at full fidelity is costly. The privacy/authorization screens, over-allowance decision, offline final submission, and mobile-overflow fixes require high-fidelity review.

## Important follow-ups

- The dashboard’s “Approve” action is ambiguous and appears to let a manager approve customer repair work. Rename it to the actual decision, such as “Review fund request,” or route customer approval to the customer/staff-recorded decision flow.
- Replace the remaining “AutoCare Pro,” US fixtures, EST, and 2023 dates throughout the code and design documentation.
- The design token `on-primary-container: #7ebdac` is used for important button text on `#004d40`; measure it rather than assuming WCAG AA. Do the same for muted text and disabled states.
- Clarify whether a fund requester as well as the intended recipient is barred from approving. The recommended segregation rule is that neither requester nor recipient may approve/release the request.

## Gate to acceptance

The visual direction does not need another exploration round. The gate passes after the eight blockers above are resolved, the master specification matches the screens, and the revised critical flows receive a short representative owner/supervisor and mechanic walkthrough.
