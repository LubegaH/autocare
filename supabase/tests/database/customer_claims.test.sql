begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

select has_table('public', 'garage_customers', 'garage customers table exists');
select has_table('public', 'customer_claims', 'customer claims table exists');
select is((select relrowsecurity from pg_class where oid = 'public.garage_customers'::regclass), true, 'garage customers has RLS');
select is((select relrowsecurity from pg_class where oid = 'public.customer_claims'::regclass), true, 'customer claims has RLS');
select ok(not has_table_privilege('authenticated', 'public.garage_customers', 'insert'), 'browser cannot insert customers');
select ok(not has_table_privilege('authenticated', 'public.customer_claims', 'insert'), 'browser cannot forge claims');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000', '54000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'claim-owner@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Claim Owner","phone_e164":"+256700000011"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '54000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'customer@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Claim Customer","phone_e164":"+256700000012"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '54000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'wrong-customer@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Wrong Customer","phone_e164":"+256700000013"}'::jsonb, now(), now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '54000000-0000-0000-0000-000000000001', true);
select lives_ok(
  $$
    do $block$
    declare
      garage uuid;
      issued jsonb;
    begin
      garage := public.create_garage(
        'Customer Claim Garage', '+256700123466',
        '55000000-0000-0000-0000-000000000001'
      );
      issued := public.issue_customer_claim(
        garage, 'Claim Customer', '+256700000012', 'CUSTOMER@example.test',
        '56000000-0000-0000-0000-000000000001', 72
      );
      perform set_config('test.customer_claim_token', issued ->> 'token', true);
    end
    $block$
  $$,
  'owner can create a customer and issue a claim atomically'
);
select is((select count(*) from public.garage_customers), 1::bigint, 'one garage customer is created');
select is((select count(*) from public.garage_customers where linked_profile_id is null), 1::bigint, 'matching email does not auto-link a profile');
select is((select intended_email from public.customer_claims), 'customer@example.test', 'claim email is normalized');
select isnt((select token_hash from public.customer_claims), current_setting('test.customer_claim_token'), 'raw claim token is not stored');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '54000000-0000-0000-0000-000000000003', true);
select throws_ok(
  format('select public.redeem_customer_claim(%L)', current_setting('test.customer_claim_token')),
  '42501',
  'claim email mismatch',
  'a different account cannot redeem the claim'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '54000000-0000-0000-0000-000000000002', true);
select lives_ok(
  format('select public.redeem_customer_claim(%L)', current_setting('test.customer_claim_token')),
  'the intended verified customer can redeem the claim'
);
select is((select count(*) from public.garage_customers), 1::bigint, 'linked customer can read only their own customer record');
select is((select linked_profile_id from public.garage_customers), '54000000-0000-0000-0000-000000000002'::uuid, 'claim explicitly links the profile');
select is((select count(*) from public.customer_claims), 0::bigint, 'customer cannot read claim security metadata');
select is((select count(*) from public.activity_events), 0::bigint, 'customer cannot read garage security activity');
select throws_ok(
  format('select public.redeem_customer_claim(%L)', current_setting('test.customer_claim_token')),
  'P0001',
  'claim is no longer valid',
  'the claim token cannot be replayed'
);

select * from finish();
rollback;
