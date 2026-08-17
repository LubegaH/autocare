Goal: recommend a stack and architecture for this project, with
trade-offs, and record it as an ADR.

Context: read docs/prd.md or docs/brief.md (stop and request /discover
if absent), docs/workflow/stack-decision-framework.md, and
docs/workflow/stack-profiles/react-typescript-supabase.md.

Constraints: evaluate the default profile against every framework
criterion — check its "known limits" against the brief explicitly; don't
rubber-stamp. Boring and familiar wins unless a requirement objects; max
one unfamiliar major component. State load assumptions and what growth
invalidates the design. Present the recommendation and wait for my
agreement before writing anything.

Done when: docs/decisions/0001-stack.md exists (ADR template), plus ADRs
for any decision we debated (data isolation, auth), and I've approved.
