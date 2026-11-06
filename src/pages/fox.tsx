import { useParams } from "wouter";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import FoxArt from "@/components/FoxArt";
import { Row, SectionTitle, NotLive, EmptyState, ButtonLink } from "@/components/den";
import { useFoxOwner, useFoxVault, useReputation, useActivity } from "@/hooks/use-foxes";
import { useTx } from "@/hooks/use-tx";
import { CONTRACTS, registryAbi, VAULT_SALT } from "@/lib/contracts";
import { elysium, explorerAddress, explorerTx } from "@/lib/wagmi";
import { LEVELS, levelFor, MINT_PLATFORM, OPENSEA_ITEM_BASE, SUPPLY } from "@/lib/foxysium-constants";
import { ago, fmtToken, short } from "@/lib/format";
import NotFound from "./not-found";

export default function FoxProfile() {
  const { id: raw } = useParams<{ id: string }>();
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1 || id > SUPPLY) return <NotFound />;
  return <Profile id={id} />;
}

function Profile({ id }: { id: number }) {
  const { address } = useAccount();
  const { data: owner } = useFoxOwner(id);
  const v = useFoxVault(id);
  const { data: rep } = useReputation(id);
  const { data: activity } = useActivity({ foxId: id, limit: 10 });
  const { run, pending } = useTx();
  const isOwner = !!owner && !!address && owner.toLowerCase() === address.toLowerCase();
  const points = rep?.points ?? 0;
  const lvl = levelFor(points);
  const next = LEVELS.find((l) => l.min > points);

  const activate = () =>
    run("Activate vault", {
      address: CONTRACTS.vaultRegistry!,
      abi: registryAbi,
      functionName: "createAccount",
      args: [CONTRACTS.vaultImplementation!, VAULT_SALT, BigInt(elysium.id), CONTRACTS.genesis!, BigInt(id)],
    });

  return (
    <div className="pt-6 md:pt-10 grid lg:grid-cols-[minmax(0,420px)_1fr] gap-8 items-start">
      <div className="sticker overflow-hidden p-0 lg:sticky lg:top-24">
        <div className="aspect-square bg-dusk">
          <FoxArt id={id} className="h-full w-full" />
        </div>
        <div className="p-5 border-t-[3px] border-ink">
          <h1 className="text-4xl font-extrabold">Fox #{id}</h1>
          <div className="mt-1 text-mist">
            {rep?.fox_class ?? "Class revealed at mint"} · <span className="text-fur font-semibold">{lvl.name}</span>
          </div>
        </div>
      </div>

      <div className="space-y-10 min-w-0">
        <section>
          <SectionTitle>Ownership</SectionTitle>
          <div className="sticker p-5">
            <Row
              k="Held by"
              mono
              v={
                !CONTRACTS.genesis ? "Not minted yet" : owner ? (
                  <a href={explorerAddress(owner)} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    {isOwner ? "You" : short(owner)}
                  </a>
                ) : (
                  "Unminted"
                )
              }
            />
            <Row k="Token ID" v={`#${id}`} />
            {OPENSEA_ITEM_BASE && (
              <Row
                k="Marketplace"
                v={
                  <a href={`${OPENSEA_ITEM_BASE}${id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 underline underline-offset-2">
                    View on {MINT_PLATFORM} <ExternalLink className="h-4 w-4" />
                  </a>
                }
              />
            )}
            <Row k="Network" v={elysium.name} />
          </div>
        </section>

        <section id="vault">
          <SectionTitle>FoxVault</SectionTitle>
          {!v.configured ? (
            <NotLive what="FoxVault">
              Vaults switch on once the Genesis contract and the vault implementation are deployed. Each Fox's address is
              fixed in advance, so anything sent to it later will be waiting.
            </NotLive>
          ) : (
            <div className="sticker p-5">
              <Row
                k="Vault address"
                mono
                v={
                  v.vault ? (
                    <span className="inline-flex items-center gap-2">
                      {short(v.vault, 6)}
                      <button aria-label="Copy vault address" onClick={() => navigator.clipboard.writeText(v.vault!)} className="text-haze hover:text-belly">
                        <Copy className="h-4 w-4" />
                      </button>
                      <a aria-label="Vault on explorer" href={explorerAddress(v.vault)} target="_blank" rel="noreferrer" className="text-haze hover:text-belly">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </span>
                  ) : (
                    "…"
                  )
                }
              />
              <Row k="Status" v={v.deployed ? <span className="text-mint">Active</span> : "Not activated (address reserved)"} />
              <Row k="HYPE balance" v={fmtToken(v.hype?.value, 18, 4)} />
              {isOwner && !v.deployed && (
                <button className="btn btn-fur mt-4" onClick={activate} disabled={!!pending}>
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />} Activate vault
                </button>
              )}
              <p className="text-haze text-[14px] mt-4">
                Selling this Fox hands its vault to the buyer. Withdraw anything you want to keep before listing.
              </p>
            </div>
          )}
        </section>

        <section>
          <SectionTitle>Reputation</SectionTitle>
          <div className="sticker p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="num text-5xl font-extrabold">{points.toLocaleString()}</div>
                <div className="text-mist">points · {lvl.name}, {lvl.blurb.toLowerCase()}</div>
              </div>
              {next && <div className="text-right text-haze text-[15px]">{(next.min - points).toLocaleString()} to {next.name}</div>}
            </div>
            <div className="mt-4 flex gap-1.5">
              {LEVELS.map((l) => (
                <div key={l.name} className="flex-1">
                  <div className={`h-3 rounded-full border-2 border-ink ${points >= l.min ? "bg-fur" : "bg-dusk"}`} />
                  <div className={`mt-1.5 text-[13px] font-semibold ${points >= l.min ? "text-belly" : "text-haze"}`}>{l.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionTitle action={isOwner ? <ButtonLink href={`/agents?fox=${id}`} variant="ghost" className="btn-sm">Configure agent</ButtonLink> : undefined}>
            Activity
          </SectionTitle>
          {activity && activity.length ? (
            <ul className="sticker p-2">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 p-3 border-b-2 border-dusk-3 last:border-0">
                  <span className="font-semibold min-w-0 truncate">{a.title}</span>
                  <span className="text-haze text-[14px] shrink-0">
                    {a.tx_hash ? (
                      <a href={explorerTx(a.tx_hash)} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                        {ago(a.created_at)}
                      </a>
                    ) : (
                      ago(a.created_at)
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Nothing yet">Rewards, launches and agent actions for this Fox will show up here.</EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}
