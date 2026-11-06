/** FoxYsium logo mark — sleepy-eyed fox head in the Genesis art's colours. */
export default function FoxMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g stroke="#0E0A1C" strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
        <path d="M32 58 10 34 8 7l16 13h16L56 7l-2 27Z" fill="#F27A1A" />
        <path d="M12 12.5 13 27l8-6Z" fill="#9C8CFF" strokeWidth={2.5} />
        <path d="M52 12.5 51 27l-8-6Z" fill="#9C8CFF" strokeWidth={2.5} />
        <path d="M32 58 16 40l10-2 6 6 6-6 10 2Z" fill="#FFF3E3" />
        <path d="M18 31h9M37 31h9" />
        <path d="M29.5 51h5L32 54.5Z" fill="#0E0A1C" strokeWidth={2} />
      </g>
    </svg>
  );
}

export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <span className="font-extrabold tracking-tight leading-none" style={{ fontSize: size }}>
      Fox<span className="text-fur">Y</span>sium
    </span>
  );
}
