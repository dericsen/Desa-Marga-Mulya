import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/site/ui";
import { categoryLabel, POTENSI_TYPES, type IconName } from "@/lib/categories";
import { db } from "@/lib/db";
import { excerpt } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pencarian" };

type Hasil = { jenis: string; icon: IconName; judul: string; ringkas: string; href: string };

async function cari(q: string): Promise<Hasil[]> {
  const sql = db();
  const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const [berita, potensi, statistik, organisasi, galeri] = await Promise.all([
    sql<{ judul: string; slug: string; ringkasan: string | null; konten: string | null }[]>`
      select judul, slug, ringkasan, konten from berita
      where terbit = true and (judul ilike ${like} or ringkasan ilike ${like} or konten ilike ${like})
      order by tanggal desc limit 10`,
    sql<{ nama: string; tipe: string; deskripsi: string | null }[]>`
      select nama, tipe, deskripsi from potensi where nama ilike ${like} or deskripsi ilike ${like} or alamat ilike ${like} limit 10`,
    sql<{ id: number; judul: string; kategori: string; deskripsi: string | null }[]>`
      select id, judul, kategori, deskripsi from statistik
      where judul ilike ${like} or deskripsi ilike ${like} or items::text ilike ${like} limit 10`,
    sql<{ nama: string; deskripsi: string | null; jadwal: string | null }[]>`
      select nama, deskripsi, jadwal from organisasi where nama ilike ${like} or deskripsi ilike ${like} or jadwal ilike ${like} limit 10`,
    sql<{ judul: string; album: string; deskripsi: string | null }[]>`
      select judul, album, deskripsi from galeri where judul ilike ${like} or deskripsi ilike ${like} or album ilike ${like} limit 10`,
  ]);

  return [
    ...berita.map((b) => ({ jenis: "Berita", icon: "news" as IconName, judul: b.judul, ringkas: b.ringkasan || excerpt(b.konten), href: `/berita/${b.slug}` })),
    ...potensi.map((p) => ({
      jenis: POTENSI_TYPES.find((t) => t.key === p.tipe)?.label ?? "Potensi",
      icon: "star" as IconName,
      judul: p.nama,
      ringkas: excerpt(p.deskripsi),
      href: `/potensi?jenis=${p.tipe}`,
    })),
    ...statistik.map((s) => ({ jenis: `Data ${categoryLabel(s.kategori)}`, icon: "chart" as IconName, judul: s.judul, ringkas: excerpt(s.deskripsi) || "Lihat grafik dan tabel data.", href: `/informasi?kategori=${s.kategori}#${s.kategori}` })),
    ...organisasi.map((o) => ({ jenis: "Organisasi", icon: "users" as IconName, judul: o.nama, ringkas: o.jadwal || excerpt(o.deskripsi), href: "/berita#organisasi" })),
    ...galeri.map((g) => ({ jenis: `Galeri · ${g.album}`, icon: "camera" as IconName, judul: g.judul, ringkas: excerpt(g.deskripsi), href: "/galeri" })),
  ];
}

export default async function CariPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: raw } = await searchParams;
  const q = (raw || "").trim().slice(0, 100);
  const hasil = q.length >= 2 ? await cari(q) : [];

  return (
    <>
      <PageHeader eyebrow="Pencarian" title="Cari Informasi Desa" description="Temukan berita, data statistik, potensi desa, organisasi, dan foto galeri." />
      <div className="container-desa mt-10 max-w-3xl">
        <form action="/cari" method="get" role="search" className="flex gap-2">
          <label htmlFor="q" className="sr-only">Kata kunci</label>
          <input id="q" name="q" defaultValue={q} placeholder="mis. posyandu, bandeng, jumlah penduduk…" className="input py-3 text-base" autoFocus />
          <button type="submit" className="btn-primary px-5">
            <Icon name="search" className="h-4 w-4" /> Cari
          </button>
        </form>

        {q.length >= 2 ? (
          <p className="mt-6 text-sm text-stone-500" role="status">
            {hasil.length} hasil untuk <strong className="text-stone-800">“{q}”</strong>
          </p>
        ) : q ? (
          <p className="mt-6 text-sm text-stone-500">Masukkan minimal 2 karakter.</p>
        ) : null}

        <ul className="mt-4 space-y-3">
          {hasil.map((h, i) => (
            <li key={i}>
              <Link href={h.href} className="card flex gap-4 p-4 transition hover:ring-brand-300">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon name={h.icon} />
                </span>
                <span>
                  <span className="block text-xs font-bold tracking-wide text-brand-600 uppercase">{h.jenis}</span>
                  <span className="block font-bold text-stone-900">{h.judul}</span>
                  {h.ringkas ? <span className="mt-0.5 block text-sm text-stone-600">{h.ringkas}</span> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {q.length >= 2 && hasil.length === 0 ? (
          <p className="card mt-4 p-6 text-center text-stone-500">
            Tidak ada hasil. Coba kata kunci lain atau tanyakan kepada asisten <strong>Tanya Desa</strong>.
          </p>
        ) : null}
      </div>
    </>
  );
}
