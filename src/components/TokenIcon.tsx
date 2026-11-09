import { cn } from "@/lib/utils";

export type TokenId = "fox" | "hype" | "usdc";

export const TOKENS: Record<TokenId, { symbol: string; name: string; src: string; full: string }> = {
  fox: { symbol: "FOX", name: "FoxYsium", src: "/tokens/fox-128.png", full: "/tokens/fox.png" },
  hype: { symbol: "HYPE", name: "Hyperliquid", src: "/tokens/hype-128.png", full: "/tokens/hype.png" },
  usdc: { symbol: "USDC", name: "USD Coin", src: "/tokens/usdc-128.png", full: "/tokens/usdc.png" },
};

/** Round token logo. Logos live in public/tokens. */
export default function TokenIcon({ id, size = 24, className }: { id: TokenId; size?: number; className?: string }) {
  const t = TOKENS[id];
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
