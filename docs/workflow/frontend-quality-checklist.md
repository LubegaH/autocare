# Frontend Quality Checklist

## Component architecture
- [ ] Components under ~150 lines; split by responsibility when larger
- [ ] Reuse existing components/design-system primitives before creating new
- [ ] Presentational vs data-fetching concerns separated; fetch as high
      in the tree as the framework allows
- [ ] Props typed; no `any`; no prop-drilling more than 2 levels
      (composition or context instead)

## State management
- [ ] Server state (cache of backend data) and client state (UI state)
      handled by different mechanisms — don't hand-roll a cache in a
      global store
- [ ] URL is the state container for anything shareable/bookmarkable
      (filters, tabs, pagination)
- [ ] Global client state only when 3+ distant components need it;
      start local, promote reluctantly

## The five states — every data-driven view
- [ ] Loading (skeleton/spinner), Empty (helpful, with a next action),
      Error (human-readable, recoverable), Success feedback (toast /
      redirect / visible change), Partial (some data, some failed)

## Forms
- [ ] Validation messages next to fields, on blur or submit — not only
      a generic banner
- [ ] Submit disabled while submitting, with a loading indicator
- [ ] Values preserved on error; double-submit prevented

## Responsive
- [ ] Works at 360px, 768px, 1280px; content reflows, not just shrinks
- [ ] Touch targets ≥ 44px; no hover-only interactions

## Accessibility
- [ ] Keyboard: every interaction reachable, visible focus, logical order
- [ ] Labels on all inputs (visible, not placeholder-only); alt text on
      meaningful images; semantic HTML before ARIA
- [ ] Contrast passes WCAG AA; colour never the only signal
- [ ] Automated pass (axe or equivalent) on key pages, Tier 2+

## Performance
- [ ] No client-side fetch for data the server could render
- [ ] Lists over ~100 rows paginated or virtualised
- [ ] Images sized/optimised; no layout shift on load
- [ ] Bundle checked for accidental heavy imports (Tier 2+)
