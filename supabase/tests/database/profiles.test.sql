begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

select has_table('public', 'profiles', 'profiles table exists');
select has_pk('public', 'profiles', 'profiles has a primary key');
select col_not_null('public', 'profiles', 'full_name', 'full name is required');
select col_not_null('public', 'profiles', 'phone_e164', 'phone is required');
select is(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  true,
  'profiles has row-level security enabled'
);
select ok(
  has_table_privilege('authenticated', 'public.profiles', 'select'),
  'authenticated users may select profiles through RLS'
);
select ok(
  not has_table_privilege('anon', 'public.profiles', 'select'),
  'anonymous users cannot read profiles'
);
select ok(
  not has_table_privilege('authenticated', 'public.profiles', 'insert'),
  'browser users cannot insert profiles directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.profiles', 'delete'),
  'browser users cannot delete profiles'
);
select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  ),
  2::bigint,
  'profiles has explicit read and update policies'
);
select throws_ok(
  $$
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      '10000000-0000-0000-0000-000000000001',
      'authenticated',
      'authenticated',
      'missing-profile@example.test',
      crypt('test-password', gen_salt('bf')),
      '{}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    )
  $$,
  '23502',
  null,
  'signup fails closed when required profile metadata is missing'
);
select lives_ok(
  $$
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      '10000000-0000-0000-0000-000000000002',
      'authenticated',
      'authenticated',
      'valid-profile@example.test',
      crypt('test-password', gen_salt('bf')),
      '{}'::jsonb,
      '{"full_name":"Kato Samuel","phone_e164":"+256700123456"}'::jsonb,
      now(),
      now()
    )
  $$,
  'valid signup metadata creates a profile'
);

select * from finish();
rollback;
