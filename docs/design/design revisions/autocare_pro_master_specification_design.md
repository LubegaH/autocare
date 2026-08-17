# AutoCare Pro: High-Visibility Hub Design Specification

## 1. Brand & Visual Identity
**Brand Personality:** Industrial, Utility-First, Trustworthy, Robust.
**Design Style:** Industrial Neo-Brutalism.
- **Visual Language:** Heavy 2px-3px black borders, bold uppercase typography, high-contrast status labels, and a functional "grid" aesthetic.
- **Color Palette:**
  - **Primary:** Deep Petrol Green (#004d40) — used for primary actions and brand presence.
  - **Secondary/Accent:** High-Visibility Amber/Yellow — used for "In Progress" states and priority warnings.
  - **Surface:** Off-white/Light Gray (#f9f9f9) to reduce glare in outdoor settings.
  - **Status Colors:** Bold red for "Overdue/Blocked", Green for "Completed", Amber for "Pending/Ongoing".
- **Typography:** INTER (Sans-serif). Heavy weights for headlines to ensure legibility on low-resolution screens in bright sunlight.

## 2. Core Design Tokens
- **Borders:** `3px solid #000000` (Main containers), `2px solid #000000` (Inner cards).
- **Corner Radius:** `0px` (Sharp, industrial feel).
- **Shadows:** `None` (Flat design for maximum clarity).
- **Spacing:** `16px` (Margin-mobile), `24px` (Stack-md).

## 3. Component Patterns

### TopAppBar
- **Style:** Sticky top, 2px bottom border.
- **Content:** Brand Logo (Left), Contextual Headline (Center), Action/Profile (Right).
- **Interactions:** Active states use a subtle `translate-y-[2px]` transform.

### BottomNavBar
- **Style:** Fixed bottom, 2px top border.
- **Destinations:** HOME, JOBS, FINANCE, MORE.
- **Active State:** Solid primary color background with inverted text/icon.

### Action Cards
- **Structure:** Bold border, flat background, high-contrast internal labels.
- **Usage:** Used for Job listings, Financial summaries, and Itemized lists.

## 4. Full User Journey (19-Screen Prototype)

### Phase 1: Intake & Dashboard
1. **Hybrid Dashboard (V4):** Central hub showing "Quick Stats" (Expected, In Bay, Parts Hold, Ready) and a "Priority Attention" feed for escalations.
2. **New Intake - Step 1 (Customer & Vehicle):** Lookup/registration for customers and plate-first vehicle entry.
3. **New Intake - Step 2 (Diagnosis):** Capturing primary complaints and initial visual findings.
4. **New Intake - Step 3 (Summary):** Final review of intake details before job creation.

### Phase 2: Diagnosis & Approval
5. **Supervisor Job Workspace:** A timeline-centric view of a specific vehicle's progress (Intake -> Diagnosis -> Quotation -> Work).
6. **Itemized Quotation Builder:** Modular builder for Labour, Parts, and Consumables with subtotaling and tax logic.
7. **Customer Approval Screen:** External-facing mobile screen for clients to approve estimates and pay deposits.

### Phase 3: Mechanic Workflow
8. **Mechanic: My Work List:** High-contrast, scan-ready list of assigned jobs with large "Start/Continue" buttons.
9. **Mechanic: Job Update Screen:** Optimized for one-handed use. Large buttons for "Add Finding", "Record Parts", and "Mark Complete". No financial data shown.

### Phase 4: Financial Authorization
10. **Supervisor: Fund Request:** Form for requesting petty cash or mobile money disbursements for parts.
11. **Manager: Fund Decision:** High-stakes screen showing job liquidity (Deposit vs. Spend) and enforcing the "Self-Approval Block" rule.

### Phase 5: Invoicing & Payment
12. **Final Invoice Review:** Breakdown of final costs minus the deposit to show "Balance Due".
13. **Payment Entry:** Recording payment via Cash, MTN MoMo, Airtel Money, or Bank Transfer.
14. **Debt Queue:** Management dashboard for tracking and following up on overdue balances.

### Phase 6: Reconciliation & Performance
15. **Daily Reconciliation:** Closing out the day's financials by payment method and physical cash-on-hand verification.
16. **Performance Report:** Owner's dashboard for Gross Profit, Margins, Efficiency Metrics, and Customer Ratings.

### Phase 7: Records & History
17. **Customer Service History:** Comprehensive log of a customer's lifetime relationship, past services, and vehicle health trends.
18. **Service Records (Older):** Paginated or "Load More" interface for deep history audits.
19. **System Settings:** Global configuration for workshop rates, payment IDs, and user roles.

## 5. Technical Requirements
- **Responsive:** Mobile-first (Portrait).
- **Accessibility:** WCAG AA Contrast compliance. Touch targets minimum 44x44px.
- **Offline Considerations:** High-visibility UI for low-connectivity/bright environments.