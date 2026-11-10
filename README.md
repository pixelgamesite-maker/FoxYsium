# FoxBank

2,626 Genesis Foxes on Robinhood Chain. Every Fox gets its own wallet (ERC-6551),
an optional AI operator with on-chain spending limits, and a share of ecosystem
revenue. This repo is the web app.

**Stack:** Vite + React 19 + TypeScript · Tailwind v4 · wagmi/viem · Supabase
(Postgres, Web3 wallet auth, storage) · Railway (Docker + Caddy).

## Run locally

```bash
cp .env.example .env    # fill in Supabase keys; contracts can stay blank
npm install
npm run dev             # http://localhost:8080
```

Without Supabase keys the site still renders; anything that reads or writes
data shows an empty state.

## Supabase setup

1. Create a project, then run `supabase/migrations/0001_init.sql` in the SQL editor
   (or `supabase db push` with the CLI).
2. **Authentication → Sign In / Providers → Web3 Wallet:** enable Ethereum.
3. **Authentication → URL Configuration:** set Site URL to your Railway domain and
   add `https://YOUR-DOMAIN/**` and `http://localhost:8080/**` to redirect URLs.
   Sign-in messages are checked against these.
4. Set Web3 sign-in rate limits (Auth → Rate limits); consider hCaptcha.
5. Copy the project URL and anon key into `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

What's stored, and who can write it:

| Table | Browser can | Written by |
| --- | --- | --- |
| `allowlist_entries` | insert/read its own row | user (wallet-signed) |
| `foundry_launches` | submit (forced to `review`), read live + own | user; indexer sets status + market data |
| `agent_configs` | full CRUD on own rows, never `active` | user |
| `fox_reputation`, `activity` | read | indexer (service role) |
| storage `launch-art` | upload to own folder, public read | user |

## Deploy on Railway

1. New project → Deploy from GitHub repo → pick this repo. `railway.json` tells
   Railway to build with the `Dockerfile` (Node build stage → Caddy serving `dist/`).
2. Add the variables from `.env.example` under **Variables**. They're baked in at
   build time, so **redeploy after changing any of them**.
3. Settings → Networking → Generate domain (or add your own). Then put that domain
   into Supabase's URL configuration (step 3 above).

## Network

Defaults to **Robinhood Chain mainnet** (chain `4663`, gas in ETH,
RPC `https://rpc.mainnet.chain.robinhood.com`, explorer
`https://robinhoodchain.blockscout.com`). To use testnet, set `VITE_CHAIN_ID=46630`
(the RPC and explorer switch automatically) and redeploy. The public RPC is
rate-limited; for production, put a dedicated provider URL in `VITE_RPC_URL`.

## Mint (OpenSea)

Genesis mints on OpenSea, which supports Robinhood Chain. Until the drop is
live, the site shows "Minting on OpenSea soon" until you set `VITE_OPENSEA_URL`. When the
drop is live, also set `VITE_GENESIS_ADDRESS` and `VITE_GENESIS_DEPLOY_BLOCK` so
the Console and Fox pages can read ownership. The allowlist exports to the CSV
OpenSea asks for, see [`docs/CONTRACTS.md`](docs/CONTRACTS.md#allowlist--opensea).

## FoxFoundry

Locked by default: the nav, home page and `/foundry` routes show a teaser.
Set `VITE_FOUNDRY_OPEN=true` and redeploy to open it.

## Contracts

The NFT contract comes from OpenSea. Staking, the locker, $FOX and the vault
implementation aren't deployed yet. Each page switches from "not live yet" to the real flow
as soon as its address variable is set. See [`docs/CONTRACTS.md`](docs/CONTRACTS.md)
for the interface each contract must expose and what the indexer needs to do.

## Where things live

```
src/
  pages/            one file per route (home, genesis, fox, foundry*, staking, locker, …)
  components/       HeroCarousel, LaunchCard, AllowlistForm, den.tsx (shared building blocks)
    layout/         Shell, Topbar, MobileNav, nav.ts
    wallet/         ConnectWalletDialog, ConnectGate
    ui/             Radix primitives (shadcn), restyled
  hooks/            use-wallet, use-den-auth (Supabase SIWE), use-foxes, use-tx, use-fox-token
  lib/              foxbank-constants (edit copy/numbers here), wagmi, contracts, supabase
public/             art, see public/README.md
supabase/migrations SQL schema + RLS
```

Brand name, supply, classes, rarity, revenue split and roadmap all live in
`src/lib/foxbank-constants.ts`.
