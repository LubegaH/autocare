-- Rollback before production data: drop table public.system_status;
-- This table is synthetic and contains no tenant or customer records.

create table public.system_status (
  id smallint primary key default 1 constraint system_status_single_row check (id = 1),
  service text not null constraint system_status_service_not_blank check (length(btrim(service)) > 0),
  status text not null constraint system_status_ready_only check (status = 'ready'),
  message text not null constraint system_status_message_not_blank check (length(btrim(message)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.system_status is
  'Non-sensitive walking-skeleton status. Product and tenant data must not be added here.';

alter table public.system_status enable row level security;

revoke all on table public.system_status from anon, authenticated;
grant select on table public.system_status to anon, authenticated;

create policy "Anyone can read the synthetic system status"
on public.system_status
for select
to anon, authenticated
using (true);
