import { useState } from "react";
import { useLocation } from "wouter";
import { Wallet, Bot, Trophy, Fingerprint, Search } from "lucide-react";
import { PageHeader, SectionTitle, Row, ButtonLink } from "@/components/den";
import AllowlistForm from "@/components/AllowlistForm";
import { useEconomy, useAllowlistCount } from "@/hooks/use-foxes";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import { ART, CLASSES, MINT_PLATFORM, MINT_PRICE, MINT_STATUS, OPENSEA_URL, RARITY, SUPPLY } from "@/lib/foxbank-constants";
import { CONTRACTS } from "@/lib/contracts";
import { robinhood, explorerAddress } from "@/lib/wagmi";
import { fmtInt, short } from "@/lib/format";

const OWN = [
  { icon: Fingerprint, title: "An identity", body: "Original art, a class and a rarity tier. Your Fox is your identity across the ecosystem." },
  { icon: Wallet, title: "Its own vault", body: "An ERC-6551 account tied to the token. Rewards land here and travel with the Fox when it changes hands." },
  { icon: Bot, title: "An optional agent", body: "Switch on an AI operator for this Fox, with spending limits enforced by contract." },
  { icon: Trophy, title: "A record", body: "Reputation that grows with what the Fox actually does: launches, governance, market activity." },
];

