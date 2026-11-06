-- ═══════════════════════════════════════════════════════════════════
-- FoxYsium, initial schema
-- Auth: Supabase "Sign in with Web3" (Ethereum / EIP-4361).
-- Every client write is keyed to the signed-in wallet via current_wallet().
-- Market stats, reputation and activity are written only by the indexer
-- (service role), clients can read them but never write them.
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Helpers ─────────────────────────────────────────────────────────

-- Lower-cased 0x address of the signed-in Web3 user, or null.
-- Checks the JWT metadata first, then the auth.identities row, so it keeps
-- working whichever field GoTrue puts the address in.
create or replace function public.current_wallet()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  with c as (
    select lower(coalesce(
      nullif(auth.jwt() -> 'user_metadata' ->> 'address', ''),
      nullif(split_part(auth.jwt() -> 'user_metadata' ->> 'sub', ':', 3), ''),
      (
        select coalesce(nullif(i.identity_data ->> 'address', ''), split_part(i.provider_id, ':', 3))
        from auth.identities i
        where i.user_id = auth.uid() and i.provider = 'web3'
        limit 1
      )
    )) as w
  )
  select case when w ~ '^0x[0-9a-f]{40}$' then w end from c
$$;

revoke all on function public.current_wallet() from public;
grant execute on function public.current_wallet() to anon, authenticated;

-- True when the statement comes from a browser client (PostgREST anon/authenticated).
create or replace function public.is_client()
returns boolean
language sql
stable
as $$ select current_user in ('anon', 'authenticated') $$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ── Allowlist ───────────────────────────────────────────────────────
create table public.allowlist_entries (
  id          uuid primary key default gen_random_uuid(),
  wallet      text not null unique default public.current_wallet()
              check (wallet ~ '^0x[0-9a-f]{40}$'),
  x_handle    text check (x_handle ~ '^[A-Za-z0-9_]{1,15}$'),
  class_pref  text check (class_pref in ('Sovereign','Oracle','Alchemist','Merchant','Guardian')),
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  phase       text not null default 'allowlist',
  created_at  timestamptz not null default now()
);

alter table public.allowlist_entries enable row level security;

create policy "read own allowlist entry" on public.allowlist_entries
  for select to authenticated using (wallet = public.current_wallet());

create policy "join allowlist as yourself" on public.allowlist_entries
  for insert to authenticated
  with check (wallet = public.current_wallet() and status = 'pending' and phase = 'allowlist');

-- Public headcount without exposing addresses.
create or replace function public.allowlist_count()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$ select count(*) from public.allowlist_entries $$;

grant execute on function public.allowlist_count() to anon, authenticated;

