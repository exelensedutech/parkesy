-- Private bucket for vehicle/ID-proof photos. Private (not public) because
-- ID-proof photos are sensitive personal documents — access is always via a
-- short-lived signed URL generated for an authenticated business member,
-- never a permanent public link.
--
-- Path convention: <business_id>/<random>.jpg — the first path segment is
-- the business id, so access can be scoped exactly like every other table
-- (via get_my_business_id()), instead of needing a separate metadata table.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Business members can upload their own photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = get_my_business_id()::text
);

create policy "Business members can view their own photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = get_my_business_id()::text
);
