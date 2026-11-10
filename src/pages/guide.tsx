import { PageHeader, ButtonLink } from "@/components/den";
import { useWallet } from "@/hooks/use-wallet";
import { robinhood } from "@/lib/wagmi";

const STEPS = [
  { t: "Get a wallet", b: "Any EVM wallet works: MetaMask, Rabby, OKX, Coinbase Wallet, or a mobile wallet through WalletConnect.", cta: null },
  { t: "Add Robinhood Chain", b: `Connect on this site and your wallet will offer to add ${robinhood.name} (chain ${robinhood.id}). Gas on Robinhood Chain is paid in ETH.`, cta: "network" },
  { t: "Get some ETH on Robinhood Chain", b: "Bridge ETH from Ethereum or another L2 using the official Robinhood Chain bridge. A little goes a long way for gas.", cta: null },
  { t: "Join the allowlist", b: "Sign one message on the Genesis page. It's free and proves the wallet is yours.", cta: "/genesis#allowlist" },
  { t: "Mint your Fox", b: "Allowlist wallets mint first. Your Fox arrives with a vault address already reserved for it.", cta: "/genesis" },
  { t: "Activate the vault", b: "From your Fox's page, activate its vault. Rewards and anything you send to it are held by the Fox.", cta: "/console" },
  { t: "Put it to work", b: "Stake or lock $FOX, or set up an agent with spending limits. The Foundry unlocks for holders after mint.", cta: "/agents" },
] as const;

export default function Guide() {
  const { isConnected, isWrongNetwork, switchToRobinhood } = useWallet();
  return (
    <>
      <PageHeader title="Getting started" lede="Seven steps from a new wallet to an active Fox. Skip any you've already completed." />
      <ol className="space-y-4 max-w-3xl">
        {STEPS.map((s, i) => (
          <li key={s.t} className="sticker-sm p-5 flex gap-4">
            <span className="num h-10 w-10 rounded-full bg-fur text-ink font-semibold text-lg grid place-items-center shrink-0 border border-line">{i + 1}</span>
            <div className="flex-1">
              <div className="font-semibold text-xl">{s.t}</div>
              <p className="text-mist mt-1 leading-relaxed">{s.b}</p>
              {s.cta === "network" ? (
                isConnected && isWrongNetwork ? (
                  <button className="btn btn-sm btn-fur mt-3" onClick={switchToRobinhood}>Add {robinhood.name}</button>
                ) : null
              ) : s.cta ? (
                <ButtonLink href={s.cta} variant="ghost" className="btn-sm mt-3">
                  Go
                </ButtonLink>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