export default function Genesis() {
  useHashScroll();
  const e = useEconomy();
  const { data: allowlisted } = useAllowlistCount();

  return (
    <>
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-end">
        <PageHeader
          title="Genesis"
          lede={`${SUPPLY.toLocaleString()} Foxes, fixed forever. Each one carries its own wallet, and holding one is how you take part in everything FoxBank builds.`}
        >
          {OPENSEA_URL ? (
            <>
              <ButtonLink href={OPENSEA_URL}>Mint on {MINT_PLATFORM}</ButtonLink>
              <ButtonLink href="#allowlist" variant="ghost">Join the allowlist</ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="#allowlist">Join the allowlist</ButtonLink>
              <span className="chip bg-dusk-2 text-mist !py-2 !px-4 text-[15px]">
                <span className="h-2 w-2 rounded-full bg-fur" /> Minting on {MINT_PLATFORM} soon
              </span>
            </>
          )}
        </PageHeader>
        <div className="sticker p-5 mb-8">
          <Row k="Supply" v={SUPPLY.toLocaleString()} />
          <Row k="Mint price" v={MINT_PRICE} />
          <Row k="Mint on" v={OPENSEA_URL ? <a href={OPENSEA_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2">{MINT_PLATFORM}</a> : `${MINT_PLATFORM} (link soon)`} />
          <Row k="Network" v={robinhood.name} />
          <Row k="Status" v={e.live.genesis ? `${fmtInt(e.minted)} minted` : MINT_STATUS === "allowlist" ? "Allowlist open" : MINT_STATUS} />
          {allowlisted !== undefined && <Row k="On the allowlist" v={fmtInt(allowlisted)} />}
          <Row
            k="Contract"
            mono={!!CONTRACTS.genesis}
            v={
              CONTRACTS.genesis ? (
                <a className="underline underline-offset-2" href={explorerAddress(CONTRACTS.genesis)} target="_blank" rel="noreferrer">
                  {short(CONTRACTS.genesis)}
                </a>
              ) : (
                `Deployed on ${MINT_PLATFORM} at mint`
              )
            }
          />
        </div>
      </div>

      <section>
        <SectionTitle>What you own</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OWN.map((o) => (
            <div key={o.title} className="sticker-sm p-5">
              <o.icon className="h-7 w-7 text-fur" strokeWidth={2.2} />
              <div className="mt-3 font-semibold text-xl">{o.title}</div>
              <p className="mt-1.5 text-mist leading-snug">{o.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid lg:grid-cols-2 gap-6">
        <div>
          <SectionTitle>Classes</SectionTitle>
          <div className="sticker p-2">
            {CLASSES.map((c) => (
              <div key={c.name} className="flex gap-4 p-3.5 border-b border-line last:border-0">
                <span className="mt-2 h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                <div>
                  <div className="font-semibold text-lg leading-tight">
                    {c.name} <span className="text-haze font-medium text-[15px]">· {c.role}</span>
                  </div>
                  <p className="text-mist mt-0.5 leading-snug">{c.perk}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-haze text-[14px] mt-3">Every Fox gets the core ecosystem. Class adds on top; it never locks you out.</p>
        </div>
        <div>
          <SectionTitle>Rarity</SectionTitle>
          <div className="sticker p-5">
            {RARITY.map((r) => {
              const p = (r.supply / SUPPLY) * 100;
              return (
                <div key={r.tier} className="py-2.5">
                  <div className="flex justify-between font-semibold">
                    <span>{r.tier}</span>
                    <span className="num text-mist">
                      {r.supply.toLocaleString()} <span className="text-haze">· {p.toFixed(2)}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-3 rounded-full bg-ink overflow-hidden">
                    <div className="h-full bg-fur rounded-full" style={{ width: `${Math.max(p, 2)}%` }} />
                  </div>
                </div>
              );
            })}
            <p className="text-haze text-[14px] mt-3">
              Proposed distribution. Rarity can boost multipliers and cosmetics, but it never decides all of a Fox's rewards.
            </p>
          </div>
        </div>
      </section>

      <Gallery />

      <section id="allowlist" className="mt-16 scroll-mt-24 grid lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
        <div>
          <SectionTitle>Get on the allowlist</SectionTitle>
          <p className="text-mist leading-relaxed max-w-[50ch]">
            Allowlist wallets mint on {MINT_PLATFORM} before the public phase. Connect the wallet you'll mint with and sign
            a message to prove it's yours. No gas, no approvals.
          </p>
          <div className="mt-6 hidden lg:block sticker overflow-hidden p-0 aspect-[4/3] relative" style={{ backgroundColor: ART[4].bg }}>
            <img src={ART[4].src} alt={ART[4].alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_20%]" />
          </div>
        </div>
        <AllowlistForm />
      </section>
    </>
  );
}

function Gallery() {
  const [, nav] = useLocation();
  const [q, setQ] = useState("");
  return (
    <section className="mt-16">
      <SectionTitle
        action={
          OPENSEA_URL ? (
            <a href={OPENSEA_URL} target="_blank" rel="noreferrer" className="font-medium text-fur-2 hover:underline underline-offset-4 shrink-0">
              Browse on {MINT_PLATFORM}
            </a>
          ) : undefined
        }
      >
        A first look
      </SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {ART.map((a) => (
          <figure key={a.src} className="sticker-sm overflow-hidden p-0 aspect-square" style={{ backgroundColor: a.bg }}>
            <img src={a.sm} srcSet={`${a.sm} 560w, ${a.src} 1200w`} sizes="(min-width: 768px) 33vw, 50vw" alt={a.alt} loading="lazy" className="h-full w-full object-cover" />
          </figure>
        ))}
      </div>
      <p className="text-haze text-[14px] mt-3">Previews from the collection. Token numbers are assigned at mint.</p>

      <form
        className="flex gap-2 mt-8 max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(q);
          if (Number.isInteger(n) && n >= 1 && n <= SUPPLY) nav(`/fox/${n}`);
        }}
      >
        <label htmlFor="foxq" className="sr-only">
          Look up a Fox by number
        </label>
        <input id="foxq" className="field" inputMode="numeric" placeholder={`Look up a Fox, 1 to ${SUPPLY}`} value={q} onChange={(e) => setQ(e.target.value.replace(/\D/g, ""))} />
        <button className="btn btn-fur !px-0 w-12 shrink-0" aria-label="Look up Fox">
          <Search className="h-5 w-5" />
        </button>
      </form>
    </section>
  );
}
