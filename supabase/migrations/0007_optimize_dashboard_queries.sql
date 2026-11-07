create index if not exists attendances_date_idx
  on public.attendances (date);

create index if not exists profiles_role_name_idx
  on public.profiles (role, full_name);

create index if not exists leave_requests_user_created_idx
  on public.leave_requests (user_id, created_at desc);

create index if not exists leave_requests_created_idx
  on public.leave_requests (created_at desc);

create index if not exists leave_requests_pending_idx
  on public.leave_requests (created_at desc)
  where status = 'pending';

do $$
begin
  if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'attendances') then
    alter publication supabase_realtime drop table public.attendances;
  end if;
  if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leave_requests') then
    alter publication supabase_realtime drop table public.leave_requests;
  end if;
  if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles') then
    alter publication supabase_realtime drop table public.profiles;
  end if;
end $$;
