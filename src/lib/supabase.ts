import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Null when env vars are missing so the site still renders (read-only, empty
// states) in a fresh clone or preview without a Supabase project.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "foxysium-auth" },
    })
  : null;

// ── Row types (mirror supabase/migrations/0001_init.sql) ───────────
export interface Launch {
  id: string;
  creator_wallet: string;
  name: string;
  ticker: string;
  description: string | null;
  image_url: string | null;
  total_supply: number;
  creator_fee_bps: number;
  reward_mode: "hype" | "fox" | "none";
  linked_fox_id: number | null;
  token_address: string | null;
  website: string | null;
  x_url: string | null;
  status: "review" | "live" | "rejected";
  price_usd: number | null;
  market_cap_usd: number | null;
  liquidity_usd: number | null;
  volume_24h_usd: number | null;
  change_24h_pct: number | null;
  created_at: string;
}

export interface AgentConfig {
  id: string;
  fox_id: number;
  owner_wallet: string;
  template: string;
  status: "draft" | "paused" | "active";
  per_tx_limit_usd: number;
  daily_budget_usd: number;
  permissions: string[];
  updated_at: string;
}

export interface ReputationRow {
  fox_id: number;
  owner_wallet: string | null;
  points: number;
  fox_class: string | null;
  updated_at: string;
}

export interface ActivityRow {
  id: string;
  kind: string;
  title: string;
  fox_id: number | null;
  wallet: string | null;
  tx_hash: string | null;
  created_at: string;
}
