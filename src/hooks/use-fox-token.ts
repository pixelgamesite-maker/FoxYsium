import { useReadContracts } from "wagmi";
import { maxUint256, type Address } from "viem";
import { CONTRACTS, foxTokenAbi } from "@/lib/contracts";
import { robinhood } from "@/lib/wagmi";
import { useTx } from "@/hooks/use-tx";

/** $FOX balance + allowance for a spender, and an approve helper. */
export function useFoxToken(owner: Address | null, spender: Address | null) {
  const fox = CONTRACTS.fox;
  const enabled = !!fox && !!owner;
  const { data } = useReadContracts({
    contracts: [
      { address: fox ?? undefined, abi: foxTokenAbi, functionName: "balanceOf", args: owner ? [owner] : undefined, chainId: robinhood.id },
      { address: fox ?? undefined, abi: foxTokenAbi, functionName: "allowance", args: owner && spender ? [owner, spender] : undefined, chainId: robinhood.id },
      { address: fox ?? undefined, abi: foxTokenAbi, functionName: "decimals", chainId: robinhood.id },
    ],
    query: { enabled, refetchInterval: 20_000 },
  });
  const balance = data?.[0]?.status === "success" ? (data[0].result as bigint) : undefined;
  const allowance = data?.[1]?.status === "success" ? (data[1].result as bigint) : 0n;
  const decimals = data?.[2]?.status === "success" ? Number(data[2].result) : 18;
  const { run, pending } = useTx();

  const approve = () =>
    run("Approve $FOX", { address: fox!, abi: foxTokenAbi, functionName: "approve", args: [spender!, maxUint256] });

  return { balance, allowance, decimals, approve, approving: pending === "Approve $FOX" };
}
