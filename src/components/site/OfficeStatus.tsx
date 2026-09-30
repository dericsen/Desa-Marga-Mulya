"use client";

import { useEffect, useMemo, useState } from "react";
import { parseJamLayanan, statusKantor } from "@/lib/jam";

type Props = {
  jamLayanan: string;
  /** Waktu render server (ISO) agar tampilan awal sama dengan hasil server, tanpa lompatan tata letak. */
  initialNow?: string;
  variant?: "chip" | "line" | "hero";
  tone?: "dark" | "light";
  fallback?: string;
  /** @deprecated gunakan variant="chip" */
  short?: boolean;
};

/**
 * Status kantor desa dari jam layanan di CMS dan waktu WIB.
 * Buka = titik terisi (berdenyut pelan hanya pada varian hero); tutup = titik bergaris.
 */
export function OfficeStatus({ jamLayanan, initialNow, variant, tone = "light", fallback, short }: Props) {
  const v = variant ?? (short ? "chip" : "line");
  const jadwal = useMemo(() => parseJamLayanan(jamLayanan), [jamLayanan]);
  const [now, setNow] = useState<Date | null>(initialNow ? new Date(initialNow) : null);

  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const isi = tone === "dark" ? "bg-white" : "bg-ink";
  const garis = tone === "dark" ? "border-white/60" : "border-slate";

  if (!jadwal || !now) {
    const teks = fallback ?? "Lihat jam layanan kantor desa";
    if (v === "hero") return <p className="font-display text-[1.5rem] leading-tight sm:text-[2.25rem]">Jam layanan kantor desa</p>;
    return <span className={tone === "dark" ? "text-white/70" : "text-muted"}>{teks}</span>;
  }

  const st = statusKantor(jadwal, now);
  const dot = (
    <span className={`relative flex shrink-0 ${v === "hero" ? "h-3.5 w-3.5" : "h-2 w-2"}`} aria-hidden="true">
      {st.buka && v === "hero" ? <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 motion-reduce:hidden ${isi}`} /> : null}
      <span className={`relative inline-flex h-full w-full rounded-full ${st.buka ? isi : `border-2 ${garis}`}`} />
    </span>
  );

  if (v === "hero") {
    return (
      <div data-status-kantor={st.buka ? "buka" : "tutup"} aria-live="polite">
        <p className="font-display flex items-center gap-4 text-[1.5rem] leading-tight sm:text-[2.25rem]">
          {dot}
          {st.judul}
        </p>
        <p className="mt-2 pl-[1.875rem] text-lg text-muted sm:pl-9">{st.rinci}</p>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-2" data-status-kantor={st.buka ? "buka" : "tutup"} title={v === "chip" ? `${st.judul} ${st.rinci}` : undefined}>
      {dot}
      <span>
        <span className="sr-only">Kantor desa: </span>
        {v === "chip" ? st.ringkas : `${st.judul.replace("Kantor desa sedang ", "").replace("Kantor desa ", "").replace(/^./, (c) => c.toUpperCase())} ${st.rinci}`}
      </span>
    </span>
  );
}
