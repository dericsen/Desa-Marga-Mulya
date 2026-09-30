import type { Metadata } from "next";
import Link from "next/link";
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

  const navItem = (href: string, label: string, active: boolean, count?: number) => (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-baseline justify-between gap-3 rounded-xl px-3.5 py-2 text-[0.9375rem] transition-colors ${
        active ? "bg-ink font-medium text-white" : "text-muted hover:bg-white hover:text-ink"
      }`}
    >
      <span>{label}</span>
      {count !== undefined ? <span className={`text-xs tabular-nums ${active ? "text-white/60" : "text-muted"}`}>{count}</span> : null}
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Informasi Desa"
        description="Data geografis, pemerintahan, kependudukan, pendidikan, kesehatan, pertanian, ekonomi, dan infrastruktur Desa Marga Mulya. Setiap tabel dapat diunduh sebagai CSV."
      />

      <div className="container-desa grid gap-10 pt-10 lg:grid-cols-12 lg:gap-12">
        <nav aria-label="Kategori data" className="lg:col-span-3">
          {/* Seluler: gulir horizontal */}
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
            {[{ key: "", label: "Semua" }, ...kategoriAda].map((c) => {
              const active = (aktif ?? "") === c.key;
              return (
                <li key={c.key || "semua"} className="shrink-0">
                  <Link
                    href={c.key ? `/informasi?kategori=${c.key}` : "/informasi"}
                    aria-current={active ? "page" : undefined}
                    className={`inline-block rounded-full px-4 py-2 text-sm whitespace-nowrap ${active ? "bg-ink font-medium text-white" : "bg-white text-muted"}`}
                  >
                    {c.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          {/* Desktop: daftar samping lengket */}
          <div className="hidden lg:sticky lg:top-32 lg:block">
            <p className="eyebrow mb-3">Kategori</p>
            <ul className="space-y-0.5">
              <li>{navItem("/informasi", "Semua kategori", !aktif, statistik.length)}</li>
              {kategoriAda.map((c) => (
                <li key={c.key}>{navItem(`/informasi?kategori=${c.key}`, c.label, aktif === c.key, statistik.filter((s) => s.kategori === c.key).length)}</li>
              ))}
            </ul>
            {site.catatanData ? <p className="mt-6 rounded-2xl bg-white p-4 text-xs leading-relaxed text-muted">{site.catatanData}</p> : null}
          </div>
        </nav>

        <div className="lg:col-span-9">
          {site.catatanData ? <p className="mb-8 rounded-2xl bg-white p-4 text-sm leading-relaxed text-muted lg:hidden">{site.catatanData}</p> : null}

          {tampil.length === 0 ? (
            <EmptyState title="Belum ada data desa" text="Data statistik akan tampil di sini setelah diisi oleh admin desa melalui CMS." />
          ) : null}

          <div className="space-y-16">
            {tampil.map((c) => {
              const data = statistik.filter((s) => s.kategori === c.key);
              return (
                <section key={c.key} id={c.key} className="scroll-mt-32" aria-labelledby={`judul-${c.key}`}>
                  <header>
                    <h2 id={`judul-${c.key}`} className="section-title">{c.label}</h2>
                    <p className="mt-1 text-sm text-muted">{c.description}</p>
                  </header>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {data.map((s) => (
                      <figure key={s.id} className={`rounded-[1.5rem] bg-white p-6 sm:p-7 ${s.items.length > 7 ? "md:col-span-2" : ""}`}>
                        <figcaption className="mb-5 flex items-start justify-between gap-4">
                          <span>
                            <span className="block font-semibold text-ink">{s.judul}</span>
                            <span className="meta mt-0.5 block text-xs">
                              {[s.tahun ? `Tahun ${s.tahun}` : null, s.satuan ? `dalam ${s.satuan}` : null].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                          <a href={`/api/statistik/${s.id}/csv`} className="shrink-0 rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink hover:bg-line" aria-label={`Unduh data ${s.judul} dalam format CSV`}>
                            Unduh CSV
                          </a>
                        </figcaption>
                        <div className={s.items.length > 7 ? "md:max-w-[40rem]" : ""}>
                          <StatView stat={s} />
                        </div>
                        {s.deskripsi ? <p className="mt-4 text-sm leading-relaxed text-muted">{s.deskripsi}</p> : null}
                      </figure>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
