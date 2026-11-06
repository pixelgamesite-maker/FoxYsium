import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X, LogOut } from "lucide-react";
import FoxMark, { Wordmark } from "@/components/FoxMark";
import { useWallet } from "@/hooks/use-wallet";
import { useDenAuth } from "@/hooks/use-den-auth";
import { NAV, RESOURCES } from "./nav";
import { cn } from "@/lib/utils";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const { address, disconnect } = useWallet();
  const { signOut } = useDenAuth();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const item = (p: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const active = p.path === "/" ? location === "/" : location.startsWith(p.path);
    return (
      <Link
        key={p.path}
        href={p.path}
        onClick={onClose}
        className={cn(
          "flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[17px] font-semibold border-[2.5px] transition-colors",
          active ? "bg-fur text-ink border-ink shadow-[3px_3px_0_var(--color-ink)]" : "border-transparent text-mist hover:text-belly hover:bg-dusk-3",
        )}
      >
        <p.icon className="h-5 w-5 shrink-0" />
        {p.label}
      </Link>
    );
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <nav className="slide-in absolute left-0 top-0 bottom-0 w-[min(320px,86vw)] bg-dusk-2 border-r-[3px] border-ink flex flex-col">
        <div className="h-16 flex items-center justify-between px-4 border-b-[3px] border-ink shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <FoxMark size={34} />
            <Wordmark size={21} />
          </Link>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dusk-3" aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map(item)}
          <div className="pt-5 pb-2 px-3.5 text-[14px] font-semibold text-haze">Resources</div>
          {RESOURCES.map(item)}
        </div>
        {address && (
          <div className="p-3 border-t-[3px] border-ink">
            <div className="font-mono text-[12px] text-haze px-2 mb-2 truncate">{address}</div>
            <button
              onClick={() => {
                signOut();
                disconnect();
                onClose();
              }}
              className="flex items-center gap-3 w-full px-3.5 py-3 rounded-2xl text-mist hover:text-rose hover:bg-dusk-3 font-semibold"
            >
              <LogOut className="h-5 w-5" /> Disconnect
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
