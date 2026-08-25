begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

select has_table('public', 'garages', 'garages table exists');
select has_table('public', 'garage_memberships', 'memberships table exists');
select has_table('public', 'activity_events', 'activity events table exists');
select has_function('public', 'create_garage', array['text', 'text', 'uuid', 'text'], 'create_garage exists');
select is((select relrowsecurity from pg_class where oid = 'public.garages'::regclass), true, 'garages has RLS');
select is((select relrowsecurity from pg_class where oid = 'public.garage_memberships'::regclass), true, 'memberships has RLS');
select is((select relrowsecurity from pg_class where oid = 'public.activity_events'::regclass), true, 'activity events has RLS');
select ok(not has_table_privilege('authenticated', 'public.garages', 'insert'), 'browser cannot insert garages');
select ok(not has_table_privilege('authenticated', 'public.garage_memberships', 'insert'), 'browser cannot assign roles');
select ok(not has_table_privilege('authenticated', 'public.activity_events', 'insert'), 'browser cannot forge audit events');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'owner-one@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Owner One","phone_e164":"+256700000001"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'owner-two@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Owner Two","phone_e164":"+256700000002"}'::jsonb, now(), now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);

select lives_ok(
  $$select public.create_garage('AutoCare Central', '+256700123456', '21000000-0000-0000-0000-000000000001')$$,
  'verified user can create a garage'
);
select is((select count(*) from public.list_my_garages()), 1::bigint, 'owner can list the new garage');
select is(
  public.create_garage('AutoCare Central', '+256700123456', '21000000-0000-0000-0000-000000000001'),
  (select garage_id from public.list_my_garages()),
  'reusing the creation key returns the same garage'
);
select is((select count(*) from public.list_my_garages()), 1::bigint, 'idempotent retry creates no duplicate');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select lives_ok(
  $$select public.create_garage('Second Garage', '+256700123457', '21000000-0000-0000-0000-000000000002')$$,
  'second owner can create an isolated garage'
);

select is((select count(*) from public.garages), 1::bigint, 'RLS hides the other owner garage');
select is((select count(*) from public.garage_memberships), 1::bigint, 'RLS hides cross-garage memberships');
select is((select count(*) from public.activity_events), 1::bigint, 'owner sees only their garage audit event');

select * from finish();
rollback;
