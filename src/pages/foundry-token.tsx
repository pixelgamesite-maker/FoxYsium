import FoundryLocked from "@/components/FoundryLocked";
import { FOUNDRY_LOCKED } from "@/lib/foxbank-constants";
import { Link, useParams } from "wouter";
import { Copy, ExternalLink, Globe } from "lucide-react";
import { Row, SectionTitle, StatTile, ButtonLink, EmptyState } from "@/components/den";
import { useLaunch } from "@/hooks/use-foxes";
import { explorerAddress } from "@/lib/wagmi";
import { SWAP_URL } from "@/lib/foxbank-constants";
import { fmtUsd, short } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function FoundryToken() {
  if (FOUNDRY_LOCKED) return <FoundryLocked />;
  return <FoundryTokenOpen />;
}

function FoundryTokenOpen() {
  const { id } = useParams<{ id: string }>();
  const { data: l, isLoading } = useLaunch(id);

  if (isLoading) return <div className="sticker mt-10 h-72 animate-pulse" />;
  if (!l)
    return (
      <div className="mt-10">
        <EmptyState title="Launch not found" action={<ButtonLink href="/foundry">Back to the feed</ButtonLink>}>
          It may still be in review, or the link is wrong.
        </EmptyState>
      </div>
    );

  const ch = l.change_24h_pct;
  const swap = SWAP_URL && l.token_address ? `${SWAP_URL}${SWAP_URL.includes("?") ? "&" : "?"}outputCurrency=${l.token_address}` : null;

  return (
    <div className="pt-6 md:pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="h-24 w-24 rounded-2xl border border-line bg-belly overflow-hidden grid place-items-center shrink-0">
          {l.image_url ? <img src={l.image_url} alt="" className="h-full w-full object-cover" /> : <span className="font-semibold text-ink text-3xl">{l.ticker.slice(0, 2)}</span>}
        </div>
        <div className="min-w-0">
          <h1 className="text-[clamp(2.2rem,8vw,3.5rem)] font-semibold leading-none truncate">{l.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-haze font-medium text-lg">${l.ticker}</span>
            <span className={cn("chip", l.status === "live" ? "bg-mint text-ink" : l.status === "review" ? "bg-gold text-ink" : "bg-rose text-ink")}>
              {l.status === "live" ? "Live" : l.status === "review" ? "In review" : "Rejected"}
            </span>
            {l.linked_fox_id !== null && (
              <Link href={`/fox/${l.linked_fox_id}`} className="chip bg-fur text-ink">
                Fox #{l.linked_fox_id}
              </Link>
            )}
          </div>
        </div>
        <div className="sm:ml-auto flex gap-3">
          {swap ? <ButtonLink href={swap}>Buy ${l.ticker}</ButtonLink> : <button className="btn btn-fur" disabled>Trading opens at launch</button>}
        </div>
      </div>

      {l.description && <p className="mt-6 text-mist text-[17px] leading-relaxed max-w-[64ch]">{l.description}</p>}

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatTile label="Market cap" value={fmtUsd(l.market_cap_usd)} sub={ch !== null ? <span className={ch >= 0 ? "text-mint" : "text-rose"}>{ch >= 0 ? "+" : ""}{ch.toFixed(2)}% today</span> : undefined} />
        <StatTile label="Price" value={fmtUsd(l.price_usd)} />
        <StatTile label="24h volume" value={fmtUsd(l.volume_24h_usd)} />
        <StatTile label="Liquidity" value={fmtUsd(l.liquidity_usd)} tone="mint" />
      </div>

      <section className="mt-10 grid lg:grid-cols-2 gap-6">
        <div>
          <SectionTitle>Terms</SectionTitle>
          <div className="sticker p-5">
            <Row k="Total supply" v={Number(l.total_supply).toLocaleString()} />
            <Row k="Creator fee" v={`${(l.creator_fee_bps / 100).toFixed(2)}% per trade`} />
            <Row k="Holder rewards" v={l.reward_mode === "none" ? "None" : `Paid in ${l.reward_mode.toUpperCase()}`} />
            <Row k="Pair" v="ETH" />
            <Row k="Creator" mono v={<a className="underline underline-offset-2" href={explorerAddress(l.creator_wallet)} target="_blank" rel="noreferrer">{short(l.creator_wallet)}</a>} />
            <Row
              k="Contract"
              mono
              v={
                l.token_address ? (
                  <span className="inline-flex items-center gap-2">
                    {short(l.token_address)}
                    <button aria-label="Copy contract address" onClick={() => navigator.clipboard.writeText(l.token_address!)} className="text-haze hover:text-belly">
                      <Copy className="h-4 w-4" />
                    </button>
                  </span>
                ) : (
                  "Deployed on approval"
                )
              }
            />
          </div>
        </div>
        <div>
          <SectionTitle>Links</SectionTitle>
          <div className="sticker p-5 flex flex-col gap-3">
            {l.website && (
              <a href={l.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 font-semibold hover:text-fur">
                <Globe className="h-5 w-5" /> {l.website.replace(/^https:\/\//, "")}
              </a>
            )}
            {l.x_url && (
              <a href={l.x_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 font-semibold hover:text-fur">
                <span className="w-5 text-center font-semibold">𝕏</span> {l.x_url.replace(/^https:\/\/(www\.)?/, "")}
              </a>
            )}
            {l.token_address && (
              <a href={explorerAddress(l.token_address)} target="_blank" rel="noreferrer" className="flex items-center gap-3 font-semibold hover:text-fur">
                <ExternalLink className="h-5 w-5" /> View on explorer
              </a>
            )}
            {!l.website && !l.x_url && !l.token_address && <p className="text-mist">The creator hasn't added links.</p>}
          </div>
          <p className="text-haze text-[14px] mt-3">Launches are community-made. Review terms before buying; nothing here is investment advice.</p>
        </div>
      </section>
    </div>
  );
}
