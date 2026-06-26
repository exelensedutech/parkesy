-- The initial migration enabled RLS and wrote policies on every table, but
-- never granted the underlying table-level privileges that PostgREST (the
-- Data API) checks first. Without these grants, every request gets a 403
-- before RLS is even evaluated — this is what "Automatically expose new
-- tables" would normally have done for us; we turned that off deliberately
-- and need to do this part by hand instead.
--
-- RLS policies remain the real fine-grained gate: granting broadly here is
-- safe, because tables like `businesses` only have SELECT/UPDATE policies
-- (no INSERT/DELETE policy exists), so those operations stay blocked
-- regardless of this grant. `ticket_counters` is deliberately left with no
-- grant at all — it's internal bookkeeping, touched only via the
-- SECURITY DEFINER next_ticket_code() function.

grant select, insert, update, delete on businesses to authenticated;
grant select, insert, update, delete on profiles to authenticated;
grant select, insert, update, delete on vehicle_types to authenticated;
grant select, insert, update, delete on parking_sessions to authenticated;
grant select, insert, update, delete on expenses to authenticated;
grant select, insert, update, delete on members to authenticated;
grant select, insert, update, delete on member_payments to authenticated;
grant select, insert, update, delete on team_invites to authenticated;
