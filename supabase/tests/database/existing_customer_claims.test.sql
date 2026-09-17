begin;

create extension if not exists pgtap with schema extensions;
select plan(17);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000', '76000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'claim-owner-a@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Claim Owner A","phone_e164":"+256700000061"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '76000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'claim-owner-b@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Claim Owner B","phone_e164":"+256700000062"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '76000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'corrected@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Existing Customer","phone_e164":"+256700000063"}'::jsonb, now(), now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '76000000-0000-0000-0000-000000000001', true);
select lives_ok(
  $$
    do $block$
    declare garage uuid; issued jsonb;
    begin
      garage := public.create_garage(
        'Existing Customer Garage', '+256700000064',
        '76100000-0000-0000-0000-000000000001'
      );
      issued := public.issue_customer_claim(
        garage, 'Existing Customer', '+256700000063', 'old@example.test',
        '76200000-0000-0000-0000-000000000001', 72
      );
      perform set_config('test.existing_garage', garage::text, true);
      perform set_config('test.existing_customer', issued ->> 'customer_id', true);
    end
    $block$
  $$,
  'owner first creates an unlinked customer record'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '76000000-0000-0000-0000-000000000002', true);
select lives_ok(
  $$
    do $block$
    declare garage uuid;
    begin
      garage := public.create_garage(
        'Other Customer Garage', '+256700000065',
        '76100000-0000-0000-0000-000000000002'
      );
      perform set_config('test.other_garage', garage::text, true);
    end
    $block$
  $$,
  'second owner has a separate garage'
);
select throws_ok(
  format(
    'select public.issue_customer_claim(%L, %L, %L, %L, %L, 72)',
    current_setting('test.existing_garage'), 'Existing Customer',
    '+256700000063', 'corrected@example.test',
    '76200000-0000-0000-0000-000000000001'
  ),
  '42501', 'owner or manager required',
  'another garage owner cannot issue a claim on this customer'
);

reset role;
update public.garage_customers
set email = null
where customer_id = current_setting('test.existing_customer')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', '76000000-0000-0000-0000-000000000001', true);
select lives_ok(
  $$
    do $block$
    declare issued jsonb;
    begin
      issued := public.issue_customer_claim(
        current_setting('test.existing_garage')::uuid,
        'Existing Customer', '+256700000063', 'corrected@example.test',
        '76200000-0000-0000-0000-000000000001', 72
      );
      perform set_config('test.existing_token', issued ->> 'token', true);
      perform set_config('test.reissued_customer', issued ->> 'customer_id', true);
    end
    $block$
  $$,
  'owner issues a new claim for the same customer with a corrected email'
);
select is(
  current_setting('test.reissued_customer'), current_setting('test.existing_customer'),
  'claim targets the original customer row'
);
select is(
  (select count(*) from public.garage_customers), 1::bigint,
  'reissuing creates no duplicate customer'
);
select is(
  (select count(*) from public.customer_claims where revoked_at is not null), 1::bigint,
  'previous unredeemed claim is revoked'
);
select is(
  (select intended_email from public.customer_claims where revoked_at is null),
  'corrected@example.test', 'new claim uses the verified target email'
);
select is(
  (select email from public.garage_customers), null::text,
  'issuing a claim does not silently overwrite stored contact email'
);

reset role;
update public.garage_customers
set archived_at = now()
where customer_id = current_setting('test.existing_customer')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', '76000000-0000-0000-0000-000000000001', true);
select throws_ok(
  format(
    'select public.issue_customer_claim(%L, %L, %L, %L, %L, 72)',
    current_setting('test.existing_garage'), 'Existing Customer',
    '+256700000063', 'corrected@example.test',
    '76200000-0000-0000-0000-000000000001'
  ),
  '23514', 'customer record is archived',
  'archived customer cannot receive another claim'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '76000000-0000-0000-0000-000000000003', true);
select throws_ok(
  format('select public.redeem_customer_claim(%L)', current_setting('test.existing_token')),
  '23514', 'archived customer cannot be linked',
  'an issued claim cannot link a customer after archival'
);

reset role;
update public.garage_customers
set archived_at = null
where customer_id = current_setting('test.existing_customer')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', '76000000-0000-0000-0000-000000000003', true);
select lives_ok(
  format('select public.redeem_customer_claim(%L)', current_setting('test.existing_token')),
  'recipient redeems the corrected-email claim'
);
select is(
  (select customer_id from public.garage_customers),
  current_setting('test.existing_customer')::uuid,
  'recipient sees the original linked customer record'
);
select is(
  (select count(*) from public.garage_customers), 1::bigint,
  'redemption still leaves one customer row'
);
select is(
  (select linked_profile_id from public.garage_customers),
  '76000000-0000-0000-0000-000000000003'::uuid,
  'the original row links to the intended profile'
);
select throws_ok(
  format('select public.redeem_customer_claim(%L)', current_setting('test.existing_token')),
  'P0001', 'claim is no longer valid', 'token stays single-use'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '76000000-0000-0000-0000-000000000001', true);
select throws_ok(
  format(
    'select public.issue_customer_claim(%L, %L, %L, %L, %L, 72)',
    current_setting('test.existing_garage'), 'Existing Customer',
    '+256700000063', 'another@example.test',
    '76200000-0000-0000-0000-000000000001'
  ),
  '23505', 'customer is already linked',
  'linked customer cannot receive a new claim'
);

select * from finish();
rollback;
