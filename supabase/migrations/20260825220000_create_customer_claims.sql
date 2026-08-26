-- Additive rollback before customer data exists: drop the claim functions,
-- policies, indexes, customer_claims, and garage_customers.

create table public.garage_customers (
  customer_id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages (garage_id) on delete restrict,
  full_name text not null
    constraint garage_customers_name_not_blank check (length(btrim(full_name)) between 2 and 100),
  phone_e164 text not null
    constraint garage_customers_phone_is_e164 check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  email text
    constraint garage_customers_email_normalized check (
      email is null or (
        email = lower(btrim(email))
        and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      )
    ),
  linked_profile_id uuid references public.profiles (user_id) on delete restrict,
  created_by uuid not null references auth.users (id) on delete restrict,
  creation_key uuid not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (garage_id, customer_id),
  unique (garage_id, creation_key)
);

create unique index garage_customers_linked_profile_idx
on public.garage_customers (garage_id, linked_profile_id)
where linked_profile_id is not null and archived_at is null;

create index garage_customers_phone_idx
on public.garage_customers (garage_id, phone_e164, customer_id)
where archived_at is null;

create table public.customer_claims (
  claim_id uuid primary key default gen_random_uuid(),
  garage_id uuid not null,
  customer_id uuid not null,
  intended_email text not null
    constraint customer_claims_email_normalized check (
      intended_email = lower(btrim(intended_email))
      and intended_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  token_hash text not null unique
    constraint customer_claims_token_hash check (token_hash ~ '^[0-9a-f]{64}$'),
  issued_by uuid not null references auth.users (id) on delete restrict,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users (id) on delete restrict,
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id) on delete restrict,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (garage_id, claim_id),
  foreign key (garage_id, customer_id)
    references public.garage_customers (garage_id, customer_id) on delete restrict,
  constraint customer_claims_expiry_after_creation check (expires_at > created_at),
  constraint customer_claims_redemption_complete check (
    (redeemed_at is null and redeemed_by is null)
    or (redeemed_at is not null and redeemed_by is not null)
  ),
  constraint customer_claims_revocation_complete check (
    (revoked_at is null and revoked_by is null and revocation_reason is null)
    or (
      revoked_at is not null and revoked_by is not null
      and length(btrim(revocation_reason)) between 2 and 240
    )
  ),
  constraint customer_claims_terminal_once check (
    not (redeemed_at is not null and revoked_at is not null)
  )
);

create index customer_claims_garage_customer_idx
on public.customer_claims (garage_id, customer_id, created_at desc);

create trigger garage_customers_set_updated_at
before update on public.garage_customers
for each row execute function public.set_updated_at();

create trigger customer_claims_set_updated_at
before update on public.customer_claims
for each row execute function public.set_updated_at();

alter table public.garage_customers enable row level security;
alter table public.customer_claims enable row level security;
revoke all on table public.garage_customers, public.customer_claims from anon, authenticated;
grant select on table public.garage_customers, public.customer_claims to authenticated;

create policy "Owners managers and linked customers can read customer records"
on public.garage_customers for select to authenticated
using (
  private.is_garage_owner_or_manager(garage_id)
  or linked_profile_id = (select auth.uid())
);

create policy "Owners and managers can read customer claims"
on public.customer_claims for select to authenticated
using (private.is_garage_owner_or_manager(garage_id));

