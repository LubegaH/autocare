-- Additive rollback before delegated access is used: drop the capability
-- functions, policies, indexes, and membership_capability_grants table.

create table public.membership_capability_grants (
  grant_id uuid primary key default gen_random_uuid(),
  garage_id uuid not null,
  membership_id uuid not null,
  capability text not null
    constraint membership_capability_grants_capability check (capability = 'finance_admin'),
  granted_by uuid not null references auth.users (id) on delete restrict,
  grant_reason text not null
    constraint membership_capability_grants_reason check (length(btrim(grant_reason)) between 2 and 240),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id) on delete restrict,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (garage_id, grant_id),
  foreign key (garage_id, membership_id)
    references public.garage_memberships (garage_id, membership_id) on delete restrict,
  constraint membership_capability_grants_revocation_complete check (
    (revoked_at is null and revoked_by is null and revocation_reason is null)
    or (
      revoked_at is not null and revoked_by is not null
      and length(btrim(revocation_reason)) between 2 and 240
    )
  )
);

create unique index membership_capability_grants_one_active_idx
on public.membership_capability_grants (garage_id, membership_id, capability)
where revoked_at is null;

create index membership_capability_grants_garage_history_idx
on public.membership_capability_grants (garage_id, membership_id, granted_at desc, grant_id desc);

create trigger membership_capability_grants_set_updated_at
before update on public.membership_capability_grants
for each row execute function public.set_updated_at();

create function private.has_finance_admin(target_garage_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.garage_memberships membership
    join public.membership_capability_grants capability
      on capability.garage_id = membership.garage_id
      and capability.membership_id = membership.membership_id
      and capability.capability = 'finance_admin'
      and capability.revoked_at is null
    where membership.garage_id = target_garage_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  );
$$;

revoke all on function private.has_finance_admin(uuid) from public, anon;
grant execute on function private.has_finance_admin(uuid) to authenticated;

alter table public.membership_capability_grants enable row level security;
revoke all on table public.membership_capability_grants from anon, authenticated;
grant select on table public.membership_capability_grants to authenticated;

create policy "Owners managers and recipients can read capability grants"
on public.membership_capability_grants for select to authenticated
using (
  private.is_garage_owner_or_manager(garage_id)
  or exists (
    select 1 from public.garage_memberships membership
    where membership.garage_id = membership_capability_grants.garage_id
      and membership.membership_id = membership_capability_grants.membership_id
      and membership.user_id = (select auth.uid())
  )
);

create function public.grant_finance_admin(
  p_garage_id uuid,
  p_membership_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  target public.garage_memberships%rowtype;
  existing_grant_id uuid;
  created_grant_id uuid;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not private.is_garage_owner_or_manager(p_garage_id) then
    raise exception 'owner or manager required' using errcode = '42501';
  end if;
  if length(btrim(p_reason)) not between 2 and 240 then
    raise exception 'grant reason required' using errcode = '23514';
  end if;

  select * into target
  from public.garage_memberships
  where garage_id = p_garage_id and membership_id = p_membership_id;
  if target.membership_id is null or target.status <> 'active' or target.role <> 'supervisor' then
    raise exception 'active supervisor membership required' using errcode = '23514';
  end if;

  select grant_id into existing_grant_id
  from public.membership_capability_grants
  where garage_id = p_garage_id
    and membership_id = p_membership_id
    and capability = 'finance_admin'
    and revoked_at is null;
  if existing_grant_id is not null then
    return existing_grant_id;
  end if;

  insert into public.membership_capability_grants (
    garage_id, membership_id, capability, granted_by, grant_reason
  ) values (
    p_garage_id, p_membership_id, 'finance_admin', caller_id, btrim(p_reason)
  ) returning grant_id into created_grant_id;

  insert into public.activity_events (
    garage_id, actor_user_id, event_type, subject_type, subject_id,
    metadata
  ) values (
    p_garage_id, caller_id, 'finance_admin.granted',
    'garage_membership', p_membership_id,
    jsonb_build_object('capability', 'finance_admin')
  );

  return created_grant_id;
end;
$$;

create function public.revoke_finance_admin(
  p_garage_id uuid,
  p_grant_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  target public.membership_capability_grants%rowtype;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if not private.is_garage_owner_or_manager(p_garage_id) then
    raise exception 'owner or manager required' using errcode = '42501';
  end if;
  if length(btrim(p_reason)) not between 2 and 240 then
    raise exception 'revocation reason required' using errcode = '23514';
  end if;

  select * into target
  from public.membership_capability_grants
  where garage_id = p_garage_id and grant_id = p_grant_id
  for update;
  if target.grant_id is null then
    raise exception 'capability grant not found' using errcode = 'P0002';
  end if;
  if target.revoked_at is not null then
    return;
  end if;

  update public.membership_capability_grants
  set revoked_at = now(), revoked_by = caller_id, revocation_reason = btrim(p_reason)
  where grant_id = target.grant_id;

  insert into public.activity_events (
    garage_id, actor_user_id, event_type, subject_type, subject_id,
    metadata
  ) values (
    p_garage_id, caller_id, 'finance_admin.revoked',
    'garage_membership', target.membership_id,
    jsonb_build_object('capability', 'finance_admin')
  );
end;
$$;

create function public.list_finance_admin_candidates(p_garage_id uuid)
returns table (
  membership_id uuid,
  full_name text,
  role text,
  grant_id uuid,
  has_finance_admin boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_garage_owner_or_manager(p_garage_id) then
    raise exception 'owner or manager required' using errcode = '42501';
  end if;

  return query
  select
    membership.membership_id,
    profile.full_name,
    membership.role,
    capability.grant_id,
    capability.grant_id is not null
  from public.garage_memberships membership
  join public.profiles profile on profile.user_id = membership.user_id
  left join public.membership_capability_grants capability
    on capability.garage_id = membership.garage_id
    and capability.membership_id = membership.membership_id
    and capability.capability = 'finance_admin'
    and capability.revoked_at is null
  where membership.garage_id = p_garage_id
    and membership.status = 'active'
    and membership.role = 'supervisor'
  order by profile.full_name, membership.membership_id;
end;
$$;

revoke all on function public.grant_finance_admin(uuid, uuid, text) from public, anon;
revoke all on function public.revoke_finance_admin(uuid, uuid, text) from public, anon;
revoke all on function public.list_finance_admin_candidates(uuid) from public, anon;
grant execute on function public.grant_finance_admin(uuid, uuid, text) to authenticated;
grant execute on function public.revoke_finance_admin(uuid, uuid, text) to authenticated;
grant execute on function public.list_finance_admin_candidates(uuid) to authenticated;

comment on table public.membership_capability_grants is
  'Append/revoke history for delegated capabilities. Authorization reads active rows, never JWT metadata.';
