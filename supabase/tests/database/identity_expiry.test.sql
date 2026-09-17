begin;

create extension if not exists pgtap with schema extensions;

select plan(4);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000', '70000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'expiry-owner@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Expiry Owner","phone_e164":"+256700000031"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '70000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'expired-staff@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Expired Staff","phone_e164":"+256700000032"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '70000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'expired-customer@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Expired Customer","phone_e164":"+256700000033"}'::jsonb, now(), now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '70000000-0000-0000-0000-000000000001', true);
select lives_ok(
  $$
    do $block$
    declare garage uuid;
    begin
      garage := public.create_garage(
        'Expiry Test Garage', '+256700123486',
        '71000000-0000-0000-0000-000000000001'
      );
      perform set_config('test.expiry_garage', garage::text, true);
    end
    $block$
  $$,
  'expiry test garage is created'
);

reset role;
insert into public.staff_invitations (
  garage_id, intended_email, intended_role, token_hash, issued_by,
  created_at, updated_at, expires_at
) values (
  current_setting('test.expiry_garage')::uuid,
  'expired-staff@example.test',
  'mechanic',
  encode(extensions.digest(repeat('c', 64), 'sha256'), 'hex'),
  '70000000-0000-0000-0000-000000000001',
  now() - interval '2 hours',
  now() - interval '2 hours',
  now() - interval '1 hour'
);

insert into public.garage_customers (
  customer_id, garage_id, full_name, phone_e164, email, created_by, creation_key
) values (
  '72000000-0000-0000-0000-000000000001',
  current_setting('test.expiry_garage')::uuid,
  'Expired Customer', '+256700000033', 'expired-customer@example.test',
  '70000000-0000-0000-0000-000000000001',
  '73000000-0000-0000-0000-000000000001'
);
insert into public.customer_claims (
  garage_id, customer_id, intended_email, token_hash, issued_by,
  created_at, updated_at, expires_at
) values (
  current_setting('test.expiry_garage')::uuid,
  '72000000-0000-0000-0000-000000000001',
  'expired-customer@example.test',
  encode(extensions.digest(repeat('d', 64), 'sha256'), 'hex'),
  '70000000-0000-0000-0000-000000000001',
  now() - interval '2 hours',
  now() - interval '2 hours',
  now() - interval '1 hour'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '70000000-0000-0000-0000-000000000002', true);
select throws_ok(
  format('select public.accept_staff_invitation(%L)', repeat('c', 64)),
  'P0001',
  'invitation is no longer valid',
  'expired staff invitation is rejected'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '70000000-0000-0000-0000-000000000003', true);
select throws_ok(
  format('select public.redeem_customer_claim(%L)', repeat('d', 64)),
  'P0001',
  'claim is no longer valid',
  'expired customer claim is rejected'
);
select is((select count(*) from public.garage_customers), 0::bigint, 'expired claim grants no customer access');

select * from finish();
rollback;
