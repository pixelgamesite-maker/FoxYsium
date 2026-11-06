import { Lock, KeyRound } from "lucide-react";
import { ButtonLink } from "@/components/den";
import { HERO_ART } from "@/lib/foxysium-constants";
import { cn } from "@/lib/utils";

const INSIDE = [
  { t: "Your coin, your ticker", b: "Name it, give it art and a story, and it's trading on Elysium in minutes." },
  { t: "Paired with HYPE", b: "Liquidity from the first block, on the chain where Hyperliquid's money already lives." },
  { t: "Fees find their way home", b: "A cut of every trade flows to the Fox behind it, straight into its vault." },
];

/** Teaser for the locked FoxFoundry. `compact` is the home-page version. */
export default function FoundryLocked({ compact = false }: { compact?: boolean }) {
  return (
    <section className={cn("sticker overflow-hidden p-0", !compact && "mt-6 md:mt-10")}>
      <div className="grid md:grid-cols-[1.15fr_1fr]">
        <div className="p-5 sm:p-7 md:p-9">
          <span className="chip bg-ink text-belly">
            <Lock className="h-3.5 w-3.5" /> Locked
          </span>
          {compact ? (
            <h2 className="mt-4 text-[clamp(1.9rem,6vw,2.8rem)] font-extrabold leading-[0.95]">Something's brewing in the Foundry</h2>
          ) : (
            <h1 className="mt-4 text-[clamp(2.4rem,9vw,4.25rem)] font-extrabold leading-[0.95]">FoxFoundry is locked</h1>
          )}
          <p className="mt-4 text-mist text-[17px] leading-relaxed max-w-[50ch]">
            Soon, Genesis holders will be able to spin up their own coin right here, launched from the den and backed by
            the Fox that made it. The doors open after mint.
          </p>

          <ul className="mt-6 space-y-3">
            {INSIDE.map((x) => (
              <li key={x.t} className="flex gap-3">
                <span className="mt-1.5 h-3 w-3 rounded-full bg-fur border-2 border-ink shrink-0" />
                <span>
                  <span className="font-bold">{x.t}.</span> <span className="text-mist">{x.b}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/genesis#allowlist">
              <KeyRound className="h-4 w-4" /> Get a key: join the allowlist
            </ButtonLink>
            {!compact && (
              <ButtonLink href="/docs#foundry" variant="ghost">
                How it will work
              </ButtonLink>
            )}
          </div>
        </div>

        <div className="relative min-h-[260px] md:min-h-0 bg-mint border-t-[3px] md:border-t-0 md:border-l-[3px] border-ink overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #0E0A1C 0 3px, transparent 3px 18px)" }}
          />
          <img src={HERO_ART} alt="" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[88%] w-auto max-w-none -scale-x-100 brightness-[0.55] saturate-50" />
          <div className="absolute top-5 left-5 h-20 w-20 rounded-[24px] bg-belly border-[3px] border-ink shadow-[5px_5px_0_var(--color-ink)] grid place-items-center rotate-[-6deg]">
            <Lock className="h-10 w-10 text-ink" strokeWidth={2.6} />
          </div>
        </div>
      </div>
    </section>
  );
}
