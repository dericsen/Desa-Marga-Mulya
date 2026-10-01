// Mesin jawab "Tanya Desa" tanpa AI (dipakai bila Gemini tidak tersedia).
// Tidak menempel potongan data mentah: memahami maksud pertanyaan (jam buka, syarat surat, harga produk,
// jumlah penduduk/petani/sekolah, cuaca, aparat, wisata, kegiatan) lalu menyusun jawaban yang langsung ke inti.
import { POTENSI_TYPES, PRODUK_KATEGORI, STAT_CATEGORIES } from "./categories";
import type { Cuaca } from "./cuaca";
import { formatDate, formatNumber, formatRupiah } from "./format";
import { parseJamLayanan, statusKantorAkhir, type StatusManual } from "./jam";
import type { Aparat, Berita, Lokasi, Organisasi, Potensi, Produk, SiteSettings, Statistik } from "./types";

export type DataDesa = {
  site: SiteSettings;
  statistik: Statistik[];
  aparat: Aparat[];
  potensi: Potensi[];
  organisasi: Organisasi[];
  berita: Berita[];
  lokasi: Lokasi[];
  produk: Produk[];
  cuaca: Cuaca | null;
  /** Status buka/tutup yang diatur manual oleh admin. */
  statusManual?: StatusManual | null;
  /** Seluruh dokumen pengetahuan (judul, isi, tautan halaman) untuk pencarian teks penuh. */
  docs?: { title: string; text: string; link: string }[];
};

/* ----------------------------- Pemrosesan teks ----------------------------- */

const SINGKATAN: Record<string, string> = {
  brp: "berapa", berapakah: "berapa", brapa: "berapa", jmlh: "jumlah", jml: "jumlah", gmn: "bagaimana", gimana: "bagaimana", gmana: "bagaimana",
  dmn: "dimana", dimanakah: "dimana", sy: "saya", aq: "saya", aku: "saya", gw: "saya", yg: "yang", dgn: "dengan", utk: "untuk", buat: "untuk",
  tdk: "tidak", gak: "tidak", ga: "tidak", nggak: "tidak", ngga: "tidak", kades: "kepala desa", lurah: "kepala desa", sekdes: "sekretaris desa",
  telp: "telepon", tlp: "telepon", notelp: "telepon", wa: "whatsapp", skrg: "sekarang", sekarang: "sekarang", bsk: "besok", pddk: "penduduk",
  org: "orang", warga: "penduduk", masyarakat: "penduduk", jiwa: "penduduk", cowok: "laki", cewek: "perempuan", pria: "laki", wanita: "perempuan",
  sklh: "sekolah", skolah: "sekolah", ktp: "ktp", akte: "akta", meninggal: "kematian", wafat: "kematian", lahir: "kelahiran", bikin: "urus",
  membuat: "urus", ngurus: "urus", mengurus: "urus", pembuatan: "urus", oleh2: "oleh", jualan: "jual", berjualan: "jual", dagang: "jual",
  ngapain: "kegiatan", ngapa: "kegiatan", smp: "sltp", sma: "slta", ombak: "gelombang", melaut: "gelombang", ujan: "hujan",
};

const STOP = new Set(
  ("apa apakah apaan berapa bagaimana siapa siapakah dimana mana kapan yang dan atau untuk dengan ada adakah saja aja ini itu ke dari di desa marga mulya " +
    "saya mau ingin pengen tahu tau tolong bisa bisakah dong ya kah nya adalah info informasi tentang cara kami kita sih deh kak min mohon minta " +
    "jumlah banyak total berapakah boleh punya mengenai soal terkait ga tidak yg kalau kalo nih tuh lagi udah sudah perlu harus kah pak bu " +
    "menurut per berdasarkan dalam sebutkan jelaskan tampilkan lihat kapan aja apa")
    .split(" ")
);

export function bersihkan(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function stem(t: string): string {
  let w = t;
  if (w.length > 5) w = w.replace(/(nya|kah|lah)$/, "");
  return w;
}

/** Token bermakna dari teks (singkatan dikembangkan, kata tugas dibuang). */
export function token(s: string): string[] {
  return bersihkan(s)
    .split(" ")
    .flatMap((w) => (SINGKATAN[w] ?? w).split(" "))
    .map(stem)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

const sama = (a: string, b: string) =>
  a === b ||
  (a.length >= 5 && b.length >= 5 && (a.endsWith(b) || b.endsWith(a))) || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) || (a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5));

/** Skor kecocokan: berapa token target yang disebut di pertanyaan (0–1), plus jumlah token cocok. */
function cocok(q: string[], teks: string): { rasio: number; n: number } {
  const t = Array.from(new Set(token(teks)));
  if (!t.length) return { rasio: 0, n: 0 };
  const n = t.filter((x) => q.some((y) => sama(x, y))).length;
  return { rasio: n / t.length, n };
}

