begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

select has_table('public', 'staff_invitations', 'staff invitations table exists');
select is((select relrowsecurity from pg_class where oid = 'public.staff_invitations'::regclass), true, 'staff invitations has RLS');
select ok(not has_table_privilege('authenticated', 'public.staff_invitations', 'insert'), 'browser cannot insert invitations');
select ok(not has_table_privilege('authenticated', 'public.staff_invitations', 'update'), 'browser cannot alter invitations');
select ok(not has_table_privilege('authenticated', 'public.staff_invitations', 'delete'), 'browser cannot delete invitations');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000', '42000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'owner@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Garage Owner","phone_e164":"+256700000001"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '42000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'mechanic@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Garage Mechanic","phone_e164":"+256700000002"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '42000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'wrong@example.test', crypt('test-password', gen_salt('bf')), now(),
    '{}'::jsonb, '{"full_name":"Wrong Person","phone_e164":"+256700000003"}'::jsonb, now(), now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '42000000-0000-0000-0000-000000000001', true);

select lives_ok(
  $$
    do $block$
    declare
      garage uuid;
      issued jsonb;
    begin
      garage := public.create_garage(
        'Invitation Test Garage', '+256700123456',
        '43000000-0000-0000-0000-000000000001'
      );
      issued := public.issue_staff_invitation(
        garage, 'MECHANIC@example.test', 'mechanic', 72
      );
      perform set_config('test.garage_id', garage::text, true);
      perform set_config('test.invitation_token', issued ->> 'token', true);
    end
    $block$
  $$,
  'owner can issue a staff invitation'
);

select is((select count(*) from public.staff_invitations), 1::bigint, 'owner can read the invitation');
select is((select intended_email from public.staff_invitations), 'mechanic@example.test', 'email is normalized');
select isnt((select token_hash from public.staff_invitations), current_setting('test.invitation_token'), 'raw token is never stored');
select is((select length(token_hash) from public.staff_invitations), 64, 'only a sha256 token hash is stored');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '42000000-0000-0000-0000-000000000003', true);
select throws_ok(
  format(
    'select public.issue_staff_invitation(%L, %L, %L, 72)',
    current_setting('test.garage_id'),
    'outsider@example.test',
    'mechanic'
  ),
  '42501',
  'owner or manager required',
  'a non-member cannot issue an invitation'
);
select throws_ok(
  format('select public.accept_staff_invitation(%L)', current_setting('test.invitation_token')),
  '42501',
  'invitation email mismatch',
  'a different authenticated email cannot claim the invitation'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '42000000-0000-0000-0000-000000000002', true);
select lives_ok(
  format('select public.accept_staff_invitation(%L)', current_setting('test.invitation_token')),
  'the intended verified user can accept the invitation'
);
select is((select count(*) from public.list_my_garages()), 1::bigint, 'accepted staff can list the garage');
select is((select role from public.list_my_garages()), 'mechanic', 'accepted membership has the intended role');
select throws_ok(
  format('select public.accept_staff_invitation(%L)', current_setting('test.invitation_token')),
  'P0001',
  'invitation is no longer valid',
  'the token cannot be replayed'
);
select is((select count(*) from public.staff_invitations), 0::bigint, 'mechanic cannot read security invitations');
select is((select count(*) from public.activity_events), 0::bigint, 'mechanic cannot read security activity');

select * from finish();
rollback;
