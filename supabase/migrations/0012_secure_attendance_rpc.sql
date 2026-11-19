drop policy if exists "attendance_create" on public.attendances;
drop policy if exists "attendance_update" on public.attendances;
drop policy if exists "staff_create_attendance" on public.attendances;
drop policy if exists "staff_update_attendance" on public.attendances;
create policy "staff_create_attendance" on public.attendances for insert to authenticated with check (public.is_staff());
create policy "staff_update_attendance" on public.attendances for update to authenticated using (public.is_staff()) with check (public.is_staff());

create or replace function public.record_attendance(p_latitude double precision, p_longitude double precision, p_photo_url text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := clock_timestamp();
  v_date date := (v_now at time zone 'Asia/Jakarta')::date;
  v_minutes integer := extract(hour from v_now at time zone 'Asia/Jakarta')::integer * 60
    + extract(minute from v_now at time zone 'Asia/Jakarta')::integer;
  v_slot integer;
  v_status public.slot_status;
  v_recorded timestamptz;
begin
  if v_user is null or public.current_user_role() is distinct from 'employee'::public.user_role then
    raise exception 'attendance_employee_only' using errcode = '42501';
  end if;
  if p_latitude is null or p_longitude is null or p_latitude not between -90 and 90
    or p_longitude not between -180 and 180 then
    raise exception 'invalid_coordinates' using errcode = '22023';
  end if;
  if p_photo_url is null or p_photo_url !~
    ('^https://res[.]cloudinary[.]com/[^/]+/image/upload/(v[0-9]+/)?absensi/' || v_user::text || '/[^/?#]+$') then
    raise exception 'invalid_photo_url' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.company_locations c
    where c.is_active
      and 2 * 6371000 * asin(sqrt(least(1::double precision,
        power(sin(radians(p_latitude - c.latitude) / 2), 2)
        + cos(radians(c.latitude)) * cos(radians(p_latitude))
        * power(sin(radians(p_longitude - c.longitude) / 2), 2)
      ))) <= c.radius_meters
  ) then
    raise exception 'outside_geofence' using errcode = '22023';
  end if;

  v_slot := case when v_minutes <= 570 then 1 when v_minutes <= 735 then 2
    when v_minutes <= 870 then 3 else 4 end;
  v_status := case
    when v_slot = 1 then case when v_minutes <= 450 then 'on_time' else 'late' end
    when v_slot = 2 then case when v_minutes < 720 then 'early_out' else 'on_time' end
    when v_slot = 3 then case when v_minutes <= 780 then 'on_time' else 'late' end
    else case when v_minutes < 990 then 'early_out' when v_minutes > 990 then 'overtime' else 'on_time' end
  end::public.slot_status;

  insert into public.attendances (user_id, date) values (v_user, v_date)
    on conflict (user_id, date) do nothing;
  execute format(
    'update public.attendances set slot_%1$s_time = $1, slot_%1$s_photo_url = $2, slot_%1$s_lat = $3, slot_%1$s_lng = $4, slot_%1$s_status = $5, updated_at = $1 where user_id = $6 and date = $7 and slot_%1$s_time is null returning slot_%1$s_time',
    v_slot
  ) into v_recorded using v_now, p_photo_url, p_latitude, p_longitude, v_status, v_user, v_date;
  if v_recorded is null then
    raise exception 'attendance_slot_already_recorded' using errcode = '23514';
  end if;
  return jsonb_build_object('slot', v_slot, 'time', v_recorded);
end;
$$;

revoke all on function public.record_attendance(double precision, double precision, text) from public;
grant execute on function public.record_attendance(double precision, double precision, text) to authenticated;
