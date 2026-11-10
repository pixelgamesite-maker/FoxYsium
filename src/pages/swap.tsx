import { ArrowRight, Copy, Plus } from "lucide-react";
import TokenIcon, { TOKENS } from "@/components/TokenIcon";
import { useAccount } from "wagmi";
import { PageHeader, SectionTitle, NotLive, ButtonLink, Row } from "@/components/den";
import { CONTRACTS } from "@/lib/contracts";
import { SWAP_URL, TOKEN_SYMBOL } from "@/lib/foxbank-constants";
import { robinhood, explorerAddress } from "@/lib/wagmi";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { fmtToken, short } from "@/lib/format";

const STEPS = [
  { t: "Get ETH on Robinhood Chain", b: "Robinhood Chain uses ETH for gas. Bridge ETH in using the official Robinhood Chain bridge. A small amount covers many transactions." },
  { t: "Check the contract", b: "Only trust the $FOX address shown on this page. Copy it from here, not from a reply or a DM." },
  { t: "Swap on a Robinhood Chain DEX", b: "Trade ETH for $FOX on a supported DEX, then come back to stake or lock." },
];

export default function Swap() {
  const fox = CONTRACTS.fox;
  const { connector } = useAccount();
  const { eth, isConnected } = useWallet();
  const { toast } = useToast();
  const swapHref = SWAP_URL && fox ? `${SWAP_URL}${SWAP_URL.includes("?") ? "&" : "?"}outputCurrency=${fox}` : SWAP_URL;

  const addToWallet = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = (await connector?.getProvider()) as any;
      await p?.request({ method: "wallet_watchAsset", params: { type: "ERC20", options: { address: fox, symbol: TOKEN_SYMBOL, decimals: 18, image: `${window.location.origin}${TOKENS.fox.full ?? ""}` } } });
    } catch {
      toast({ variant: "destructive", title: "Couldn't add the token", description: "Your wallet doesn't support adding tokens this way." });
    }
  };

  return (
    <>
      <PageHeader title={`Get $${TOKEN_SYMBOL}`} lede="Buy $FOX with ETH on Robinhood Chain. You'll need it to stake, lock, and pay for some Foundry and agent features." />
      <div className="sticker-sm p-4 mb-6 flex items-center gap-4 max-w-md">
        <span className="inline-flex items-center gap-2.5">
          <TokenIcon id="eth" size={36} />
          <span>
            <span className="block font-semibold leading-tight">ETH</span>
            <span className="block text-[13px] text-haze">You pay</span>
          </span>
        </span>
        <ArrowRight className="h-5 w-5 text-haze mx-auto" />
        <span className="inline-flex items-center gap-2.5">
          <TokenIcon id="fox" size={36} />
          <span>
            <span className="block font-semibold leading-tight">${TOKEN_SYMBOL}</span>
            <span className="block text-[13px] text-haze">You receive</span>
          </span>
        </span>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {fox ? (
          <div className="sticker p-5 md:p-6">
            <Row
              k={`$${TOKEN_SYMBOL} contract`}
              mono
              v={
                <span className="inline-flex items-center gap-2">
                  <a href={explorerAddress(fox)} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    {short(fox, 6)}
                  </a>
                  <button
                    aria-label="Copy contract address"
                    className="text-haze hover:text-belly"
                    onClick={() => {
                      navigator.clipboard.writeText(fox);
                      toast({ title: "Contract address copied" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </span>
              }
            />
            <Row k="Network" v={robinhood.name} />
            {isConnected && <Row k="Your ETH" v={fmtToken(eth?.value, 18, 4)} />}
            <div className="mt-5 flex flex-wrap gap-3">
              {swapHref ? <ButtonLink href={swapHref}>Swap ETH for $FOX</ButtonLink> : <button className="btn btn-fur" disabled>DEX link coming</button>}
              {isConnected && (
                <button className="btn btn-ghost" onClick={addToWallet}>
                  <Plus className="h-4 w-4" /> Add to wallet
                </button>
              )}
            </div>
          </div>
        ) : (
          <NotLive what={`$${TOKEN_SYMBOL}`}>
            There is no $FOX token yet. When it launches, the one real contract address will be posted here. Anything sold as
            $FOX before then isn't ours.
          </NotLive>
        )}
        <section>
          <SectionTitle>Three steps</SectionTitle>
          <ol className="sticker p-2">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-4 p-3.5 border-b border-line last:border-0">
                <span className="num h-8 w-8 rounded-full bg-fur text-ink font-semibold grid place-items-center shrink-0 border border-line">{i + 1}</span>
                <div>
                  <div className="font-semibold">{s.t}</div>
                  <p className="text-mist leading-snug mt-0.5">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
