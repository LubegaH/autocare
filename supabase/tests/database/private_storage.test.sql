begin;

create extension if not exists pgtap with schema extensions;

select plan(5);

select is(
  (select public from storage.buckets where id = 'garage-private'),
  false,
  'garage-private bucket is not public'
);
select is(
  (select file_size_limit from storage.buckets where id = 'garage-private'),
  10485760::bigint,
  'private files have a conservative ten-megabyte limit'
);
select results_eq(
  $$select unnest(allowed_mime_types) from storage.buckets where id = 'garage-private' order by 1$$,
  $$values ('application/pdf'::text), ('image/jpeg'::text), ('image/png'::text)$$,
  'only images and PDF are admitted by the bucket baseline'
);
select is(
  (
    select count(*) from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (qual like '%garage-private%' or with_check like '%garage-private%')
  ),
  0::bigint,
  'no browser object policy exists before an attachment workflow is reviewed'
);
select is(
  (select count(*) from storage.buckets where id = 'garage-private'),
  1::bigint,
  'the private bucket exists exactly once'
);

select * from finish();
rollback;