const ada = (q: string, re: RegExp) => re.test(q);
const daftar = (xs: string[]) => xs.map((x) => `• ${x}`).join("\n");
const angka = (n: number, satuan?: string) => `${formatNumber(n)}${satuan ? ` ${satuan}` : ""}`;

/* ------------------------------- Penjawab ------------------------------- */

const NAMA_HARI_KECIL = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
const fmtMenit = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;

function jawabJam(d: DataDesa, b: string): string {
  const { site } = d;
  const hariDitanya = NAMA_HARI_KECIL.findIndex((h) => new RegExp(`\\b${h}\\b`).test(b.replace(/jum at/g, "jumat")));
  const jd = site.jamLayanan ? parseJamLayanan(site.jamLayanan) : null;
  const sm = statusKantorAkhir(site.jamLayanan, d.statusManual, new Date());
  if (sm?.manual && /sekarang|hari ini|skrg|lagi buka|masih buka/.test(b)) {
    return `Saat ini kantor desa **${sm.buka ? "buka" : "tutup sementara"}** — ${sm.teks}.\n\nJam layanan biasa:\n${daftar(site.jamLayanan.split("\n").map((l) => l.trim()).filter(Boolean))}`;
  }
  if (jd && hariDitanya >= 0) {
    const j = jd[hariDitanya];
    const nama = hariDitanya === 5 ? "Jumat" : NAMA_HARI_KECIL[hariDitanya][0].toUpperCase() + NAMA_HARI_KECIL[hariDitanya].slice(1);
    return j
      ? `Hari ${nama} kantor desa **buka pukul ${fmtMenit(j.buka)} – ${fmtMenit(j.tutup)} WIB**.`
      : `Hari ${nama} kantor desa **tutup**. Jam layanan: ${site.jamLayanan.split("\n").filter((l) => !/tutup|libur/i.test(l)).join("; ")}.`;
  }
  if (!site.jamLayanan) return "Jam layanan kantor desa belum diisi di website. Silakan hubungi kantor desa melalui halaman **Kontak**.";
  const st = statusKantorAkhir(site.jamLayanan, d.statusManual, new Date());
  const status = st
    ? st.manual
      ? `Saat ini kantor desa **${st.buka ? "buka" : "tutup sementara"}** (${st.teks.replace(/^(Buka|Tutup sementara)( · )?/, "") || "diumumkan petugas desa"}).\n\n`
      : `Saat ini kantor desa **${st.buka ? "buka" : "tutup"}** (${st.teks.replace(/^(Buka|Tutup) · /, "")}).\n\n`
    : "";
  return `${status}Jam layanan Kantor Desa ${site.namaDesa}:\n${daftar(site.jamLayanan.split("\n").map((l) => l.trim()).filter(Boolean))}${
    site.alamat ? `\n\nAlamat: ${site.alamat}.` : ""
  }`;
}

const ALIAS_LAYANAN: [RegExp, string][] = [
  [/\bkk\b|kartu keluarga/, "kartu keluarga"],
  [/\bktp\b|ktp el|e ktp/, "ktp"],
  [/\bsku\b|keterangan usaha|izin usaha/, "keterangan usaha"],
  [/\bsktm\b|tidak mampu|miskin/, "tidak mampu"],
  [/kelahiran|akta lahir|bayi/, "kelahiran"],
  [/kematian|akta mati/, "kematian"],
  [/domisili|tempat tinggal|pindah/, "domisili"],
];

function jawabLayanan(d: DataDesa, qRaw: string, q: string[]): string | null {
  const { site } = d;
  if (!site.layanan.length) return null;
  const b = bersihkan(qRaw);
  const tambahan = ALIAS_LAYANAN.filter(([re]) => re.test(b)).flatMap(([, w]) => token(w));
  const qq = [...q, ...tambahan];
  const skor = site.layanan
    .map((l) => ({ l, s: cocok(qq, l.label.replace(/^surat (pengantar|keterangan)\s*/i, "")) }))
    .sort((a, b) => b.s.rasio - a.s.rasio || b.s.n - a.s.n);
  const best = skor[0];
  const jam = site.jamLayanan ? `\n\nLayanan dilayani pada jam kerja: ${site.jamLayanan.split("\n").slice(0, 2).join("; ")}.` : "";
  if (best && best.s.n > 0 && best.s.rasio >= 0.5) {
    return `**${best.l.label}**\nYang perlu dibawa: ${best.l.nilai}.${site.catatanLayanan ? `\n\n${site.catatanLayanan}` : ""}${jam}`;
  }
  return `Layanan administrasi di Kantor Desa ${site.namaDesa}:\n${daftar(site.layanan.map((l) => l.label))}\n\nSebutkan nama suratnya (mis. "syarat surat domisili") agar saya tunjukkan dokumen yang perlu dibawa.${
    site.catatanLayanan ? `\n\n${site.catatanLayanan}` : ""
  }`;
}

