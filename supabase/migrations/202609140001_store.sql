-- Run once in your Supabase project's SQL Editor. Safe to run again.
begin;

create table if not exists public.aalan_orders (
  session_id text primary key,
  amount integer not null check (amount >= 0),
  currency text not null,
  email text,
  items jsonb not null,
  shipping jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.aalan_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.aalan_orders enable row level security;
alter table public.aalan_subscribers enable row level security;

-- Customers access these records through the authenticated server logic only.
revoke all on table public.aalan_orders from public, anon, authenticated;
revoke all on table public.aalan_subscribers from public, anon, authenticated;
grant select, insert on table public.aalan_orders to service_role;
grant select, insert on table public.aalan_subscribers to service_role;

commit;
