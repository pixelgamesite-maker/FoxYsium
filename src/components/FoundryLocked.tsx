import { Lock } from "lucide-react";
import { ButtonLink } from "@/components/den";
import { ART } from "@/lib/foxbank-constants";
import { cn } from "@/lib/utils";

const INSIDE = [
  { t: "Your own coin", b: "Name, ticker and artwork, trading on Robinhood Chain within minutes." },
  { t: "Paired from day one", b: "Liquidity against ETH, USDC or $FOX from the first block." },
  { t: "Fees routed to your Fox", b: "A share of every trade settles into the creator Fox's vault." },
];

/** Teaser for the locked FoxFoundry. `compact` is the home-page version. */
export default function FoundryLocked({ compact = false }: { compact?: boolean }) {
  const art = ART[2];
  return (
    <section className={cn("sticker overflow-hidden p-0", !compact && "mt-6 md:mt-10")}>
      <div className="grid md:grid-cols-[1.2fr_1fr]">
        <div className="p-6 sm:p-8 md:p-12">
          <span className="chip text-mist">
            <Lock className="h-3.5 w-3.5 text-fur" /> Opens after mint
          </span>
          {compact ? (
            <h2 className="mt-5 text-[clamp(1.8rem,5.5vw,2.6rem)] font-semibold leading-[1.05]">FoxFoundry</h2>
          ) : (
            <h1 className="mt-5 text-[clamp(2.3rem,8vw,3.8rem)] font-semibold leading-[1.02]">FoxFoundry</h1>
          )}
          <p className="mt-4 text-mist text-[17px] leading-relaxed max-w-[48ch]">
            A launch venue for Genesis holders. Each launch is backed by the Fox that created it, with its terms shown up front.
          </p>

          <dl className="mt-7 grid gap-4">
            {INSIDE.map((x) => (
              <div key={x.t} className="border-l-2 border-fur/70 pl-4">
                <dt className="font-semibold">{x.t}</dt>
                <dd className="text-mist mt-0.5">{x.b}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/genesis#allowlist">Join the allowlist</ButtonLink>
            {compact ? (
              <ButtonLink href="/foundry" variant="ghost">
                Learn more
              </ButtonLink>
            ) : (
              <ButtonLink href="/docs#foundry" variant="ghost">
                How it will work
              </ButtonLink>
            )}
          </div>
        </div>

        <div className="relative aspect-[5/4] md:aspect-auto md:min-h-[440px] overflow-hidden" style={{ backgroundColor: art.bg }}>
          <img src={art.src} alt={art.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_22%] brightness-[0.62] saturate-[0.8]" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="h-16 w-16 rounded-full bg-black/45 backdrop-blur-md border border-white/15 grid place-items-center">
              <Lock className="h-7 w-7 text-white" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
