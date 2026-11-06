import { PageHeader } from "@/components/den";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import { elysium } from "@/lib/wagmi";
import { SUPPLY, TOKEN_SYMBOL } from "@/lib/foxysium-constants";

const TOC = [
  ["genesis", "Genesis"],
  ["vault", "FoxVault"],
  ["agents", "FoxAgents"],
  ["foundry", "FoxFoundry"],
  ["finance", "Staking, locking, liquidity"],
  ["rewards", "FoxRewards"],
  ["reputation", "Reputation"],
  ["business", "Fox Businesses"],
  ["token", `$${TOKEN_SYMBOL}`],
  ["network", "Network"],
] as const;

export default function Docs() {
  useHashScroll();
  return (
    <div className="grid lg:grid-cols-[220px_1fr] gap-10">
      <aside className="hidden lg:block pt-10">
        <nav className="sticky top-24 space-y-1" aria-label="On this page">
          {TOC.map(([id, l]) => (
            <a key={id} href={`#${id}`} className="block px-3 py-1.5 rounded-lg text-mist hover:text-belly hover:bg-dusk-2 font-semibold">
              {l}
            </a>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <PageHeader title="How FoxYsium works" lede="The short version of every product in the den, and what each one does with your Fox." />
        <article className="prose-den">
          <h2 id="genesis" className="scroll-mt-24">Genesis</h2>
          <p>
            The Genesis collection is {SUPPLY.toLocaleString()} ERC-721 Foxes on Kinetiq Elysium, fixed forever. Each Fox has unique
            art, one of five classes (Sovereign, Oracle, Alchemist, Merchant, Guardian) and a rarity tier. Every Fox gets the core
            ecosystem; class and rarity add privileges on top.
          </p>

          <h2 id="vault" className="scroll-mt-24">FoxVault</h2>
          <p>
            Every Fox has its own wallet, an ERC-6551 token-bound account. The address is derived from the Fox's token ID, so it
            exists before it's activated. The vault can hold HYPE, tokens, NFTs and positions, and whoever holds the Fox controls
            it.
          </p>
          <ul>
            <li>Rewards are paid into the vault, not to your main wallet.</li>
            <li>Selling the Fox transfers the vault and its contents to the buyer. Withdraw first if you want to keep them.</li>
            <li>Agents act through the vault only, never through your main wallet.</li>
          </ul>

          <h2 id="agents" className="scroll-mt-24">FoxAgents</h2>
          <p>
            An agent is an optional AI operator attached to one Fox. You pick a template, choose which actions it may take and set a
            per-transaction limit and a daily budget. Those rules are enforced by an execution-policy contract that sits in front of
            the vault, so an agent that misbehaves still can't exceed them.
          </p>
          <ul>
            <li>Approved contracts and tokens only.</li>
            <li>Every transaction is simulated before it's sent.</li>
            <li>Pause or revoke any time; an emergency stop halts every agent.</li>
          </ul>
          <p>Agents ship in phase three, after a security review. Until then, configurations save as drafts and never execute.</p>

          <h2 id="foundry" className="scroll-mt-24">FoxFoundry</h2>
          <p>
            Genesis holders can launch ERC-20 tokens paired with HYPE. Every launch page shows total supply, creator fee (capped at
            3%), holder reward mode and any allocations. Submissions are reviewed before they go live; we reject launches that
            impersonate real projects, hide allocations or use exploitative fee setups.
          </p>
          <p>Linking a launch to a Fox routes the creator share to that Fox's vault, so the business travels with the Fox.</p>

          <h2 id="finance" className="scroll-mt-24">Staking, locking, liquidity</h2>
          <p>
            <strong>Staking</strong> puts ${TOKEN_SYMBOL} in a shared pool that earns from ecosystem revenue. Principal unlocks
            gradually. <strong>Locking</strong> is separate: a time-lock with no admin key that unlocks platform privileges at 30, 90,
            180 and 365 days — not higher yield. <strong>Liquidity</strong> runs on Elysium DEXes; LPs earn trading fees and carry
            impermanent-loss risk.
          </p>

          <h2 id="rewards" className="scroll-mt-24">FoxRewards</h2>
          <p>
            A defined share of eligible net revenue from the Foundry, market, agents and protocol fees goes to Genesis Fox vaults.
            Distributions only come from revenue actually collected, after costs and reserves. Nothing is guaranteed and there's no
            fixed yield.
          </p>

          <h2 id="reputation" className="scroll-mt-24">Reputation</h2>
          <p>
            Each Fox earns points from verified activity and moves through five levels: Cub, Scout, Hunter, Alpha, Apex. Points
            can't be bought, and wash activity is filtered out. Higher levels unlock launchpad priority, special agent templates
            and governance weight.
          </p>

          <h2 id="business" className="scroll-mt-24">Fox Businesses</h2>
          <p>
            Several Foxes can form a business with a shared treasury and fixed ownership shares, written into a dedicated contract.
            Revenue splits automatically by share. Businesses arrive in phase four.
          </p>

          <h2 id="token" className="scroll-mt-24">${TOKEN_SYMBOL}</h2>
          <p>
            ${TOKEN_SYMBOL} is the ecosystem's utility token: staking, locking, Foundry fees, agent services, upgrades and governance.
            Supply and allocations will be published before launch, with team and treasury tokens in the public locker. Gas on
            Elysium is still paid in HYPE.
          </p>

          <h2 id="network" className="scroll-mt-24">Network</h2>
          <ul>
            <li>Network: {elysium.name}</li>
            <li>Chain ID: <code>{elysium.id}</code></li>
            <li>Gas: HYPE</li>
            <li>RPC: <code>{elysium.rpcUrls.default.http[0]}</code></li>
            <li>Explorer: <a href={elysium.blockExplorers.default.url} target="_blank" rel="noreferrer">{elysium.blockExplorers.default.url.replace(/^https:\/\//, "")}</a></li>
          </ul>
        </article>
      </div>
    </div>
  );
}
