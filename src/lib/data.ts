import { cache } from "react";
import { STATUS_MANUAL_DEFAULT, type StatusManual } from "./jam";
import { db } from "./db";
import type { Aparat, Berita, Galeri, Lokasi, Organisasi, Penjual, Potensi, Produk, SiteSettings, Statistik } from "./types";

/** Mengubah hasil query (RowList) menjadi array biasa agar aman dikirim ke komponen klien. */
export function plain<T>(rows: readonly T[]): T[] {
  return Array.from(rows, (r) => ({ ...r }));
}

export const DEFAULT_SITE: SiteSettings = {
  namaDesa: "Marga Mulya",
  kecamatan: "Mauk",
  kabupaten: "Tangerang",
  provinsi: "Banten",
  kodePos: "15530",
  tagline: "",
  heroJudul: "Selamat Datang di Desa Marga Mulya",
  heroDeskripsi: "",
  heroGambar: "/img/hero-desa.svg",
  heroKeterangan: "",
  namaKepalaDesa: "",
  fotoKepalaDesa: "",
  sambutan: "",
  sejarah: "",
  visi: "",
  misi: [],
  luasWilayah: "",
  batasUtara: "",
  batasSelatan: "",
  batasTimur: "",
  batasBarat: "",
  angkaKunci: [],
  alamat: "",
  telepon: "",
  email: "",
  whatsapp: "",
  jamLayanan: "",
  lat: -6.0355,
  lng: 106.5185,
  instagram: "",
  facebook: "",
  youtube: "",
  catatanData: "",
  layanan: [],
  catatanLayanan: "",
};

/** Status buka/tutup kantor yang diatur manual oleh admin (tabel settings, key "kantor"). */
export const getStatusManual = cache(async (): Promise<StatusManual> => {
  const rows = await db()<{ value: Partial<StatusManual> }[]>`select value from settings where key = 'kantor'`;
  const v = rows[0]?.value ?? {};
  const mode = v.mode === "buka" || v.mode === "tutup" ? v.mode : "otomatis";
  return { ...STATUS_MANUAL_DEFAULT, ...v, mode, alasan: String(v.alasan ?? ""), sampai: v.sampai ? String(v.sampai) : null };
});

export const getSite = cache(async (): Promise<SiteSettings> => {
  const rows = await db()<{ value: Partial<SiteSettings> }[]>`select value from settings where key = 'site'`;
  const value = rows[0]?.value ?? {};
  const site = { ...DEFAULT_SITE, ...value };
  site.misi = Array.isArray(site.misi) ? site.misi : [];
  site.angkaKunci = Array.isArray(site.angkaKunci) ? site.angkaKunci : [];
  site.layanan = Array.isArray(site.layanan) ? site.layanan : [];
  site.lat = Number(site.lat) || DEFAULT_SITE.lat;
  site.lng = Number(site.lng) || DEFAULT_SITE.lng;
  return site;
});

function normalizeStat(row: Statistik): Statistik {
  const items = Array.isArray(row.items) ? row.items : [];
  return { ...row, items: items.map((i) => ({ label: String(i.label ?? ""), nilai: Number(i.nilai) || 0 })) };
}

export const getStatistik = cache(async (): Promise<Statistik[]> => {
  const rows = await db()<Statistik[]>`select * from statistik order by kategori, urutan, id`;
  return plain(rows).map(normalizeStat);
});

export async function getStatistikById(id: number): Promise<Statistik | null> {
  const rows = await db()<Statistik[]>`select * from statistik where id = ${id}`;
  return rows[0] ? normalizeStat(rows[0]) : null;
}

export const getAparat = cache(async () => plain(await db()<Aparat[]>`select * from aparat order by urutan, id`));

export async function getBerita(opts: { limit?: number; kategori?: string } = {}) {
  const sql = db();
  const limit = opts.limit ?? 100;
  if (opts.kategori) {
    return plain(await sql<Berita[]>`select * from berita where terbit = true and kategori = ${opts.kategori} order by tanggal desc, id desc limit ${limit}`);
  }
  return plain(await sql<Berita[]>`select * from berita where terbit = true order by tanggal desc, id desc limit ${limit}`);
}

