# AutoCare MVP — Final Stitch revision prompt

Paste this into the same Stitch project. Keep the High-Visibility Utility design direction; focus only on workflow consistency, missing safety states, and responsive correctness.

## Prompt

Apply this final correction pass without changing the selected visual style:

1. Create one canonical connected-flow fixture and use it everywhere: **Job #8492, Kato Samuel, Toyota Hilux, UBA 123X, Kampala time, 2026 dates, kilometres, UGX, brake-pad work**. Remove all Ford F-150, dollar, EST, US phone, mile, 2023, engine-overhaul, and rust-repair examples. Use **AutoCare**, not AutoCare Pro.
2. Emergency allowance applies only to eligible **additional work found after intake**. The initial UGX 235,000 quotation must show allowance used as UGX 0 and the full allowance available for later unexpected work. Never subtract the original quote from allowance.
3. Rebuild intake as three coherent steps: **Customer & vehicle → Complaint & visible condition → Arrival details, mileage, emergency allowance & review**. Do not call any intake step Diagnosis. Create the job only on the final successful online submission; diagnosis begins afterward. In offline state, preserve values, disable submission, and show Retry when connected.
4. On customer approval, show garage, Job #8492, Toyota Hilux/UBA 123X, exact quotation revision, issue date/time, all lines, total, deposit required, and the consequence of approval. Do not show allowance as used on the initial quotation.
5. Replace the supplementary screen with two UGX variants. **Within allowance:** “Record & notify customer,” exact new revision, added items, allowance allocation, cumulative used/remaining, and communication status—no customer Approve/Reject. **Over allowance:** work blocked until direct customer or staff-recorded approval of the exact revision.
6. Fix the mechanic screen: render a real back icon with accessible label, enlarge the parts icon, and ensure bottom navigation never covers “Mark complete” or any content.
7. At 360px, stack reconciliation fields per method: expected, counted/confirmed, variance. Include notes, reconciler/time, and a final confirmation that closing creates an auditable snapshot corrected through an adjustment. Remove all horizontal overflow.
8. Rename the dashboard’s ambiguous “Approve” action to its exact task. Managers cannot substitute for customer repair approval unless explicitly recording a phone/in-person customer decision.

Add the remaining evidence. Annotated wireframes are acceptable except where high fidelity is explicitly requested:

- high fidelity: fund-release expense reconciliation;
- high fidelity: finance-admin grant and immediate revocation with audit;
- high fidelity: over-allowance approval state;
- high fidelity: former-owner/new-owner selected-history release and revocation;
- high fidelity: offline final intake retry and corrected 360px reconciliation/mechanic layouts;
- annotated wireframes: customer home/progress, staff history versus customer history, mobile receipt and printable A4 invoice/receipt;
- state board: loading, empty, validation error, partial failure, permission denied, expired session, offline/not saved, retrying, and success;
- responsive examples at 768px and 1280px for dashboard, job workspace, intake, approval, reconciliation, and print document.

Update the master specification and `DESIGN.md` to match the final screens exactly: remove tax logic, in-product payment collection, customer ratings, advanced analytics, intake diagnosis, and generic HOME/JOBS/FINANCE navigation for roles that lack finance access. Record that neither a fund requester nor recipient may approve/release that request.

Before returning the work, check every connected screen for consistent customer, vehicle, plate, currency, amounts, allowance, revision, dates, and role visibility. Report any requested artifact you did not produce.
