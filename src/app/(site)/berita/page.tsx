import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { BeritaCard, EmptyState, PageHeader, SectionHeading } from "@/components/site/ui";
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
      <PageHeader eyebrow="Kabar Desa" title="Berita & Kegiatan" description="Informasi terbaru, kegiatan warga, pengumuman, serta organisasi kemasyarakatan Desa Marga Mulya." />

      <div className="container-desa mt-10">
        <nav aria-label="Kategori berita">
          <ul className="flex flex-wrap gap-2">
            {[{ key: "", label: "Semua" }, ...BERITA_TYPES].map((b) => {
              const isActive = (aktif ?? "") === b.key;
              return (
                <li key={b.key || "semua"}>
                  <Link
                    href={b.key ? `/berita?kategori=${b.key}` : "/berita"}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ring-1 ${isActive ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-stone-700 ring-stone-200"}`}
                  >
                    {b.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-8">
          {berita.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {berita.map((b) => (
                <BeritaCard key={b.id} item={b} />
              ))}
            </div>
          ) : (
            <EmptyState text="Belum ada berita pada kategori ini." />
          )}
        </div>
      </div>

      {organisasi.length ? (
        <section className="container-desa mt-20" id="organisasi" aria-label="Organisasi dan kegiatan rutin">
          <SectionHeading eyebrow="Organisasi & Kegiatan Rutin" title="Lembaga Kemasyarakatan Desa" description="Organisasi yang menggerakkan pembangunan dan kegiatan rutin warga Marga Mulya." />
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organisasi.map((o) => (
              <li key={o.id} className="card flex flex-col p-5">
                <h3 className="font-bold text-stone-900">{o.nama}</h3>
                {o.deskripsi ? <p className="mt-2 flex-1 text-sm text-stone-600">{o.deskripsi}</p> : <div className="flex-1" />}
                <dl className="mt-4 space-y-1.5 border-t border-stone-100 pt-3 text-sm">
                  {o.jadwal ? (
                    <div className="flex gap-2 text-brand-800">
                      <dt><Icon name="clock" className="mt-0.5 h-4 w-4" /><span className="sr-only">Kegiatan rutin</span></dt>
                      <dd className="font-semibold">{o.jadwal}</dd>
                    </div>
                  ) : null}
                  {o.anggota ? (
                    <div className="flex gap-2 text-stone-500">
                      <dt><Icon name="users" className="mt-0.5 h-4 w-4" /><span className="sr-only">Anggota</span></dt>
                      <dd>{o.anggota} anggota{o.ketua ? ` · ${o.ketua}` : ""}</dd>
                    </div>
                  ) : null}
                </dl>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
