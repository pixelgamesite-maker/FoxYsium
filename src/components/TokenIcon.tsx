import { cn } from "@/lib/utils";

export type TokenId = "fox" | "eth" | "usdc";

// `src: null` renders a text badge. Drop a logo at public/tokens/eth.png (+ eth-128.png) and set the paths.
export const TOKENS: Record<TokenId, { symbol: string; name: string; src: string | null; full: string | null }> = {
  fox: { symbol: "FOX", name: "FoxBank", src: "/tokens/fox-128.png", full: "/tokens/fox.png" },
  eth: { symbol: "ETH", name: "Ether", src: null, full: null },
  usdc: { symbol: "USDC", name: "USD Coin", src: "/tokens/usdc-128.png", full: "/tokens/usdc.png" },
};

/** Round token logo. Logos live in public/tokens. */
export default function TokenIcon({ id, size = 24, className }: { id: TokenId; size?: number; className?: string }) {
  const t = TOKENS[id];
  if (!t.src)
    return (
      <span
        role="img"
        aria-label={t.symbol}
        className={cn("rounded-full shrink-0 bg-belly text-ink font-semibold grid place-items-center", className)}
        style={{ width: size, height: size, fontSize: Math.max(9, size * 0.3) }}
      >
        {t.symbol}
      </span>
    );
  return (
    <img
      src={t.src}
      alt={t.symbol}
      width={size}
      height={size}
      loading="lazy"
      className={cn("rounded-full object-cover shrink-0 bg-dusk-3", className)}
      style={{ width: size, height: size }}
    />
  );
}

/** Two overlapping logos for a trading pair. */
export function PairIcon({ a, b, size = 36 }: { a: TokenId; b: TokenId; size?: number }) {
  return (
    <span className="inline-flex items-center">
      <TokenIcon id={a} size={size} className="ring-2 ring-dusk-2" />
      <TokenIcon id={b} size={size} className="-ml-2.5 ring-2 ring-dusk-2" />
    </span>
  );
}
