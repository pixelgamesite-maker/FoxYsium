# Contract interfaces the site expects

The frontend is wired to these functions (ABIs in `src/lib/contracts.ts`). Each
page checks for a configured address and shows a "not live yet" state until it's
set, so contracts can ship one at a time. Set the address in Railway as the
matching `VITE_*` variable and redeploy.

| Contract | Env var | Must expose |
| --- | --- | --- |
| Genesis (deployed by OpenSea Studio) | `VITE_GENESIS_ADDRESS` + `VITE_GENESIS_DEPLOY_BLOCK` | Nothing custom, the site only uses `balanceOf`, `ownerOf`, `totalSupply` and `Transfer` events, which OpenSea's drop contract has. Set max supply to 2,626 in Studio. |
| `FoxToken` (ERC-20) | `VITE_FOX_TOKEN_ADDRESS` | standard ERC-20 (`balanceOf`, `allowance`, `approve`, `decimals`, `totalSupply`) |
| `FoxStaking` | `VITE_STAKING_ADDRESS` | `totalStaked()`, `stakerCount()`, `stakedOf(addr)`, `earned(addr)`, `unlockedOf(addr)`, `stake(amount)`, `withdraw(amount)`, `claim()` |
| `FoxLocker` | `VITE_LOCKER_ADDRESS` | `totalLocked()`, `locksOf(addr) → (id, amount, unlockAt, withdrawn)[]`, `lock(amount, unlockAt) → id`, `withdraw(id)`, no owner, no early exit |
| ERC-6551 Registry | `VITE_VAULT_REGISTRY_ADDRESS` | `account(...)`, `createAccount(...)`, defaults to canonical `0x000000006551c19487814612e58FE06813775758` |
| FoxVault implementation | `VITE_VAULT_IMPLEMENTATION_ADDRESS` | ERC-6551 account implementation (salt `0x00…00`) |

## Still to design

- `FoxExecutionPolicy`: per-vault allow-lists, per-tx and daily limits,
  revoke + global pause. Agents stay in draft until this is deployed and
  audited (flip `POLICY_LIVE` in `src/pages/agents.tsx`).
- `FoxFoundry` factory and `FoxRevenueRouter` / `FoxRewards`.
- `FoxBusiness` for multi-Fox businesses.

Before any of these hold real funds: tests, an external audit, and a
testnet run on Robinhood Chain testnet (chain 46630).

## Indexer (service role)

These Supabase tables are read-only for browsers and need a backend job
(Supabase Edge Function on a cron, or a small Railway worker) holding the
service-role key:

- `foundry_launches`: set `status` to `live`/`rejected`, `token_address`, and
  refresh `price_usd`, `market_cap_usd`, `liquidity_usd`, `volume_24h_usd`,
  `change_24h_pct`.
- `fox_reputation`: `owner_wallet`, `fox_class`, `points` per Fox.
- `activity`: feed rows (`kind`, `title`, `fox_id`, `wallet`, `tx_hash`).
- `allowlist_entries.status`: approve or reject.

## Allowlist → OpenSea

OpenSea's drop allowlist stage takes a CSV of wallet addresses. Export the
approved wallets from the Supabase SQL editor and download the result as CSV:

```sql
select wallet from public.allowlist_entries where status = 'approved' order by created_at;
```

Approve entries first with
`update public.allowlist_entries set status = 'approved' where status = 'pending';`
(or selectively).
