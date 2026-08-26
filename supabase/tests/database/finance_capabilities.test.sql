begin;

create extension if not exists pgtap with schema extensions;

select plan(19);

select has_table('public', 'membership_capability_grants', 'capability grants table exists');
select is((select relrowsecurity from pg_class where oid = 'public.membership_capability_grants'::regclass), true, 'capability grants has RLS');
select ok(not has_table_privilege('authenticated', 'public.membership_capability_grants', 'insert'), 'browser cannot forge grants');
select ok(not has_table_privilege('authenticated', 'public.membership_capability_grants', 'update'), 'browser cannot forge revocation');
select ok(not has_table_privilege('authenticated', 'public.membership_capability_grants', 'delete'), 'grant history cannot be deleted');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000', '63000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'finance-owner@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Finance Owner","phone_e164":"+256700000021"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '63000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'finance-supervisor@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Finance Supervisor","phone_e164":"+256700000022"}'::jsonb, now(), now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '63000000-0000-0000-0000-000000000001', true);
select lives_ok(
  $$
    do $block$
    declare garage uuid;
    begin
      garage := public.create_garage(
        'Finance Access Garage', '+256700123476',
        '64000000-0000-0000-0000-000000000001'
      );
      perform set_config('test.finance_garage', garage::text, true);
    end
    $block$
  $$,
  'owner creates the finance test garage'
);

reset role;
insert into public.garage_memberships (
  membership_id, garage_id, user_id, role, status, invited_by, accepted_at
) values (
  '65000000-0000-0000-0000-000000000001',
  current_setting('test.finance_garage')::uuid,
  '63000000-0000-0000-0000-000000000002',
  'supervisor', 'active', '63000000-0000-0000-0000-000000000001', now()
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '63000000-0000-0000-0000-000000000001', true);
select is(
  (select count(*) from public.list_finance_admin_candidates(current_setting('test.finance_garage')::uuid)),
  1::bigint,
  'active supervisor is eligible for delegation'
);
select lives_ok(
  $$
    do $block$
    declare created_grant uuid;
    begin
      created_grant := public.grant_finance_admin(
        current_setting('test.finance_garage')::uuid,
        '65000000-0000-0000-0000-000000000001',
        'Handles daily cash'
      );
      perform set_config('test.finance_grant', created_grant::text, true);
    end
    $block$
  $$,
  'owner grants finance admin'
);
select is((select count(*) from public.membership_capability_grants where revoked_at is null), 1::bigint, 'one active grant exists');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '63000000-0000-0000-0000-000000000002', true);
select ok(private.has_finance_admin(current_setting('test.finance_garage')::uuid), 'supervisor authorization sees the active grant');
select throws_ok(
  format(
    'select public.grant_finance_admin(%L, %L, %L)',
    current_setting('test.finance_garage'),
    '65000000-0000-0000-0000-000000000001',
    'Self delegation attempt'
  ),
  '42501',
  'owner or manager required',
  'delegated finance admin cannot delegate onward'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '63000000-0000-0000-0000-000000000001', true);
select lives_ok(
  format(
    'select public.revoke_finance_admin(%L, %L, %L)',
    current_setting('test.finance_garage'),
    current_setting('test.finance_grant'),
    'Assignment ended'
  ),
  'owner revokes finance admin'
);
select is((select count(*) from public.membership_capability_grants), 1::bigint, 'revoked grant remains in history');
select is((select count(*) from public.membership_capability_grants where revoked_at is null), 0::bigint, 'no active grant remains');
select is((select revocation_reason from public.membership_capability_grants), 'Assignment ended', 'revocation reason is retained');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '63000000-0000-0000-0000-000000000002', true);
select ok(not private.has_finance_admin(current_setting('test.finance_garage')::uuid), 'revocation is immediate without JWT refresh');
select is((select count(*) from public.membership_capability_grants), 1::bigint, 'recipient can read their own revoked history');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '63000000-0000-0000-0000-000000000001', true);
select lives_ok(
  $$select public.grant_finance_admin(
    current_setting('test.finance_garage')::uuid,
    '65000000-0000-0000-0000-000000000001',
    'New assignment'
  )$$,
  'a later grant appends a new history row'
);
select is((select count(*) from public.membership_capability_grants), 2::bigint, 'grant and regrant history are both retained');

select * from finish();
rollback;