function jawabKontak(d: DataDesa): string {
  const s = d.site;
  const baris = [
    s.alamat && `Alamat: ${s.alamat}`,
    s.telepon && `Telepon: ${s.telepon}`,
    s.whatsapp && `WhatsApp: ${s.whatsapp.replace(/^62/, "0")}`,
    s.email && `Email: ${s.email}`,
  ].filter(Boolean) as string[];
  return `Kontak Kantor Desa ${s.namaDesa}:\n${daftar(baris)}\n\nAnda juga bisa mengirim pesan atau aspirasi melalui formulir di halaman **Kontak**.`;
}

function jawabAparat(d: DataDesa, q: string[], b: string): string | null {
  if (!d.aparat.length) return null;
  const jab = d.aparat
    .map((a) => ({ a, s: cocok(q, a.jabatan) }))
    .filter((x) => x.s.rasio >= 0.6 || (x.s.n >= 2))
    .sort((a, b) => b.s.rasio - a.s.rasio || b.s.n - a.s.n);
  if (/kepala desa|\bkades\b|\blurah\b/.test(b) || (jab[0] && /kepala desa/i.test(jab[0].a.jabatan) && !/dusun/.test(b))) {
    const k = d.aparat.find((a) => /^kepala desa$/i.test(a.jabatan)) ?? d.aparat[0];
    return `Kepala Desa ${d.site.namaDesa} adalah **${d.site.namaKepalaDesa || k.nama}**.`;
  }
  if (jab.length && jab[0].s.rasio >= 0.6) {
    const top = jab.filter((x) => x.s.rasio === jab[0].s.rasio);
    return top.map((x) => `${x.a.jabatan}: **${x.a.nama}**`).join("\n");
  }
  return `Perangkat Desa ${d.site.namaDesa}:\n${daftar(d.aparat.map((a) => `${a.jabatan}: ${a.nama}`))}\n\nSelengkapnya di halaman **Profil Desa**.`;
}

function jawabCuaca(d: DataDesa, b: string): string {
  const c = d.cuaca;
  if (!c) return "Data cuaca sedang tidak dapat diambil. Silakan cek kembali beberapa saat lagi, atau lihat informasi resmi BMKG.";
  const k = c.sekarang;
  const besok = /besok/.test(b);
  const h = besok ? c.hari[1] : c.hari[0];
  const nelayan = /gelombang|laut|nelayan|perahu/.test(b);
  const petani = /tani|sawah|panen|jemur|semprot|pupuk/.test(b);
  let out = besok
    ? `Prakiraan **besok**: ${h?.label.toLowerCase() ?? "-"}, ${h ? `${Math.round(h.suhuMin)}–${Math.round(h.suhuMaks)}°C` : ""}${h?.peluangHujan != null ? `, peluang hujan **${h.peluangHujan}%**` : ""}.`
    : `Cuaca sekarang: **${k.label.toLowerCase()}, ${Math.round(k.suhu)}°C** (terasa ${Math.round(k.terasa)}°C), angin ${Math.round(k.angin)} km/jam dari ${k.arahAngin}.${
        h ? ` Hari ini ${Math.round(h.suhuMin)}–${Math.round(h.suhuMaks)}°C${h.peluangHujan != null ? `, peluang hujan **${h.peluangHujan}%**` : ""}.` : ""
      }`;
  const gel = besok ? h?.gelombangMaks : k.gelombang;
  if (gel != null) out += ` Gelombang laut sekitar **${gel.toFixed(1)} m**.`;
  const saran = c.saran.filter((s) => (nelayan ? s.untuk === "Nelayan" : petani ? s.untuk === "Petani" : true));
  if (saran.length && !besok) out += `\n\n${saran.map((s) => `${s.untuk}: ${s.teks}`).join("\n")}`;
  return `${out}\n\nSumber: Open-Meteo, diperbarui pukul ${c.diperbarui.slice(11, 16).replace(":", ".")} WIB. Bukan peringatan resmi — untuk cuaca ekstrem ikuti BMKG.`;
}

function infoBelanja(): string {
  return "Cara pesan: buka **Pasar Desa**, masukkan produk ke keranjang, isi nama dan nomor HP, lalu kirim pesanan ke WhatsApp penjual. Pembayaran langsung ke penjual (tunai/transfer).";
}

