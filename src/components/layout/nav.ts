import {
  Home, Sparkles, Rocket, ArrowLeftRight, Coins, Lock, Droplets, Trophy, Bot, LayoutGrid,
  BookOpen, FileText, type LucideIcon,
} from "lucide-react";
import { FOUNDRY_LOCKED } from "@/lib/foxbank-constants";

export type NavItem = { path: string; label: string; blurb: string; icon: LucideIcon; locked?: boolean };
export type NavGroup = { name: string; color: string; items: NavItem[] };

/** The den map: every destination, grouped by what you came to do. */
export const GROUPS: NavGroup[] = [
  {
    name: "Collect",
    color: "#F27A1A",
    items: [
      { path: "/genesis", label: "Genesis", blurb: "The 2,626 Foxes", icon: Sparkles },
      { path: "/console", label: "Console", blurb: "Your Foxes and vaults", icon: LayoutGrid },
      { path: "/leaderboard", label: "Leaderboard", blurb: "Top reputation", icon: Trophy },
    ],
  },
  {
    name: "Earn",
    color: "#5EE6A8",
    items: [
      { path: "/staking", label: "Staking", blurb: "Share in den revenue", icon: Coins },
      { path: "/locker", label: "Locker", blurb: "Lock for privileges", icon: Lock },
      { path: "/liquidity", label: "Liquidity", blurb: "Earn trading fees", icon: Droplets },
      { path: "/swap", label: "Get $FOX", blurb: "Swap with ETH", icon: ArrowLeftRight },
    ],
  },
  {
    name: "Build",
    color: "#9C8CFF",
    items: [
      { path: "/foundry", label: "Foundry", blurb: "Opens after mint", icon: Rocket, locked: FOUNDRY_LOCKED },
      { path: "/agents", label: "Agents", blurb: "Put a Fox to work", icon: Bot },
    ],
  },
  {
    name: "Learn",
    color: "#F2C14E",
    items: [
      { path: "/guide", label: "Guide", blurb: "Start in seven steps", icon: BookOpen },
      { path: "/docs", label: "Docs", blurb: "How it all works", icon: FileText },
    ],
  },
];

export const HOME: NavItem = { path: "/", label: "Home", blurb: "Home", icon: Home };

/** Shown inline in the desktop header. Everything else lives in the menu. */
export const HEADER_LINKS = ["/genesis", "/staking", "/agents", "/console"];

export const ALL_ITEMS: NavItem[] = GROUPS.flatMap((g) => g.items);
