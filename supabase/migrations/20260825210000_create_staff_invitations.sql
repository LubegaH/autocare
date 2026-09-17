-- Additive rollback before invitations exist: drop the invitation functions,
-- policies, indexes, and staff_invitations table.

create table public.staff_invitations (
  invitation_id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages (garage_id) on delete restrict,
  intended_email text not null
    constraint staff_invitations_email_normalized check (
      intended_email = lower(btrim(intended_email))
      and intended_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  intended_role text not null
    constraint staff_invitations_role check (intended_role in ('manager', 'supervisor', 'mechanic')),
  token_hash text not null unique
    constraint staff_invitations_token_hash check (token_hash ~ '^[0-9a-f]{64}$'),
  issued_by uuid not null references auth.users (id) on delete restrict,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users (id) on delete restrict,
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id) on delete restrict,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (garage_id, invitation_id),
  constraint staff_invitations_expiry_after_creation check (expires_at > created_at),
  constraint staff_invitations_redemption_complete check (
    (redeemed_at is null and redeemed_by is null)
    or (redeemed_at is not null and redeemed_by is not null)
  ),
  constraint staff_invitations_revocation_complete check (
    (revoked_at is null and revoked_by is null and revocation_reason is null)
    or (
      revoked_at is not null and revoked_by is not null
      and length(btrim(revocation_reason)) between 2 and 240
    )
  ),
  constraint staff_invitations_terminal_once check (
    not (redeemed_at is not null and revoked_at is not null)
  )
);

create index staff_invitations_garage_created_idx
on public.staff_invitations (garage_id, created_at desc, invitation_id desc);

create index staff_invitations_active_email_idx
on public.staff_invitations (garage_id, intended_email)
where redeemed_at is null and revoked_at is null;

create trigger staff_invitations_set_updated_at
before update on public.staff_invitations
for each row execute function public.set_updated_at();

alter table public.staff_invitations enable row level security;
revoke all on table public.staff_invitations from anon, authenticated;
grant select on table public.staff_invitations to authenticated;

create policy "Owners and managers can read staff invitations"
on public.staff_invitations for select to authenticated
using (private.is_garage_owner_or_manager(garage_id));

create function public.issue_staff_invitation(
  p_garage_id uuid,
  p_email text,
  p_role text,
  p_expiry_hours integer default 72
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_role text;
  normalized_email text := lower(btrim(p_email));
  invitation_token text := encode(extensions.gen_random_bytes(32), 'hex');
  created_invitation_id uuid;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select role into caller_role
  from public.garage_memberships
  where garage_id = p_garage_id
    and user_id = caller_id
    and status = 'active';

  if caller_role is null or caller_role not in ('owner', 'manager') then
    raise exception 'owner or manager required' using errcode = '42501';
  end if;

  if p_role not in ('manager', 'supervisor', 'mechanic') then
    raise exception 'invalid staff role' using errcode = '23514';
  end if;

  if caller_role = 'manager' and p_role = 'manager' then
    raise exception 'only owners may invite managers' using errcode = '42501';
  end if;

  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid invitation email' using errcode = '23514';
  end if;

  if p_expiry_hours < 1 or p_expiry_hours > 168 then
    raise exception 'invalid invitation expiry' using errcode = '23514';
  end if;

  if (
    select count(*) from public.staff_invitations
    where garage_id = p_garage_id
      and issued_by = caller_id
      and created_at > now() - interval '1 hour'
  ) >= 20 then
    raise exception 'invitation rate limit reached' using errcode = 'P0001';
  end if;

  update public.staff_invitations
  set revoked_at = now(), revoked_by = caller_id, revocation_reason = 'Superseded by a new invitation'
  where garage_id = p_garage_id
    and intended_email = normalized_email
    and redeemed_at is null
    and revoked_at is null;

  insert into public.staff_invitations (
    garage_id, intended_email, intended_role, token_hash, issued_by, expires_at
  ) values (
    p_garage_id,
    normalized_email,
    p_role,
    encode(extensions.digest(invitation_token, 'sha256'), 'hex'),
    caller_id,
    now() + make_interval(hours => p_expiry_hours)
  )
  returning invitation_id into created_invitation_id;

  insert into public.activity_events (
    garage_id, actor_user_id, event_type, subject_type, subject_id, metadata
  ) values (
    p_garage_id,
    caller_id,
    'staff_invitation.issued',
    'staff_invitation',
    created_invitation_id,
    jsonb_build_object('role', p_role)
  );

  return jsonb_build_object(
    'invitation_id', created_invitation_id,
    'token', invitation_token
  );
end;
$$;

create function public.fail_staff_invitation_delivery(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  target public.staff_invitations%rowtype;
begin
  select * into target
  from public.staff_invitations
  where invitation_id = p_invitation_id
  for update;

  if caller_id is null or target.issued_by is distinct from caller_id then
    raise exception 'invitation issuer required' using errcode = '42501';
  end if;

  if target.redeemed_at is null and target.revoked_at is null then
    update public.staff_invitations
    set revoked_at = now(), revoked_by = caller_id, revocation_reason = 'Invitation email delivery failed'
    where invitation_id = p_invitation_id;

    insert into public.activity_events (
      garage_id, actor_user_id, event_type, subject_type, subject_id
    ) values (
      target.garage_id, caller_id, 'staff_invitation.delivery_failed',
      'staff_invitation', target.invitation_id
    );
  end if;
end;
$$;

create function public.accept_staff_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_email text;
  target public.staff_invitations%rowtype;
  created_membership_id uuid;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select lower(email) into caller_email
  from auth.users
  where id = caller_id and email_confirmed_at is not null;

  if caller_email is null then
    raise exception 'verified email required' using errcode = '28000';
  end if;

  select * into target
  from public.staff_invitations
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;

  if target.invitation_id is null then
    raise exception 'invitation not found' using errcode = 'P0002';
  end if;

  if target.revoked_at is not null or target.redeemed_at is not null or target.expires_at <= now() then
    raise exception 'invitation is no longer valid' using errcode = 'P0001';
  end if;

  if target.intended_email <> caller_email then
    raise exception 'invitation email mismatch' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.garage_memberships
    where garage_id = target.garage_id and user_id = caller_id
  ) then
    raise exception 'membership already exists' using errcode = '23505';
  end if;

  insert into public.garage_memberships (
    garage_id, user_id, role, status, invited_by, accepted_at
  ) values (
    target.garage_id, caller_id, target.intended_role, 'active', target.issued_by, now()
  ) returning membership_id into created_membership_id;

  update public.staff_invitations
  set redeemed_at = now(), redeemed_by = caller_id
  where invitation_id = target.invitation_id;

  insert into public.activity_events (
    garage_id, actor_user_id, event_type, subject_type, subject_id, metadata
  ) values (
    target.garage_id,
    caller_id,
    'staff_invitation.accepted',
    'garage_membership',
    created_membership_id,
    jsonb_build_object('role', target.intended_role)
  );

  return jsonb_build_object('garage_id', target.garage_id, 'role', target.intended_role);
end;
$$;

revoke all on function public.issue_staff_invitation(uuid, text, text, integer) from public, anon;
revoke all on function public.fail_staff_invitation_delivery(uuid) from public, anon;
revoke all on function public.accept_staff_invitation(text) from public, anon;
grant execute on function public.issue_staff_invitation(uuid, text, text, integer) to authenticated;
grant execute on function public.fail_staff_invitation_delivery(uuid) to authenticated;
grant execute on function public.accept_staff_invitation(text) to authenticated;

comment on table public.staff_invitations is
  'Hashed, expiring, single-use authority for staff membership. Email delivery alone grants no access.';
