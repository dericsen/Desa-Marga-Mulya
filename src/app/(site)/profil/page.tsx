import type { Metadata } from "next";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/site/ui";
import { VillageMap } from "@/components/site/VillageMap";
import { getAparat, getLokasi, getSite } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profil Desa" };

const BAGIAN = [
  { id: "sambutan", label: "Sambutan kepala desa" },
  { id: "sejarah", label: "Sejarah" },
  { id: "visi-misi", label: "Visi dan misi" },
  { id: "wilayah", label: "Wilayah" },
  { id: "pemerintahan", label: "Pemerintahan desa" },
];

export default async function ProfilPage() {
  const [site, aparat, lokasi] = await Promise.all([getSite(), getAparat(), getLokasi()]);
  const kepala = aparat[0];
  const perangkat = aparat.slice(1);

  return (
    <>
      <PageHeader
        title="Profil Desa"
        description={`Sejarah, arah pembangunan, wilayah, dan susunan pemerintahan Desa ${site.namaDesa}, Kecamatan ${site.kecamatan}, Kabupaten ${site.kabupaten}.`}
      />

      <div className="container-desa grid gap-8 pt-8 lg:grid-cols-12 lg:gap-12 lg:pt-12">
        <nav aria-label="Isi halaman" className="lg:col-span-3">
          {/* HP & tablet: chip yang digulir horizontal */}
          <ol className="scroll-chips -mx-5 px-5 text-sm sm:-mx-8 sm:px-8 lg:hidden">
            {BAGIAN.map((b) => (
              <li key={b.id} className="shrink-0">
                <a href={`#${b.id}`} className="inline-block rounded-full bg-white px-4 py-2 whitespace-nowrap text-ink shadow-[0_0_0_1px_rgb(11_19_16/0.06)]">
                  {b.label}
                </a>
              </li>
            ))}
          </ol>
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <p className="eyebrow">Di halaman ini</p>
            <ol className="mt-3 space-y-0.5 text-[0.9375rem]">
              {BAGIAN.map((b) => (
                <li key={b.id}>
                  <a href={`#${b.id}`} className="block rounded-xl px-3.5 py-2 text-muted hover:bg-white hover:text-ink">
                    {b.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="space-y-12 sm:space-y-16 lg:col-span-9">
          {site.sambutan ? (
            <section id="sambutan" className="scroll-mt-32">
              <h2 className="section-title">Sambutan kepala desa</h2>
              <figure className="mt-6 grid grid-cols-[5.5rem_1fr] items-center gap-x-5 gap-y-5 rounded-[1.75rem] bg-white p-5 sm:grid-cols-[9rem_1fr] sm:items-start sm:gap-x-8 sm:p-8">
                {site.fotoKepalaDesa ? (
                  <img src={site.fotoKepalaDesa} alt={`Foto ${site.namaKepalaDesa}`} className="aspect-[4/5] w-full rounded-2xl object-cover sm:row-span-2 sm:rounded-3xl" />
                ) : (
                  <div className="grid aspect-[4/5] w-full place-items-center rounded-2xl bg-paper p-2 text-center text-xs text-muted sm:row-span-2 sm:rounded-3xl">Foto belum diunggah</div>
                )}
                {site.namaKepalaDesa ? (
                  <figcaption className="sm:order-last sm:col-start-2">
                    <span className="block font-semibold text-ink">{site.namaKepalaDesa}</span>
                    <span className="block text-sm text-muted">Kepala Desa {site.namaDesa}</span>
                  </figcaption>
                ) : null}
                <blockquote className="font-display col-span-2 text-lg leading-relaxed text-ink sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:text-xl">{site.sambutan}</blockquote>
              </figure>
            </section>
          ) : null}

          <section id="sejarah" className="scroll-mt-32">
            <h2 className="section-title">Sejarah</h2>
            <div className="mt-5 max-w-[68ch]">
              {site.sejarah ? <Markdown text={site.sejarah} /> : <p className="text-muted">Sejarah desa belum ditulis.</p>}
            </div>
          </section>

          <section id="visi-misi" className="scroll-mt-32">
            <h2 className="section-title">Visi dan misi</h2>
            {site.visi ? (
              <p className="font-display mt-6 max-w-[44ch] rounded-[1.75rem] bg-sun-400 p-7 text-[1.375rem] leading-snug text-ink">{site.visi}</p>
            ) : null}
            {site.misi.length ? (
              <ol className="mt-4 max-w-[68ch] divide-y divide-line rounded-[1.75rem] bg-white px-6">
                {site.misi.map((m, i) => (
                  <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-2 py-3.5 leading-relaxed">
                    <span className="font-semibold text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-ink">{m}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </section>

          <section id="wilayah" className="scroll-mt-32">
            <h2 className="section-title">Wilayah</h2>
            <div className="mt-6 grid gap-8 xl:grid-cols-[18rem_1fr]">
              <dl className="divide-y divide-line self-start rounded-3xl bg-white px-5 text-[0.9375rem]">
                {[
                  ["Luas wilayah", site.luasWilayah],
                  ["Batas utara", site.batasUtara],
                  ["Batas timur", site.batasTimur],
                  ["Batas selatan", site.batasSelatan],
                  ["Batas barat", site.batasBarat],
                  ["Kode pos", site.kodePos],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-2.5">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-right font-semibold text-ink">{v}</dd>
                    </div>
                  ))}
              </dl>
              <VillageMap center={[site.lat, site.lng]} lokasi={lokasi} height="360px" />
            </div>
          </section>

          {aparat.length ? (
            <section id="pemerintahan" className="scroll-mt-32">
              <h2 className="section-title">Struktur aparat desa</h2>
              {kepala ? (
                <p className="mt-4 text-muted">
                  Pemerintahan desa dipimpin oleh <span className="font-semibold text-ink">{kepala.nama}</span> sebagai {kepala.jabatan.toLowerCase()}, dibantu {perangkat.length} perangkat desa.
                </p>
              ) : null}
              {/* HP: daftar bertumpuk (jabatan di atas nama) */}
              <ul className="mt-6 divide-y divide-line rounded-[1.75rem] bg-white px-5 sm:hidden">
                {aparat.map((a) => (
                  <li key={a.id} className="py-3">
                    <span className="block text-xs text-muted">{a.jabatan}</span>
                    <span className="block font-semibold text-ink">{a.nama}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 hidden max-w-[44rem] rounded-[1.75rem] bg-white px-6 py-3 sm:block"><table className="w-full text-[0.9375rem]">
                <caption className="sr-only">Daftar aparat Desa {site.namaDesa}</caption>
                <thead>
                  <tr className="border-b border-line text-left">
                    <th scope="col" className="pb-2 text-xs font-medium text-muted">Jabatan</th>
                    <th scope="col" className="pb-2 text-xs font-medium text-muted">Nama</th>
                  </tr>
                </thead>
                <tbody>
                  {aparat.map((a) => (
                    <tr key={a.id} className="border-b border-line last:border-0">
                      <td className="w-1/2 py-2.5 pr-6 text-muted">{a.jabatan}</td>
                      <th scope="row" className="py-2.5 text-left font-semibold text-ink">{a.nama}</th>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
