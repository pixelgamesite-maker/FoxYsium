import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useBlockNumber } from "wagmi";
import { Topbar } from "./Topbar";
import FoxMark, { Wordmark } from "@/components/FoxMark";
import { elysium } from "@/lib/wagmi";
import { SUPPLY, TELEGRAM_URL, X_URL } from "@/lib/foxysium-constants";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  useEffect(() => window.scrollTo(0, 0), [location]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Topbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pb-20">{children}</main>
      <Footer />
    </div>
  );
}

function Footer() {
  const { data: block, isError } = useBlockNumber({ chainId: elysium.id, query: { refetchInterval: 15_000 } });
  return (
    <footer className="border-t border-line bg-dusk-2/60">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex items-start gap-3">
          <FoxMark size={44} />
          <div>
            <Wordmark size={24} />
            <p className="text-haze mt-1.5 text-[15px]">{SUPPLY.toLocaleString()} Genesis Foxes on Kinetiq Elysium.</p>
            <p className="mt-3 inline-flex items-center gap-2 text-[14px] text-mist">
              <span className={cn("h-2.5 w-2.5 rounded-full", block && !isError ? "bg-mint" : "bg-haze")} />
              {elysium.name}
              <span className="font-mono text-[12px] text-haze">{block ? `#${block.toLocaleString()}` : isError ? "offline" : "…"}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-semibold text-mist md:justify-end">
          <Link href="/guide" className="hover:text-belly">Guide</Link>
          <Link href="/docs" className="hover:text-belly">Docs</Link>
          {X_URL && <a href={X_URL} target="_blank" rel="noreferrer" className="hover:text-belly">X</a>}
          {TELEGRAM_URL && <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-belly">Telegram</a>}
          <Link href="/terms" className="text-haze font-normal hover:text-belly">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
