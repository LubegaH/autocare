begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

select results_eq(
  $$
    select relname::text
    from pg_class
    where oid in (
      'public.profiles'::regclass,
      'public.garages'::regclass,
      'public.garage_memberships'::regclass,
      'public.activity_events'::regclass,
      'public.staff_invitations'::regclass,
      'public.garage_customers'::regclass,
      'public.customer_claims'::regclass,
      'public.membership_capability_grants'::regclass
    ) and relrowsecurity
    order by relname
  $$,
  $$values
    ('activity_events'::text),
    ('customer_claims'::text),
    ('garage_customers'::text),
    ('garage_memberships'::text),
    ('garages'::text),
    ('membership_capability_grants'::text),
    ('profiles'::text),
    ('staff_invitations'::text)
  $$,
  'every Slice 1 browser table has RLS enabled'
);

select ok(not has_table_privilege('anon', 'public.profiles', 'select'), 'anon cannot read profiles');
select ok(not has_table_privilege('anon', 'public.garages', 'select'), 'anon cannot read garages');
select ok(not has_table_privilege('anon', 'public.garage_memberships', 'select'), 'anon cannot read memberships');
select ok(not has_table_privilege('anon', 'public.activity_events', 'select'), 'anon cannot read audit events');
select ok(not has_table_privilege('anon', 'public.staff_invitations', 'select'), 'anon cannot read staff invitations');
select ok(not has_table_privilege('anon', 'public.garage_customers', 'select'), 'anon cannot read customer records');
select ok(not has_table_privilege('anon', 'public.membership_capability_grants', 'select'), 'anon cannot read capability history');

select * from finish();
rollback;
