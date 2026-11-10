import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SectionTitle, StatTile, EmptyState, ButtonLink, NotLive } from "@/components/den";
import { ConnectGate } from "@/components/wallet/ConnectGate";
import FoxArt from "@/components/FoxArt";
import { useWallet } from "@/hooks/use-wallet";
import { useDenAuth } from "@/hooks/use-den-auth";
import { useOwnedFoxes, useFoxVault } from "@/hooks/use-foxes";
import { useFoxToken } from "@/hooks/use-fox-token";
import { supabase, type Launch, type AgentConfig } from "@/lib/supabase";
import { CONTRACTS } from "@/lib/contracts";
import { AGENTS, FOUNDRY_LOCKED, TOKEN_SYMBOL } from "@/lib/foxbank-constants";
import { fmtToken } from "@/lib/format";

export default function Console() {
  return (
    <>
      <PageHeader title="Console" lede="Your Foxes, their vaults, and and everything you've set up." />
      <ConnectGate why="to open your Console">
        <Inner />
      </ConnectGate>
    </>
  );
}

function Inner() {
  const { address, eth } = useWallet();
  const { isSignedIn, signIn, signingIn } = useDenAuth();
  const foxes = useOwnedFoxes(address);
  const tok = useFoxToken(address, null);

  const mine = useQuery({
    queryKey: ["console", address, isSignedIn],
    enabled: !!supabase && isSignedIn,
    queryFn: async () => {
      const [l, a, w] = await Promise.all([
        supabase!.from("foundry_launches").select("*").order("created_at", { ascending: false }),
        supabase!.from("agent_configs").select("*"),
        supabase!.from("allowlist_entries").select("status").maybeSingle(),
      ]);
      const me = address!.toLowerCase();
      return {
        launches: ((l.data ?? []) as Launch[]).filter((x) => x.creator_wallet === me),
        agents: (a.data ?? []) as AgentConfig[],
        allowlist: (w.data as { status: string } | null)?.status ?? null,
      };
    },
  });

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatTile label="Foxes held" value={foxes.balance} live={foxes.live} tone="fur" />
        <StatTile label="ETH" value={fmtToken(eth?.value, 18, 4)} />
        <StatTile label={`$${TOKEN_SYMBOL}`} value={fmtToken(tok.balance)} live={!!CONTRACTS.fox} />
        <StatTile label="Allowlist" value={<span className="capitalize text-[1.3rem]">{mine.data?.allowlist ?? (isSignedIn ? "Not joined" : "Sign in to see")}</span>} />
      </div>

      <section className="mt-12">
        <SectionTitle>Your Foxes</SectionTitle>
        {!foxes.live ? (
          <NotLive what="Genesis">Your Foxes and their vaults show here once you mint.</NotLive>
        ) : foxes.ids.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {foxes.ids.map((id) => (
              <FoxCard key={id} id={id} />
            ))}
          </div>
        ) : (
          <EmptyState title="No Foxes in this wallet" action={<ButtonLink href="/genesis">Go to Genesis</ButtonLink>}>
            A Genesis Fox comes with a vault, agent access and a share of ecosystem rewards.
          </EmptyState>
        )}
      </section>

      {!isSignedIn ? (
        <section className="mt-12 sticker p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="font-semibold text-lg">Sign in to see your agents and allowlist status</div>
            <p className="text-mist">One signature, no gas.</p>
          </div>
          <button className="btn btn-fur" onClick={signIn} disabled={signingIn}>
            Sign message
          </button>
        </section>
      ) : (
        <section className={`mt-12 grid gap-6 ${FOUNDRY_LOCKED ? "" : "lg:grid-cols-2"}`}>
          {!FOUNDRY_LOCKED && <div>
            <SectionTitle action={<Link href="/foundry/new" className="font-semibold text-fur-2 hover:underline underline-offset-4">New launch</Link>}>Your launches</SectionTitle>
            {mine.data?.launches.length ? (
              <ul className="sticker p-2">
                {mine.data.launches.map((l) => (
                  <li key={l.id} className="border-b border-line last:border-0">
                    <Link href={`/foundry/${l.id}`} className="flex items-center justify-between p-3.5 hover:bg-dusk-3 rounded-xl">
                      <span className="font-semibold">
                        {l.name} <span className="text-haze">${l.ticker}</span>
                      </span>
                      <span className="chip bg-dusk text-mist capitalize">{l.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No launches yet">Tokens you submit through the Foundry show here with their review status.</EmptyState>
            )}
          </div>}
          <div>
            <SectionTitle action={<Link href="/agents" className="font-semibold text-fur-2 hover:underline underline-offset-4">Configure</Link>}>Your agents</SectionTitle>
            {mine.data?.agents.length ? (
              <ul className="sticker p-2">
                {mine.data.agents.map((a) => (
                  <li key={a.id} className="border-b border-line last:border-0">
                    <Link href={`/agents?fox=${a.fox_id}`} className="flex items-center justify-between p-3.5 hover:bg-dusk-3 rounded-xl">
                      <span className="font-semibold">
                        {AGENTS.find((x) => x.id === a.template)?.name ?? a.template} <span className="text-haze">· Fox #{a.fox_id}</span>
                      </span>
                      <span className="chip bg-dusk text-mist capitalize">{a.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No agents set up">Give one of your Foxes an operator with limits you choose.</EmptyState>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function FoxCard({ id }: { id: number }) {
  const v = useFoxVault(id);
  return (
    <Link href={`/fox/${id}`} className="sticker-sm overflow-hidden p-0 block hover:bg-dusk-3">
      <div className="aspect-square bg-dusk">
        <FoxArt id={id} className="h-full w-full" />
      </div>
      <div className="p-3 border-t border-line">
        <div className="font-semibold">Fox #{id}</div>
        <div className="text-[14px] text-mist">
          {!v.configured ? "Vault pending" : v.deployed ? `Vault · ${fmtToken(v.eth?.value, 18, 3)} ETH` : "Vault not activated"}
        </div>
      </div>
    </Link>
  );
}
