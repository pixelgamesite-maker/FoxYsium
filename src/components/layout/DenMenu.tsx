import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Lock, LogOut } from "lucide-react";
import { useBlockNumber } from "wagmi";
import FoxMark from "@/components/FoxMark";
import { useWallet } from "@/hooks/use-wallet";
import { useDenAuth } from "@/hooks/use-den-auth";
import { elysium } from "@/lib/wagmi";
import { TELEGRAM_URL, X_URL } from "@/lib/foxysium-constants";
import { GROUPS, HOME } from "./nav";
import { cn } from "@/lib/utils";

/**
 * The den map. A bottom sheet on phones, a panel under the header on
 * desktop. Destinations are tiles grouped by intent, not a flat list.
 */
export function DenMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={panel}
        className={cn(
          "sheet-up absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto",
          "bg-dusk-2 border-t-[3px] border-ink rounded-t-[28px]",
          "md:sheet-down md:bottom-auto md:top-[76px] md:inset-x-auto md:right-[max(16px,calc((100vw-72rem)/2+16px))] md:w-[680px] md:max-h-[calc(100dvh-96px)]",
          "md:border-[3px] md:rounded-[26px] md:shadow-[8px_8px_0_var(--color-ink)]",
        )}
      >
        {/* grab handle on phones */}
        <div className="md:hidden pt-3 flex justify-center">
          <span className="h-1.5 w-12 rounded-full bg-dusk-3" />
        </div>

        <div className="flex items-center justify-between px-5 pt-3 md:pt-5 pb-1">
          <Link href={HOME.path} onClick={onClose} className={cn("inline-flex items-center gap-2.5 font-extrabold text-xl", location === "/" && "text-fur")}>
            <FoxMark size={30} /> Where to?
          </Link>
          <span className="text-[14px] text-haze hidden sm:inline">Esc to close</span>
        </div>

        <div className="px-4 pb-4 grid md:grid-cols-2 gap-x-4">
          {GROUPS.map((g) => (
            <section key={g.name} className="mt-4">
              <h2 className="px-1 mb-2 flex items-center gap-2 text-[15px] font-bold text-mist">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-ink" style={{ background: g.color }} />
                {g.name}
              </h2>
              <div className="grid grid-cols-2 gap-2.5 [&>*:last-child:nth-child(odd)]:col-span-2">
                {g.items.map((it) => {
                  const active = location.startsWith(it.path);
                  return (
                    <Link
                      key={it.path}
                      href={it.path}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative rounded-2xl border-[2.5px] border-ink p-3 min-h-[92px] flex flex-col justify-between transition-[transform,background-color] active:translate-x-[2px] active:translate-y-[2px]",
                        active ? "bg-fur text-ink shadow-[3px_3px_0_var(--color-ink)]" : "bg-dusk hover:bg-dusk-3 shadow-[3px_3px_0_var(--color-ink)]",
                      )}
                    >
                      <span className="flex items-start justify-between">
                        <span
                          className="h-9 w-9 rounded-xl border-2 border-ink grid place-items-center"
                          style={{ background: active ? "var(--color-belly)" : g.color }}
                        >
                          <it.icon className="h-[18px] w-[18px] text-ink" strokeWidth={2.4} />
                        </span>
                        {it.locked && (
                          <span className={cn("chip !py-0 !px-2 text-[12px]", active ? "bg-ink text-belly" : "bg-dusk-3 text-mist border-transparent")}>
                            <Lock className="h-3 w-3" /> Soon
                          </span>
                        )}
                      </span>
                      <span className="mt-2">
                        <span className="block font-extrabold leading-tight">{it.label}</span>
                        <span className={cn("block text-[13px] leading-snug", active ? "text-ink/75" : "text-haze")}>{it.blurb}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <MenuFooter onClose={onClose} />
      </div>
    </div>
  );
}

function MenuFooter({ onClose }: { onClose: () => void }) {
  const { address, shortAddress, disconnect } = useWallet();
  const { signOut } = useDenAuth();
  const { data: block, isError } = useBlockNumber({ chainId: elysium.id, query: { refetchInterval: 15_000 } });

  return (
    <div className="border-t-[3px] border-ink bg-dusk/60 px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-3 pb-[max(16px,env(safe-area-inset-bottom))]">
      <span className="inline-flex items-center gap-2 text-[14px] text-mist">
        <span className={cn("h-2.5 w-2.5 rounded-full", block && !isError ? "bg-mint" : "bg-haze")} />
        {elysium.name}
        <span className="font-mono text-[12px] text-haze">{block ? `#${block.toLocaleString()}` : isError ? "offline" : "…"}</span>
      </span>
      <span className="ml-auto flex items-center gap-1">
        {X_URL && (
          <a href={X_URL} target="_blank" rel="noreferrer" aria-label="FoxYsium on X" className="h-10 w-10 grid place-items-center rounded-xl hover:bg-dusk-3 font-extrabold text-[17px]">
            𝕏
          </a>
        )}
        {TELEGRAM_URL && (
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" aria-label="FoxYsium on Telegram" className="h-10 px-3 grid place-items-center rounded-xl hover:bg-dusk-3 font-semibold text-[14px]">
            Telegram
          </a>
        )}
        {address && (
          <button
            onClick={() => {
              signOut();
              disconnect();
              onClose();
            }}
            className="inline-flex items-center gap-2 h-10 px-3 rounded-xl text-mist hover:text-rose hover:bg-dusk-3 text-[14px] font-semibold"
            title={address}
          >
            <span className="font-mono text-[12px]">{shortAddress}</span>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Disconnect</span>
          </button>
        )}
      </span>
    </div>
  );
}
