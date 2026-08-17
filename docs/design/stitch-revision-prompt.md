# AutoCare MVP — Stitch revision prompt

Paste this into the **same Stitch project** that produced the current AutoCare mockups so the design agent retains the selected visual direction.

## Revision prompt

Keep the selected High-Visibility Utility visual language, but revise the AutoCare prototype for workflow correctness and role safety. Do not redesign the aesthetic from scratch. Use **AutoCare**, not AutoCare Pro, until branding is separately approved.

Apply these corrections across the existing screens:

1. Replace “Approve & Pay Deposit” with a direct **Approve quotation** action. AutoCare does not collect payment in MVP. After approval, show external payment instructions and “Waiting for garage to record deposit.” Do not claim work starts immediately if the garage requires a deposit.
2. Make the customer approval screen reconcile exactly to the issued quotation: show all labour, parts, consumables/other lines, quotation revision, issue date, garage, vehicle/job, total, required deposit, and what approval authorizes.
3. Remove the “Customer approval required” bypass toggle. Every cost must use one valid path: direct customer approval, staff-recorded phone/in-person approval, or eligible emergency-allowance allocation.
4. Remove Finance from all mechanic navigation and screens. Rename “Inventory & materials” to “Parts used.”
5. On the job workspace and supplementary-cost flow, show original emergency allowance, used amount, remaining amount, allocated items, and whether the new item is within allowance or needs explicit approval.
6. Make Job #8492 data consistent across quote, approval, fund request, fund decision, invoice, and payment. Keep customer, vehicle, plate, items, amounts, and 2026 dates coherent.
7. On fund decisions, show requester and recipient separately, deposit received, prior releases, recorded spend, available job funds, requested amount, and resulting shortfall/surplus. When the current actor is conflicted, disable all decision actions and offer only **Withdraw request** or return; another authorized owner/manager/finance admin must decide.
8. Make payment reference conditionally required for MTN MoMo, Airtel Money, and bank, but optional for cash. Support partial payment clearly.
9. Rename combined “Net cash position” to “Net money movement.” In reconciliation, show expected, counted/confirmed, variance, and notes by payment method; reserve cash-on-hand for physical cash.
10. Replace the speculative performance report—customer rating, arbitrary targets, and yesterday comparison—with MVP operational measures: cash in/out, debt, estimated job/period profit, unreconciled fund releases, intake-before-work rate, added-cost authorization rate, completed-job documentation rate, and reconciliation completion.
11. Remove the tax line until tax behavior is defined. Intake captures complaint and visible condition; diagnosis starts only after the active job exists.
12. Make staff and customer history visibly different. Staff history may support new service and operational details. Customer history shows only participated or explicitly released jobs and never internal costs/profit.

Now add the missing critical screens, using the same components and realistic consistent data:

- Owner Today dashboard and all three walk-in intake steps, including review/success and offline-not-saved.
- Staff-recorded phone/in-person quotation decision, showing recorder, method, exact revision, time, and evidence note.
- Supplementary quotation with both within-allowance and over-limit/customer-decision-required variants.
- Fund-release expense reconciliation showing released, spent, and unreconciled amounts.
- Mobile receipt and printable A4 invoice/receipt.
- Owner permission screen to grant/revoke the predefined finance-admin capability, including immediate-revocation confirmation and audit entry.
- Customer home/progress timeline.
- Former-owner history, new-owner history hidden by default, selected-history release preview with reason/scope, recipient view, and audited revocation.
- A state board for loading, empty, validation error, partial failure, permission denied, expired session, offline/not saved, retrying, and success.

Show responsive versions at 360px, 768px, and 1280px for the dashboard, job workspace, intake, customer approval, reconciliation, and print document. Annotate role visibility, sticky-action behavior, safe areas, focus order, and contrast results. Preserve the strong outdoor-readable direction, but reduce visual density wherever heavy borders compete with the primary action.

Finally, update the design specification/`DESIGN.md` so it matches the revised screens exactly. List any remaining unresolved UX decision instead of inventing business behavior.
