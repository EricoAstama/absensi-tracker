alter table public.leave_requests
  add constraint leave_requests_reason_length
  check (char_length(trim(reason)) between 10 and 500)
  not valid;

alter table public.leave_requests
  add constraint leave_requests_attachment_required
  check (attachment_url is not null and char_length(trim(attachment_url)) > 0)
  not valid;
