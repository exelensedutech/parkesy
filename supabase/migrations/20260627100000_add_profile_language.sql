-- Language is a per-employee preference (an attendant might want Tamil
-- while the owner uses English for reports), so it lives on profiles, not
-- businesses.
alter table profiles add column language text not null default 'en' check (language in ('en', 'ta'));
