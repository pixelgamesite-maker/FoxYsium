import { Link } from "wouter";
import HeroCarousel from "@/components/HeroCarousel";
import FAQSection from "@/components/FAQSection";
import LaunchCard from "@/components/LaunchCard";
import { SectionTitle, StatTile, EmptyState, ButtonLink } from "@/components/den";
import { useEconomy, useLaunches } from "@/hooks/use-foxes";
import { fmtToken, fmtInt, pct } from "@/lib/format";
import { CLASSES, FOUNDRY_LOCKED, REVENUE_SPLIT, ROADMAP, SUPPLY, TOKEN_SYMBOL } from "@/lib/foxbank-constants";
import FoundryLocked from "@/components/FoundryLocked";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <EconomyTiles />
      <ClassesStrip />
      <RecentLaunches />
      <RevenueFlow />
      <Roadmap />
      <FAQSection />
    </>
  );
}

function EconomyTiles() {
  const e = useEconomy();
  const lockedPct = pct(e.totalLocked, e.totalSupply);
  const stakedPct = pct(e.totalStaked, e.totalSupply);
  const combined = e.totalLocked !== undefined && e.totalStaked !== undefined ? e.totalLocked + e.totalStaked : undefined;
  const combinedPct = pct(combined, e.totalSupply);

  return (
    <section className="mt-14">
      <SectionTitle>${TOKEN_SYMBOL} supply</SectionTitle>
      <p className="text-mist -mt-2 mb-5">Read directly from the Locker and Staking contracts on Robinhood Chain, refreshed every 30 seconds.</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatTile label="In the locker" value={fmtToken(e.totalLocked, 18, 0)} sub={lockedPct !== null ? `${lockedPct}% of supply` : undefined} tone="mint" live={e.live.locker} />
        <StatTile
          label="Staked"
          value={fmtToken(e.totalStaked, 18, 0)}
          sub={stakedPct !== null ? `${stakedPct}% of supply · ${fmtInt(e.stakers)} stakers` : undefined}
          tone="mint"
          live={e.live.staking}
        />
        <StatTile label="Locked and staked" value={fmtToken(combined, 18, 0)} sub={combinedPct !== null ? `${combinedPct}% of supply` : undefined} tone="fur" live={e.live.locker && e.live.staking} bar={combinedPct} />
        <StatTile
          label="Genesis minted"
          value={`${fmtInt(e.minted)} / ${SUPPLY.toLocaleString()}`}
          tone="belly"
          live={e.live.genesis}
          bar={e.minted !== undefined ? (Number(e.minted) / SUPPLY) * 100 : null}
        />
      </div>
    </section>
  );
}

function ClassesStrip() {
  return (
    <section className="mt-16">
      <SectionTitle action={<Link href="/genesis" className="font-semibold text-fur-2 hover:underline underline-offset-4 shrink-0">View Genesis</Link>}>
        Five classes
      </SectionTitle>
      <div className="flex gap-3 md:grid md:grid-cols-5 overflow-x-auto snap-x pb-3 -mx-4 px-4 md:mx-0 md:px-0">
        {CLASSES.map((c) => (
          <div key={c.name} className="sticker-sm p-4 min-w-[210px] md:min-w-0 snap-start">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
              <span className="font-semibold text-xl">{c.name}</span>
            </div>
            <div className="text-haze font-medium">{c.role}</div>
            <p className="mt-2 text-mist text-[15px] leading-snug">{c.perk}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentLaunches() {
  if (FOUNDRY_LOCKED)
    return (
      <section className="mt-16">
        <FoundryLocked compact />
      </section>
    );
  return <RecentLaunchesOpen />;
}

function RecentLaunchesOpen() {
  const { data, isLoading } = useLaunches(6);
  return (
    <section className="mt-16">
      <SectionTitle action={<Link href="/foundry" className="font-semibold text-fur-2 hover:underline underline-offset-4 shrink-0">All launches</Link>}>
        Recent launches
      </SectionTitle>
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="sticker-sm h-[230px] animate-pulse" />
          ))}
        </div>
      ) : data && data.length ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((l) => (
            <LaunchCard key={l.id} l={l} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No launches yet"
          action={<ButtonLink href="/foundry/new">Start a launch</ButtonLink>}
        >
          {isSupabaseConfigured
            ? "The Foundry feed fills up as tokens go live. Holders of a Genesis Fox can submit the first one."
            : "Connect Supabase to show the Foundry feed."}
        </EmptyState>
      )}
    </section>
  );
}

function RevenueFlow() {
  return (
    <section className="mt-16 grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
      <div>
        <SectionTitle>Revenue distribution</SectionTitle>
        <p className="text-mist leading-relaxed max-w-[52ch]">
          Launches, market trades and agent usage all pay small fees. Part of every dollar collected goes back to
          Genesis holders, paid into each Fox's vault. No inflationary emissions and no promised APY.
        </p>
        <p className="text-haze text-[14px] mt-3">Proposed split, to be finalised with the tokenomics.</p>
      </div>
      <div className="sticker p-5 md:p-6">
        <div className="text-[15px] font-medium text-haze">Of every $10,000 in eligible net revenue</div>
        <div className="mt-4 flex h-12 rounded-xl border border-line overflow-hidden">
          {REVENUE_SPLIT.map((r, i) => (
            <div key={r.to} className={cn("h-full", i > 0 && "border-l border-line")} style={{ width: `${r.pct}%`, background: r.color }} title={`${r.to}: ${r.pct}%`} />
          ))}
        </div>
        <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {REVENUE_SPLIT.map((r) => (
            <li key={r.to} className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-md border border-line shrink-0" style={{ background: r.color }} />
              <span className="flex-1 text-mist">{r.to}</span>
              <span className="num font-semibold">${(r.pct * 100).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section className="mt-16">
      <SectionTitle>Roadmap</SectionTitle>
      <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROADMAP.map((r, i) => (
          <li key={r.phase} className={cn("sticker-sm p-5", r.state === "now" && "border-fur/60")}>
            <div className="flex items-center justify-between">
              <span className={cn("num text-4xl font-semibold", r.state === "now" ? "text-fur" : "text-dusk-3")}>{i + 1}</span>
              <span className={cn("chip", r.state === "now" ? "text-fur border-fur/50" : "text-haze")}>
                {r.state === "now" ? "In progress" : r.state === "next" ? "Next" : "Later"}
              </span>
            </div>
            <div className="mt-3 font-semibold text-xl leading-tight">{r.phase}</div>
            <ul className={cn("mt-3 space-y-1.5 text-[15px]", "text-mist")}>
              {r.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
