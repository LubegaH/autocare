# Tech Spec: [Feature or system name]

Links: PRD · ADRs · Tier

## Summary
What we're building and the approach, in 3–5 sentences.

## Data model
New/changed entities, fields, relationships, indexes. For changes to
existing tables: migration approach and rollback plan
(database-design-checklist.md applies).

## API / actions
Endpoints or server actions: name, input (validated how), output shape,
error cases, who may call it (api-design-checklist.md applies).

## UI structure
Pages/components, which existing patterns they follow, states (loading /
empty / error / success), responsive behaviour
(frontend-quality-checklist.md applies).

## Authn/authz
Who can do what. Where each check is enforced (never UI-only).

## Milestones & task breakdown
Vertical slices, each independently shippable and testable — not
"backend then frontend". Each task: code + tests + affected tests green.

## Testing approach
What gets unit / integration / E2E coverage and why
(testing-strategy.md applies). Manual QA steps for what automation misses.

## Risks & open questions
What could go wrong; what needs deciding before which milestone.

## Definition of done
Feature-specific completion checklist, including docs to update.
