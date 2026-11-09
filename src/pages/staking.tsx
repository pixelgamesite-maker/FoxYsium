import { useState } from "react";
import { useReadContracts } from "wagmi";
import { parseUnits } from "viem";
import { Loader2 } from "lucide-react";
import { PageHeader, SectionTitle, StatTile, NotLive, ButtonLink } from "@/components/den";
import { ConnectGate } from "@/components/wallet/ConnectGate";
import AmountInput from "@/components/AmountInput";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CONTRACTS, stakingAbi } from "@/lib/contracts";
import { elysium } from "@/lib/wagmi";
import { useWallet } from "@/hooks/use-wallet";
import { useEconomy } from "@/hooks/use-foxes";
import { useFoxToken } from "@/hooks/use-fox-token";
import { useTx } from "@/hooks/use-tx";
import { fmtInt, fmtToken, pct } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/foxysium-constants";

const HOW = [
  { t: "Rewards come from revenue", b: "Foundry, market and agent fees fund the pool. When the ecosystem earns more, the pool grows; when it earns less, so does your share." },
  { t: "Your share follows the pool", b: "You earn in proportion to your stake while it's active. There's no fixed APY and none is implied." },
  { t: "Principal unlocks gradually", b: "Staked $FOX unlocks over a ramp. Adding more restarts the ramp for the whole position, so top up deliberately." },
  { t: "Claim whenever", b: "Accrued rewards can be claimed at any time without touching your principal." },
];

export default function Staking() {
  const live = !!CONTRACTS.staking && !!CONTRACTS.fox;
  const e = useEconomy();
  const stakedPct = pct(e.totalStaked, e.totalSupply);

  return (
    <>
      <PageHeader title={`Stake $${TOKEN_SYMBOL}`} lede="Put $FOX into the shared pool and earn a share of what the ecosystem actually collects.">
        <ButtonLink href="/leaderboard" variant="ghost">
          Leaderboard
        </ButtonLink>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8 [&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1">
        <StatTile label="Total staked" value={fmtToken(e.totalStaked, 18, 0)} sub={stakedPct !== null ? `${stakedPct}% of supply` : undefined} tone="mint" live={e.live.staking} />
        <StatTile label="Stakers" value={fmtInt(e.stakers)} live={e.live.staking} />
        <StatTile label="Total supply" value={fmtToken(e.totalSupply, 18, 0)} live={e.live.fox} />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
        {live ? (
          <ConnectGate why="to stake">
            <StakePanel />
          </ConnectGate>
        ) : (
          <NotLive what="Staking">
            Staking opens with the $FOX token in phase two. The contract address will be posted here and on our X account, so don't
            trust it anywhere else.
          </NotLive>
        )}
        <section>
          <SectionTitle>How it works</SectionTitle>
          <ol className="sticker p-2">
            {HOW.map((h, i) => (
              <li key={h.t} className="flex gap-4 p-3.5 border-b border-line last:border-0">
                <span className="num h-8 w-8 rounded-full bg-fur text-ink font-semibold grid place-items-center shrink-0 border border-line">{i + 1}</span>
                <div>
                  <div className="font-semibold">{h.t}</div>
                  <p className="text-mist leading-snug mt-0.5">{h.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}

function StakePanel() {
  const { address } = useWallet();
  const tok = useFoxToken(address, CONTRACTS.staking);
  const { run, pending } = useTx();
  const [amt, setAmt] = useState("");
  const [wAmt, setWAmt] = useState("");

  const { data } = useReadContracts({
    contracts: (["stakedOf", "earned", "unlockedOf"] as const).map((fn) => ({
      address: CONTRACTS.staking!,
      abi: stakingAbi,
      functionName: fn,
      args: [address!] as const,
      chainId: elysium.id,
    })),
    query: { enabled: !!address, refetchInterval: 15_000 },
  });
  const [staked, earned, unlocked] = [0, 1, 2].map((i) => (data?.[i]?.status === "success" ? (data[i].result as bigint) : undefined));

  const parse = (v: string) => {
    try {
      return v ? parseUnits(v, tok.decimals) : 0n;
    } catch {
      return 0n;
    }
  };
  const a = parse(amt);
  const w = parse(wAmt);
  const needsApproval = a > 0n && tok.allowance < a;
  const tooMuch = tok.balance !== undefined && a > tok.balance;

  return (
    <div className="sticker p-5 md:p-6">
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          ["Your stake", staked],
          ["Earned", earned],
          ["Unlocked", unlocked],
        ].map(([k, v]) => (
          <div key={k as string}>
            <div className="text-haze text-[14px] font-medium">{k as string}</div>
            <div className="num text-xl font-semibold mt-0.5">{fmtToken(v as bigint | undefined)}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="stake">
        <TabsList className="grid grid-cols-2 bg-dusk border border-line rounded-xl p-1 h-auto">
          <TabsTrigger value="stake" className="rounded-lg py-2 font-semibold data-[state=active]:bg-fur data-[state=active]:text-ink">Stake</TabsTrigger>
          <TabsTrigger value="withdraw" className="rounded-lg py-2 font-semibold data-[state=active]:bg-fur data-[state=active]:text-ink">Withdraw</TabsTrigger>
        </TabsList>
        <TabsContent value="stake" className="mt-5 space-y-4">
          <AmountInput id="stake" label="Amount to stake" value={amt} onChange={setAmt} max={tok.balance} decimals={tok.decimals} />
          {tooMuch && <p className="text-rose font-semibold">That's more $FOX than this wallet holds.</p>}
          {needsApproval ? (
            <button className="btn btn-fur w-full" onClick={tok.approve} disabled={tok.approving}>
              {tok.approving && <Loader2 className="h-4 w-4 animate-spin" />} Approve $FOX
            </button>
          ) : (
            <button
              className="btn btn-fur w-full"
              disabled={a === 0n || tooMuch || !!pending}
              onClick={async () => {
                if (await run("Stake", { address: CONTRACTS.staking!, abi: stakingAbi, functionName: "stake", args: [a] })) setAmt("");
              }}
            >
              {pending === "Stake" && <Loader2 className="h-4 w-4 animate-spin" />} Stake
            </button>
          )}
          {staked !== undefined && staked > 0n && <p className="text-haze text-[14px]">Adding to an existing stake restarts its unlock ramp.</p>}
        </TabsContent>
        <TabsContent value="withdraw" className="mt-5 space-y-4">
          <AmountInput id="withdraw" label="Amount to withdraw" value={wAmt} onChange={setWAmt} max={unlocked} decimals={tok.decimals} />
          <button
            className="btn btn-fur w-full"
            disabled={w === 0n || (unlocked !== undefined && w > unlocked) || !!pending}
            onClick={async () => {
              if (await run("Withdraw", { address: CONTRACTS.staking!, abi: stakingAbi, functionName: "withdraw", args: [w] })) setWAmt("");
            }}
          >
            {pending === "Withdraw" && <Loader2 className="h-4 w-4 animate-spin" />} Withdraw
          </button>
        </TabsContent>
      </Tabs>

      <button
        className="btn btn-belly w-full mt-4"
        disabled={!earned || earned === 0n || !!pending}
        onClick={() => run("Claim rewards", { address: CONTRACTS.staking!, abi: stakingAbi, functionName: "claim" })}
      >
        {pending === "Claim rewards" && <Loader2 className="h-4 w-4 animate-spin" />} Claim {fmtToken(earned)} $FOX
      </button>
    </div>
  );
}
