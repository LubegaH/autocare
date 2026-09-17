-- Rollback: drop garage_customers_prevent_archived_link and its private
-- function, then restore the previous issue_customer_claim body only if no
-- claim has been issued to an existing customer with a different or missing
-- stored email. Existing claims and links are retained.

create or replace function public.issue_customer_claim(
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
  where garage_id = p_garage_id and creation_key = p_creation_key
  for update;

  if target_customer.customer_id is null then
    insert into public.garage_customers (
      garage_id, full_name, phone_e164, email, created_by, creation_key
    ) values (
      p_garage_id, btrim(p_full_name), p_phone_e164, normalized_email,
      caller_id, p_creation_key
    ) returning * into target_customer;
  elsif target_customer.archived_at is not null then
    raise exception 'customer record is archived' using errcode = '23514';
  elsif target_customer.linked_profile_id is not null then
    raise exception 'customer is already linked' using errcode = '23505';
  elsif target_customer.full_name is distinct from btrim(p_full_name)
    or target_customer.phone_e164 is distinct from p_phone_e164 then
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

comment on function public.issue_customer_claim(uuid, text, text, text, uuid, integer) is
  'Issues a single-use claim for a new or selected unlinked garage customer; the verified claim email may differ from stored contact data.';

create function private.prevent_archived_customer_link()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.linked_profile_id is not null
    and (old.archived_at is not null or new.archived_at is not null) then
    raise exception 'archived customer cannot be linked' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function private.prevent_archived_customer_link() from public, anon, authenticated;

create trigger garage_customers_prevent_archived_link
before update of linked_profile_id on public.garage_customers
for each row execute function private.prevent_archived_customer_link();