function jawabProduk(d: DataDesa, q: string[], b: string): string | null {
  const tersedia = d.produk;
  if (!tersedia.length) return null;
  const kat = PRODUK_KATEGORI.find((k) => cocok(q, k.label).rasio >= 0.5);
  const hasil = tersedia
    .map((p) => ({ p, s: cocok(q, p.nama), s2: cocok(q, p.penjual_nama) }))
    .filter((x) => x.s.rasio >= 0.5 || (x.s.n >= 1 && x.s.rasio >= 0.34) || x.s2.rasio >= 0.6)
    .sort((a, b) => b.s.rasio - a.s.rasio || b.s.n - a.s.n || b.s2.rasio - a.s2.rasio);
  const baris = (p: Produk) => `${p.nama}${p.satuan ? `, ${p.satuan}` : ""} — **${formatRupiah(p.harga)}** (${p.penjual_nama})${p.stok === 0 ? " · sedang habis" : ""}`;
  if (hasil.length) {
    const terbaik = hasil[0].s.rasio;
    const pilih = (terbaik >= 0.34 ? hasil.filter((x) => x.s.rasio >= terbaik - 0.01) : hasil.filter((x) => x.s2.rasio >= 0.6)).slice(0, 6).map((x) => x.p);
    return `${pilih.length === 1 ? "Produk yang cocok:" : "Produk yang cocok di Pasar Desa:"}\n${daftar(pilih.map(baris))}\n\n${infoBelanja()}`;
  }
  if (kat) {
    const ps = tersedia.filter((p) => p.kategori === kat.key).slice(0, 8);
    if (ps.length) return `${kat.label} di Pasar Desa:\n${daftar(ps.map(baris))}\n\n${infoBelanja()}`;
  }
  if (/murah|termurah/.test(b)) {
    const ps = [...tersedia].filter((p) => p.stok !== 0).sort((a, c) => a.harga - c.harga).slice(0, 5);
    return `Produk termurah di Pasar Desa:\n${daftar(ps.map(baris))}\n\n${infoBelanja()}`;
  }
  const jumlahPenjual = new Set(tersedia.map((p) => p.penjual_id)).size;
  const contoh = tersedia.filter((p) => p.stok !== 0).slice(0, 6);
  return `Ada **${tersedia.length} produk** dari **${jumlahPenjual} pelaku usaha** warga di Pasar Desa, antara lain:\n${daftar(contoh.map(baris))}\n\n${infoBelanja()}`;
}

const GENERIK_WISATA = new Set(["wisata", "budaya", "kesenian", "seni", "tempat", "rekreasi", "liburan", "jalan", "main", "piknik", "destinasi"]);
const tanpaGenerik = (q: string[]) => q.filter((x) => !GENERIK_WISATA.has(x));

function jawabWisata(d: DataDesa, q0: string[], b: string): string | null {
  if (!d.potensi.length) return null;
  const q = tanpaGenerik(q0);
  const hasil = d.potensi.map((p) => ({ p, s: cocok(q, p.nama) })).filter((x) => x.s.rasio >= 0.5).sort((a, c) => c.s.rasio - a.s.rasio);
  if (hasil.length) {
    const p = hasil[0].p;
    const tipe = POTENSI_TYPES.find((t) => t.key === p.tipe)?.label ?? p.tipe;
    return `**${p.nama}** (${tipe})\n${p.deskripsi ?? ""}${p.alamat ? `\nLokasi: ${p.alamat}.` : ""}${p.harga ? `\nHarga/tiket: ${p.harga}.` : ""}${
      p.kontak ? `\nKontak: ${p.kontak.replace(/^62/, "0")}.` : ""
    }`.trim();
  }
  const tipe = /budaya|seni|kesenian|tradisi|tari|silat/.test(b) ? "budaya" : "wisata";
  const ps = d.potensi.filter((p) => p.tipe === tipe);
  if (!ps.length) return null;
  return `${tipe === "budaya" ? "Budaya dan kesenian" : "Tempat wisata"} di sekitar Desa ${d.site.namaDesa}:\n${daftar(
    ps.map((p) => `**${p.nama}**${p.alamat ? ` — ${p.alamat}` : ""}`)
  )}\n\nDetailnya ada di halaman **Wisata & Budaya**.`;
}

function jawabBerita(d: DataDesa): string | null {
  if (!d.berita.length) return null;
  return `Kabar terbaru dari desa:\n${daftar(d.berita.slice(0, 4).map((b) => `${formatDate(b.tanggal)} — ${b.judul}`))}\n\nBaca selengkapnya di halaman **Berita**.`;
}

