-- Kept separate because PostgreSQL requires a commit before a new enum value is used.
alter type public.user_role add value if not exists 'superadmin';
