import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AlertTriangle, X } from "lucide-react";
import FoxMark, { Wordmark } from "@/components/FoxMark";
import { useWallet } from "@/hooks/use-wallet";
import { ConnectWalletDialog } from "@/components/wallet/ConnectWalletDialog";
import { DenMenu } from "./DenMenu";
import { ALL_ITEMS, HEADER_LINKS } from "./nav";
import { cn } from "@/lib/utils";

/** Four paw-pad dots: the menu glyph. */
function PawGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <g fill="currentColor">
        <circle cx="5" cy="5" r="2.6" />
        <circle cx="15" cy="5" r="2.6" />
        <circle cx="5" cy="15" r="2.6" />
        <circle cx="15" cy="15" r="2.6" />
      </g>
    </svg>
  );
}

export function Topbar() {
  const { shortAddress, isWrongNetwork, switchToRobinhood } = useWallet();
  const [connectOpen, setConnectOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const links = ALL_ITEMS.filter((i) => HEADER_LINKS.includes(i.path));

  return (
    <>
      <header className="sticky top-0 z-[60] bg-dusk/90 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="FoxBank home">
            <FoxMark size={36} />
            <Wordmark size={21} />
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-6 text-[15px] font-medium">
            {links.map((n) => (
              <Link
                key={n.path}
                href={n.path}
                className={cn("px-3 py-2 rounded-xl", location.startsWith(n.path) ? "bg-dusk-2 text-fur" : "text-mist hover:text-belly")}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {isWrongNetwork ? (
              <button onClick={switchToRobinhood} className="btn btn-sm bg-rose text-ink">
                <AlertTriangle className="h-4 w-4" /> <span className="hidden sm:inline">Switch network</span>
              </button>
            ) : shortAddress ? (
              <Link href="/console" className="btn btn-sm btn-ghost font-mono text-[13px]">
                {shortAddress}
              </Link>
            ) : (
              <button onClick={() => setConnectOpen(true)} className="btn btn-sm btn-fur">
                Connect
              </button>
            )}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={cn("btn btn-sm gap-2", menuOpen ? "btn-belly" : "btn-ghost")}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <PawGlyph />}
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>
      <DenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <ConnectWalletDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </>
  );
}
