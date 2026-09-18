-- Run in the Supabase SQL Editor, or apply with supabase db push.
begin;

create table if not exists public.aalan_carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb
    check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 40)
);

alter table public.aalan_carts enable row level security;
revoke all on public.aalan_carts from public, anon, authenticated;
grant select, insert, update on public.aalan_carts to authenticated;

drop policy if exists "Read own cart" on public.aalan_carts;
create policy "Read own cart" on public.aalan_carts for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Create own cart" on public.aalan_carts;
create policy "Create own cart" on public.aalan_carts for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Update own cart" on public.aalan_carts;
create policy "Update own cart" on public.aalan_carts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

commit;
