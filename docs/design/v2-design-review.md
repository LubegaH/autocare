# AutoCare MVP V2 Design Review

Date: 2026-08-15  
Reviewed artifacts: 18 V2 screen/code pairs, `autocare_master_specification_final.md`, and `high_visibility_utility/DESIGN.md`  
Verdict: **Sufficient visual exploration; generated content is not implementation-authoritative**

## Material progress

- Initial-quote allowance is now shown as unused in the job workspace and customer approval.
- Intake is separated into customer/vehicle, complaint/condition, and arrival/review concepts.
- Customer approval shows garage, vehicle, revision, complete lines, deposit, and approval consequence.
- Within- and over-allowance supplementary concepts exist.
- Mechanic completion has safe-area space and finance navigation is absent on the dedicated mechanic screen.
- Reconciliation stacks expected, counted/confirmed, variance, and notes for narrow screens.
- Fund reconciliation, finance permission management, customer progress, history comparison, receipt/print, state-board, tablet, and desktop concepts were added.
- The final master specification removes tax and in-product collection and records the intended core policies.

## Why the generated screens cannot be copied literally

- Several headers still say “AutoCare Pro.”
- Intake step 1 displays a job ID before creation and permits progress while “Offline: not saved.” Step 2 promises offline synchronization, contradicting the no-queued-writes policy.
- Customer approval and progress screens show a Finance destination to customers.
- The within-allowance screen says the customer was notified by SMS, which is outside MVP.
- The over-allowance amounts do not match the canonical job and omit a clear allowance comparison.
- The mechanic screen has large black-on-black regions and reintroduces an “Inventory” label.
- Dashboard labels mix counts and money (“Cash in/out: 12”, “Est. job profit: 03”) and still says manager approval is needed for customer work.
- Permission examples allow “System Admin” and “CEO Office” to grant finance access, contrary to owner/manager-only delegation.
- The state board promises local caching/synchronization of writes and uses irrelevant telemetry/calibration concepts.
- Fund reconciliation, receipt, history, customer progress, tablet, and desktop examples revert to 2023, dollars, US vehicles/phones, or out-of-scope loyalty, warranty, EV, real-time analytics, and public-customer language.
- Ownership-history release and revocation are not actually demonstrated.

These are content-generation failures, not reasons to discard the chosen visual system. The accepted rules and component behavior are consolidated in `ui-ux-acceptance.md`, which overrides every screenshot and generated HTML file.

## Gate status

- Visual direction and design-system definition: **accepted with the written overrides**.
- Workflow/information architecture definition: **accepted through the UI contract**.
- Representative usability validation: **pending**—one owner/supervisor and one mechanic should walk through intake, approval, mechanic update, fund release, payment, and reconciliation before production UI implementation begins.
