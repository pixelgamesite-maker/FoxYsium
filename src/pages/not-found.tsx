import { ButtonLink } from "@/components/den";
import { ART } from "@/lib/foxysium-constants";

export default function NotFound() {
  const art = ART[5];
  return (
    <div className="py-16 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <div className="text-fur font-medium">404</div>
        <h1 className="mt-2 text-[clamp(2.4rem,9vw,4rem)] font-semibold leading-[1.02]">Page not found</h1>
        <p className="text-mist text-lg mt-4 max-w-[44ch]">The page you followed doesn't exist or has moved.</p>
        <div className="mt-7 flex gap-3">
          <ButtonLink href="/">Go home</ButtonLink>
          <ButtonLink href="/genesis" variant="ghost">View Genesis</ButtonLink>
        </div>
      </div>
      <div className="sticker overflow-hidden p-0 aspect-square max-w-[460px] w-full md:justify-self-end" style={{ backgroundColor: art.bg }}>
        <img src={art.src} alt={art.alt} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