/** Kata yang sering dipakai warga → kata pada judul/kategori data statistik. */
const SINONIM_STAT: [RegExp, string][] = [
  [/penduduk|laki|perempuan|kepala keluarga|\bkk\b/, "penduduk kependudukan jenis kelamin ringkasan"],
  [/kerja|pekerjaan|profesi|mata pencaharian|petani|nelayan|pedagang|buruh|guru|pns|tni|polri|karyawan/, "mata pencaharian"],
  [/sekolah|sd|smp|sma|smk|mts|madrasah/, "sekolah jenjang"],
  [/murid|siswa|pelajar/, "murid jenjang"],
  [/guru|pengajar/, "guru jenjang"],
  [/pendidikan|lulusan|sarjana|tamat/, "tingkat pendidikan penduduk"],
  [/puskesmas|pustu|posyandu|bidan|dokter|klinik|apotek|rumah sakit/, "fasilitas kesehatan tenaga"],
  [/gizi|stunting|balita/, "status gizi balita"],
  [/imunisasi|vaksin/, "imunisasi"],
  [/air bersih|sumur|pdam/, "sumber air bersih"],
  [/sawah|lahan|tanah/, "penggunaan lahan luas sawah"],
  [/panen|padi|produksi/, "luas panen produksi pertanian"],
  [/ternak|sapi|kambing|kerbau/, "populasi ternak"],
  [/ayam|bebek|unggas|itik/, "populasi unggas"],
  [/jalan|aspal/, "jalan"],
  [/rt|rw|dusun|wilayah administratif/, "wilayah administratif"],
  [/bank|koperasi|keuangan/, "lembaga keuangan"],
  [/listrik|pln/, "listrik"],
  [/pbb|pajak/, "penerimaan pbb"],
  [/toko|warung|pasar tradisional/, "sarana perdagangan"],
  [/industri|pabrik|kerajinan/, "industri"],
  [/kb|keluarga berencana/, "keluarga berencana"],
  [/menikah|nikah|cerai/, "pernikahan perceraian"],
  [/kelompok tani|gapoktan|kelompok nelayan/, "kelompok tani nelayan"],
  [/ibadah|masjid|mushola/, "fasilitas umum"],
];

