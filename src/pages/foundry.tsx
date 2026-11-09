import FoundryLocked from "@/components/FoundryLocked";
import { FOUNDRY_LOCKED } from "@/lib/foxysium-constants";
import { useMemo, useState } from "react";
import { PageHeader, EmptyState, ButtonLink } from "@/components/den";
import LaunchCard from "@/components/LaunchCard";
import { useLaunches } from "@/hooks/use-foxes";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "mcap", label: "Market cap" },
  { id: "vol", label: "24h volume" },
] as const;

export default function Foundry() {
  if (FOUNDRY_LOCKED) return <FoundryLocked />;
  return <FoundryOpen />;
}

function FoundryOpen() {
  const { data, isLoading, error } = useLaunches(120);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("new");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    let r = [...(data ?? [])];
    const s = q.trim().toLowerCase();
    if (s) r = r.filter((l) => l.name.toLowerCase().includes(s) || l.ticker.toLowerCase().includes(s));
    if (sort === "mcap") r.sort((a, b) => (b.market_cap_usd ?? 0) - (a.market_cap_usd ?? 0));
    if (sort === "vol") r.sort((a, b) => (b.volume_24h_usd ?? 0) - (a.volume_24h_usd ?? 0));
    return r;
  }, [data, sort, q]);

  return (
    <>
      <PageHeader
        title="FoxFoundry"
        lede="Community tokens launched by Genesis holders. Every launch shows its supply, creator fees and allocations up front, and links back to the Fox that made it."
      >
        <ButtonLink href="/foundry/new">Start a launch</ButtonLink>
        <ButtonLink href="/docs#foundry" variant="ghost">
          Launch rules
        </ButtonLink>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <label htmlFor="lq" className="sr-only">
          Search launches
        </label>
        <input id="lq" className="field sm:max-w-xs" placeholder="Search name or ticker" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-2" role="group" aria-label="Sort launches">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              aria-pressed={sort === s.id}
              className={cn("btn btn-sm", sort === s.id ? "btn-fur" : "btn-ghost")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="sticker-sm h-[230px] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="The launch feed didn't load">{(error as Error).message}. Refresh to try again.</EmptyState>
      ) : rows.length ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((l) => (
            <LaunchCard key={l.id} l={l} />
          ))}
        </div>
      ) : (
        <EmptyState title={q ? "No launches match that" : "No launches yet"} action={!q ? <ButtonLink href="/foundry/new">Start a launch</ButtonLink> : undefined}>
          {!isSupabaseConfigured ? "Connect Supabase to show the Foundry feed." : q ? "Try a different name or ticker." : "Be the first Fox to launch a token on Elysium."}
        </EmptyState>
      )}
    </>
  );
}
