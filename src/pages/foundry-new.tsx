import { useMemo, useState } from "react";
import { Loader2, ImagePlus, Check } from "lucide-react";
import { PageHeader, Row, ButtonLink } from "@/components/den";
import { ConnectGate } from "@/components/wallet/ConnectGate";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabase";
import { useWallet } from "@/hooks/use-wallet";
import { useOwnedFoxes } from "@/hooks/use-foxes";
import { CONTRACTS } from "@/lib/contracts";
import { cn } from "@/lib/utils";

const SUPPLIES = [1_000_000, 100_000_000, 1_000_000_000, 10_000_000_000];
const MAX_FEE_BPS = 300; // creator fee cap: 3%

export default function FoundryNew() {
  return (
    <>
      <PageHeader
        title="Start a launch"
        lede="Fill in your token's details. Submissions are reviewed for impersonation and hidden allocations before they go live, usually within a day."
      />
      <ConnectGate signIn why="to start a launch">
        <LaunchForm />
      </ConnectGate>
    </>
  );
}

function LaunchForm() {
  const { address } = useWallet();
  const foxes = useOwnedFoxes(address);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [desc, setDesc] = useState("");
  const [supply, setSupply] = useState(SUPPLIES[2]);
  const [fee, setFee] = useState(100);
  const [reward, setReward] = useState<"hype" | "fox" | "none">("hype");
  const [fox, setFox] = useState<number | null>(null);
  const [website, setWebsite] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const needsFox = !!CONTRACTS.genesis;
  const eligible = !needsFox || foxes.balance > 0;

  const validate = () => {
    if (name.trim().length < 2 || name.trim().length > 32) return "Name needs 2–32 characters.";
    if (!/^[A-Z0-9]{2,10}$/.test(ticker)) return "Ticker needs 2–10 capital letters or numbers.";
    if (desc.length > 400) return "Keep the description under 400 characters.";
    if (file && file.size > 2 * 1024 * 1024) return "Image must be under 2 MB.";
    for (const u of [website, xUrl]) if (u && !/^https:\/\/\S+$/.test(u)) return "Links must start with https://";
    return null;
  };

  const submit = async () => {
    const v = validate();
    if (v) return setErr(v);
    setErr(null);
    setBusy(true);
    try {
      let image_url: string | null = null;
      if (file) {
        const { data: u } = await supabase!.auth.getUser();
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const path = `${u.user!.id}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase!.storage.from("launch-art").upload(path, file, { contentType: file.type, upsert: false });
        if (up.error) throw up.error;
        image_url = supabase!.storage.from("launch-art").getPublicUrl(path).data.publicUrl;
      }
      const { data, error } = await supabase!
        .from("foundry_launches")
        .insert({
          name: name.trim(),
          ticker,
          description: desc.trim() || null,
          image_url,
          total_supply: supply,
          creator_fee_bps: fee,
          reward_mode: reward,
          linked_fox_id: fox,
          website: website || null,
          x_url: xUrl || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      setDoneId(data.id as string);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (doneId)
    return (
      <div className="sticker p-6 max-w-xl">
        <span className="h-12 w-12 rounded-full bg-mint border-[2.5px] border-ink grid place-items-center">
          <Check className="h-7 w-7 text-ink" strokeWidth={3} />
        </span>
        <div className="mt-4 font-extrabold text-2xl">${ticker} submitted for review</div>
        <p className="text-mist mt-2">
          Once approved, the token is deployed and paired with HYPE, and the launch page goes live in the feed.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href={`/foundry/${doneId}`}>View launch page</ButtonLink>
          <ButtonLink href="/foundry" variant="ghost">
            Back to the feed
          </ButtonLink>
        </div>
      </div>
    );

  return (
    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
      <div className="sticker p-5 md:p-6 space-y-5">
        {!eligible && (
          <div className="rounded-2xl border-[2.5px] border-ink bg-gold text-ink p-4 font-semibold">
            Launching needs a Genesis Fox in this wallet. You can still fill this in, but it won't submit.
          </div>
        )}
        <div className="grid sm:grid-cols-[1fr_160px] gap-4">
          <div>
            <label className="label" htmlFor="n">Token name</label>
            <input id="n" className="field" maxLength={32} placeholder="Den Coin" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="t">Ticker</label>
            <input id="t" className="field uppercase" maxLength={10} placeholder="DEN" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="d">What is it?</label>
          <textarea id="d" className="field min-h-[110px]" maxLength={400} placeholder="One or two sentences people will read on the launch page." value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div className="text-haze text-[13px] mt-1 text-right num">{desc.length}/400</div>
        </div>

        <div>
          <div className="label">Token art</div>
          <label className="flex items-center gap-4 p-3 rounded-2xl border-[2.5px] border-dashed border-dusk-3 hover:border-lilac cursor-pointer">
            <span className="h-16 w-16 rounded-xl border-[2.5px] border-ink bg-dusk grid place-items-center overflow-hidden shrink-0">
              {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-haze" />}
            </span>
            <span className="text-mist">{file ? file.name : "Square PNG, JPG or WebP, up to 2 MB"}</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        <div>
          <div className="label">Total supply</div>
          <div className="flex flex-wrap gap-2">
            {SUPPLIES.map((s) => (
              <button key={s} type="button" onClick={() => setSupply(s)} aria-pressed={supply === s} className={cn("btn btn-sm num", supply === s ? "btn-fur" : "btn-ghost")}>
                {s >= 1e9 ? `${s / 1e9}B` : `${s / 1e6}M`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between label">
            <span>Creator fee on trades</span>
            <span className="num text-belly">{(fee / 100).toFixed(2)}%</span>
          </div>
          <Slider value={[fee]} min={0} max={MAX_FEE_BPS} step={25} onValueChange={(v) => setFee(v[0])} aria-label="Creator fee" />
          <p className="text-haze text-[14px] mt-2">Capped at 3%. Shown to every buyer on the launch page.</p>
        </div>

        <div>
          <div className="label">Holder rewards paid in</div>
          <div className="flex flex-wrap gap-2">
            {(["hype", "fox", "none"] as const).map((r) => (
              <button key={r} type="button" onClick={() => setReward(r)} aria-pressed={reward === r} className={cn("btn btn-sm", reward === r ? "btn-fur" : "btn-ghost")}>
                {r === "none" ? "No rewards" : r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="fx">Link to a Fox (optional)</label>
          <select id="fx" className="field" value={fox ?? ""} onChange={(e) => setFox(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Don't link</option>
            {foxes.ids.map((i) => (
              <option key={i} value={i}>Fox #{i}</option>
            ))}
          </select>
          <p className="text-haze text-[14px] mt-2">A linked Fox's vault receives the creator share, so it travels with the Fox if sold.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="w">Website</label>
            <input id="w" className="field" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value.trim())} />
          </div>
          <div>
            <label className="label" htmlFor="x">X profile</label>
            <input id="x" className="field" placeholder="https://x.com/…" value={xUrl} onChange={(e) => setXUrl(e.target.value.trim())} />
          </div>
        </div>

        {err && <p className="text-rose font-semibold">{err}</p>}
        <button className="btn btn-fur w-full sm:w-auto" onClick={submit} disabled={busy || !eligible}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit for review
        </button>
      </div>

      <aside className="sticker p-5 lg:sticky lg:top-24">
        <div className="text-haze font-semibold text-[15px]">Launch page preview</div>
        <div className="flex items-center gap-3 mt-3">
          <div className="h-16 w-16 rounded-xl border-[2.5px] border-ink bg-belly overflow-hidden grid place-items-center">
            {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="font-extrabold text-ink text-xl">{(ticker || "??").slice(0, 2)}</span>}
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-2xl truncate">{name || "Your token"}</div>
            <div className="text-haze font-semibold">${ticker || "TICKER"}</div>
          </div>
        </div>
        <p className="text-mist mt-4 min-h-[3rem]">{desc || "Your description shows here."}</p>
        <div className="mt-2">
          <Row k="Supply" v={supply.toLocaleString()} />
          <Row k="Creator fee" v={`${(fee / 100).toFixed(2)}%`} />
          <Row k="Holder rewards" v={reward === "none" ? "None" : reward.toUpperCase()} />
          <Row k="Pair" v="HYPE" />
          <Row k="Linked Fox" v={fox ? `#${fox}` : "None"} />
        </div>
      </aside>
    </div>
  );
}
