import { Link } from "wouter";
import type { Launch } from "@/lib/supabase";
import { fmtUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function LaunchCard({ l }: { l: Launch }) {
  const ch = l.change_24h_pct;
  return (
    <Link href={`/foundry/${l.id}`} className="sticker-sm p-4 block hover:bg-dusk-3 transition-colors">
      <div className="flex items-center gap-3.5">
        <div className="h-14 w-14 rounded-xl border border-line bg-belly overflow-hidden shrink-0 grid place-items-center">
          {l.image_url ? (
            <img src={l.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="font-semibold text-ink text-lg">{l.ticker.slice(0, 2)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-lg leading-tight truncate">{l.name}</div>
          <div className="text-haze font-medium">${l.ticker}</div>
        </div>
        {l.linked_fox_id !== null && <span className="chip bg-fur text-ink shrink-0">Fox #{l.linked_fox_id}</span>}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[14px] text-haze font-medium">Market cap</div>
          <div className="num text-2xl font-semibold">{fmtUsd(l.market_cap_usd)}</div>
        </div>
        {ch !== null && (
          <div className={cn("num font-semibold", ch >= 0 ? "text-mint" : "text-rose")}>
            {ch >= 0 ? "+" : ""}
            {ch.toFixed(2)}% today
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[14px]">
        <div>
          <div className="text-haze">Price</div>
          <div className="num font-semibold truncate">{fmtUsd(l.price_usd)}</div>
        </div>
        <div>
          <div className="text-haze">24h volume</div>
          <div className="num font-semibold">{fmtUsd(l.volume_24h_usd)}</div>
        </div>
        <div>
          <div className="text-haze">Liquidity</div>
          <div className="num font-semibold">{fmtUsd(l.liquidity_usd)}</div>
        </div>
      </div>
      <div className="mt-3 text-[14px] text-mist">
        {l.reward_mode === "none" ? "No holder rewards" : `${l.reward_mode.toUpperCase()} rewards to holders`}
      </div>
    </Link>
  );
}
