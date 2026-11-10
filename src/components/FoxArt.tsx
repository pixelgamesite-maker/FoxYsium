import { useState } from "react";
import { ART_BASE_URL } from "@/lib/foxbank-constants";
import { cn } from "@/lib/utils";

/** Per-token art with a silhouette fallback until the collection art is uploaded. */
export default function FoxArt({ id, className, tint = "#9C8CFF" }: { id?: number; className?: string; tint?: string }) {
  const [failed, setFailed] = useState(id === undefined);
  if (failed) return <FoxSilhouette className={className} tint={tint} />;
  return (
    <img
      src={`${ART_BASE_URL}${id}.png`}
      alt={`Fox #${id}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export function FoxSilhouette({ className, tint = "#9C8CFF" }: { className?: string; tint?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("block", className)} aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <rect width="100" height="100" fill={tint} opacity={0.22} />
      <g fill="#0E0A1C" opacity={0.55}>
        <path d="M50 74 24 50 21 14l20 16h18l20-16-3 36Z" />
        <path d="M14 100c2-16 14-26 36-26s34 10 36 26Z" />
      </g>
      <text x="50" y="47" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FFF3E3" opacity={0.85} fontFamily="Bricolage Grotesque, sans-serif">?</text>
    </svg>
  );
}
