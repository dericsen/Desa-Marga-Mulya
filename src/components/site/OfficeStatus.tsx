"use client";

import { useEffect, useState } from "react";
import { statusKantorAkhir, type StatusManual } from "@/lib/jam";

/**
 * Indikator kantor desa buka/tutup.
 * Urutan: status manual dari admin panel (bila masih berlaku) → jadwal jam layanan di CMS (waktu WIB).
 */
export function OfficeStatus({
  jamLayanan,
  manual,
  tone = "dark",
  fallback,
  short = false,
}: {
  jamLayanan: string;
  manual?: StatusManual | null;
  tone?: "dark" | "light";
  fallback?: string;
  /** Versi ringkas untuk chip di header: "Kantor buka" / "Kantor tutup". */
  short?: boolean;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const st = now ? statusKantorAkhir(jamLayanan, manual, now) : null;
  if (!st) {
    if (short) return <span className={tone === "dark" ? "text-white/60" : "text-muted"}>Jam layanan kantor desa</span>;
    return fallback ? <span className={tone === "dark" ? "text-white/60" : "text-muted"}>{fallback}</span> : null;
  }
  const onColor = tone === "dark" ? "bg-sun-400" : "bg-brand-500";
  const offColor = st.manual ? "bg-red-500" : tone === "dark" ? "bg-white/35" : "bg-stone-400";
  return (
    <span className="inline-flex items-center gap-2" data-status-kantor={st.buka ? "buka" : "tutup"} data-status-manual={st.manual ? "ya" : undefined} title={short ? st.teks : undefined}>
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {st.buka ? <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden ${onColor}`} /> : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${st.buka ? onColor : offColor}`} />
      </span>
      <span>
        <span className="sr-only">Kantor desa: </span>
        {short ? (st.buka ? "Kantor buka" : st.manual ? "Tutup sementara" : "Kantor tutup") : st.teks}
      </span>
    </span>
  );
}
