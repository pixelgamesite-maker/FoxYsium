import { ButtonLink } from "@/components/den";
import { HERO_ART } from "@/lib/foxysium-constants";

export default function NotFound() {
  return (
    <div className="py-16 grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-[clamp(2.6rem,10vw,4.5rem)] font-extrabold leading-[0.95]">This trail goes nowhere</h1>
        <p className="text-mist text-lg mt-4 max-w-[44ch]">The page you followed doesn't exist, or it moved. Head back to the den and pick another path.</p>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="/">Back to the den</ButtonLink>
          <ButtonLink href="/genesis" variant="ghost">See Genesis</ButtonLink>
        </div>
      </div>
      <div className="sticker overflow-hidden p-0 bg-lilac h-[320px] relative">
        <img src={HERO_ART} alt="" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[95%] w-auto max-w-none opacity-90 grayscale-[30%]" />
      </div>
    </div>
  );
}
