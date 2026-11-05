create or replace function public.current_user_role() returns public.user_role language sql stable security definer set search_path = '' as $$ select role from public.profiles where id = auth.uid() $$;
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = '' as $$ select coalesce(public.current_user_role() in ('hc_admin', 'superadmin'), false) $$;
create or replace function public.is_superadmin() returns boolean language sql stable security definer set search_path = '' as $$ select coalesce(public.current_user_role() = 'superadmin', false) $$;
create or replace function public.is_hc_admin() returns boolean language sql stable security definer set search_path = '' as $$ select public.is_staff() $$;

drop policy if exists "profiles_self_read" on public.profiles; drop policy if exists "admins_manage_profiles" on public.profiles;
drop policy if exists "locations_authenticated_read" on public.company_locations; drop policy if exists "admins_manage_locations" on public.company_locations;
drop policy if exists "employees_read_own_attendance" on public.attendances; drop policy if exists "employees_insert/update own attendance" on public.attendances; drop policy if exists "employees_insert_own_attendance" on public.attendances; drop policy if exists "employees_update_own_attendance" on public.attendances;
drop policy if exists "employees_read_own_leave" on public.leave_requests; drop policy if exists "employees_create_own_leave" on public.leave_requests; drop policy if exists "admins_manage_leave" on public.leave_requests;

create policy "profiles_read" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "superadmin_create_profiles" on public.profiles for insert with check (public.is_superadmin());
create policy "superadmin_update_profiles" on public.profiles for update using (public.is_superadmin()) with check (public.is_superadmin());
create policy "superadmin_delete_profiles" on public.profiles for delete using (public.is_superadmin());
create policy "locations_read" on public.company_locations for select to authenticated using (true);
create policy "staff_create_locations" on public.company_locations for insert with check (public.is_staff());
create policy "staff_update_locations" on public.company_locations for update using (public.is_staff()) with check (public.is_staff());
create policy "superadmin_delete_locations" on public.company_locations for delete using (public.is_superadmin());
create policy "attendance_read" on public.attendances for select using (user_id = auth.uid() or public.is_staff());
create policy "attendance_create" on public.attendances for insert with check (user_id = auth.uid() or public.is_staff());
create policy "attendance_update" on public.attendances for update using (user_id = auth.uid() or public.is_staff()) with check (user_id = auth.uid() or public.is_staff());
create policy "superadmin_delete_attendance" on public.attendances for delete using (public.is_superadmin());
create policy "leave_read" on public.leave_requests for select using (user_id = auth.uid() or public.is_staff());
create policy "employee_create_leave" on public.leave_requests for insert with check (user_id = auth.uid() and status = 'pending');
create policy "staff_update_leave" on public.leave_requests for update using (public.is_staff()) with check (public.is_staff());
create policy "superadmin_delete_leave" on public.leave_requests for delete using (public.is_superadmin());

revoke all on function public.current_user_role() from public; revoke all on function public.is_staff() from public; revoke all on function public.is_superadmin() from public;
grant execute on function public.current_user_role() to authenticated; grant execute on function public.is_staff() to authenticated; grant execute on function public.is_superadmin() to authenticated;
