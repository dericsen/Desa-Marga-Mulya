"use client";

import { useEffect, useMemo, useState } from "react";
import { parseJamLayanan, statusKantor } from "@/lib/jam";

/** Indikator kantor desa buka/tutup berdasarkan jam layanan di CMS dan waktu WIB. */
export function OfficeStatus({ jamLayanan, tone = "dark", fallback }: { jamLayanan: string; tone?: "dark" | "light"; fallback?: string }) {
  const jadwal = useMemo(() => parseJamLayanan(jamLayanan), [jamLayanan]);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  if (!jadwal || !now) {
    return fallback ? <span className={tone === "dark" ? "text-white/60" : "text-muted"}>{fallback}</span> : null;
  }
  const st = statusKantor(jadwal, now);
  return (
    <span className="inline-flex items-center gap-2" data-status-kantor={st.buka ? "buka" : "tutup"}>
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {st.buka ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sun-400 opacity-60 motion-reduce:hidden" /> : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${st.buka ? "bg-sun-400" : tone === "dark" ? "bg-white/35" : "bg-stone-400"}`} />
      </span>
      <span>
        <span className="sr-only">Kantor desa: </span>
        {st.teks}
      </span>
    </span>
  );
}
