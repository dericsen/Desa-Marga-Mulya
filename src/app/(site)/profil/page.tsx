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

      <div className="container-desa grid gap-12 pt-12 lg:grid-cols-12">
        <nav aria-label="Isi halaman" className="lg:col-span-3">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow">Di halaman ini</p>
            <ol className="mt-3 space-y-2 border-l border-line text-[0.9375rem]">
              {BAGIAN.map((b) => (
                <li key={b.id}>
                  <a href={`#${b.id}`} className="-ml-px block border-l-2 border-transparent pl-4 text-muted hover:border-ink hover:text-ink">
                    {b.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="space-y-16 lg:col-span-9">
          {site.sambutan ? (
            <section id="sambutan" className="scroll-mt-32">
              <h2 className="section-title">Sambutan kepala desa</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-[9rem_1fr]">
                {site.fotoKepalaDesa ? (
                  <img src={site.fotoKepalaDesa} alt={`Foto ${site.namaKepalaDesa}`} className="aspect-[4/5] w-36 rounded-md object-cover" />
                ) : (
                  <div className="grid aspect-[4/5] w-36 place-items-center rounded-md bg-line/60 text-center text-xs text-muted">Foto belum diunggah</div>
                )}
                <div>
                  <blockquote className="font-display text-xl leading-relaxed text-ink">{site.sambutan}</blockquote>
                  {site.namaKepalaDesa ? (
                    <p className="mt-4 text-[0.9375rem]">
                      <span className="font-semibold text-ink">{site.namaKepalaDesa}</span>
                      <span className="text-muted"> — Kepala Desa {site.namaDesa}</span>
                    </p>
                  ) : null}
                </div>
              </div>
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
              <p className="font-display mt-6 max-w-[40ch] border-l-2 border-ink pl-5 text-[1.375rem] leading-snug text-ink">{site.visi}</p>
            ) : null}
            {site.misi.length ? (
              <ol className="mt-8 max-w-[68ch] divide-y divide-line border-y border-line">
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
              <dl className="divide-y divide-line border-y border-line text-[0.9375rem]">
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
              <table className="mt-6 w-full max-w-[44rem] text-[0.9375rem]">
                <caption className="sr-only">Daftar aparat Desa {site.namaDesa}</caption>
                <thead>
                  <tr className="border-b border-ink text-left">
                    <th scope="col" className="pb-2 font-mono text-[0.6875rem] font-normal tracking-[0.12em] text-muted uppercase">Jabatan</th>
                    <th scope="col" className="pb-2 font-mono text-[0.6875rem] font-normal tracking-[0.12em] text-muted uppercase">Nama</th>
                  </tr>
                </thead>
                <tbody>
                  {aparat.map((a) => (
                    <tr key={a.id} className="border-b border-line last:border-0">
                      <td className="py-2.5 pr-6 text-muted">{a.jabatan}</td>
                      <th scope="row" className="py-2.5 text-left font-semibold text-ink">{a.nama}</th>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
