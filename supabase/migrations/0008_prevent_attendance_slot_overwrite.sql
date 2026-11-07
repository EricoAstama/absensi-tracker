create or replace function public.prevent_employee_attendance_slot_overwrite()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() is distinct from 'employee'::public.user_role then
    return new;
  end if;

  if new.user_id is distinct from old.user_id or new.date is distinct from old.date then
    raise exception using
      errcode = '23514',
      message = 'attendance_identity_is_immutable';
  end if;

  if old.slot_1_time is not null and (
    new.slot_1_time is distinct from old.slot_1_time or
    new.slot_1_photo_url is distinct from old.slot_1_photo_url or
    new.slot_1_lat is distinct from old.slot_1_lat or
    new.slot_1_lng is distinct from old.slot_1_lng or
    new.slot_1_status is distinct from old.slot_1_status
  ) then
    raise exception using errcode = '23514', message = 'attendance_slot_already_recorded', detail = 'slot_1';
  end if;

  if old.slot_2_time is not null and (
    new.slot_2_time is distinct from old.slot_2_time or
    new.slot_2_photo_url is distinct from old.slot_2_photo_url or
    new.slot_2_lat is distinct from old.slot_2_lat or
    new.slot_2_lng is distinct from old.slot_2_lng or
    new.slot_2_status is distinct from old.slot_2_status
  ) then
    raise exception using errcode = '23514', message = 'attendance_slot_already_recorded', detail = 'slot_2';
  end if;

  if old.slot_3_time is not null and (
    new.slot_3_time is distinct from old.slot_3_time or
    new.slot_3_photo_url is distinct from old.slot_3_photo_url or
    new.slot_3_lat is distinct from old.slot_3_lat or
    new.slot_3_lng is distinct from old.slot_3_lng or
    new.slot_3_status is distinct from old.slot_3_status
  ) then
    raise exception using errcode = '23514', message = 'attendance_slot_already_recorded', detail = 'slot_3';
  end if;

  if old.slot_4_time is not null and (
    new.slot_4_time is distinct from old.slot_4_time or
    new.slot_4_photo_url is distinct from old.slot_4_photo_url or
    new.slot_4_lat is distinct from old.slot_4_lat or
    new.slot_4_lng is distinct from old.slot_4_lng or
    new.slot_4_status is distinct from old.slot_4_status
  ) then
    raise exception using errcode = '23514', message = 'attendance_slot_already_recorded', detail = 'slot_4';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_employee_attendance_slot_overwrite on public.attendances;
create trigger prevent_employee_attendance_slot_overwrite
before update on public.attendances
for each row execute function public.prevent_employee_attendance_slot_overwrite();

revoke all on function public.prevent_employee_attendance_slot_overwrite() from public;
