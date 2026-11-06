// ── Brand ──────────────────────────────────────────────────────────
// One place to rename the project if the final name differs.
export const BRAND = "FoxYsium";
export const TOKEN_SYMBOL = "FOX"; // provisional, pending ticker check

// ── Collection facts (edit here — used across all pages) ───────────
export const SUPPLY = 2626;
export const MINT_PRICE = "TBA";
export const MINT_STATUS: "allowlist" | "live" | "sold-out" = "allowlist";

// Base URL for per-token art. Point at IPFS/Arweave once metadata is pinned,
// e.g. "https://ipfs.io/ipfs/<cid>/" — the site appends `${id}.png`.
export const ART_BASE_URL = "/foxes/";
export const HERO_ART = "/fox-hero.webp";

// ── Links ──────────────────────────────────────────────────────────
const env = import.meta.env;
export const SWAP_URL: string | null = env.VITE_SWAP_URL || null;
export const X_URL: string | null = env.VITE_X_URL && env.VITE_X_URL !== "https://x.com/" ? env.VITE_X_URL : null;
export const TELEGRAM_URL: string | null = env.VITE_TELEGRAM_URL || null;

// ── Classes (from the blueprint) ───────────────────────────────────
export type FoxClass = "Sovereign" | "Oracle" | "Alchemist" | "Merchant" | "Guardian";

export const CLASSES: { name: FoxClass; role: string; perk: string; color: string }[] = [
  { name: "Sovereign", role: "The elite fox", perk: "Highest ecosystem privileges and first access to new products.", color: "#F2C14E" },
  { name: "Oracle", role: "The strategist", perk: "Advanced FoxAgent templates and governance tooling.", color: "#9C8CFF" },
  { name: "Alchemist", role: "The creator", perk: "Foundry priority and reduced launch fees.", color: "#5EE6A8" },
  { name: "Merchant", role: "The trader", perk: "Marketplace and business features, Fox Business lead role.", color: "#F27A1A" },
  { name: "Guardian", role: "The protector", perk: "Governance weight and ecosystem participation boosts.", color: "#6FB7FF" },
];

// ── Rarity (proposed distribution, sums to 2,626) ──────────────────
export const RARITY = [
  { tier: "Common", supply: 1200 },
  { tier: "Uncommon", supply: 750 },
  { tier: "Rare", supply: 400 },
  { tier: "Epic", supply: 200 },
  { tier: "Legendary", supply: 76 },
] as const;

// ── Reputation levels ──────────────────────────────────────────────
export const LEVELS = [
  { name: "Cub", min: 0, blurb: "New Genesis member" },
  { name: "Scout", min: 250, blurb: "Active in the den" },
  { name: "Hunter", min: 1000, blurb: "Established contributor" },
  { name: "Alpha", min: 3000, blurb: "Recognised across the ecosystem" },
  { name: "Apex", min: 8000, blurb: "Exceptional reputation" },
] as const;

export function levelFor(points: number) {
  let lvl: (typeof LEVELS)[number] = LEVELS[0];
  for (const l of LEVELS) if (points >= l.min) lvl = l;
  return lvl;
}

// ── FoxAgent templates ─────────────────────────────────────────────
export type AgentTemplate = "trader" | "researcher" | "merchant" | "liquidity" | "treasurer" | "builder";

export const AGENTS: { id: AgentTemplate; name: string; does: string; perms: string[] }[] = [
  { id: "trader", name: "FoxTrader", does: "Watches markets and executes swaps you've approved.", perms: ["swap"] },
  { id: "researcher", name: "FoxResearcher", does: "Tracks tokens, launches and wallets. Read-only, never signs.", perms: [] },
  { id: "merchant", name: "FoxMerchant", does: "Lists, delists and accepts offers on FoxMarket within your limits.", perms: ["market"] },
  { id: "liquidity", name: "FoxLiquidity", does: "Rebalances approved liquidity positions and harvests fees.", perms: ["liquidity"] },
  { id: "treasurer", name: "FoxTreasurer", does: "Claims rewards and sweeps balances to your main wallet.", perms: ["claim", "sweep"] },
  { id: "builder", name: "FoxBuilder", does: "Interacts with approved Foundry and deployment tools.", perms: ["foundry"] },
];

export const PERMISSIONS: { id: string; label: string; risk: "low" | "medium" | "high" }[] = [
  { id: "claim", label: "Claim rewards into the vault", risk: "low" },
  { id: "sweep", label: "Send vault balance to my wallet only", risk: "low" },
  { id: "swap", label: "Swap between approved tokens", risk: "medium" },
  { id: "liquidity", label: "Add or remove approved liquidity", risk: "medium" },
  { id: "market", label: "List or buy on FoxMarket", risk: "medium" },
  { id: "foundry", label: "Use Foundry tools", risk: "medium" },
  { id: "transfer", label: "Transfer to any address", risk: "high" },
  { id: "approve", label: "Grant new token approvals", risk: "high" },
];

// ── Revenue split (illustrative, per $10,000 of eligible net revenue) ──
export const REVENUE_SPLIT = [
  { to: "Genesis Fox vaults", pct: 30, color: "#F27A1A" },
  { to: "Treasury", pct: 25, color: "#9C8CFF" },
  { to: "Liquidity", pct: 20, color: "#5EE6A8" },
  { to: "Development", pct: 15, color: "#6FB7FF" },
  { to: "Ecosystem incentives", pct: 10, color: "#F2C14E" },
];

// ── Roadmap (a real sequence) ──────────────────────────────────────
export const ROADMAP = [
  { phase: "Genesis & infrastructure", items: ["Genesis mint of 2,626 Foxes", "FoxVault: a wallet for every Fox", "Fox profiles and the Console"], state: "now" },
  { phase: "DeFi & economy", items: ["$FOX token, staking and locker", "FoxRewards from real revenue", "FoxFoundry launchpad"], state: "next" },
  { phase: "AI operators", items: ["FoxAgents with on-chain spending policies", "Operator templates", "Agent marketplace"], state: "later" },
  { phase: "Ecosystem expansion", items: ["FoxMarket", "Reputation and progression", "Fox Businesses and governance"], state: "later" },
] as const;

export const LS_ALLOWLIST = "foxysium_allowlist_submitted";
