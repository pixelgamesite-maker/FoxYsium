import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Hourglass } from "lucide-react";

/** Page title block. `kicker` is a plain-language context line, not an eyebrow label. */
export function PageHeader({ title, lede, children }: { title: string; lede?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="pt-6 pb-8 md:pt-10 md:pb-10">
      <h1 className="text-[clamp(2.4rem,9vw,4.25rem)] font-extrabold leading-[0.95]">{title}</h1>
      {lede && <p className="mt-4 text-mist text-[17px] leading-relaxed max-w-[60ch]">{lede}</p>}
      {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <h2 className="text-[clamp(1.6rem,5vw,2.25rem)] font-extrabold leading-none">{children}</h2>
      {action}
    </div>
  );
}

export function Sticker({ className, children, as: As = "div" }: { className?: string; children: React.ReactNode; as?: React.ElementType }) {
  return <As className={cn("sticker p-5 md:p-6", className)}>{children}</As>;
}

/** Stat tile. Shows "Not live yet" when the backing contract isn't configured. */
export function StatTile({
  label,
  value,
  sub,
  tone = "belly",
  live = true,
  bar,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "belly" | "fur" | "mint" | "lilac";
  live?: boolean;
  bar?: number | null;
}) {
  const color = { belly: "text-belly", fur: "text-fur", mint: "text-mint", lilac: "text-lilac" }[tone];
  return (
    <div className="sticker-sm p-4 md:p-5 flex flex-col min-h-[128px]">
      <div className="text-[14px] font-semibold text-haze">{label}</div>
      {live ? (
        <div className={cn("num mt-2 text-[clamp(1.6rem,6vw,2.3rem)] font-extrabold leading-none", color)}>{value}</div>
      ) : (
        <div className="mt-2 flex items-center gap-2 text-mist font-semibold">
          <Hourglass className="h-4 w-4 text-lilac" /> Not live yet
        </div>
      )}
      {live && sub && <div className="mt-2 text-[14px] text-mist">{sub}</div>}
      {live && typeof bar === "number" && (
        <div className="mt-auto pt-3">
          <div className="h-2.5 rounded-full bg-ink overflow-hidden">
            <div className="h-full bg-fur rounded-full" style={{ width: `${Math.min(100, Math.max(0, bar))}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function NotLive({ what, children }: { what: string; children?: React.ReactNode }) {
  return (
    <div className="sticker-sm p-5 flex gap-4 items-start bg-dusk-3/40">
      <Hourglass className="h-6 w-6 text-lilac shrink-0 mt-0.5" />
      <div>
        <div className="font-bold text-[17px]">{what} isn't live yet</div>
        <div className="text-mist mt-1 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border-[3px] border-dashed border-dusk-3 p-8 text-center">
      <div className="font-bold text-lg">{title}</div>
      {children && <div className="text-mist mt-2 max-w-[48ch] mx-auto leading-relaxed">{children}</div>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function ButtonLink({ href, variant = "fur", className, children, external }: { href: string; variant?: "fur" | "belly" | "ghost"; className?: string; children: React.ReactNode; external?: boolean }) {
  const cls = cn("btn", `btn-${variant}`, className);
  if (href.startsWith("#"))
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  if (external || href.startsWith("http"))
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Row({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b-2 border-dusk-3 last:border-0">
      <span className="text-haze text-[15px]">{k}</span>
      <span className={cn("text-right font-semibold text-[15px] min-w-0 truncate", mono && "font-mono text-[13px]")}>{v}</span>
    </div>
  );
}
