import { Link } from "wouter";
import { useAccount } from "wagmi";
import { PageHeader, EmptyState } from "@/components/den";
import { useLeaderboard } from "@/hooks/use-foxes";
import { CLASSES, LEVELS, levelFor } from "@/lib/foxysium-constants";
import { isSupabaseConfigured } from "@/lib/supabase";
import { short } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const { data, isLoading } = useLeaderboard(100);
  const { address } = useAccount();
  const me = address?.toLowerCase();

  return (
    <>
      <PageHeader
        title="Leaderboard"
        lede="Foxes ranked by reputation. Points come from verified activity, like launches, governance, market and agent work, and can't be bought."
      />
      <div className="flex flex-wrap gap-2 mb-6">
        {LEVELS.map((l) => (
          <span key={l.name} className="chip bg-dusk-2 text-mist">
            <span className="font-extrabold text-belly">{l.name}</span> {l.min.toLocaleString()}+
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="sticker h-80 animate-pulse" />
      ) : data && data.length ? (
        <div className="sticker p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-ink/60 text-haze text-[14px]">
              <tr>
                <th className="py-3 pl-4 pr-2 font-semibold w-14">Rank</th>
                <th className="py-3 px-2 font-semibold">Fox</th>
                <th className="py-3 px-2 font-semibold hidden sm:table-cell">Level</th>
                <th className="py-3 px-2 font-semibold hidden md:table-cell">Holder</th>
                <th className="py-3 pl-2 pr-4 font-semibold text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => {
                const cls = CLASSES.find((c) => c.name === r.fox_class);
                const mine = me && r.owner_wallet?.toLowerCase() === me;
                return (
                  <tr key={r.fox_id} className={cn("border-t-2 border-dusk-3", mine && "bg-fur/15")}>
                    <td className={cn("py-3 pl-4 pr-2 num font-extrabold text-lg", i < 3 ? "text-fur" : "text-haze")}>{i + 1}</td>
                    <td className="py-3 px-2">
                      <Link href={`/fox/${r.fox_id}`} className="font-bold hover:text-fur inline-flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-sm border-2 border-ink" style={{ background: cls?.color ?? "#34296a" }} />
                        Fox #{r.fox_id}
                        {mine && <span className="chip bg-fur text-ink !py-0 text-[12px]">You</span>}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-mist hidden sm:table-cell">{levelFor(r.points).name}</td>
                    <td className="py-3 px-2 font-mono text-[13px] text-haze hidden md:table-cell">{short(r.owner_wallet)}</td>
                    <td className="py-3 pl-2 pr-4 text-right num font-extrabold">{r.points.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No rankings yet">
          {isSupabaseConfigured ? "Rankings appear once Genesis is minted and the first activity is recorded." : "Connect Supabase to show rankings."}
        </EmptyState>
      )}
    </>
  );
}
