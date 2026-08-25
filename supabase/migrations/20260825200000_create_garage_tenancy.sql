-- Additive rollback before tenant data exists: drop the functions, policies,
-- activity_events, garage_memberships, garages, and private helper schema.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.garages (
  garage_id uuid primary key default gen_random_uuid(),
  name text not null constraint garages_name_not_blank check (length(btrim(name)) between 2 and 120),
  phone_e164 text not null constraint garages_phone_is_e164 check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  timezone text not null default 'Africa/Kampala'
    constraint garages_pilot_timezone check (timezone = 'Africa/Kampala'),
  created_by uuid not null references auth.users (id) on delete restrict,
  creation_key uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (created_by, creation_key)
);

create table public.garage_memberships (
  membership_id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages (garage_id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  role text not null constraint garage_memberships_role check (role in ('owner', 'manager', 'supervisor', 'mechanic')),
  status text not null constraint garage_memberships_status check (status in ('invited', 'active', 'revoked')),
  invited_by uuid references auth.users (id) on delete restrict,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (garage_id, membership_id),
  unique (garage_id, user_id),
  constraint garage_memberships_active_is_accepted check (status <> 'active' or accepted_at is not null)
);

create table public.activity_events (
  event_id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages (garage_id) on delete restrict,
  actor_user_id uuid not null references auth.users (id) on delete restrict,
  event_type text not null constraint activity_events_type_not_blank check (length(btrim(event_type)) between 2 and 80),
  subject_type text not null constraint activity_events_subject_type_not_blank check (length(btrim(subject_type)) between 2 and 80),
  subject_id uuid not null,
  metadata jsonb not null default '{}'::jsonb constraint activity_events_metadata_is_object check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index garage_memberships_user_active_idx
on public.garage_memberships (user_id, garage_id)
where status = 'active';

create index activity_events_garage_created_idx
on public.activity_events (garage_id, created_at desc, event_id desc);

create trigger garages_set_updated_at
before update on public.garages
for each row execute function public.set_updated_at();

create trigger garage_memberships_set_updated_at
before update on public.garage_memberships
for each row execute function public.set_updated_at();

create function private.is_active_garage_member(target_garage_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.garage_memberships membership
    where membership.garage_id = target_garage_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  );
$$;

create function private.is_garage_owner_or_manager(target_garage_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.garage_memberships membership
    where membership.garage_id = target_garage_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and membership.role in ('owner', 'manager')
  );
$$;

revoke all on function private.is_active_garage_member(uuid) from public, anon;
revoke all on function private.is_garage_owner_or_manager(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_active_garage_member(uuid) to authenticated;
grant execute on function private.is_garage_owner_or_manager(uuid) to authenticated;

alter table public.garages enable row level security;
alter table public.garage_memberships enable row level security;
alter table public.activity_events enable row level security;

revoke all on table public.garages, public.garage_memberships, public.activity_events from anon, authenticated;
grant select on table public.garages, public.garage_memberships to authenticated;
grant select on table public.activity_events to authenticated;

create policy "Active staff can read their garage"
on public.garages for select to authenticated
using (private.is_active_garage_member(garage_id));

create policy "Active staff can read garage memberships"
on public.garage_memberships for select to authenticated
using (private.is_active_garage_member(garage_id));

create policy "Owners and managers can read security activity"
on public.activity_events for select to authenticated
using (private.is_garage_owner_or_manager(garage_id));

create function public.create_garage(
  p_name text,
  p_phone_e164 text,
  p_creation_key uuid,
  p_timezone text default 'Africa/Kampala'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  created_garage_id uuid;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  if not exists (
    select 1 from auth.users
    where id = caller_id and email_confirmed_at is not null
  ) then
    raise exception 'verified email required' using errcode = '28000';
  end if;

  if not exists (select 1 from public.profiles where user_id = caller_id) then
    raise exception 'profile required' using errcode = '23514';
  end if;

  select garage_id into created_garage_id
  from public.garages
  where created_by = caller_id and creation_key = p_creation_key;

  if created_garage_id is not null then
    return created_garage_id;
  end if;

  if (
    select count(*) from public.garage_memberships
    where user_id = caller_id and role = 'owner' and status = 'active'
  ) >= 5 then
    raise exception 'garage creation limit reached' using errcode = '23514';
  end if;

  insert into public.garages (name, phone_e164, timezone, created_by, creation_key)
  values (btrim(p_name), p_phone_e164, p_timezone, caller_id, p_creation_key)
  returning garage_id into created_garage_id;

  insert into public.garage_memberships (
    garage_id, user_id, role, status, invited_by, accepted_at
  ) values (
    created_garage_id, caller_id, 'owner', 'active', caller_id, now()
  );

  insert into public.activity_events (
    garage_id, actor_user_id, event_type, subject_type, subject_id
  ) values (
    created_garage_id, caller_id, 'garage.created', 'garage', created_garage_id
  );

  return created_garage_id;
end;
$$;

revoke all on function public.create_garage(text, text, uuid, text) from public, anon;
grant execute on function public.create_garage(text, text, uuid, text) to authenticated;

create function public.list_my_garages()
returns table (garage_id uuid, name text, role text)
language sql
stable
security invoker
set search_path = ''
as $$
  select garage.garage_id, garage.name, membership.role
  from public.garage_memberships membership
  join public.garages garage using (garage_id)
  where membership.user_id = auth.uid()
    and membership.status = 'active'
  order by garage.name, garage.garage_id;
$$;

revoke all on function public.list_my_garages() from public, anon;
grant execute on function public.list_my_garages() to authenticated;

comment on function public.create_garage(text, text, uuid, text) is
  'Idempotently creates a garage and its first owner membership for a verified caller.';
comment on table public.activity_events is
  'Append-only safe audit metadata. Tokens, email addresses, phone numbers, and bulk PII are forbidden.';
