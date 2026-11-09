import { PageHeader, SectionTitle, ButtonLink } from "@/components/den";
import { CONTRACTS } from "@/lib/contracts";
import { SWAP_URL, TOKEN_SYMBOL } from "@/lib/foxysium-constants";
import { AlertTriangle } from "lucide-react";

const POOLS = [
  { pair: `$${TOKEN_SYMBOL} / WHYPE`, a: "#F27A1A", b: "#5EE6A8", note: "The main pool. Most $FOX trading routes through here." },
  { pair: `$${TOKEN_SYMBOL} / USDC`, a: "#F27A1A", b: "#6FB7FF", note: "Stable pair for pricing and lower-volatility LPs." },
  { pair: "Foundry tokens / HYPE", a: "#9C8CFF", b: "#5EE6A8", note: "Each Foundry launch seeds its own HYPE pool at go-live." },
];

export default function Liquidity() {
  const live = !!CONTRACTS.fox && !!SWAP_URL;
  return (
    <>
      <PageHeader
        title="Liquidity"
        lede="Supply both sides of a pool and earn a cut of every trade through it. Pools run on Elysium's DEXes; FoxYsium points you to the right one."
      />
      <div className="grid md:grid-cols-3 gap-4">
        {POOLS.map((p) => (
          <div key={p.pair} className="sticker-sm p-5 flex flex-col">
            <div className="flex -space-x-2">
              <span className="h-10 w-10 rounded-full border border-line" style={{ background: p.a }} />
              <span className="h-10 w-10 rounded-full border border-line" style={{ background: p.b }} />
            </div>
            <div className="mt-3 font-semibold text-xl">{p.pair}</div>
            <p className="text-mist mt-1 leading-snug flex-1">{p.note}</p>
            <div className="mt-4">
              {live ? (
                <ButtonLink href={SWAP_URL!} className="btn-sm">
                  Add liquidity
                </ButtonLink>
              ) : (
                <span className="chip bg-dusk text-haze">Opens with $FOX</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-12 max-w-3xl">
        <SectionTitle>Before you provide liquidity</SectionTitle>
        <div className="sticker p-5 flex gap-4">
          <AlertTriangle className="h-6 w-6 text-gold shrink-0 mt-0.5" />
          <p className="text-mist leading-relaxed">
            If one token's price moves a lot against the other, you can end up with less value than if you'd just held both.
            That's called impermanent loss. Trading fees can offset it, but not always. Only provide what you're comfortable leaving in
            the pool through price swings.
          </p>
        </div>
      </section>
    </>
  );
}
