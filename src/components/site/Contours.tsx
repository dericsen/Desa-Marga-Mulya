/** Garis kontur lengkung seperti petak sawah bertingkat — motif khas desa, dipakai tipis di panel gelap. */
export function Contours({ className = "" }: { className?: string }) {
  const lines = Array.from({ length: 9 }, (_, i) => {
    const y = 40 + i * 34;
    const a = 18 + i * 3;
    return `M-20 ${y} C 160 ${y - a}, 300 ${y + a}, 460 ${y - a / 2} S 760 ${y + a}, 920 ${y - a / 3}`;
  });
  return (
    <svg className={`pointer-events-none absolute -z-10 ${className}`} viewBox="0 0 900 360" fill="none" preserveAspectRatio="none" aria-hidden="true">
      {lines.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth={i === 4 ? 1.6 : 1} opacity={i === 4 ? 0.9 : 0.35 + (i % 3) * 0.12} />
      ))}
    </svg>
  );
}
