import Link from "next/link";
import { StatView } from "@/components/charts";
import { Img, kategoriBerita, PotensiCard, SectionHeading } from "@/components/site/ui";
import { VillageMap } from "@/components/site/VillageMap";
import { STAT_CATEGORIES } from "@/lib/categories";
import { getBerita, getGaleri, getLokasi, getPotensi, getSite, getStatistik } from "@/lib/data";
import { excerpt, formatDate, toDateInput, waLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BerandaPage() {
  const [site, statistik, potensi, berita, galeri, lokasi] = await Promise.all([
    getSite(),
    getStatistik(),
    getPotensi(),
    getBerita({ limit: 5 }),
    getGaleri(),
    getLokasi(),
  ]);

  const wa = waLink(site.whatsapp, `Halo Pemerintah Desa ${site.namaDesa}, saya ingin bertanya tentang layanan desa.`);
  const [utama, ...lainnya] = berita;
  const dataUtama = statistik.find((s) => /mata pencaharian/i.test(s.judul)) ?? statistik.find((s) => s.tipe_grafik === "bar");
  const kategoriData = STAT_CATEGORIES.map((c) => ({ ...c, jumlah: statistik.filter((s) => s.kategori === c.key).length })).filter((c) => c.jumlah > 0);
  const tahunData = Math.max(0, ...statistik.map((s) => s.tahun ?? 0));
  const pilihanPotensi = [
    ...potensi.filter((p) => p.unggulan && p.tipe === "umkm").slice(0, 2),
    ...potensi.filter((p) => p.unggulan && p.tipe !== "umkm").slice(0, 1),
  ];

  return (
    <>
      {/* ===== Pembuka: identitas desa + layanan kantor ===== */}
      <section className="container-desa grid gap-10 pt-12 pb-10 sm:pt-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="meta">
            Kecamatan {site.kecamatan} · Kabupaten {site.kabupaten} · {site.provinsi} {site.kodePos}
          </p>
          <h1 className="font-display mt-4 text-[2.75rem] leading-[1.05] font-semibold text-ink sm:text-[3.5rem]">{site.heroJudul}</h1>
          {site.heroDeskripsi ? <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">{site.heroDeskripsi}</p> : null}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="#layanan" className="btn-primary px-5 py-3">Lihat layanan administrasi</a>
            <Link href="/informasi" className="link text-sm">Buka data desa</Link>
          </div>
        </div>

        <aside aria-labelledby="kantor-desa" className="border-t-2 border-ink pt-5 lg:col-span-5 lg:mt-2">
          <h2 id="kantor-desa" className="text-sm font-semibold text-ink">Kantor Desa {site.namaDesa}</h2>
          <dl className="mt-4 divide-y divide-line text-[0.9375rem]">
            {site.jamLayanan ? (
              <div className="grid grid-cols-[7.5rem_1fr] gap-3 py-3">
                <dt className="text-muted">Jam layanan</dt>
                <dd className="whitespace-pre-line text-ink">{site.jamLayanan}</dd>
              </div>
            ) : null}
            {site.telepon ? (
              <div className="grid grid-cols-[7.5rem_1fr] gap-3 py-3">
                <dt className="text-muted">Telepon</dt>
                <dd><a href={`tel:${site.telepon.replace(/[^\d+]/g, "")}`} className="text-ink tabular-nums hover:underline">{site.telepon}</a></dd>
              </div>
            ) : null}
            {wa ? (
              <div className="grid grid-cols-[7.5rem_1fr] gap-3 py-3">
                <dt className="text-muted">WhatsApp</dt>
                <dd><a href={wa} target="_blank" rel="noopener noreferrer" className="link">Tanya lewat WhatsApp</a></dd>
              </div>
            ) : null}
            {site.alamat ? (
              <div className="grid grid-cols-[7.5rem_1fr] gap-3 py-3">
                <dt className="text-muted">Alamat</dt>
                <dd className="text-ink">
                  {site.alamat}
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`} target="_blank" rel="noopener noreferrer" className="link mt-1 block text-sm">
                    Petunjuk arah
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </section>

      {/* ===== Foto utama + angka kunci ===== */}
      <section className="container-desa" aria-label="Sekilas desa">
        <figure>
          <Img src={site.heroGambar} alt={site.heroKeterangan || `Pemandangan Desa ${site.namaDesa}`} className="aspect-[16/9] w-full rounded-md sm:aspect-[21/8]" />
          {site.heroKeterangan ? <figcaption className="mt-2 text-xs text-muted">{site.heroKeterangan}</figcaption> : null}
        </figure>
        {site.angkaKunci.length ? (
          <dl className="mt-8 grid grid-cols-2 border-y border-line lg:grid-cols-4">
            {site.angkaKunci.map((a, i) => (
              <div
                key={i}
                className={[
                  "py-5 pr-4",
                  i % 2 === 1 ? "border-l border-line pl-5 lg:pl-6" : "",
                  i % 2 === 0 && i > 0 ? "lg:border-l lg:border-line lg:pl-6" : "",
                  i >= 2 ? "border-t border-line lg:border-t-0" : "",
                ].join(" ")}
              >
                <dt className="text-sm text-muted">{a.label}</dt>
                <dd className="mt-1 text-[1.75rem] leading-tight font-semibold text-ink tabular-nums">{a.nilai}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      {/* ===== Kabar desa: satu utama + daftar ===== */}
      {utama ? (
        <section className="container-desa section-lg" aria-labelledby="kabar">
          <SectionHeading id="kabar" title="Kabar dan pengumuman" action={{ href: "/berita", label: "Semua berita" }} />
          <div className="grid gap-10 lg:grid-cols-12">
            <article className="group relative lg:col-span-7">
              <Img src={utama.gambar} alt="" className="aspect-[16/9] w-full rounded-md" />
              <p className="meta mt-5">
                <span className="font-semibold text-brand-700">{kategoriBerita(utama.kategori)}</span>
                <span aria-hidden="true"> · </span>
                <time dateTime={toDateInput(utama.tanggal)}>{formatDate(utama.tanggal)}</time>
              </p>
              <h3 className="font-display mt-2 text-[1.75rem] leading-tight font-semibold text-ink">
                <Link href={`/berita/${utama.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
                  {utama.judul}
                </Link>
              </h3>
              <p className="mt-3 max-w-[60ch] leading-relaxed text-muted">{utama.ringkasan || excerpt(utama.konten)}</p>
            </article>

            {lainnya.length ? (
              <ol className="divide-y divide-line border-t border-line lg:col-span-5 lg:border-t-0">
                {lainnya.map((b) => (
                  <li key={b.id} className="group relative py-5 first:pt-5 lg:first:pt-0">
                    <p className="meta">
                      <time dateTime={toDateInput(b.tanggal)}>{formatDate(b.tanggal)}</time>
                      <span aria-hidden="true"> · </span>
                      {kategoriBerita(b.kategori)}
                    </p>
                    <h3 className="mt-1 text-[1.0625rem] leading-snug font-semibold text-ink">
                      <Link href={`/berita/${b.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
                        {b.judul}
                      </Link>
                    </h3>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ===== Layanan administrasi ===== */}
      {site.layanan.length ? (
        <section id="layanan" className="scroll-mt-28 border-y border-line bg-white" aria-labelledby="judul-layanan">
          <div className="container-desa section grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id="judul-layanan" className="section-title">Layanan administrasi</h2>
              {site.catatanLayanan ? <p className="mt-3 leading-relaxed text-muted">{site.catatanLayanan}</p> : null}
              <p className="mt-5 text-sm text-muted">
                Ada pertanyaan sebelum datang?{" "}
                <Link href="/kontak" className="link">Hubungi kantor desa</Link>
              </p>
            </div>
            <div className="overflow-x-auto lg:col-span-8">
              <table className="w-full min-w-[34rem] text-[0.9375rem]">
                <caption className="sr-only">Daftar layanan administrasi dan persyaratannya</caption>
                <thead>
                  <tr className="border-b border-ink text-left">
                    <th scope="col" className="w-[38%] pb-2 text-xs font-semibold tracking-[0.06em] text-muted uppercase">Layanan</th>
                    <th scope="col" className="pb-2 text-xs font-semibold tracking-[0.06em] text-muted uppercase">Yang perlu dibawa</th>
                  </tr>
                </thead>
                <tbody>
                  {site.layanan.map((l, i) => (
                    <tr key={i} className="border-b border-line align-top last:border-0">
                      <th scope="row" className="py-3 pr-6 text-left font-semibold text-ink">{l.label}</th>
                      <td className="py-3 leading-relaxed text-ink/85">{l.nilai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== Data desa ===== */}
      {dataUtama ? (
        <section className="container-desa section-lg grid gap-10 lg:grid-cols-12" aria-labelledby="judul-data">
          <div className="lg:col-span-4">
            <h2 id="judul-data" className="section-title">Data desa</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Angka kependudukan, pendidikan, kesehatan, pertanian, ekonomi, dan infrastruktur yang dicatat pemerintah desa{tahunData ? ` hingga ${tahunData}` : ""}.
            </p>
            <ul className="mt-6 divide-y divide-line border-y border-line text-[0.9375rem]">
              {kategoriData.map((c) => (
                <li key={c.key}>
                  <Link href={`/informasi?kategori=${c.key}`} className="flex items-center justify-between py-2.5 text-ink hover:text-brand-700">
                    <span>{c.label}</span>
                    <span className="text-sm text-muted tabular-nums">{c.jumlah} data</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <figure className="lg:col-span-7 lg:col-start-6">
            <figcaption className="mb-6 flex items-baseline justify-between gap-4 border-b border-ink pb-3">
              <span className="font-semibold text-ink">{dataUtama.judul}</span>
              <span className="meta shrink-0">{[dataUtama.satuan, dataUtama.tahun].filter(Boolean).join(" · ")}</span>
            </figcaption>
            <StatView stat={dataUtama} />
            {dataUtama.deskripsi ? <p className="mt-5 text-sm text-muted">{dataUtama.deskripsi}</p> : null}
          </figure>
        </section>
      ) : null}

      {/* ===== Potensi & produk ===== */}
      {pilihanPotensi.length ? (
        <section className="border-t border-line" aria-labelledby="judul-potensi">
          <div className="container-desa section-lg">
            <SectionHeading
              id="judul-potensi"
              title="Produk warga dan tempat untuk dikunjungi"
              description="Beli langsung dari pembuatnya. Setiap pesanan lewat WhatsApp masuk ke pelaku usaha, bukan perantara."
              action={{ href: "/potensi", label: "Semua potensi desa" }}
            />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {pilihanPotensi.map((p) => (
                <PotensiCard key={p.id} item={p} showType />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== Galeri ===== */}
      {galeri.length ? (
        <section className="container-desa" aria-labelledby="judul-galeri">
          <div className="mb-6 flex items-end justify-between gap-4 border-t border-line pt-10">
            <h2 id="judul-galeri" className="section-title">Galeri</h2>
            <Link href="/galeri" className="link text-sm">Lihat {galeri.length} foto</Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
            {galeri.slice(0, 4).map((g) => (
              <li key={g.id}>
                <Link href="/galeri" className="group block">
                  <Img src={g.gambar} alt={g.judul} className="aspect-[4/3] w-full rounded-md transition-opacity group-hover:opacity-90" />
                  <p className="mt-2 text-sm leading-snug text-ink group-hover:underline">{g.judul}</p>
                  <p className="text-xs text-muted">{g.album}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ===== Peta ===== */}
      <section className="container-desa section-lg grid gap-8 lg:grid-cols-12" aria-labelledby="judul-peta">
        <div className="lg:col-span-4">
          <h2 id="judul-peta" className="section-title">Lokasi di desa</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Kantor desa, fasilitas kesehatan, sekolah, dan tempat usaha warga. Ketuk titik di peta untuk melihat keterangannya.
          </p>
          <p className="mt-5 text-sm">
            <Link href="/kontak" className="link">Kirim pertanyaan atau aspirasi</Link>
          </p>
        </div>
        <div className="lg:col-span-8">
          <VillageMap center={[site.lat, site.lng]} lokasi={lokasi} height="400px" />
        </div>
      </section>
    </>
  );
}
