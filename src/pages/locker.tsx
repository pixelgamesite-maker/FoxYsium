import { useState } from "react";
import { useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { Loader2, Lock as LockIcon, Unlock } from "lucide-react";
import { PageHeader, SectionTitle, StatTile, NotLive, EmptyState } from "@/components/den";
import { ConnectGate } from "@/components/wallet/ConnectGate";
import AmountInput from "@/components/AmountInput";
import { CONTRACTS, lockerAbi } from "@/lib/contracts";
import { elysium } from "@/lib/wagmi";
import { useWallet } from "@/hooks/use-wallet";
import { useEconomy } from "@/hooks/use-foxes";
import { useFoxToken } from "@/hooks/use-fox-token";
import { useTx } from "@/hooks/use-tx";
import { fmtToken, pct } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/foxysium-constants";
import { cn } from "@/lib/utils";

const TIERS = [
  { days: 30, perk: "Basic privileges" },
  { days: 90, perk: "Enhanced privileges" },
  { days: 180, perk: "Advanced access" },
  { days: 365, perk: "Maximum access" },
];

export default function Locker() {
  const live = !!CONTRACTS.locker && !!CONTRACTS.fox;
  const e = useEconomy();
  const lp = pct(e.totalLocked, e.totalSupply);

  return (
    <>
      <PageHeader
        title="FoxLocker"
        lede="A trustless time-lock for $FOX. No admin key and no early withdrawal, for anyone. Longer locks unlock more of the platform; they don't promise more yield."
      />
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8 max-w-2xl">
        <StatTile label="Total locked" value={fmtToken(e.totalLocked, 18, 0)} sub={lp !== null ? `${lp}% of supply` : undefined} tone="mint" live={e.live.locker} />
        <StatTile label="Contract" value={<span className="text-[1.1rem]">No owner</span>} sub="Nobody can move a lock early" live={e.live.locker} />
      </div>

      {live ? (
        <ConnectGate why="to lock $FOX">
          <LockPanel />
        </ConnectGate>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <NotLive what="The locker">It deploys alongside $FOX. Team and treasury allocations will be locked here first, in public.</NotLive>
          <TierTable />
        </div>
      )}
    </>
  );
}

function TierTable({ selected, onPick }: { selected?: number; onPick?: (d: number) => void }) {
  return (
    <div className="sticker p-2">
      {TIERS.map((t) => (
        <button
          key={t.days}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(t.days)}
          aria-pressed={selected === t.days}
          className={cn(
            "w-full flex items-center justify-between gap-3 p-3.5 rounded-xl text-left border-[2.5px] border-transparent",
            selected === t.days && "bg-fur text-ink border-ink",
            onPick && selected !== t.days && "hover:bg-dusk-3",
          )}
        >
          <span className="num font-extrabold text-lg">{t.days} days</span>
          <span className={cn("font-semibold", selected === t.days ? "text-ink" : "text-mist")}>{t.perk}</span>
        </button>
      ))}
    </div>
  );
}

function LockPanel() {
  const { address } = useWallet();
  const tok = useFoxToken(address, CONTRACTS.locker);
  const { run, pending } = useTx();
  const [amt, setAmt] = useState("");
  const [days, setDays] = useState(90);
  const [confirm, setConfirm] = useState(false);

  const { data: locks } = useReadContract({
    address: CONTRACTS.locker!,
    abi: lockerAbi,
    functionName: "locksOf",
    args: [address!],
    chainId: elysium.id,
    query: { enabled: !!address, refetchInterval: 20_000 },
  });

  let a = 0n;
  try {
    a = amt ? parseUnits(amt, tok.decimals) : 0n;
  } catch {
    a = 0n;
  }
  const unlockAt = BigInt(Math.floor(Date.now() / 1000) + days * 86400);
  const unlockDate = new Date(Number(unlockAt) * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const needsApproval = a > 0n && tok.allowance < a;
  const tooMuch = tok.balance !== undefined && a > tok.balance;
  const now = BigInt(Math.floor(Date.now() / 1000));

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <div className="sticker p-5 md:p-6 space-y-5">
        <AmountInput id="lock" label="Amount to lock" value={amt} onChange={setAmt} max={tok.balance} decimals={tok.decimals} />
        <div>
          <div className="label">Lock for</div>
          <TierTable selected={days} onPick={setDays} />
        </div>
        <label className="flex gap-3 items-start text-mist cursor-pointer">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--color-fur)]" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
          <span>
            I understand these tokens can't be withdrawn before <span className="font-bold text-belly">{unlockDate}</span>, by me or anyone else.
          </span>
        </label>
        {tooMuch && <p className="text-rose font-semibold">That's more $FOX than this wallet holds.</p>}
        {needsApproval ? (
          <button className="btn btn-fur w-full" onClick={tok.approve} disabled={tok.approving}>
            {tok.approving && <Loader2 className="h-4 w-4 animate-spin" />} Approve $FOX
          </button>
        ) : (
          <button
            className="btn btn-fur w-full"
            disabled={a === 0n || tooMuch || !confirm || !!pending}
            onClick={async () => {
              if (await run("Lock", { address: CONTRACTS.locker!, abi: lockerAbi, functionName: "lock", args: [a, unlockAt] })) {
                setAmt("");
                setConfirm(false);
              }
            }}
          >
            {pending === "Lock" && <Loader2 className="h-4 w-4 animate-spin" />} Lock until {unlockDate}
          </button>
        )}
      </div>

      <section>
        <SectionTitle>Your locks</SectionTitle>
        {locks && locks.length ? (
          <ul className="sticker p-2">
            {locks.map((l) => {
              const open = !l.withdrawn && l.unlockAt <= now;
              return (
                <li key={String(l.id)} className="flex items-center gap-3 p-3.5 border-b-2 border-dusk-3 last:border-0">
                  {open || l.withdrawn ? <Unlock className="h-5 w-5 text-mint shrink-0" /> : <LockIcon className="h-5 w-5 text-lilac shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="num font-extrabold">{fmtToken(l.amount)} ${TOKEN_SYMBOL}</div>
                    <div className="text-haze text-[14px]">
                      {l.withdrawn ? "Withdrawn" : open ? "Unlocked" : `Unlocks ${new Date(Number(l.unlockAt) * 1000).toLocaleDateString()}`}
                    </div>
                  </div>
                  {open && (
                    <button
                      className="btn btn-sm btn-belly"
                      disabled={!!pending}
                      onClick={() => run("Withdraw lock", { address: CONTRACTS.locker!, abi: lockerAbi, functionName: "withdraw", args: [l.id] })}
                    >
                      Withdraw
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="No locks yet">Locks you create show here with their unlock date.</EmptyState>
        )}
      </section>
    </div>
  );
}