function jawabStatistik(d: DataDesa, q0: string[], b: string): { teks: string; skor: number } | null {
  let q = q0;
  if (/\bkk\b/.test(b)) q = [...q.filter((x) => x !== "kk"), "kepala", "keluarga"];
  const tambahan = SINONIM_STAT.filter(([re]) => re.test(b)).flatMap(([, w]) => token(w));
  const qq = [...q, ...tambahan];

  // 1) Angka kunci di Beranda (mis. "Jumlah Penduduk", "Luas Wilayah").
  for (const a of d.site.angkaKunci) {
    const label = token(a.label.replace(/\//g, " "));
    const s = cocok(q, a.label.replace(/\//g, " "));
    const tercakup = q.length > 0 && q.every((x) => label.some((y) => sama(x, y)));
    if (s.n >= 1 && tercakup) {
      let teks = `${a.label} Desa ${d.site.namaDesa}: **${a.nilai}**.`;
      if (/penduduk/i.test(a.label)) {
        const jk = d.statistik.find((x) => /jenis kelamin/i.test(x.judul) && x.kategori === "kependudukan");
        const l = jk?.items.find((i) => /laki/i.test(i.label));
        const p = jk?.items.find((i) => /perempuan/i.test(i.label));
        if (l && p) teks += ` Terdiri dari **${formatNumber(l.nilai)}** laki-laki dan **${formatNumber(p.nilai)}** perempuan.`;
      }
      return { teks: `${teks}\n\nData lengkap ada di halaman **Informasi Desa**.`, skor: 3 };
    }
  }

  // 2) Tabel statistik: cari tabel paling cocok, lalu baris yang disebut di pertanyaan.
  const kandidat = d.statistik
    .filter((s) => s.items.length)
    .map((s) => {
      const judul = cocok(qq, s.judul);
      const kat = cocok(q, STAT_CATEGORIES.find((c) => c.key === s.kategori)?.label ?? s.kategori);
      const kepala = token(`${s.judul} ${STAT_CATEGORIES.find((c) => c.key === s.kategori)?.label ?? ""}`);
      const sisa = q.filter((x) => !kepala.some((y) => sama(x, y)));
      const daftarItem = s.items
        .map((i) => {
          const c = cocok(q, i.label.replace(/\(.*?\)/g, ""));
          const it = token(i.label.replace(/\(.*?\)/g, ""));
          const tepat = c.n >= 1 && (c.rasio >= 0.99 || (sisa.length > 0 && sisa.every((x) => it.some((y) => sama(x, y)))));
          return { i, c, tepat };
        })
        .sort((a, c) => Number(c.tepat) - Number(a.tepat) || c.c.rasio - a.c.rasio || c.c.n - a.c.n);
      const item = daftarItem[0];
      const tepatSemua = item?.tepat ? daftarItem.filter((x) => x.tepat && x.c.rasio === item.c.rasio) : [];
      const semua = [...kepala, ...(item ? token(item.i.label) : [])];
      const cakupan = q.length ? q.filter((x) => semua.some((y) => sama(x, y))).length / q.length : 0;
      const skor = judul.rasio * 2 + judul.n * 0.5 + kat.rasio * 0.5 + (item?.tepat ? 1.5 : item ? item.c.rasio * 0.5 : 0) + cakupan * 3;
      return { s, skor, item, tepatSemua };
    })
    .sort((a, c) => c.skor - a.skor);
  const best = kandidat[0];
  if (!best || best.skor < 2.5) return null;
  const { s, item, tepatSemua } = best;
  const satuan = s.satuan || "";
  const sumber = `(${s.judul}${s.tahun ? `, ${s.tahun}` : ""})`;
  if (tepatSemua.length > 1) {
    const jml = tepatSemua.reduce((t, x) => t + x.i.nilai, 0);
    return {
      teks: `${daftar(tepatSemua.map((x) => `${x.i.label}: **${angka(x.i.nilai, satuan)}**`))}\nJumlah: **${angka(jml, satuan)}** ${sumber}.\n\nData lengkap ada di halaman **Informasi Desa**.`,
      skor: best.skor,
    };
  }
  if (item?.tepat) {
    const total = s.items.reduce((t, i) => t + i.nilai, 0);
    const persen = total > 0 && s.tipe_grafik !== "tabel" && s.items.length > 1 ? ` — ${formatNumber(Math.round((item.i.nilai / total) * 1000) / 10)}% dari total` : "";
    return { teks: `${item.i.label}: **${angka(item.i.nilai, satuan)}**${persen} ${sumber}.${s.deskripsi ? ` ${s.deskripsi}` : ""}\n\nData lengkap ada di halaman **Informasi Desa**.`, skor: best.skor };
  }
  const urut = s.tipe_grafik === "tabel" ? s.items : [...s.items].sort((a, c) => c.nilai - a.nilai);
  const total = s.items.reduce((t, i) => t + i.nilai, 0);
  const totalTeks = s.tipe_grafik !== "tabel" && s.items.length > 1 && satuan ? `\nTotal: **${angka(total, satuan)}**.` : "";
  const sisa = urut.length > 8 ? `\n…dan ${urut.length - 8} lainnya.` : "";
  return {
    teks: `**${s.judul}**${s.tahun ? ` (${s.tahun})` : ""}:\n${daftar(urut.slice(0, 8).map((i) => `${i.label}: ${angka(i.nilai, satuan)}`))}${sisa}${totalTeks}\n\nData lengkap ada di halaman **Informasi Desa**.`,
    skor: best.skor,
  };
}

function jawabOrganisasi(d: DataDesa, q: string[], b: string): { teks: string; skor: number } | null {
  const h = d.organisasi.map((o) => ({ o, s: cocok(q, o.nama.replace(/\(.*?\)/g, "") + " " + (o.nama.match(/\((.*?)\)/)?.[1] ?? "")) })).sort((a, c) => c.s.rasio - a.s.rasio || c.s.n - a.s.n)[0];
  if (!h || h.s.n === 0 || h.s.rasio < 0.3) return null;
  const o = h.o;
  return {
    teks: `**${o.nama}**\n${o.deskripsi ?? ""}${o.jadwal ? `\nKegiatan rutin: ${o.jadwal}.` : ""}${o.anggota ? `\nAnggota: ${formatNumber(o.anggota)} orang.` : ""}`.trim(),
    skor: 1 + h.s.rasio * 2 + (/kapan|jadwal|kegiatan|ngapain|rutin|pertemuan|rapat|anggota|ketua|tugas|fungsi/.test(b) ? 6 : 0),
  };
}

function jawabLokasi(d: DataDesa, q: string[], b: string): { teks: string; skor: number } | null {
  const tanyaTempat = /dimana|di mana|letak|lokasi|alamat|arah|ke mana|kemana/.test(b);
  const h = d.lokasi.map((l) => ({ l, s: cocok(q, l.nama) })).sort((a, c) => c.s.rasio - a.s.rasio || c.s.n - a.s.n)[0];
  if (!h || h.s.n === 0 || h.s.rasio < (tanyaTempat ? 0.33 : 0.5)) return null;
  const l = h.l;
  return {
    teks: `**${l.nama}**${l.deskripsi ? ` — ${l.deskripsi}` : ""}\nLihat titiknya di peta desa (halaman **Beranda** atau **Profil**), atau buka Google Maps: https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`,
    skor: 1 + h.s.rasio * 2 + (tanyaTempat ? 3.5 : 0),
  };
}

const NAMA_HALAMAN: Record<string, string> = {
  "/": "Beranda", "/profil": "Profil Desa", "/informasi": "Informasi Desa", "/pasar": "Pasar Desa", "/potensi": "Wisata & Budaya",
  "/berita": "Berita", "/galeri": "Galeri", "/kontak": "Kontak",
};
const halaman = (link: string) => NAMA_HALAMAN[link.split(/[?#]/)[0]] ?? (link.startsWith("/berita/") ? "Berita" : link.startsWith("/pasar") ? "Pasar Desa" : "Beranda");

/** Pecah teks menjadi kalimat tanpa memotong singkatan (Kec., Kab., Jl., No., dll.). */
function kalimatDari(teks: string): string[] {
  const aman = teks.replace(/\b(Kec|Kab|Kel|Jl|No|Ds|Prov|dll|dsb|Hj|H|Dr|Ir|St|Bpk|Ibu|Sdr)\./g, "$1\u2024");
  return aman
    .split(/(?<=[.!?])\s+|\n+|\s\|\s|;\s/)
    .map((k) => k.replace(/\u2024/g, ".").replace(/^\d{1,2} \w+ \d{4} \([^)]*\) — /, "").replace(/^\d{4}-\d{2}-\d{2} \([^)]*\) — /, "").trim())
    .filter((k) => k.length > 12);
}

/**
 * Pencarian teks penuh di semua konten website: pilih dokumen paling relevan,
 * lalu kembalikan 1–3 kalimat yang paling cocok (bukan seluruh dokumen).
 */
function cariKalimat(d: DataDesa, q: string[]): { teks: string; skor: number } | null {
  if (!d.docs?.length || !q.length) return null;
  const nilai = d.docs
    .map((doc) => {
      const jt = cocok(q, doc.title);
      const tj = token(doc.title);
      const kalimat = kalimatDari(doc.text)
        .map((k) => {
          const tk = token(k);
          // Kalimat dinilai bersama judul dokumennya (judul memberi konteks, mis. nama kegiatan).
          const cakup = q.filter((x) => tk.some((y) => sama(x, y)) || tj.some((y) => sama(x, y))).length / q.length;
          return { k, c: cocok(q, k), cakup };
        })
        .sort((a, b) => b.cakup - a.cakup || b.c.n - a.c.n);
      const top = kalimat[0];
      const skor = (top?.cakup ?? 0) * 3 + jt.n * 0.8 + (top?.c.n ?? 0) * 0.3;
      return { doc, kalimat, skor };
    })
    .sort((a, b) => b.skor - a.skor);
  const best = nilai[0];
  if (!best || best.skor < 1.6 || !best.kalimat[0] || best.kalimat[0].cakup < 0.34) return null;
  let pilih = best.kalimat.filter((x) => x.cakup >= Math.max(0.34, best.kalimat[0].cakup - 0.2)).slice(0, 3).map((x) => x.k.replace(/\s+/g, " "));
  const judul = best.doc.title.replace(/^(Berita|Produk): /, "");
  // Kalimat terlalu pendek (mis. hanya nama) → ambil beberapa kalimat awal dokumen sebagai konteks.
  if (pilih.join(" ").length < 70) {
    pilih = kalimatDari(best.doc.text).filter((k) => bersihkan(k) !== bersihkan(judul)).slice(0, 3);
  }
  pilih = pilih.filter((k) => bersihkan(k) !== bersihkan(judul));
  pilih = pilih.filter((k, i) => !pilih.slice(0, i).some((p) => cocok(token(p), k).rasio >= 0.7));
  const tanggal = best.doc.title.startsWith("Berita:") ? best.doc.text.match(/^\d{1,2} \w+ \d{4}|^\d{4}-\d{2}-\d{2}/)?.[0] : undefined;
  return {
    teks: `**${judul}**${tanggal ? ` (${tanggal})` : ""}\n${pilih.map((k) => (/[.!?:]$/.test(k) ? k : k + ".")).join(" ")}\n\nSelengkapnya di halaman **${halaman(best.doc.link)}**.`,
    skor: best.skor,
  };
}

function saranPertanyaan(d: DataDesa): string {
  return `Saya bisa membantu, misalnya:\n${daftar([
    "Jam berapa kantor desa buka?",
    "Syarat membuat surat domisili?",
    "Berapa jumlah penduduk?",
    "Berapa harga bandeng presto?",
    "Bagaimana cuaca hari ini?",
  ])}\n\nUntuk hal lain, hubungi Kantor Desa ${d.site.namaDesa} melalui halaman **Kontak**.`;
}

/** Jawaban lokal (tanpa AI). */
export function jawabLokal(d: DataDesa, pertanyaan: string): string {
  const b = bersihkan(pertanyaan.replace(/oleh-oleh/gi, "oleh oleh"));
  const q = token(pertanyaan);
  const nama = d.site.namaDesa;

  if (/^(halo|hai|hi|hello|hallo|selamat (pagi|siang|sore|malam)|assalamu|permisi|p)\b/.test(b) && b.length < 32)
    return `Halo! Saya Tanya Desa, asisten website Desa ${nama}. ${saranPertanyaan(d)}`;
  if (/^(terima ?kasih|makasih|thanks|thx|ok(e|ay)?|sip|siap|mantap)\b/.test(b) && b.length < 30) return "Sama-sama! Jika ada pertanyaan lain seputar desa, silakan tanyakan.";
  if (/\b(kamu|anda) (siapa|apa)\b|\bsiapa (kamu|anda)\b/.test(b))
    return `Saya Tanya Desa, asisten otomatis website Desa ${nama}. Saya menjawab berdasarkan data yang dikelola pemerintah desa di website ini.`;

  // Maksud yang jelas dari kata kunci
  if (ada(b, /\bcuaca|hujan|panas|suhu|gerimis|mendung|cerah|gelombang|angin\b|badai|petir|melaut|ombak/)) return jawabCuaca(d, b);
  if (ada(b, /\bjam\b|\bbuka\b|\btutup\b|\blibur\b|operasional|jadwal (layanan|kantor|pelayanan)|hari kerja/) && !ada(b, /posyandu|pantai|wisata|roemah/))
    return jawabJam(d, b);
  if (ada(b, /syarat|persyaratan|dokumen|berkas|\bsurat\b|\bktp\b|\bkk\b|kartu keluarga|domisili|\bsku\b|\bsktm\b|akta|\burus\b|bikin|mengurus|ngurus|pembuatan|administrasi|layanan/) && !ada(b, /jumlah kk|berapa kk|kepala keluarga/))
    return jawabLayanan(d, pertanyaan, q) ?? saranPertanyaan(d);
  if (ada(b, /alamat|kontak|telepon|telp|\btlp\b|nomor (hp|wa|whatsapp|kantor|telepon)|\bwa\b|whatsapp|email|hubungi|menghubungi|lokasi kantor|kantor desa (dimana|di mana)/) && !ada(b, /penjual|toko|produk/))
    return jawabKontak(d);
  if (ada(b, /kepala desa|\bkades\b|\blurah\b|sekretaris|sekdes|aparat|perangkat|\bkaur\b|\bkasi\b|kepala dusun|kadus|pejabat|pemimpin/))
    return jawabAparat(d, q, b) ?? saranPertanyaan(d);
  if (ada(b, /\b(daftar|jadi|menjadi|ikut) (penjual|pedagang)|cara (jual|berjualan|jualan)|mau jualan|ingin berjualan/))
    return `Warga yang ingin berjualan di Pasar Desa dapat mendaftar ke Kantor Desa ${nama} atau mengirim pesan lewat halaman **Kontak**. Admin desa akan membuatkan akun penjual (login dengan nomor HP) untuk mengelola produk, harga, stok, dan pesanan.`;
  if (ada(b, /sejarah|asal usul|didirikan/) && d.site.sejarah) return `${d.site.sejarah.replace(/[#*_]/g, "").slice(0, 600).trim()}…\n\nSelengkapnya di halaman **Profil Desa**.`;
  if (ada(b, /\bvisi\b|\bmisi\b/) && d.site.visi) return `Visi: **${d.site.visi}**${d.site.misi.length ? `\n\nMisi:\n${daftar(d.site.misi)}` : ""}`;
  if (ada(b, /berita|kabar|pengumuman|kegiatan terbaru|acara|agenda|info terbaru/)) return jawabBerita(d) ?? saranPertanyaan(d);

  // Pencocokan entitas: produk, wisata, statistik, organisasi, lokasi
  const niatBelanja = ada(b, /harga|\bbeli|membeli|belanja|pesan(an)? (produk|barang)|order|produk|umkm|oleh oleh|\bjual|pasar desa|murah|ongkir/);
  const niatWisata = ada(b, /wisata|liburan|jalan jalan|rekreasi|pantai|budaya|kesenian|tradisi|tari|silat|piknik|main ke/);
  const teksPenuh = cariKalimat(d, q);
  const penuhKuat = teksPenuh && teksPenuh.skor >= 4.5;
  const produkSpesifik = d.produk.some((p) => cocok(q, p.nama).rasio >= 0.5 || cocok(q, p.penjual_nama).rasio >= 0.6);
  if (niatBelanja && (produkSpesifik || !penuhKuat)) return jawabProduk(d, q, b) ?? saranPertanyaan(d);
  const wisataSpesifik = d.potensi.some((p) => cocok(tanpaGenerik(q), p.nama).rasio >= 0.5);
  if (niatWisata && (wisataSpesifik || !penuhKuat)) return jawabWisata(d, q, b) ?? saranPertanyaan(d);

  const calon = [jawabStatistik(d, q, b), jawabOrganisasi(d, q, b), jawabLokasi(d, q, b)].filter(Boolean) as { teks: string; skor: number }[];
  // Nama produk/wisata yang disebut langsung (mis. "bandeng presto", "tanjung kait")
  const produkSkor = Math.max(0, ...d.produk.map((p) => cocok(q, p.nama)).map((c) => (c.n ? c.rasio : 0)));
  const wisataSkor = Math.max(0, ...d.potensi.map((p) => cocok(tanpaGenerik(q), p.nama)).map((c) => (c.n ? c.rasio : 0)));
  if (produkSkor >= 0.5) calon.push({ teks: jawabProduk(d, q, b) ?? "", skor: 1.5 + produkSkor * 4.2 });
  if (wisataSkor >= 0.5) calon.push({ teks: jawabWisata(d, q, b) ?? "", skor: 1.5 + wisataSkor * 4.1 });
  if (teksPenuh) calon.push(teksPenuh);
  calon.sort((a, c) => c.skor - a.skor);
  if (calon[0]?.teks) return calon[0].teks;

  return `Maaf, saya belum menemukan jawabannya di data website desa. ${saranPertanyaan(d)}`;
}
