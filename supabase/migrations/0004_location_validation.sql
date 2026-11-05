alter table public.company_locations add constraint company_locations_name_length check (char_length(trim(name)) between 2 and 80);
alter table public.company_locations add constraint company_locations_latitude_range check (latitude between -90 and 90);
alter table public.company_locations add constraint company_locations_longitude_range check (longitude between -180 and 180);
alter table public.company_locations drop constraint if exists company_locations_radius_meters_check;
alter table public.company_locations add constraint company_locations_radius_range check (radius_meters between 10 and 5000);

drop policy if exists "staff_create_locations" on public.company_locations;
drop policy if exists "staff_update_locations" on public.company_locations;
create policy "superadmin_create_locations" on public.company_locations for insert with check (public.is_superadmin());
create policy "superadmin_update_locations" on public.company_locations for update using (public.is_superadmin()) with check (public.is_superadmin());
