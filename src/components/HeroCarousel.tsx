import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/den";
import { ART, MINT_PLATFORM, OPENSEA_URL, SUPPLY, TOKEN_SYMBOL } from "@/lib/foxbank-constants";
import { cn } from "@/lib/utils";

type Slide = {
  tag: string;
  title: string;
  body: string;
  art: number; // index into ART
  ctas: { label: string; href: string; variant?: "fur" | "belly" | "ghost" }[];
};

const SLIDES: Slide[] = [
  {
    tag: "Genesis collection",
    title: "Every Fox holds its own wallet",
    body: `${SUPPLY.toLocaleString()} Genesis Foxes on Robinhood Chain, minting on ${MINT_PLATFORM}. Each one is an identity, an on-chain account and a stake in the ecosystem's revenue.`,
    art: 0,
    ctas: [
      OPENSEA_URL ? { label: `Mint on ${MINT_PLATFORM}`, href: OPENSEA_URL } : { label: "Join the allowlist", href: "/genesis#allowlist" },
      { label: "View the collection", href: "/genesis", variant: "ghost" },
    ],
  },
  {
    tag: "FoxVault",
    title: "Assets that move with the Fox",
    body: "Rewards, tokens and positions live in the Fox's own ERC-6551 account. Transfer the Fox and its vault goes with it.",
    art: 1,
    ctas: [
      { label: "Open Console", href: "/console" },
      { label: "How vaults work", href: "/docs#vault", variant: "ghost" },
    ],
  },
  {
    tag: "FoxFoundry",
    title: "FoxFoundry opens after mint",
    body: "Genesis holders will be able to launch their own coins on Robinhood Chain, paired with ETH, USDC or $FOX, with creator fees routed back to their Fox.",
    art: 2,
    ctas: [
      { label: "Learn more", href: "/foundry" },
      { label: "Join the allowlist", href: "/genesis#allowlist", variant: "ghost" },
    ],
  },
  {
    tag: "Staking",
    title: "Yield from revenue, not emissions",
    body: `Staking rewards for $${TOKEN_SYMBOL} are funded by launch, marketplace and agent fees. Your share follows the pool, with no promised APY.`,
    art: 4,
    ctas: [
      { label: `Stake $${TOKEN_SYMBOL}`, href: "/staking" },
      { label: "Leaderboard", href: "/leaderboard", variant: "ghost" },
    ],
  },
  {
    tag: "FoxLocker",
    title: "Time-locks with no admin key",
    body: "No early withdrawals and no owner override. Every lock is public, including the team's.",
    art: 5,
    ctas: [{ label: "Open the locker", href: "/locker" }],
  },
  {
    tag: "FoxAgents",
    title: "AI operators, on your terms",
    body: "Assign an optional agent to a Fox, choose what it may do and cap what it may spend. The limits are enforced on-chain.",
    art: 3,
    ctas: [
      { label: "Configure an agent", href: "/agents" },
      { label: "Read the docs", href: "/docs#agents", variant: "ghost" },
    ],
  },
];

const INTERVAL = 7000;

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const go = useCallback((d: number) => setI((x) => (x + d + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setTimeout(() => go(1), INTERVAL);
    return () => clearTimeout(t);
  }, [i, paused, reduced, go]);

  // Warm the cache so slide changes don't flash.
  useEffect(() => {
    SLIDES.forEach((x) => {
      const img = new Image();
      img.src = ART[x.art].src;
    });
  }, []);

  const s = SLIDES[i];
  const art = ART[s.art];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="What FoxBank does"
      className="sticker overflow-hidden p-0 mt-5 md:mt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        {/* Art */}
        <div className="relative aspect-[5/4] sm:aspect-[16/11] md:aspect-auto md:min-h-[500px] overflow-hidden md:order-2" style={{ backgroundColor: art.bg }}>
          <img
            key={art.src}
            src={art.src}
            alt={art.alt}
            className="art-in absolute inset-0 h-full w-full object-cover object-[50%_22%]"
            fetchPriority={i === 0 ? "high" : undefined}
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent md:hidden" />
          <div className="absolute bottom-3 right-3 rounded-full bg-black/45 backdrop-blur px-3 py-1 text-[13px] text-white/90 num">
            {i + 1} of {SLIDES.length}
          </div>
        </div>

        {/* Copy */}
        <div className="p-6 sm:p-8 md:p-12 flex flex-col md:order-1">
          <div key={i} className="slide-in" aria-live="polite">
            <div className="text-[15px] font-medium text-fur">{s.tag}</div>
            <h1 className="mt-3 text-[clamp(2.1rem,7.5vw,3.6rem)] font-semibold leading-[1.02]">{s.title}</h1>
            <p className="mt-5 text-mist text-[17px] leading-relaxed max-w-[44ch]">{s.body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {s.ctas.map((c) => (
                <ButtonLink key={c.label} href={c.href} variant={c.variant ?? "fur"}>
                  {c.label}
                </ButtonLink>
              ))}
            </div>
          </div>

          <div className="mt-10 md:mt-auto pt-2 flex items-center gap-4">
            <div className="flex gap-1.5 flex-1 max-w-[240px]" role="tablist" aria-label="Choose slide">
              {SLIDES.map((x, n) => (
                <button
                  key={x.title}
                  role="tab"
                  aria-selected={n === i}
                  aria-label={`Slide ${n + 1}: ${x.title}`}
                  onClick={() => setI(n)}
                  className="group flex-1 py-2"
                >
                  <span className={cn("block h-[3px] rounded-full transition-colors", n === i ? "bg-fur" : "bg-dusk-3 group-hover:bg-haze")} />
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              <button className="btn btn-sm btn-ghost !px-0 w-10" onClick={() => go(-1)} aria-label="Previous slide">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="btn btn-sm btn-ghost !px-0 w-10" onClick={() => go(1)} aria-label="Next slide">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
