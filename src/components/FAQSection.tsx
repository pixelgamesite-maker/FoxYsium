import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionTitle } from "@/components/den";
import { MINT_PRICE, SUPPLY, TOKEN_SYMBOL } from "@/lib/foxysium-constants";

const FAQ = [
  { q: "How many Foxes are there?", a: `${SUPPLY.toLocaleString()}, and that's final. The Genesis supply is fixed in the contract and can't be increased.` },
  { q: "What does it cost to mint?", a: `Mint price is ${MINT_PRICE}. Join the allowlist to hear first; allowlist spots mint before the public phase.` },
  { q: "Which chain is this on?", a: "Kinetiq Elysium, an L2 that settles to HyperEVM. Gas is paid in HYPE, so you'll need a little HYPE on Elysium to mint or transact." },
  { q: "What is a Fox's vault?", a: "Each Fox gets an ERC-6551 token-bound account: a wallet owned by the NFT itself. Rewards are paid into it, and if you sell the Fox, the vault and everything in it go to the buyer. Withdraw before you list if you want to keep the contents." },
  { q: "Do I have to use the AI agent?", a: "No. Agents are off by default. If you switch one on, it can only do what you allow, up to the limits you set, and you can revoke it at any time. Limits are enforced on-chain, not by the AI." },
  { q: `Is $${TOKEN_SYMBOL} live?`, a: `Not yet. $${TOKEN_SYMBOL} launches in phase two, with staking and the locker. Anything claiming to be $${TOKEN_SYMBOL} before we announce the contract address here is not ours.` },
  { q: "Are rewards guaranteed?", a: "No. Rewards are paid only from revenue the ecosystem actually collects, after costs and reserves. Some months that may be small or nothing. Nothing here is a promise of yield." },
];

export default function FAQSection() {
  return (
    <section className="mt-16">
      <SectionTitle>Questions</SectionTitle>
      <Accordion type="single" collapsible className="sticker p-2 md:p-3">
        {FAQ.map((f, i) => (
          <AccordionItem key={f.q} value={String(i)} className="border-b-2 border-dusk-3 last:border-0 px-3">
            <AccordionTrigger className="text-left text-[17px] font-bold py-4 hover:no-underline">{f.q}</AccordionTrigger>
            <AccordionContent className="text-mist text-[16px] leading-relaxed pb-4 max-w-[68ch]">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
