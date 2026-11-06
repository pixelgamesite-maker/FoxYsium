import {
  Home, Sparkles, Rocket, ArrowLeftRight, Coins, Lock, Droplets, Trophy, Bot, LayoutGrid,
  BookOpen, FileText, ScrollText, ShieldCheck, type LucideIcon,
} from "lucide-react";

export const NAV: { path: string; label: string; icon: LucideIcon }[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/genesis", label: "Genesis", icon: Sparkles },
  { path: "/foundry", label: "Foundry", icon: Rocket },
  { path: "/swap", label: "Swap", icon: ArrowLeftRight },
  { path: "/staking", label: "Staking", icon: Coins },
  { path: "/locker", label: "Locker", icon: Lock },
  { path: "/liquidity", label: "Liquidity", icon: Droplets },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/agents", label: "Agents", icon: Bot },
  { path: "/console", label: "Console", icon: LayoutGrid },
];

export const RESOURCES: { path: string; label: string; icon: LucideIcon }[] = [
  { path: "/guide", label: "Guide", icon: BookOpen },
  { path: "/docs", label: "Docs", icon: FileText },
  { path: "/terms", label: "Terms", icon: ScrollText },
  { path: "/privacy", label: "Privacy", icon: ShieldCheck },
];
