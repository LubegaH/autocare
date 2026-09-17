-- Rollback: restore the former recipient policy only if revoked members are
-- explicitly authorized to read their prior capability history.

drop policy "Owners managers and recipients can read capability grants"
on public.membership_capability_grants;

create policy "Owners managers and active recipients can read capability grants"
on public.membership_capability_grants for select to authenticated
using (
  private.is_garage_owner_or_manager(garage_id)
  or exists (
    select 1 from public.garage_memberships membership
    where membership.garage_id = membership_capability_grants.garage_id
      and membership.membership_id = membership_capability_grants.membership_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  )
);
