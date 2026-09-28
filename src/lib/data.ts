import { cache } from "react";
import { db } from "./db";
import type { Aparat, Berita, Galeri, Lokasi, Organisasi, Potensi, SiteSettings, Statistik } from "./types";

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
};

export const getSite = cache(async (): Promise<SiteSettings> => {
  const rows = await db()<{ value: Partial<SiteSettings> }[]>`select value from settings where key = 'site'`;
  const value = rows[0]?.value ?? {};
  const site = { ...DEFAULT_SITE, ...value };
  site.misi = Array.isArray(site.misi) ? site.misi : [];
  site.angkaKunci = Array.isArray(site.angkaKunci) ? site.angkaKunci : [];
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
