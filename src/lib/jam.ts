// Membaca teks jam layanan bebas dari CMS menjadi jadwal mingguan.
// Contoh yang dipahami:
//   "Senin – Kamis: 08.00 – 15.00 WIB"
//   "Jumat: 08.00 – 11.00 WIB"
//   "Sabtu, Minggu & hari libur: tutup"
// Bila teks tidak dapat dibaca, fungsi mengembalikan null dan indikator tidak ditampilkan.

const HARI = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
export const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export type Jadwal = Record<number, { buka: number; tutup: number } | null>; // menit sejak 00.00

function hariDalam(teks: string): number[] {
  const t = teks.toLowerCase().replace(/jum'?at/g, "jumat");
  const found: { idx: number; pos: number }[] = [];
  HARI.forEach((h, idx) => {
    const pos = t.search(new RegExp(`\\b${h}\\b`));
    if (pos >= 0) found.push({ idx, pos });
  });
  found.sort((a, b) => a.pos - b.pos);
  if (found.length === 2 && /[–—-]|s\.?\s?d\.?|sampai|hingga/.test(t.slice(found[0].pos, found[1].pos + 1))) {
    // Rentang, mis. Senin – Kamis (urutan kerja Senin..Minggu)
    const out: number[] = [];
    let i = found[0].idx;
    for (let n = 0; n < 7; n++) {
      out.push(i);
      if (i === found[1].idx) break;
      i = (i + 1) % 7;
    }
    return out;
  }
  return found.map((f) => f.idx);
}

export function parseJamLayanan(teks: string): Jadwal | null {
  const jadwal: Jadwal = {};
  let terbaca = 0;
  for (const baris of teks.split(/\n+/)) {
    const m = baris.match(/^([^\d]*?)\s*:\s*(.+)$/);
    if (!m) continue;
    const hari = hariDalam(m[1]);
    if (!hari.length) continue;
    const jam = m[2].match(/(\d{1,2})[.:](\d{2})\s*[–—-]\s*(\d{1,2})[.:](\d{2})/);
    const nilai = jam ? { buka: +jam[1] * 60 + +jam[2], tutup: +jam[3] * 60 + +jam[4] } : /tutup|libur/i.test(m[2]) ? null : undefined;
    if (nilai === undefined) continue;
    for (const h of hari) jadwal[h] = nilai;
    terbaca++;
  }
  return terbaca ? jadwal : null;
}

const fmt = (menit: number) => `${String(Math.floor(menit / 60)).padStart(2, "0")}.${String(menit % 60).padStart(2, "0")}`;

/** Status saat ini berdasarkan waktu WIB. Hari libur nasional tidak diperhitungkan. */
export function statusKantor(jadwal: Jadwal, now: Date): { buka: boolean; teks: string } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.find((p) => p.type === "weekday")!.value);
  const menit = Number(parts.find((p) => p.type === "hour")!.value) * 60 + Number(parts.find((p) => p.type === "minute")!.value);

  const hariIni = jadwal[wd];
  if (hariIni && menit >= hariIni.buka && menit < hariIni.tutup) return { buka: true, teks: `Buka · tutup pukul ${fmt(hariIni.tutup)} WIB` };
  if (hariIni && menit < hariIni.buka) return { buka: false, teks: `Tutup · buka hari ini pukul ${fmt(hariIni.buka)} WIB` };
  for (let n = 1; n <= 7; n++) {
    const d = (wd + n) % 7;
    const j = jadwal[d];
    if (j) return { buka: false, teks: `Tutup · buka ${n === 1 ? "besok" : NAMA_HARI[d]} pukul ${fmt(j.buka)} WIB` };
  }
  return { buka: false, teks: "Tutup" };
}
