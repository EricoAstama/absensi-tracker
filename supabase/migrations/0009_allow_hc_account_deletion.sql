-- Keep leave history when the HC Admin who reviewed it is deleted.
alter table public.leave_requests
  drop constraint if exists leave_requests_approved_by_fkey;

alter table public.leave_requests
  add constraint leave_requests_approved_by_fkey
  foreign key (approved_by)
  references public.profiles(id)
  on delete set null;
