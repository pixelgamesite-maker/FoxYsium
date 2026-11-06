import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { Loader2, ShieldAlert, Check } from "lucide-react";
import { PageHeader, SectionTitle, NotLive } from "@/components/den";
import { ConnectGate } from "@/components/wallet/ConnectGate";
import { Switch } from "@/components/ui/switch";
import { supabase, type AgentConfig } from "@/lib/supabase";
import { useWallet } from "@/hooks/use-wallet";
import { useOwnedFoxes } from "@/hooks/use-foxes";
import { useToast } from "@/hooks/use-toast";
import { AGENTS, PERMISSIONS, type AgentTemplate } from "@/lib/foxysium-constants";
import { CONTRACTS } from "@/lib/contracts";
import { cn } from "@/lib/utils";

const POLICY_LIVE = false; // flip once FoxExecutionPolicy is deployed and audited

export default function Agents() {
  return (
    <>
      <PageHeader
        title="FoxAgents"
        lede="An optional AI operator for one of your Foxes. It can only act through the Fox's vault, only on what you allow, and only up to the limits you set. The limits live in a contract, not in a prompt."
      />
      <section className="mb-10">
        <SectionTitle>Operator templates</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((a) => (
            <div key={a.id} className="sticker-sm p-5">
              <div className="font-extrabold text-xl">{a.name}</div>
              <p className="text-mist mt-1 leading-snug">{a.does}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.perms.length ? (
                  a.perms.map((p) => (
                    <span key={p} className="chip bg-dusk text-mist text-[12px]">
                      {PERMISSIONS.find((x) => x.id === p)?.label ?? p}
                    </span>
                  ))
                ) : (
                  <span className="chip bg-mint text-ink text-[12px]">Read-only</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionTitle>Configure an agent</SectionTitle>
      {!POLICY_LIVE && (
        <div className="mb-5">
          <NotLive what="Agent execution">
            You can set up and save an agent now. It stays a draft, and nothing signs or spends, until the execution-policy
            contract is deployed and audited.
          </NotLive>
        </div>
      )}
      <ConnectGate signIn why="to configure an agent">
        <Configurator />
      </ConnectGate>
    </>
  );
}

function Configurator() {
  const { address } = useWallet();
  const owned = useOwnedFoxes(address);
  const search = useSearch();
  const initialFox = Number(new URLSearchParams(search).get("fox")) || null;
  const { toast } = useToast();

  const [fox, setFox] = useState<number | null>(initialFox);
  const [template, setTemplate] = useState<AgentTemplate>("treasurer");
  const [perms, setPerms] = useState<string[]>(AGENTS.find((a) => a.id === "treasurer")!.perms);
  const [perTx, setPerTx] = useState(10);
  const [daily, setDaily] = useState(50);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<AgentConfig | null>(null);

  // Without a Genesis contract we can't verify ownership; allow any id for drafts.
  const foxOptions = CONTRACTS.genesis ? owned.ids : [];
  useEffect(() => {
    if (fox === null && foxOptions.length) setFox(foxOptions[0]);
  }, [foxOptions.join(","), fox]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!supabase || fox === null) return;
    supabase
      .from("agent_configs")
      .select("*")
      .eq("fox_id", fox)
      .maybeSingle()
      .then(({ data }) => {
        const c = data as AgentConfig | null;
        setSaved(c);
        if (c) {
          setTemplate(c.template as AgentTemplate);
          setPerms(c.permissions);
          setPerTx(c.per_tx_limit_usd);
          setDaily(c.daily_budget_usd);
        }
      });
  }, [fox]);

  const pickTemplate = (t: AgentTemplate) => {
    setTemplate(t);
    setPerms(AGENTS.find((a) => a.id === t)!.perms);
  };
  const togglePerm = (id: string) => setPerms((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const highRisk = perms.filter((p) => PERMISSIONS.find((x) => x.id === p)?.risk === "high");

  const save = async () => {
    if (fox === null) return;
    if (daily < perTx) return toast({ variant: "destructive", title: "Check your limits", description: "The daily budget can't be lower than the per-transaction limit." });
    setSaving(true);
    const { data, error } = await supabase!
      .from("agent_configs")
      .upsert(
        { fox_id: fox, template, permissions: perms, per_tx_limit_usd: perTx, daily_budget_usd: daily, status: "draft" },
        { onConflict: "fox_id,owner_wallet" },
      )
      .select("*")
      .single();
    setSaving(false);
    if (error) return toast({ variant: "destructive", title: "Agent not saved", description: error.message });
    setSaved(data as AgentConfig);
    toast({ title: `Agent saved for Fox #${fox}`, description: "Saved as a draft. It won't act until execution goes live." });
  };

  return (
    <div className="grid lg:grid-cols-[1.25fr_1fr] gap-6 items-start">
      <div className="sticker p-5 md:p-6 space-y-6">
        <div>
          <label className="label" htmlFor="af">Fox</label>
          {foxOptions.length ? (
            <select id="af" className="field" value={fox ?? ""} onChange={(e) => setFox(Number(e.target.value))}>
              {foxOptions.map((i) => (
                <option key={i} value={i}>Fox #{i}</option>
              ))}
            </select>
          ) : (
            <input id="af" className="field" inputMode="numeric" placeholder="Fox number" value={fox ?? ""} onChange={(e) => setFox(Number(e.target.value.replace(/\D/g, "")) || null)} />
          )}
          {CONTRACTS.genesis && !owned.isLoading && !foxOptions.length && <p className="text-rose text-[14px] mt-2">This wallet doesn't hold a Genesis Fox.</p>}
        </div>

        <div>
          <div className="label">Template</div>
          <div className="flex flex-wrap gap-2">
            {AGENTS.map((a) => (
              <button key={a.id} type="button" onClick={() => pickTemplate(a.id)} aria-pressed={template === a.id} className={cn("btn btn-sm", template === a.id ? "btn-fur" : "btn-ghost")}>
                {a.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="ptx">Per transaction (USD)</label>
            <input id="ptx" className="field num" inputMode="numeric" value={perTx} onChange={(e) => setPerTx(Math.min(10000, Number(e.target.value.replace(/\D/g, "")) || 0))} />
          </div>
          <div>
            <label className="label" htmlFor="dly">Daily budget (USD)</label>
            <input id="dly" className="field num" inputMode="numeric" value={daily} onChange={(e) => setDaily(Math.min(50000, Number(e.target.value.replace(/\D/g, "")) || 0))} />
          </div>
        </div>

        <div>
          <div className="label">Allowed actions</div>
          <ul className="rounded-2xl border-[2.5px] border-ink bg-dusk overflow-hidden">
            {PERMISSIONS.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3 border-b-2 border-dusk-3 last:border-0">
                <Switch id={`p-${p.id}`} checked={perms.includes(p.id)} onCheckedChange={() => togglePerm(p.id)} />
                <label htmlFor={`p-${p.id}`} className="flex-1 cursor-pointer">{p.label}</label>
                <span className={cn("chip text-[12px] !py-0", p.risk === "high" ? "bg-rose text-ink" : p.risk === "medium" ? "bg-gold text-ink" : "bg-mint text-ink")}>{p.risk}</span>
              </li>
            ))}
          </ul>
          {highRisk.length > 0 && (
            <p className="mt-3 flex gap-2 text-rose font-semibold">
              <ShieldAlert className="h-5 w-5 shrink-0" /> High-risk actions let the agent move funds out of the vault. Leave them off unless you're sure.
            </p>
          )}
        </div>

        <button className="btn btn-fur w-full sm:w-auto" onClick={save} disabled={saving || fox === null}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save agent
        </button>
      </div>

      <aside className="sticker p-5 lg:sticky lg:top-24">
        <div className="text-haze font-semibold text-[15px]">Summary</div>
        <div className="mt-2 font-extrabold text-2xl">
          {AGENTS.find((a) => a.id === template)!.name} {fox !== null && <span className="text-fur">for Fox #{fox}</span>}
        </div>
        <ul className="mt-4 space-y-2 text-mist">
          <li>Up to <span className="font-bold text-belly num">${perTx.toLocaleString()}</span> per transaction</li>
          <li>Up to <span className="font-bold text-belly num">${daily.toLocaleString()}</span> per day</li>
          <li>{perms.length ? `${perms.length} allowed action${perms.length > 1 ? "s" : ""}` : "Read-only, can't sign anything"}</li>
          <li>Only through this Fox's vault, never your main wallet</li>
        </ul>
        <div className="mt-5 flex items-center gap-2 text-[15px]">
          {saved ? (
            <>
              <Check className="h-5 w-5 text-mint" /> Saved · {saved.status}
            </>
          ) : (
            <span className="text-haze">Not saved yet</span>
          )}
        </div>
        <p className="text-haze text-[14px] mt-4">You can pause or revoke an agent at any time, and an emergency stop halts every agent at once.</p>
      </aside>
    </div>
  );
}