-- ── Foundry launches ────────────────────────────────────────────────
create table public.foundry_launches (
  id               uuid primary key default gen_random_uuid(),
  creator_wallet   text not null default public.current_wallet()
                   check (creator_wallet ~ '^0x[0-9a-f]{40}$'),
  name             text not null check (char_length(name) between 2 and 32),
  ticker           text not null check (ticker ~ '^[A-Z0-9]{2,10}$'),
  description      text check (char_length(description) <= 400),
  image_url        text,
  total_supply     numeric(38,0) not null check (total_supply > 0 and total_supply <= 100000000000),
  creator_fee_bps  integer not null default 100 check (creator_fee_bps between 0 and 300),
  reward_mode      text not null default 'hype' check (reward_mode in ('hype','fox','none')),
  linked_fox_id    integer check (linked_fox_id between 1 and 2626),
  website          text check (website ~ '^https://'),
  x_url            text check (x_url ~ '^https://'),
  status           text not null default 'review' check (status in ('review','live','rejected')),
  review_note      text,
  token_address    text check (token_address ~ '^0x[0-9a-fA-F]{40}$'),
  -- written by the indexer only
  price_usd        numeric,
  market_cap_usd   numeric,
  liquidity_usd    numeric,
  volume_24h_usd   numeric,
  change_24h_pct   numeric,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index foundry_launches_active_ticker on public.foundry_launches (ticker) where status in ('review','live');
create index foundry_launches_live_created on public.foundry_launches (created_at desc) where status = 'live';
create index foundry_launches_creator on public.foundry_launches (creator_wallet);

alter table public.foundry_launches enable row level security;

create policy "anyone reads live launches; creators read their own" on public.foundry_launches
  for select to anon, authenticated
  using (status = 'live' or creator_wallet = public.current_wallet());

create policy "creators submit as themselves" on public.foundry_launches
  for insert to authenticated
  with check (creator_wallet = public.current_wallet());

-- Clients can't fast-track their own launch or fake market numbers.
create or replace function public.foundry_launch_guard()
returns trigger
language plpgsql
as $$
begin
  if public.is_client() then
    new.creator_wallet := public.current_wallet();
    new.status := 'review';
    new.review_note := null;
    new.token_address := null;
    new.price_usd := null;
    new.market_cap_usd := null;
    new.liquidity_usd := null;
    new.volume_24h_usd := null;
    new.change_24h_pct := null;
  end if;
  return new;
end $$;

create trigger foundry_launch_guard before insert on public.foundry_launches
  for each row execute function public.foundry_launch_guard();
create trigger foundry_launch_touch before update on public.foundry_launches
  for each row execute function public.touch_updated_at();

-- ── Agent configs ───────────────────────────────────────────────────
create table public.agent_configs (
  id                uuid primary key default gen_random_uuid(),
  fox_id            integer not null check (fox_id between 1 and 2626),
  owner_wallet      text not null default public.current_wallet()
                    check (owner_wallet ~ '^0x[0-9a-f]{40}$'),
  template          text not null check (template in ('trader','researcher','merchant','liquidity','treasurer','builder')),
  status            text not null default 'draft' check (status in ('draft','paused','active')),
  per_tx_limit_usd  numeric not null default 10 check (per_tx_limit_usd between 0 and 10000),
  daily_budget_usd  numeric not null default 50 check (daily_budget_usd between 0 and 50000),
  permissions       text[] not null default '{}'
                    check (permissions <@ array['claim','sweep','swap','liquidity','market','foundry','transfer','approve']),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (fox_id, owner_wallet),
  check (daily_budget_usd >= per_tx_limit_usd)
);

alter table public.agent_configs enable row level security;

create policy "owners manage their agents" on public.agent_configs
  for all to authenticated
  using (owner_wallet = public.current_wallet())
  with check (owner_wallet = public.current_wallet());

-- Configs are drafts until the on-chain execution policy is live. Ownership of
-- the Fox itself is enforced on-chain by FoxExecutionPolicy, not here.
create or replace function public.agent_config_guard()
returns trigger
language plpgsql
as $$
begin
  if public.is_client() then
    new.owner_wallet := public.current_wallet();
    if new.status = 'active' then
      raise exception 'Agents can''t be activated until execution goes live';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger agent_config_guard before insert or update on public.agent_configs
  for each row execute function public.agent_config_guard();

-- ── Reputation + activity (indexer-written, public read) ────────────
create table public.fox_reputation (
  fox_id        integer primary key check (fox_id between 1 and 2626),
  owner_wallet  text,
  fox_class     text check (fox_class in ('Sovereign','Oracle','Alchemist','Merchant','Guardian')),
  points        integer not null default 0 check (points >= 0),
  updated_at    timestamptz not null default now()
);
create index fox_reputation_points on public.fox_reputation (points desc);

alter table public.fox_reputation enable row level security;
create policy "reputation is public" on public.fox_reputation for select to anon, authenticated using (true);

create table public.activity (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,
  title       text not null,
  fox_id      integer check (fox_id between 1 and 2626),
  wallet      text,
  tx_hash     text,
  created_at  timestamptz not null default now()
);
create index activity_created on public.activity (created_at desc);
create index activity_fox on public.activity (fox_id, created_at desc);

alter table public.activity enable row level security;
create policy "activity is public" on public.activity for select to anon, authenticated using (true);

-- ── Storage: launch art ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('launch-art', 'launch-art', true, 2097152, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

create policy "signed-in users upload launch art to their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'launch-art' and (storage.foldername(name))[1] = auth.uid()::text);
