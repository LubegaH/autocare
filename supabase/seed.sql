insert into public.system_status (id, service, status, message)
values (
  1,
  'AutoCare foundation',
  'ready',
  'The page, action, and database table are connected.'
)
on conflict (id) do update
set
  service = excluded.service,
  status = excluded.status,
  message = excluded.message,
  updated_at = now();
