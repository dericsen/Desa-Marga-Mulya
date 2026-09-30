import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/site/ui";
import { categoryLabel, POTENSI_TYPES } from "@/lib/categories";
import { db } from "@/lib/db";
import { excerpt } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pencarian" };

type Hasil = { jenis: string; judul: string; ringkas: string; href: string };

const CONTOH = ["posyandu", "bandeng", "jumlah penduduk", "surat domisili", "irigasi"];

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
    ...berita.map((b) => ({ jenis: "Berita", judul: b.judul, ringkas: b.ringkasan || excerpt(b.konten), href: `/berita/${b.slug}` })),
    ...statistik.map((s) => ({ jenis: `Data · ${categoryLabel(s.kategori)}`, judul: s.judul, ringkas: excerpt(s.deskripsi) || "Lihat grafik dan tabel data.", href: `/informasi?kategori=${s.kategori}#${s.kategori}` })),
    ...potensi.map((p) => ({ jenis: POTENSI_TYPES.find((t) => t.key === p.tipe)?.label ?? "Potensi", judul: p.nama, ringkas: excerpt(p.deskripsi), href: `/potensi?jenis=${p.tipe}` })),
    ...organisasi.map((o) => ({ jenis: "Organisasi", judul: o.nama, ringkas: o.jadwal || excerpt(o.deskripsi), href: "/berita#organisasi" })),
    ...galeri.map((g) => ({ jenis: `Galeri · ${g.album}`, judul: g.judul, ringkas: excerpt(g.deskripsi), href: "/galeri" })),
  ];
}

export default async function CariPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: raw } = await searchParams;
  const q = (raw || "").trim().slice(0, 100);
  const hasil = q.length >= 2 ? await cari(q) : [];

  return (
    <>
      <PageHeader title="Pencarian" description="Cari di berita, data desa, potensi, organisasi, dan galeri." />
      <div className="container-desa max-w-[48rem] pt-10">
        <form action="/cari" method="get" role="search" className="flex gap-2">
          <label htmlFor="q" className="sr-only">Kata kunci</label>
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
            <input id="q" name="q" defaultValue={q} placeholder="Ketik kata kunci" className="input py-3 pl-10 text-base" autoFocus />
          </div>
          <button type="submit" className="btn-primary px-5">Cari</button>
        </form>

        {!q ? (
          <p className="mt-4 text-sm text-muted">
            Contoh:{" "}
            {CONTOH.map((c, i) => (
              <span key={c}>
                <Link href={`/cari?q=${encodeURIComponent(c)}`} className="link font-normal">{c}</Link>
                {i < CONTOH.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        ) : null}

        {q.length === 1 ? <p className="mt-6 text-sm text-muted">Masukkan minimal 2 karakter.</p> : null}

        {q.length >= 2 ? (
          <p className="mt-8 border-b border-ink pb-3 text-sm text-muted" role="status">
            <span className="font-semibold text-ink tabular-nums">{hasil.length}</span> hasil untuk “{q}”
          </p>
        ) : null}

        <ul className="divide-y divide-line">
          {hasil.map((h, i) => (
            <li key={i} className="group relative py-5">
              <p className="text-xs font-semibold text-brand-700">{h.jenis}</p>
              <Link href={h.href} className="mt-1 block font-semibold text-ink after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
                {h.judul}
              </Link>
              {h.ringkas ? <p className="mt-1 text-sm leading-relaxed text-muted">{h.ringkas}</p> : null}
            </li>
          ))}
        </ul>

        {q.length >= 2 && hasil.length === 0 ? (
          <div className="py-8">
            <p className="font-semibold text-ink">Tidak ada yang cocok dengan “{q}”.</p>
            <p className="mt-1 text-sm text-muted">
              Coba kata yang lebih umum, periksa ejaan, atau tanyakan kepada asisten <strong className="text-ink">Tanya Desa</strong> di pojok kanan bawah.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
