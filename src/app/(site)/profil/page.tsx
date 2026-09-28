import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { Markdown } from "@/components/Markdown";
import { PageHeader, SectionHeading } from "@/components/site/ui";
import { VillageMap } from "@/components/site/VillageMap";
import { getAparat, getLokasi, getSite } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profil Desa" };

export default async function ProfilPage() {
  const [site, aparat, lokasi] = await Promise.all([getSite(), getAparat(), getLokasi()]);
  const batas = [
    { arah: "Utara", nilai: site.batasUtara },
    { arah: "Timur", nilai: site.batasTimur },
    { arah: "Selatan", nilai: site.batasSelatan },
    { arah: "Barat", nilai: site.batasBarat },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Profil Desa"
        title={`Mengenal Desa ${site.namaDesa}`}
        description={`Desa ${site.namaDesa} berada di Kecamatan ${site.kecamatan}, Kabupaten ${site.kabupaten}, Provinsi ${site.provinsi} (kode pos ${site.kodePos}).`}
      />

      <div className="container-desa mt-14 grid gap-10 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="sejarah">
          <p className="eyebrow">Sejarah</p>
          <h2 id="sejarah" className="section-title mt-1 mb-5">Sejarah Singkat Desa</h2>
          <Markdown text={site.sejarah} />
        </section>

        <aside className="space-y-4">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-bold text-stone-900">
              <Icon name="map" className="h-5 w-5 text-brand-600" /> Identitas Wilayah
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              {[
                ["Desa", site.namaDesa],
                ["Kecamatan", site.kecamatan],
                ["Kabupaten", site.kabupaten],
                ["Provinsi", site.provinsi],
                ["Kode Pos", site.kodePos],
                ["Luas Wilayah", site.luasWilayah],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-stone-100 pb-2 last:border-0">
                    <dt className="text-stone-500">{k}</dt>
                    <dd className="text-right font-semibold text-stone-900">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </aside>
      </div>

      {/* Visi & Misi */}
      <section className="mt-16 bg-brand-900 py-16 text-white" aria-labelledby="visi-misi">
        <div className="container-desa grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-brand-300 uppercase">Visi</p>
            <h2 id="visi-misi" className="mt-3 text-2xl leading-snug font-extrabold sm:text-3xl">“{site.visi}”</h2>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-brand-300 uppercase">Misi</p>
            <ol className="mt-4 space-y-3">
              {site.misi.map((m, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sun-400 text-sm font-extrabold text-stone-900">{i + 1}</span>
                  <span className="pt-0.5 text-brand-50/95">{m}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Geografis */}
      <section className="container-desa mt-16" aria-labelledby="geografis">
        <SectionHeading eyebrow="Kondisi Geografis" title="Letak dan Batas Wilayah" description="Wilayah desa berada di dataran rendah pesisir utara Kabupaten Tangerang." />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="card grid grid-cols-3 grid-rows-3 gap-2 p-5 text-center text-sm" role="list" aria-label="Batas wilayah">
            <div />
            <BatasItem arah="Utara" nilai={site.batasUtara} />
            <div />
            <BatasItem arah="Barat" nilai={site.batasBarat} />
            <div className="grid place-items-center rounded-xl bg-brand-700 p-2 font-extrabold text-white" role="listitem">
              {site.namaDesa}
              {site.luasWilayah ? <span className="block text-xs font-normal text-brand-100">{site.luasWilayah}</span> : null}
            </div>
            <BatasItem arah="Timur" nilai={site.batasTimur} />
            <div />
            <BatasItem arah="Selatan" nilai={site.batasSelatan} />
            <div />
          </div>
          <VillageMap center={[site.lat, site.lng]} lokasi={lokasi} height="400px" />
        </div>
        <p className="sr-only">
          {batas.map((b) => `Batas ${b.arah}: ${b.nilai || "-"}.`).join(" ")}
        </p>
      </section>

      {/* Aparat */}
      {aparat.length ? (
        <section className="container-desa mt-16" aria-labelledby="aparat">
          <SectionHeading eyebrow="Pemerintahan Desa" title="Struktur Aparat Desa" />
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {aparat.map((a, i) => (
              <li key={a.id} className={`card overflow-hidden text-center ${i === 0 ? "ring-2 ring-brand-500" : ""}`}>
                {a.foto ? (
                  <img src={a.foto} alt={`Foto ${a.nama}`} loading="lazy" className="aspect-square w-full object-cover" />
                ) : (
                  <div className="grid aspect-square w-full place-items-center bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600" aria-hidden="true">
                    <span className="text-3xl font-extrabold">{a.nama.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="font-bold text-stone-900">{a.nama}</p>
                  <p className="text-xs text-stone-500">{a.jabatan}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function BatasItem({ arah, nilai }: { arah: string; nilai: string }) {
  return (
    <div className="grid place-items-center rounded-xl bg-brand-50 p-2" role="listitem">
      <span className="text-[11px] font-bold tracking-wider text-brand-600 uppercase">{arah}</span>
      <span className="text-xs font-semibold text-stone-800">{nilai || "-"}</span>
    </div>
  );
}
