import { PageHeader } from "@/components/den";
import { BRAND } from "@/lib/foxbank-constants";

const DRAFT = (
  <div className="sticker-sm p-4 bg-gold text-ink font-semibold mb-8 max-w-3xl">
    Draft for review. These terms haven't been checked by a lawyer yet and should be before mint.
  </div>
);

export function Terms() {
  return (
    <>
      <PageHeader title="Terms" lede={`The rules for using ${BRAND}. Last updated November 2026.`} />
      {DRAFT}
      <article className="prose-den">
        <h2>Using the site</h2>
        <p>
          {BRAND} is an interface to smart contracts on Robinhood Chain. Connecting a wallet and signing transactions is your
          decision and your responsibility. We never hold your keys and can't reverse transactions.
        </p>
        <h2>No financial advice, no guaranteed returns</h2>
        <p>
          Nothing on this site is investment, legal or tax advice. Rewards depend on revenue the ecosystem actually collects and
          may be zero. Token prices can fall to nothing. Only use what you can afford to lose.
        </p>
        <h2>Community launches</h2>
        <p>
          Tokens in the Foundry are created by community members, not by {BRAND}. Review doesn't make a token safe or endorsed.
          We may reject or delist launches that impersonate others, mislead buyers or break these terms.
        </p>
        <h2>Agents</h2>
        <p>
          FoxAgents act within limits you set and that are enforced by contract, but automated trading carries risk, including
          losses from market moves and software faults. You're responsible for the permissions you grant.
        </p>
        <h2>Smart-contract risk</h2>
        <p>Contracts can contain bugs despite reviews. Interacting with them is at your own risk.</p>
        <h2>Eligibility</h2>
        <p>You must be of legal age where you live, and not in a jurisdiction where using this site is prohibited.</p>
      </article>
    </>
  );
}

export function Privacy() {
  return (
    <>
      <PageHeader title="Privacy" lede="What we store, why, and where. Last updated November 2026." />
      {DRAFT}
      <article className="prose-den">
        <h2>What we store</h2>
        <ul>
          <li>Your wallet address, when you sign in with it.</li>
          <li>Your X handle and class preference, if you add them to the allowlist.</li>
          <li>Foundry submissions and uploaded token art.</li>
          <li>Agent configurations you save.</li>
        </ul>
        <p>
          On-chain activity is public by nature; we index it to show leaderboards and activity feeds. We don't collect emails,
          names or IP-based tracking profiles.
        </p>
        <h2>Where it lives</h2>
        <p>Data is stored in Supabase. Sessions are kept in your browser's local storage so you stay signed in.</p>
        <h2>Your choices</h2>
        <p>
          You can disconnect at any time. To delete off-chain data tied to your wallet, contact us from that wallet's linked
          account; on-chain records can't be deleted by anyone.
        </p>
      </article>
    </>
  );
}
