-- Minimum schema for guest/user feature usage tracking. Everything else
-- (accounts, sessions, passwords) is handled entirely by Supabase Auth's
-- built-in `auth.users` — this is the one app-owned table.

create table if not exists public.feature_usage (
  id uuid primary key default gen_random_uuid(),
  -- 'guest' rows are keyed by an anonymous cookie id (see guestId.middleware.ts);
  -- 'user' rows are keyed by the Supabase auth.users.id of a signed-in user.
  -- No FK to auth.users: guest ids aren't real users, so both share this
  -- one unconstrained column instead of needing two nullable FK columns.
  owner_type text not null check (owner_type in ('guest', 'user')),
  owner_id text not null,
  feature text not null,
  usage_count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (owner_type, owner_id, feature)
);

create index if not exists feature_usage_owner_idx
  on public.feature_usage (owner_type, owner_id);

-- All access goes through the backend's service-role key, which bypasses
-- RLS by design — enabling RLS with no policies for anon/authenticated
-- means the anon/publishable key (the only Supabase credential the
-- frontend ever holds) can't read or write this table directly, even if
-- someone tried to call Supabase straight from the browser.
alter table public.feature_usage enable row level security;

-- Atomic "insert or +1" — used instead of a read-then-write from the
-- backend so concurrent requests for the same guest/feature can't race
-- each other into under-counting.
create or replace function public.increment_feature_usage(
  p_owner_type text,
  p_owner_id text,
  p_feature text
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.feature_usage (owner_type, owner_id, feature, usage_count)
  values (p_owner_type, p_owner_id, p_feature, 1)
  on conflict (owner_type, owner_id, feature)
  do update set usage_count = feature_usage.usage_count + 1, updated_at = now()
  returning usage_count into v_count;

  return v_count;
end;
$$;

revoke all on function public.increment_feature_usage(text, text, text) from public;
