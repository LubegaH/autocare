begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

select has_table('public', 'system_status', 'system_status table exists');
select has_pk('public', 'system_status', 'system_status has a primary key');
select has_column('public', 'system_status', 'created_at', 'created_at exists');
select has_column('public', 'system_status', 'updated_at', 'updated_at exists');
select is(
  (select relrowsecurity from pg_class where oid = 'public.system_status'::regclass),
  true,
  'row-level security is enabled'
);
select ok(
  has_table_privilege('anon', 'public.system_status', 'select'),
  'anonymous users may read the synthetic status'
);
select ok(
  not has_table_privilege('anon', 'public.system_status', 'insert'),
  'anonymous users cannot insert status rows'
);
select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'system_status'
      and cmd = 'SELECT'
      and roles = array['anon', 'authenticated']::name[]
  ),
  1::bigint,
  'the explicit read policy covers only the intended browser roles'
);

select * from finish();
rollback;
