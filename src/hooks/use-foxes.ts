import { useQuery } from "@tanstack/react-query";
import { useReadContract, useReadContracts, useBytecode, useBalance } from "wagmi";
import type { Address } from "viem";
import { CONTRACTS, genesisAbi, registryAbi, stakingAbi, lockerAbi, VAULT_SALT } from "@/lib/contracts";
import { elysium } from "@/lib/wagmi";
import { supabase, type Launch, type ReputationRow, type ActivityRow } from "@/lib/supabase";

/** Foxes held by a wallet (ERC-721 Enumerable). */
export function useOwnedFoxes(owner: Address | null) {
  const enabled = !!owner && !!CONTRACTS.genesis;
  const { data: bal, isLoading: balLoading } = useReadContract({
    address: CONTRACTS.genesis ?? undefined,
    abi: genesisAbi,
    functionName: "balanceOf",
    args: owner ? [owner] : undefined,
    chainId: elysium.id,
    query: { enabled },
  });
  const count = Math.min(Number(bal ?? 0n), 50);
  const { data, isLoading } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => ({
      address: CONTRACTS.genesis!,
      abi: genesisAbi,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [owner!, BigInt(i)] as const,
      chainId: elysium.id,
    })),
    query: { enabled: enabled && count > 0 },
  });
  const ids = (data ?? []).flatMap((r) => (r.status === "success" ? [Number(r.result as bigint)] : []));
  return { ids, balance: Number(bal ?? 0n), isLoading: balLoading || isLoading, live: !!CONTRACTS.genesis };
}

/** ERC-6551 vault address for a Fox, plus whether it's deployed and its HYPE balance. */
export function useFoxVault(tokenId: number | null) {
  const ready = tokenId !== null && !!CONTRACTS.genesis && !!CONTRACTS.vaultRegistry && !!CONTRACTS.vaultImplementation;
  const { data: vault } = useReadContract({
    address: CONTRACTS.vaultRegistry ?? undefined,
    abi: registryAbi,
    functionName: "account",
    args: ready
      ? [CONTRACTS.vaultImplementation!, VAULT_SALT, BigInt(elysium.id), CONTRACTS.genesis!, BigInt(tokenId!)]
      : undefined,
    chainId: elysium.id,
    query: { enabled: ready },
  });
  const { data: code } = useBytecode({ address: vault, chainId: elysium.id, query: { enabled: !!vault } });
  const { data: bal } = useBalance({ address: vault, chainId: elysium.id, query: { enabled: !!vault } });
  return { vault: vault ?? null, deployed: !!code && code !== "0x", hype: bal, configured: ready };
}

export function useFoxOwner(tokenId: number | null) {
  return useReadContract({
    address: CONTRACTS.genesis ?? undefined,
    abi: genesisAbi,
    functionName: "ownerOf",
    args: tokenId !== null ? [BigInt(tokenId)] : undefined,
    chainId: elysium.id,
    query: { enabled: tokenId !== null && !!CONTRACTS.genesis },
  });
}

/** Locked + staked FOX supply for the home page tiles. */
export function useEconomy() {
  const fox = CONTRACTS.fox;
  const { data } = useReadContracts({
    contracts: [
      { address: fox ?? undefined, abi: [{ type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] }] as const, functionName: "totalSupply", chainId: elysium.id },
      { address: CONTRACTS.staking ?? undefined, abi: stakingAbi, functionName: "totalStaked", chainId: elysium.id },
      { address: CONTRACTS.staking ?? undefined, abi: stakingAbi, functionName: "stakerCount", chainId: elysium.id },
      { address: CONTRACTS.locker ?? undefined, abi: lockerAbi, functionName: "totalLocked", chainId: elysium.id },
      { address: CONTRACTS.genesis ?? undefined, abi: genesisAbi, functionName: "totalSupply", chainId: elysium.id },
    ],
    query: { enabled: !!(fox || CONTRACTS.genesis), refetchInterval: 30_000 },
  });
  const pick = (i: number) => (data?.[i]?.status === "success" ? (data[i].result as bigint) : undefined);
  return {
    totalSupply: pick(0),
    totalStaked: pick(1),
    stakers: pick(2),
    totalLocked: pick(3),
    minted: pick(4),
    live: { fox: !!fox, staking: !!CONTRACTS.staking, locker: !!CONTRACTS.locker, genesis: !!CONTRACTS.genesis },
  };
}

// ── Supabase reads ─────────────────────────────────────────────────
export function useLaunches(limit = 24) {
  return useQuery({
    queryKey: ["launches", limit],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("foundry_launches")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Launch[];
    },
  });
}

export function useLaunch(id: string) {
  return useQuery({
    queryKey: ["launch", id],
    enabled: !!supabase && !!id,
    queryFn: async () => {
      const { data, error } = await supabase!.from("foundry_launches").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Launch | null;
    },
  });
}

export function useLeaderboard(limit = 100) {
  return useQuery({
    queryKey: ["leaderboard", limit],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!.from("fox_reputation").select("*").order("points", { ascending: false }).limit(limit);
      if (error) throw error;
      return (data ?? []) as ReputationRow[];
    },
  });
}

export function useReputation(foxId: number | null) {
  return useQuery({
    queryKey: ["rep", foxId],
    enabled: !!supabase && foxId !== null,
    queryFn: async () => {
      const { data } = await supabase!.from("fox_reputation").select("*").eq("fox_id", foxId!).maybeSingle();
      return (data as ReputationRow | null) ?? null;
    },
  });
}

export function useActivity(opts: { foxId?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["activity", opts.foxId ?? "all", opts.limit ?? 20],
    enabled: !!supabase,
    queryFn: async () => {
      let q = supabase!.from("activity").select("*").order("created_at", { ascending: false }).limit(opts.limit ?? 20);
      if (opts.foxId !== undefined) q = q.eq("fox_id", opts.foxId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ActivityRow[];
    },
  });
}

export function useAllowlistCount() {
  return useQuery({
    queryKey: ["allowlist-count"],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!.rpc("allowlist_count");
      if (error) throw error;
      return Number(data ?? 0);
    },
  });
}
