import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Wallet, Rocket, Coins, Lock, Bot, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/den";
import { HERO_ART, MINT_PLATFORM, OPENSEA_URL, SUPPLY, TOKEN_SYMBOL } from "@/lib/foxysium-constants";
import { cn } from "@/lib/utils";

type Slide = {
  tag: string;
  title: string;
  body: string;
  bg: string;
  icon: LucideIcon;
  flip?: boolean;
  ctas: { label: string; href: string; variant?: "fur" | "belly" | "ghost" }[];
};

const SLIDES: Slide[] = [
  {
    tag: `Genesis · ${SUPPLY.toLocaleString()} Foxes · Elysium`,
    title: "Every Fox comes with its own wallet",
    body: `2,626 Genesis Foxes, minting on ${MINT_PLATFORM}. Each one is an identity, a vault that holds its own assets, and a seat in the den's economy.`,
    bg: "#F27A1A",
    icon: Sparkles,
    ctas: [
      OPENSEA_URL ? { label: `Mint on ${MINT_PLATFORM}`, href: OPENSEA_URL } : { label: "Join the allowlist", href: "/genesis#allowlist" },
      { label: "See the collection", href: "/genesis", variant: "ghost" },
    ],
  },
  {
    tag: "FoxVault · ERC-6551",
    title: "Sell the Fox, the bag goes with it",
    body: "Rewards, tokens and positions sit in the Fox's own account. Whoever holds the Fox controls the vault.",
    bg: "#9C8CFF",
    icon: Wallet,
    flip: true,
    ctas: [
      { label: "Open your Console", href: "/console" },
      { label: "How vaults work", href: "/docs#vault", variant: "ghost" },
    ],
  },
  {
    tag: "FoxFoundry · locked",
    title: "The Foundry is locked. For now.",
    body: "Soon, Genesis holders will spin up their own coins right here, paired with HYPE, with a cut of every trade flowing back to their Fox.",
    bg: "#5EE6A8",
    icon: Rocket,
    ctas: [
      { label: "Peek inside", href: "/foundry" },
      { label: "Get a key", href: "/genesis#allowlist", variant: "ghost" },
    ],
  },
  {
    tag: `Staking · $${TOKEN_SYMBOL}`,
    title: "Stake, and earn from what the den makes",
    body: "Rewards come from launch, market and agent fees, not endless emissions. Your share follows the funded pool.",
    bg: "#F2C14E",
    icon: Coins,
    flip: true,
    ctas: [
      { label: `Stake $${TOKEN_SYMBOL}`, href: "/staking" },
      { label: "Leaderboard", href: "/leaderboard", variant: "ghost" },
    ],
  },
  {
    tag: "FoxLocker · no admin key",
    title: "Locked means locked. Even for us.",
    body: "A trustless time-lock: no early withdrawal and no owner override. Every lock is public, including the team's.",
    bg: "#6FB7FF",
    icon: Lock,
    ctas: [{ label: "Open the locker", href: "/locker" }],
  },
  {
    tag: "FoxAgents · optional",
    title: "Put your Fox to work",
    body: "Switch on an AI operator for a Fox. You set what it may do and how much it may spend; the contract enforces it.",
    bg: "#FF6F8E",
    icon: Bot,
    flip: true,
    ctas: [
      { label: "Set up an agent", href: "/agents" },
      { label: "What it can do", href: "/docs#agents", variant: "ghost" },
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

  const s = SLIDES[i];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="What FoxYsium does"
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
      <div className="grid md:grid-cols-[1.05fr_1fr]">
        {/* Art panel */}
        <div
          className="relative h-[300px] sm:h-[360px] md:h-[460px] border-b-[3px] md:border-b-0 md:border-l-[3px] border-ink overflow-hidden transition-colors duration-500 md:order-2"
          style={{ backgroundColor: s.bg }}
        >
          {/* halftone dots behind the fox */}
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{ backgroundImage: "radial-gradient(#0E0A1C 1.6px, transparent 1.7px)", backgroundSize: "16px 16px" }}
          />
          <div className="absolute top-4 left-4 h-14 w-14 rounded-2xl bg-belly border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)] grid place-items-center rotate-[-6deg]">
            <s.icon className="h-7 w-7 text-ink" strokeWidth={2.4} />
          </div>
          <img
            src={HERO_ART}
            alt="A Genesis Fox in an orange hoodie and backpack"
            className={cn("bob absolute bottom-0 left-1/2 -translate-x-1/2 h-[96%] w-auto max-w-none drop-shadow-[6px_0_0_rgba(14,10,28,0.35)]", s.flip && "-scale-x-100")}
          />
          <div className="absolute top-4 right-4 chip bg-ink text-belly num">
            {i + 1} / {SLIDES.length}
          </div>
        </div>

        {/* Copy */}
        <div key={i} className="slide-in p-5 sm:p-7 md:p-10 flex flex-col md:order-1" aria-live="polite">
          <div className="text-[15px] font-semibold text-haze">{s.tag}</div>
          <h1 className="mt-3 text-[clamp(2.2rem,8.5vw,3.9rem)] font-extrabold leading-[0.95]">{s.title}</h1>
          <p className="mt-4 text-mist text-[17px] leading-relaxed max-w-[46ch]">{s.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {s.ctas.map((c) => (
              <ButtonLink key={c.label} href={c.href} variant={c.variant ?? "fur"}>
                {c.label}
              </ButtonLink>
            ))}
          </div>

          <div className="mt-8 md:mt-auto pt-2 flex items-center gap-3">
            <button className="btn btn-sm btn-ghost !px-0 w-11" onClick={() => go(-1)} aria-label="Previous slide">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="btn btn-sm btn-fur !px-0 w-11" onClick={() => go(1)} aria-label="Next slide">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="flex gap-1.5 ml-2" role="tablist">
              {SLIDES.map((x, n) => (
                <button
                  key={x.title}
                  role="tab"
                  aria-selected={n === i}
                  aria-label={`Slide ${n + 1}: ${x.title}`}
                  onClick={() => setI(n)}
                  className={cn("h-3 rounded-full border-2 border-ink transition-all", n === i ? "w-8 bg-fur" : "w-3 bg-dusk-3")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
