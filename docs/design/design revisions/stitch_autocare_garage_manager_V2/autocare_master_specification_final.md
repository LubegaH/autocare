# AutoCare: Final Master Specification

## 1. Core Visual Identity
- **Brand Name:** AutoCare (Internal name only, branding separate).
- **Style:** Industrial Neo-Brutalist.
- **Palette:** Deep Petrol Green (#004d40), High-Visibility Amber (#ffb300), Surface Gray (#f9f9f9).
- **Typography:** INTER, bold weights for hierarchy.

## 2. Canonical Data Fixture (Job #8492)
- **Customer:** Kato Samuel
- **Vehicle:** Toyota Hilux (UBA 123X)
- **Currency:** UGX
- **Region:** Kampala (EAT)
- **Timeline:** 2026
- **Units:** Kilometres

## 3. Financial & Allowance Logic
- **Emergency Allowance:** Applies ONLY to additional work found AFTER initial intake.
- **Initial Quote:** Must NOT subtract from the allowance.
- **Fund Decisions:** Conflicted actors (requester = recipient) are blocked from approval. Another admin must decide.
- **Reconciliation:** 'Net Money Movement' tracks all payment methods. variance tracking required.

## 4. User Journey Refinements
- **Intake:** 3-Step flow (Customer/Vehicle -> Condition -> Arrival/Review). Job created only on final online submission.
- **Diagnosis:** Begins only after job creation.
- **Customer Approval:** Requires clear deposit instructions. No in-product payment collection for MVP.
- **Mechanic Workflow:** One-handed use, real back icons, no financial data.

## 5. Role & Permission Management
- **Finance Admin:** Explicit grant/revoke required with audit log entry.
- **Conflicted Approval:** Blocked by system.

## 6. Unresolved UX Decisions
- Tax behavior (currently omitted).
- Automatic customer notification triggers for all cost revisions.
- Detailed offline sync collision handling.