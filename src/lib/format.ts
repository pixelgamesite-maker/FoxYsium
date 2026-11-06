import { formatUnits } from "viem";

export const short = (a?: string | null, n = 4) => (a ? `${a.slice(0, 2 + n)}…${a.slice(-n)}` : "");

export function fmtInt(n: number | bigint | null | undefined) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString("en-US");
}

export function fmtToken(v: bigint | undefined, decimals = 18, max = 2) {
  if (v === undefined) return "—";
  const n = Number(formatUnits(v, decimals));
  return n.toLocaleString("en-US", { maximumFractionDigits: max });
}

export function fmtUsd(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  if (n > 0 && n < 0.01) return `$${n.toPrecision(5)}`;
  return `$${n.toFixed(2)}`;
}

export function pct(part: bigint | undefined, whole: bigint | undefined) {
  if (!part || !whole || whole === 0n) return null;
  return Number((part * 10000n) / whole) / 100;
}

export function ago(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
