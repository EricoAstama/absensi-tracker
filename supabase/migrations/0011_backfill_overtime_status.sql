update public.attendances
set slot_4_status = 'overtime'
where slot_4_status = 'on_time'
  and slot_4_time is not null
  and (extract(hour from slot_4_time at time zone 'Asia/Jakarta') * 60
    + extract(minute from slot_4_time at time zone 'Asia/Jakarta')) > 990;
