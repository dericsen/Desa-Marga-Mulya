import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { StatView } from "@/components/charts";
import { EmptyState, PageHeader } from "@/components/site/ui";
import { STAT_CATEGORIES } from "@/lib/categories";
import { getSite, getStatistik } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Informasi Desa" };

export default async function InformasiPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const [site, statistik] = await Promise.all([getSite(), getStatistik()]);

  const kategoriAda = STAT_CATEGORIES.filter((c) => statistik.some((s) => s.kategori === c.key));
  const aktif = kategoriAda.find((c) => c.key === kategori)?.key ?? null;
  const tampil = aktif ? kategoriAda.filter((c) => c.key === aktif) : kategoriAda;

  return (
    <>
      <PageHeader
        eyebrow="Informasi Desa"
        title="Data & Statistik Desa"
        description="Data geografis, pemerintahan, kependudukan, pendidikan, kesehatan, pertanian, ekonomi, dan infrastruktur Desa Marga Mulya dalam bentuk grafik yang mudah dipahami."
      />

      <div className="container-desa mt-10">
        <nav aria-label="Kategori data" className="-mx-4 overflow-x-auto px-4 pb-2">
          <ul className="flex min-w-max gap-2">
            <li>
              <Link
                href="/informasi"
                aria-current={!aktif ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${
                  !aktif ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50"
                }`}
              >
                Semua
              </Link>
            </li>
            {kategoriAda.map((c) => (
              <li key={c.key}>
                <Link
                  href={`/informasi?kategori=${c.key}`}
                  aria-current={aktif === c.key ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${
                    aktif === c.key ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <Icon name={c.icon} className="h-4 w-4" />
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {site.catatanData ? (
          <p className="mt-6 flex gap-3 rounded-2xl bg-sun-400/15 p-4 text-sm text-stone-700 ring-1 ring-sun-400/40">
            <Icon name="sparkles" className="mt-0.5 h-5 w-5 shrink-0 text-sun-500" />
            <span>{site.catatanData}</span>
          </p>
        ) : null}

        {tampil.length === 0 ? <div className="mt-10"><EmptyState text="Belum ada data statistik." /></div> : null}

        {tampil.map((c) => {
          const data = statistik.filter((s) => s.kategori === c.key);
          return (
            <section key={c.key} id={c.key} className="mt-12 scroll-mt-24" aria-labelledby={`judul-${c.key}`}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-white">
                  <Icon name={c.icon} />
                </span>
                <div>
                  <h2 id={`judul-${c.key}`} className="text-xl font-extrabold text-stone-900">{c.label}</h2>
                  <p className="text-sm text-stone-500">{c.description}</p>
                </div>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {data.map((s) => (
                  <article key={s.id} className="card flex flex-col p-6">
                    <header className="mb-5 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-stone-900">{s.judul}</h3>
                        <p className="text-xs text-stone-500">
                          {s.tahun ? `Tahun ${s.tahun}` : null}
                          {s.tahun && s.satuan ? " · " : null}
                          {s.satuan ? `Satuan: ${s.satuan}` : null}
                        </p>
                      </div>
                      <a
                        href={`/api/statistik/${s.id}/csv`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                        aria-label={`Unduh data ${s.judul} (CSV)`}
                      >
                        <Icon name="download" className="h-3.5 w-3.5" /> CSV
                      </a>
                    </header>
                    <div className="flex-1">
                      <StatView stat={s} />
                    </div>
                    {s.deskripsi ? <p className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-500">{s.deskripsi}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
