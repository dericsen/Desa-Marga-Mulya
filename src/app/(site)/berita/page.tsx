import type { Metadata } from "next";
import { BeritaRow, EmptyState, FilterTabs, PageHeader } from "@/components/site/ui";
import { BERITA_TYPES } from "@/lib/categories";
import { getBerita, getOrganisasi } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Berita & Kegiatan" };

export default async function BeritaPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const aktif = BERITA_TYPES.find((b) => b.key === kategori)?.key;
  const [berita, organisasi] = await Promise.all([getBerita({ kategori: aktif }), getOrganisasi()]);

  return (
    <>
      <PageHeader title="Berita & Kegiatan" description="Pengumuman pemerintah desa, kegiatan warga, dan lembaga kemasyarakatan Desa Marga Mulya." />

      <div className="container-desa grid gap-14 pt-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <FilterTabs
            label="Kategori berita"
            items={[{ key: "", label: "Semua" }, ...BERITA_TYPES].map((b) => ({
              href: b.key ? `/berita?kategori=${b.key}` : "/berita",
              label: b.label,
              active: (aktif ?? "") === b.key,
            }))}
          />
          {berita.length ? (
            <div className="mt-6 space-y-2">
              {berita.map((b) => (
                <BeritaRow key={b.id} item={b} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="Belum ada tulisan di kategori ini" text="Coba kategori lain, atau kembali lagi nanti." action={{ href: "/berita", label: "Lihat semua berita" }} />
            </div>
          )}
        </div>

        {organisasi.length ? (
          <aside id="organisasi" className="scroll-mt-32 lg:col-span-4" aria-labelledby="judul-organisasi">
            <div className="rounded-[1.75rem] bg-white p-6 lg:sticky lg:top-24">
              <h2 id="judul-organisasi" className="font-display text-xl font-semibold text-ink">Lembaga kemasyarakatan desa</h2>
              <p className="mt-1 text-sm text-muted">Organisasi warga dan jadwal kegiatan rutinnya.</p>
              <ul className="mt-5 divide-y divide-line">
                {organisasi.map((o) => (
                  <li key={o.id} className="py-4">
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
                        <span>
                          <span className="block font-semibold text-ink">{o.nama}</span>
                          {o.jadwal ? <span className="mt-0.5 block text-sm text-muted">{o.jadwal}</span> : null}
                        </span>
                        <span className="mt-0.5 text-muted transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                      </summary>
                      <div className="mt-2 text-sm leading-relaxed text-muted">
                        {o.deskripsi ? <p>{o.deskripsi}</p> : null}
                        {o.anggota ? <p className="mt-1 tabular-nums">{o.anggota} anggota{o.ketua ? ` · ${o.ketua}` : ""}</p> : null}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>
    </>
  );
}
