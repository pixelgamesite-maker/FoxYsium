import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Topbar } from "./Topbar";
import { Wordmark } from "@/components/FoxMark";
import { RESOURCES } from "./nav";
import { elysium } from "@/lib/wagmi";
import { useBlockNumber } from "wagmi";
import { SUPPLY, TELEGRAM_URL, X_URL } from "@/lib/foxysium-constants";
import { Send } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  useEffect(() => window.scrollTo(0, 0), [location]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Topbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pb-16">{children}</main>
      <Footer />
      <StatusBar />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-dusk-2/60 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div>
          <Wordmark size={24} />
          <p className="text-haze mt-2 text-[15px]">
            {SUPPLY.toLocaleString()} Genesis Foxes on Kinetiq Elysium.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-semibold text-mist">
          {RESOURCES.map((r) => (
            <Link key={r.path} href={r.path} className="hover:text-belly">
              {r.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

/** Fixed bottom bar, like a status line: network heartbeat + socials. */
function StatusBar() {
  const { data: block, isError } = useBlockNumber({ chainId: elysium.id, watch: true, query: { refetchInterval: 12_000 } });
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-ink/95 backdrop-blur border-t-[3px] border-ink">
      <div className="max-w-6xl mx-auto h-14 px-4 flex items-center gap-3 text-[14px]">
        <span className={`h-2.5 w-2.5 rounded-full ${block && !isError ? "bg-mint" : "bg-haze"}`} />
        <span className="text-mist font-semibold truncate">{elysium.name}</span>
        <span className="num text-haze font-mono text-[12px]">
          {block ? `#${block.toLocaleString()}` : isError ? "RPC unreachable" : "connecting…"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {X_URL && (
            <a href={X_URL} target="_blank" rel="noreferrer" aria-label="FoxYsium on X" className="h-10 w-10 grid place-items-center rounded-xl hover:bg-dusk-2 font-extrabold text-[17px]">
              𝕏
            </a>
          )}
          {TELEGRAM_URL && (
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" aria-label="FoxYsium on Telegram" className="h-10 w-10 grid place-items-center rounded-xl hover:bg-dusk-2">
              <Send className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
