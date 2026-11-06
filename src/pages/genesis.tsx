import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Wallet, Bot, Trophy, Fingerprint, Search } from "lucide-react";
import { PageHeader, SectionTitle, Row, ButtonLink } from "@/components/den";
import AllowlistForm from "@/components/AllowlistForm";
import FoxArt from "@/components/FoxArt";
import { useEconomy, useAllowlistCount } from "@/hooks/use-foxes";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import { CLASSES, HERO_ART, MINT_PLATFORM, MINT_PRICE, MINT_STATUS, OPENSEA_URL, RARITY, SUPPLY } from "@/lib/foxysium-constants";
import { CONTRACTS } from "@/lib/contracts";
import { elysium, explorerAddress } from "@/lib/wagmi";
import { fmtInt, short } from "@/lib/format";

const OWN = [
  { icon: Fingerprint, title: "An identity", body: "Unique art, a class and a rarity tier. Your Fox is your face in the den." },
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
          lede={`${SUPPLY.toLocaleString()} Foxes. That's the whole collection, fixed forever. Every one is a member of the den with its own wallet, and holding one is how you take part in everything FoxYsium builds.`}
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
          <Row k="Network" v={elysium.name} />
          <Row k="Status" v={e.live.genesis ? `${fmtInt(e.minted)} minted` : MINT_STATUS === "allowlist" ? "Allowlist open" : MINT_STATUS} />
          {allowlisted !== undefined && <Row k="On the allowlist" v={fmtInt(allowlisted)} />}
          <Row
            k="Contract"
            mono
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
              <div className="mt-3 font-extrabold text-xl">{o.title}</div>
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
              <div key={c.name} className="flex gap-4 p-3.5 border-b-2 border-dusk-3 last:border-0">
                <span className="h-10 w-10 rounded-xl border-[2.5px] border-ink shrink-0" style={{ background: c.color }} />
                <div>
                  <div className="font-extrabold text-lg leading-tight">
                    {c.name} <span className="text-haze font-semibold text-[15px]">· {c.role}</span>
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
          <div className="mt-6 hidden lg:block sticker overflow-hidden p-0 bg-gold h-[280px] relative">
            <img src={HERO_ART} alt="" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[96%] w-auto max-w-none -scale-x-100" />
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
  const ids = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <section className="mt-16">
      <SectionTitle>The collection</SectionTitle>
      <form
        className="flex gap-2 mb-5 max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(q);
          if (Number.isInteger(n) && n >= 1 && n <= SUPPLY) nav(`/fox/${n}`);
        }}
      >
        <label htmlFor="foxq" className="sr-only">
          Find a Fox by number
        </label>
        <input id="foxq" className="field" inputMode="numeric" placeholder={`Find a Fox, 1–${SUPPLY}`} value={q} onChange={(e) => setQ(e.target.value.replace(/\D/g, ""))} />
        <button className="btn btn-fur !px-0 w-12 shrink-0" aria-label="Find Fox">
          <Search className="h-5 w-5" />
        </button>
      </form>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {ids.map((id, i) => (
          <Link key={id} href={`/fox/${id}`} className="sticker-sm overflow-hidden p-0 block group">
            <div className="aspect-square bg-dusk">
              <FoxArt id={id} className="h-full w-full" tint={CLASSES[i % 5].color} />
            </div>
            <div className="px-2.5 py-2 border-t-[2.5px] border-ink font-bold text-[14px] group-hover:text-fur">Fox #{id}</div>
          </Link>
        ))}
      </div>
      <p className="text-haze text-[14px] mt-3">
        Art reveals at mint. Until then, every Fox is a silhouette.
        {OPENSEA_URL && (
          <>
            {" "}
            <a href={OPENSEA_URL} target="_blank" rel="noreferrer" className="text-fur-2 underline underline-offset-2">Browse on {MINT_PLATFORM}</a>
          </>
        )}
      </p>
    </section>
  );
}
