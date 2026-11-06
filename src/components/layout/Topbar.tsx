import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, AlertTriangle, Lock } from "lucide-react";
import FoxMark, { Wordmark } from "@/components/FoxMark";
import { useWallet } from "@/hooks/use-wallet";
import { ConnectWalletDialog } from "@/components/wallet/ConnectWalletDialog";
import { MobileNav } from "./MobileNav";
import { NAV } from "./nav";
import { TOKEN_SYMBOL } from "@/lib/foxysium-constants";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { shortAddress, isWrongNetwork, switchToElysium } = useWallet();
  const [connectOpen, setConnectOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [location] = useLocation();

  return (
    <>
      <header className="sticky top-0 z-40 bg-dusk/90 backdrop-blur-md border-b-[3px] border-ink">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center gap-3">
          <button
            onClick={() => setNavOpen(true)}
            className="h-11 w-11 -ml-1 grid place-items-center rounded-xl hover:bg-dusk-2 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="FoxYsium home">
            <FoxMark size={34} />
            <span className="hidden sm:inline">
              <Wordmark size={21} />
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-4 text-[15px] font-semibold">
            {NAV.slice(1, 8).map((n) => {
              const active = location.startsWith(n.path);
              return (
                <Link
                  key={n.path}
                  href={n.path}
                  className={cn("px-3 py-2 rounded-xl", active ? "bg-dusk-2 text-fur" : "text-mist hover:text-belly")}
                >
                  {n.label}
                  {n.locked && <Lock className="inline h-3.5 w-3.5 ml-1 -mt-0.5 opacity-70" aria-label="Locked" />}
                </Link>
              );
            })}
            <button onClick={() => setNavOpen(true)} className="px-3 py-2 rounded-xl text-mist hover:text-belly">
              More
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            {isWrongNetwork ? (
              <button onClick={switchToElysium} className="btn btn-sm bg-rose text-ink">
                <AlertTriangle className="h-4 w-4" /> Switch network
              </button>
            ) : (
              <Link href="/swap" className="btn btn-sm btn-belly">
                Buy ${TOKEN_SYMBOL}
              </Link>
            )}
            {shortAddress ? (
              <Link href="/console" className="btn btn-sm btn-ghost font-mono text-[13px]">
                {shortAddress}
              </Link>
            ) : (
              <button onClick={() => setConnectOpen(true)} className="btn btn-sm btn-fur">
                Connect
              </button>
            )}
          </div>
        </div>
      </header>
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
      <ConnectWalletDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </>
  );
}
