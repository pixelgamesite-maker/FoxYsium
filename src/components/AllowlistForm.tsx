import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { ConnectGate } from "@/components/wallet/ConnectGate";
import { supabase } from "@/lib/supabase";
import { useWallet } from "@/hooks/use-wallet";
import { CLASSES, type FoxClass } from "@/lib/foxysium-constants";
import { cn } from "@/lib/utils";

type Entry = { wallet: string; x_handle: string | null; class_pref: string | null; status: string; created_at: string };

export default function AllowlistForm() {
  return (
    <ConnectGate signIn why="to join the allowlist">
      <Inner />
    </ConnectGate>
  );
}

function Inner() {
  const { address } = useWallet();
  const qc = useQueryClient();
  const [entry, setEntry] = useState<Entry | null | undefined>(undefined);
  const [xHandle, setXHandle] = useState("");
  const [pref, setPref] = useState<FoxClass | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !address) return;
    supabase
      .from("allowlist_entries")
      .select("wallet,x_handle,class_pref,status,created_at")
      .eq("wallet", address.toLowerCase())
      .maybeSingle()
      .then(({ data }) => setEntry((data as Entry) ?? null));
  }, [address]);

  const submit = async () => {
    setErr(null);
    const handle = xHandle.trim().replace(/^@/, "");
    if (handle && !/^[A-Za-z0-9_]{1,15}$/.test(handle)) return setErr("X handles are 1–15 letters, numbers or underscores.");
    setBusy(true);
    const { data, error } = await supabase!
      .from("allowlist_entries")
      .insert({ x_handle: handle || null, class_pref: pref })
      .select("wallet,x_handle,class_pref,status,created_at")
      .single();
    setBusy(false);
    if (error) return setErr(error.code === "23505" ? "This wallet is already on the allowlist." : error.message);
    setEntry(data as Entry);
    qc.invalidateQueries({ queryKey: ["allowlist-count"] });
  };

  if (entry === undefined)
    return (
      <div className="sticker p-6 flex items-center gap-3 text-mist">
        <Loader2 className="h-5 w-5 animate-spin" /> Checking your wallet…
      </div>
    );

  if (entry)
    return (
      <div className="sticker p-6">
        <div className="flex items-center gap-3">
          <span className="h-11 w-11 rounded-full bg-mint border-[2.5px] border-ink grid place-items-center">
            <Check className="h-6 w-6 text-ink" strokeWidth={3} />
          </span>
          <div>
            <div className="font-extrabold text-xl">You're on the list</div>
            <div className="text-mist">
              Status: <span className="font-semibold text-belly capitalize">{entry.status}</span>
              {entry.class_pref && <> · hoping for a {entry.class_pref}</>}
            </div>
          </div>
        </div>
        <p className="text-mist mt-4">
          We'll confirm allowlist spots before mint. Keep this wallet — it's the one that will be able to mint.
        </p>
      </div>
    );

  return (
    <div className="sticker p-5 md:p-6 space-y-5">
      <div>
        <label className="label" htmlFor="xh">
          X handle (optional)
        </label>
        <input id="xh" className="field" placeholder="@yourhandle" value={xHandle} onChange={(e) => setXHandle(e.target.value)} />
      </div>
      <div>
        <div className="label">Which class are you hoping for?</div>
        <div className="flex flex-wrap gap-2">
          {CLASSES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setPref(pref === c.name ? null : c.name)}
              aria-pressed={pref === c.name}
              className={cn("chip text-[14px] py-1.5 px-3.5", pref === c.name ? "text-ink" : "bg-dusk text-mist")}
              style={pref === c.name ? { background: c.color } : undefined}
            >
              {c.name}
            </button>
          ))}
        </div>
        <p className="text-haze text-[14px] mt-2">Classes are assigned at mint; this just helps us see demand.</p>
      </div>
      {err && <p className="text-rose font-semibold">{err}</p>}
      <button className="btn btn-fur w-full sm:w-auto" onClick={submit} disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Join the allowlist
      </button>
    </div>
  );
}
