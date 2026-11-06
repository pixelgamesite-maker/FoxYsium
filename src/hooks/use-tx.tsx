import { useState } from "react";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { explorerTx, elysium } from "@/lib/wagmi";

/**
 * Write a contract call, wait for the receipt, toast the outcome and refresh
 * every wagmi read. Returns `run(label, params)` and the label in flight.
 */
export function useTx() {
  const config = useConfig();
  const qc = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const [pending, setPending] = useState<string | null>(null);

  async function run(label: string, params: Parameters<typeof writeContractAsync>[0]) {
    setPending(label);
    try {
      const hash = await writeContractAsync({ ...params, chainId: elysium.id } as Parameters<typeof writeContractAsync>[0]);
      toast({ title: `${label}: submitted`, description: "Waiting for Elysium to confirm…" });
      const r = await waitForTransactionReceipt(config, { hash, chainId: elysium.id });
      if (r.status !== "success") throw new Error("The transaction reverted.");
      toast({
        title: `${label}: done`,
        description: (
          <a className="underline" href={explorerTx(hash)} target="_blank" rel="noreferrer">
            View on explorer
          </a>
        ),
      });
      await qc.invalidateQueries();
      return hash;
    } catch (e) {
      const msg = e instanceof Error ? (e as { shortMessage?: string }).shortMessage ?? e.message : String(e);
      toast({
        variant: "destructive",
        title: `${label} didn't go through`,
        description: /reject|denied/i.test(msg) ? "You rejected it in your wallet." : msg.split("\n")[0],
      });
      return null;
    } finally {
      setPending(null);
    }
  }

  return { run, pending };
}
