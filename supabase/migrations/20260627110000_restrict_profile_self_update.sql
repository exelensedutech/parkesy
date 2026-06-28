-- The "profiles update own" RLS policy only restricts WHICH ROW a user can
-- update (their own), not WHICH COLUMNS. Combined with the blanket UPDATE
-- grant from the earlier grants migration, any authenticated user could call
-- the REST API directly (bypassing the app's UI entirely) with
-- update({ role: 'admin' }) or update({ business_id: '<another business>' })
-- on their own row and self-promote to admin, or hop into another tenant's
-- data — since get_my_business_id()/get_my_role() just read whatever is
-- currently in that row.
--
-- RLS operates at the row level and can't restrict individual columns, so
-- the fix uses Postgres's native column-level GRANT instead: a user may only
-- ever set the columns they're actually meant to edit about themselves.
-- role and business_id are deliberately excluded — those only ever change
-- via complete_signup/team invite redemption (SECURITY DEFINER, runs with
-- elevated privilege, unaffected by this grant).
revoke update on profiles from authenticated;
grant update (name, address, language) on profiles to authenticated;