export async function getBeritaBySlug(slug: string): Promise<Berita | null> {
  const rows = await db()<Berita[]>`select * from berita where slug = ${slug} and terbit = true`;
  return rows[0] ?? null;
}

export const getGaleri = cache(async () => plain(await db()<Galeri[]>`select * from galeri order by urutan, tanggal desc nulls last, id desc`));

export const getPotensi = cache(async () => plain(await db()<Potensi[]>`select * from potensi order by tipe, unggulan desc, urutan, id`));

export const getOrganisasi = cache(async () => plain(await db()<Organisasi[]>`select * from organisasi order by urutan, id`));

export const getLokasi = cache(async () =>
  plain(await db()<Lokasi[]>`select * from lokasi order by kategori, id`).map((l) => ({ ...l, lat: Number(l.lat), lng: Number(l.lng) }))
);

/* ---------------------------- Pasar Desa ---------------------------- */

export type ProdukFilter = { q?: string; kategori?: string; penjual?: string; urut?: "populer" | "termurah" | "termahal" | "terbaru"; unggulan?: boolean; limit?: number };

/** Produk yang tampil di Pasar Desa (hanya dari penjual aktif dan produk yang ditandai dijual). */
export async function getProduk(f: ProdukFilter = {}): Promise<Produk[]> {
  const sql = db();
  const like = f.q ? `%${f.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%` : null;
  const order =
    f.urut === "termurah" ? sql`p.harga asc, p.id` :
    f.urut === "termahal" ? sql`p.harga desc, p.id` :
    f.urut === "terbaru" ? sql`p.created_at desc, p.id desc` :
    sql`(p.stok = 0) asc, p.unggulan desc, j.urutan, p.urutan, p.id`;
  const rows = await sql<Produk[]>`
    select p.*, j.nama as penjual_nama, j.slug as penjual_slug, j.alamat as penjual_alamat
    from produk p join penjual j on j.id = p.penjual_id
    where p.tersedia = true and p.status_tinjau = 'disetujui' and j.aktif = true
      ${f.kategori ? sql`and p.kategori = ${f.kategori}` : sql``}
      ${f.penjual ? sql`and j.slug = ${f.penjual}` : sql``}
      ${f.unggulan ? sql`and p.unggulan = true and (p.stok is null or p.stok > 0)` : sql``}
      ${like ? sql`and (p.nama ilike ${like} or p.deskripsi ilike ${like} or j.nama ilike ${like})` : sql``}
    order by ${order}
    limit ${f.limit ?? 200}`;
  return plain(rows).map((r) => ({ ...r, harga: Number(r.harga), stok: r.stok === null ? null : Number(r.stok) }));
}

export async function getProdukBySlug(slug: string): Promise<Produk | null> {
  const rows = await db()<Produk[]>`
    select p.*, j.nama as penjual_nama, j.slug as penjual_slug, j.alamat as penjual_alamat
    from produk p join penjual j on j.id = p.penjual_id
    where p.slug = ${slug} and p.tersedia = true and p.status_tinjau = 'disetujui' and j.aktif = true`;
  const r = rows[0];
  return r ? { ...r, harga: Number(r.harga), stok: r.stok === null ? null : Number(r.stok) } : null;
}

export type PenjualRingkas = Penjual & { jumlah_produk: number; harga_min: number | null };

export const getPenjual = cache(async (): Promise<PenjualRingkas[]> => {
  const rows = await db()<PenjualRingkas[]>`
    select j.*, count(p.id)::int as jumlah_produk, min(p.harga) as harga_min
    from penjual j left join produk p on p.penjual_id = j.id and p.tersedia = true and p.status_tinjau = 'disetujui'
    where j.aktif = true
    group by j.id
    order by j.urutan, j.id`;
  return plain(rows).map((r) => ({ ...r, harga_min: r.harga_min === null ? null : Number(r.harga_min) }));
});