create function public.issue_customer_claim(
  p_garage_id uuid,
  p_full_name text,
  p_phone_e164 text,
  p_email text,
  p_creation_key uuid,
  p_expiry_hours integer default 72
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  normalized_email text := lower(btrim(p_email));
  claim_token text := encode(extensions.gen_random_bytes(32), 'hex');
  target_customer public.garage_customers%rowtype;
  created_claim_id uuid;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  if not private.is_garage_owner_or_manager(p_garage_id) then
    raise exception 'owner or manager required' using errcode = '42501';
  end if;

  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid claim email' using errcode = '23514';
  end if;

  if p_expiry_hours < 1 or p_expiry_hours > 168 then
    raise exception 'invalid claim expiry' using errcode = '23514';
  end if;

  if (
    select count(*) from public.customer_claims
    where garage_id = p_garage_id
      and issued_by = caller_id
      and created_at > now() - interval '1 hour'
  ) >= 20 then
    raise exception 'claim rate limit reached' using errcode = 'P0001';
  end if;

  select * into target_customer
  from public.garage_customers
  where garage_id = p_garage_id and creation_key = p_creation_key;

  if target_customer.customer_id is null then
    insert into public.garage_customers (
      garage_id, full_name, phone_e164, email, created_by, creation_key
    ) values (
      p_garage_id, btrim(p_full_name), p_phone_e164, normalized_email,
      caller_id, p_creation_key
    ) returning * into target_customer;
  elsif target_customer.linked_profile_id is not null then
    raise exception 'customer is already linked' using errcode = '23505';
  elsif target_customer.full_name <> btrim(p_full_name)
    or target_customer.phone_e164 <> p_phone_e164
    or target_customer.email is distinct from normalized_email then
    raise exception 'creation key belongs to different customer data' using errcode = '23505';
  end if;

  update public.customer_claims
  set revoked_at = now(), revoked_by = caller_id, revocation_reason = 'Superseded by a new claim'
  where garage_id = p_garage_id
    and customer_id = target_customer.customer_id
    and redeemed_at is null
    and revoked_at is null;

  insert into public.customer_claims (
    garage_id, customer_id, intended_email, token_hash, issued_by, expires_at
  ) values (
    p_garage_id,
    target_customer.customer_id,
    normalized_email,
    encode(extensions.digest(claim_token, 'sha256'), 'hex'),
    caller_id,
    now() + make_interval(hours => p_expiry_hours)
  ) returning claim_id into created_claim_id;

  insert into public.activity_events (
    garage_id, actor_user_id, event_type, subject_type, subject_id
  ) values (
    p_garage_id, caller_id, 'customer_claim.issued', 'customer_claim', created_claim_id
  );

  return jsonb_build_object(
    'claim_id', created_claim_id,
    'customer_id', target_customer.customer_id,
    'token', claim_token
  );
end;
$$;

create function public.fail_customer_claim_delivery(p_claim_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  target public.customer_claims%rowtype;
begin
  select * into target from public.customer_claims where claim_id = p_claim_id for update;
  if caller_id is null or target.issued_by is distinct from caller_id then
    raise exception 'claim issuer required' using errcode = '42501';
  end if;
  if target.redeemed_at is null and target.revoked_at is null then
    update public.customer_claims
    set revoked_at = now(), revoked_by = caller_id, revocation_reason = 'Claim email delivery failed'
    where claim_id = p_claim_id;
    insert into public.activity_events (
      garage_id, actor_user_id, event_type, subject_type, subject_id
    ) values (
      target.garage_id, caller_id, 'customer_claim.delivery_failed', 'customer_claim', target.claim_id
    );
  end if;
end;
$$;

create function public.redeem_customer_claim(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_email text;
  target public.customer_claims%rowtype;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select lower(email) into caller_email
  from auth.users where id = caller_id and email_confirmed_at is not null;
  if caller_email is null then
    raise exception 'verified email required' using errcode = '28000';
  end if;

  select * into target
  from public.customer_claims
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;

  if target.claim_id is null then
    raise exception 'claim not found' using errcode = 'P0002';
  end if;
  if target.revoked_at is not null or target.redeemed_at is not null or target.expires_at <= now() then
    raise exception 'claim is no longer valid' using errcode = 'P0001';
  end if;
  if target.intended_email <> caller_email then
    raise exception 'claim email mismatch' using errcode = '42501';
  end if;

  update public.garage_customers
  set linked_profile_id = caller_id
  where garage_id = target.garage_id
    and customer_id = target.customer_id
    and linked_profile_id is null;

  if not found then
    raise exception 'customer is already linked' using errcode = '23505';
  end if;

  update public.customer_claims
  set redeemed_at = now(), redeemed_by = caller_id
  where claim_id = target.claim_id;

  insert into public.activity_events (
    garage_id, actor_user_id, event_type, subject_type, subject_id
  ) values (
    target.garage_id, caller_id, 'customer_claim.redeemed', 'garage_customer', target.customer_id
  );

  return jsonb_build_object('garage_id', target.garage_id, 'customer_id', target.customer_id);
end;
$$;

revoke all on function public.issue_customer_claim(uuid, text, text, text, uuid, integer) from public, anon;
revoke all on function public.fail_customer_claim_delivery(uuid) from public, anon;
revoke all on function public.redeem_customer_claim(text) from public, anon;
grant execute on function public.issue_customer_claim(uuid, text, text, text, uuid, integer) to authenticated;
grant execute on function public.fail_customer_claim_delivery(uuid) to authenticated;
grant execute on function public.redeem_customer_claim(text) to authenticated;

comment on table public.garage_customers is
  'Garage-owned customer relationship. Email text alone never links a global profile.';
comment on table public.customer_claims is
  'Hashed single-use authority to link one global profile to one garage customer.';
