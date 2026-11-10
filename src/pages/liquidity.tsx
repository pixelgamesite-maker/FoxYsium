import { PageHeader, SectionTitle, ButtonLink } from "@/components/den";
import { CONTRACTS } from "@/lib/contracts";
import { SWAP_URL, TOKEN_SYMBOL } from "@/lib/foxbank-constants";
import { AlertTriangle } from "lucide-react";
import TokenIcon, { PairIcon, type TokenId } from "@/components/TokenIcon";

const POOLS: { pair: string; a: TokenId | TokenId[]; b: TokenId; note: string }[] = [
  { pair: `$${TOKEN_SYMBOL} / WETH`, a: "fox", b: "eth", note: "The main pool. Most $FOX trading routes through here." },
  { pair: `$${TOKEN_SYMBOL} / USDC`, a: "fox", b: "usdc", note: "Stable pair for pricing and lower-volatility LPs." },
  { pair: "Foundry coins", a: ["fox", "usdc"], b: "eth", note: "Each Foundry launch seeds a pool against $FOX, USDC or ETH when it goes live." },
];

export default function Liquidity() {
  const live = !!CONTRACTS.fox && !!SWAP_URL;
  return (
    <>
      <PageHeader
        title="Liquidity"
        lede="Supply both sides of a pool and earn a cut of every trade through it. Pools run on Robinhood Chain DEXes; FoxBank points you to the right one."
      />
      <div className="grid md:grid-cols-3 gap-4">
        {POOLS.map((p) => (
          <div key={p.pair} className="sticker-sm p-5 flex flex-col">
            {Array.isArray(p.a) ? (
              <span className="inline-flex items-center">
                {[...p.a, p.b].map((t, n) => (
                  <TokenIcon key={t} id={t} size={40} className={n > 0 ? "-ml-2.5 ring-2 ring-dusk-2" : "ring-2 ring-dusk-2"} />
                ))}
              </span>
            ) : (
              <PairIcon a={p.a} b={p.b} size={40} />
            )}
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
