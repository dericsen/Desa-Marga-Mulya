/**
 * Jam layanan dari CMS (teks bebas per baris, mis. "Senin – Kamis: 08.00 – 15.00 WIB")
 * ditampilkan sebagai tabel kecil dua kolom: hari di kiri, jam rata kanan.
 * Baris tanpa titik dua tetap tampil utuh.
 */
export function JamLayanan({ teks, tone = "light" }: { teks: string; tone?: "light" | "dark" }) {
  const baris = teks
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      // Titik dua pemisah hari harus sebelum angka jam pertama (hindari memotong "08:00").
      const angka = l.search(/\d/);
      return i > 0 && (angka < 0 || i < angka) ? { hari: l.slice(0, i).trim(), jam: l.slice(i + 1).trim() } : { hari: l, jam: "" };
    });
  const muted = tone === "dark" ? "text-white/60" : "text-muted";
  const strong = tone === "dark" ? "text-white" : "text-ink";
  const line = tone === "dark" ? "divide-white/10" : "divide-line";
  return (
    <ul className={`divide-y ${line}`}>
      {baris.map((b, i) => {
        const tutup = /tutup|libur/i.test(b.jam);
        return (
          <li key={i} className="flex items-baseline justify-between gap-4 py-1.5 first:pt-0 last:pb-0">
            <span className={b.jam ? muted : strong}>{b.hari}</span>
            {b.jam ? <span className={`shrink-0 text-right tabular-nums ${tutup ? muted : `font-medium ${strong}`}`}>{tutup ? "Tutup" : b.jam}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}
