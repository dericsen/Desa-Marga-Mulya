import Link from "next/link";
import { StatView } from "@/components/charts";
import { ProductCard } from "@/components/pasar/ProductCard";
import { Img, kategoriBerita, SectionHeading } from "@/components/site/ui";
import { OfficeStatus } from "@/components/site/OfficeStatus";
import { VillageMap } from "@/components/site/VillageMap";
import { STAT_CATEGORIES } from "@/lib/categories";
import { getBerita, getGaleri, getLokasi, getPotensi, getProduk, getSite, getStatistik } from "@/lib/data";
import { excerpt, formatDate, toDateInput, waLink } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Koordinat kantor desa dalam format derajat-menit, mis. 6°02′S 106°31′E. */
function koordinat(lat: number, lng: number): string {
  const dm = (v: number) => {
    const a = Math.abs(v);
    const d = Math.floor(a);
    return `${d}°${String(Math.round((a - d) * 60)).padStart(2, "0")}′`;
  };
  return `${dm(lat)}${lat < 0 ? "S" : "N"} ${dm(lng)}${lng < 0 ? "W" : "E"}`;
}

export default async function BerandaPage() {
  const [site, statistik, potensi, berita, galeri, lokasi, produkPilihan] = await Promise.all([
    getSite(),
    getStatistik(),
    getPotensi(),
    getBerita({ limit: 5 }),
    getGaleri(),
    getLokasi(),
    getProduk({ unggulan: true, limit: 4 }),
  ]);

  const wa = waLink(site.whatsapp, `Halo Pemerintah Desa ${site.namaDesa}, saya ingin bertanya tentang layanan desa.`);
  const [utama, ...lainnya] = berita;
  const dataUtama = statistik.find((s) => /mata pencaharian/i.test(s.judul)) ?? statistik.find((s) => s.tipe_grafik === "bar");
  const kategoriData = STAT_CATEGORIES.map((c) => ({ ...c, jumlah: statistik.filter((s) => s.kategori === c.key).length })).filter((c) => c.jumlah > 0);
  const tahunData = Math.max(0, ...statistik.map((s) => s.tahun ?? 0));
  const wisataUnggulan = potensi.filter((p) => p.tipe === "wisata" && p.unggulan).slice(0, 3);

  return (
    <>
      {/* ===== Pembuka: identitas desa + status kantor ===== */}
      <section className="band-dark">
        <div className="container-desa grid gap-12 pt-14 pb-16 sm:pt-20 sm:pb-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="font-mono text-[0.75rem] text-white/55">
              <span className="text-sun-400">{koordinat(site.lat, site.lng)}</span>
              <span className="mx-2 text-white/25">/</span>
              KEC. {site.kecamatan.toUpperCase()} · KAB. {site.kabupaten.toUpperCase()} · {site.provinsi.toUpperCase()} {site.kodePos}
            </p>
            <h1 className="font-display mt-6 max-w-[12ch] text-[3.25rem] leading-[0.95] font-semibold sm:text-[4.75rem]">{site.heroJudul}</h1>
            {site.heroDeskripsi ? <p className="mt-6 max-w-[50ch] text-[1.0625rem] leading-relaxed text-white/70">{site.heroDeskripsi}</p> : null}
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="#layanan" className="btn-accent px-5 py-3">Lihat layanan administrasi</a>
              <Link href="/pasar" className="group inline-flex items-center gap-2 text-sm font-medium text-white">
                <span className="border-b border-white/30 pb-0.5 group-hover:border-white">Belanja di Pasar Desa</span>
              </Link>
            </div>
          </div>

          <aside aria-labelledby="kantor-desa" className="self-start rounded-md border border-white/15 bg-white/[0.03] lg:col-span-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/15 px-5 py-3.5">
              <h2 id="kantor-desa" className="text-sm font-medium">Kantor Desa {site.namaDesa}</h2>
              <span className="font-mono text-[0.75rem] text-white/80">
                <OfficeStatus jamLayanan={site.jamLayanan} tone="dark" />
              </span>
            </div>
            <dl className="divide-y divide-white/10 px-5 text-[0.9375rem]">
              {site.jamLayanan ? (
                <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-3.5">
                  <dt className="font-mono text-[0.75rem] leading-6 text-white/45 uppercase">Jam</dt>
                  <dd className="whitespace-pre-line text-white/90">{site.jamLayanan}</dd>
                </div>
              ) : null}
              {site.telepon ? (
                <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-3.5">
                  <dt className="font-mono text-[0.75rem] leading-6 text-white/45 uppercase">Telepon</dt>
                  <dd><a href={`tel:${site.telepon.replace(/[^\d+]/g, "")}`} className="tabular-nums hover:text-sun-400">{site.telepon}</a></dd>
                </div>
              ) : null}
              {wa ? (
                <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-3.5">
                  <dt className="font-mono text-[0.75rem] leading-6 text-white/45 uppercase">WhatsApp</dt>
                  <dd><a href={wa} target="_blank" rel="noopener noreferrer" className="text-sun-400 hover:underline">Tanya lewat WhatsApp</a></dd>
                </div>
              ) : null}
              {site.alamat ? (
                <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-3.5">
                  <dt className="font-mono text-[0.75rem] leading-6 text-white/45 uppercase">Alamat</dt>
                  <dd className="text-white/90">
                    {site.alamat}
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm text-sun-400 hover:underline">
                      Petunjuk arah →
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </aside>
        </div>
      </section>

      {/* ===== Foto utama + angka kunci ===== */}
      <section className="container-desa pt-10" aria-label="Sekilas desa">
        <figure>
          <Img src={site.heroGambar} alt={site.heroKeterangan || `Pemandangan Desa ${site.namaDesa}`} className="aspect-[16/9] w-full rounded-md sm:aspect-[21/8]" />
          {site.heroKeterangan ? <figcaption className="meta mt-2 text-[0.75rem]">↑ {site.heroKeterangan}</figcaption> : null}
        </figure>
        {site.angkaKunci.length ? (
          <dl className="mt-10 grid grid-cols-2 border-y border-ink lg:grid-cols-4">
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
                <dt className="eyebrow">{a.label}</dt>
                <dd className="font-display mt-2 text-[2rem] leading-none font-semibold text-ink tabular-nums">{a.nilai}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      {/* ===== Kabar desa: satu utama + daftar ===== */}
      {utama ? (
        <section className="container-desa section-lg" aria-labelledby="kabar">
          <SectionHeading id="kabar" index="01 — KABAR DESA" title="Kabar dan pengumuman" action={{ href: "/berita", label: "Semua berita" }} />
          <div className="grid gap-10 lg:grid-cols-12">
            <article className="group relative lg:col-span-7">
              <Img src={utama.gambar} alt="" className="aspect-[16/9] w-full rounded-md" />
              <p className="meta mt-5">
                <span className="text-ink">{kategoriBerita(utama.kategori).toUpperCase()}</span>
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
        <section id="layanan" className="band-dark scroll-mt-28" aria-labelledby="judul-layanan">
          <div className="container-desa section-lg grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="mb-4 font-mono text-[0.75rem] text-sun-400">02 — LAYANAN</p>
              <h2 id="judul-layanan" className="section-title text-white">Layanan administrasi</h2>
              {site.catatanLayanan ? <p className="mt-4 leading-relaxed text-white/70">{site.catatanLayanan}</p> : null}
              <p className="mt-6 font-mono text-[0.75rem] text-white/80">
                <OfficeStatus jamLayanan={site.jamLayanan} tone="dark" />
              </p>
              <p className="mt-6 text-sm text-white/60">
                Ada pertanyaan sebelum datang?{" "}
                <Link href="/kontak" className="text-sun-400 hover:underline">Hubungi kantor desa</Link>
              </p>
            </div>
            <div className="overflow-x-auto lg:col-span-8">
              <table className="w-full min-w-[34rem] text-[0.9375rem]">
                <caption className="sr-only">Daftar layanan administrasi dan persyaratannya</caption>
                <thead>
                  <tr className="border-b border-white/40 text-left">
                    <th scope="col" className="w-[6%] pb-3 font-mono text-[0.6875rem] font-normal tracking-[0.12em] text-white/45 uppercase">No</th>
                    <th scope="col" className="w-[36%] pb-3 font-mono text-[0.6875rem] font-normal tracking-[0.12em] text-white/45 uppercase">Layanan</th>
                    <th scope="col" className="pb-3 font-mono text-[0.6875rem] font-normal tracking-[0.12em] text-white/45 uppercase">Yang perlu dibawa</th>
                  </tr>
                </thead>
                <tbody>
                  {site.layanan.map((l, i) => (
                    <tr key={i} className="border-b border-white/10 align-top transition-colors last:border-0 hover:bg-white/[0.03]">
                      <td className="py-3.5 pr-3 font-mono text-[0.75rem] leading-6 text-sun-400 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                      <th scope="row" className="py-3.5 pr-6 text-left font-medium text-white">{l.label}</th>
                      <td className="py-3.5 leading-relaxed text-white/70">{l.nilai}</td>
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
          <div className="border-t border-ink pt-4 lg:col-span-4">
            <p className="mb-4 font-mono text-[0.75rem] text-muted">03 — DATA DESA</p>
            <h2 id="judul-data" className="section-title">Data desa</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Angka kependudukan, pendidikan, kesehatan, pertanian, ekonomi, dan infrastruktur yang dicatat pemerintah desa{tahunData ? ` hingga ${tahunData}` : ""}.
            </p>
            <ul className="mt-6 divide-y divide-line border-y border-line text-[0.9375rem]">
              {kategoriData.map((c) => (
                <li key={c.key}>
                  <Link href={`/informasi?kategori=${c.key}`} className="group flex items-center justify-between py-2.5 text-ink">
                    <span className="group-hover:translate-x-0.5 transition-transform">{c.label}</span>
                    <span className="font-mono text-[0.75rem] text-muted tabular-nums group-hover:text-ink">{String(c.jumlah).padStart(2, "0")} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <figure className="border-t border-ink pt-4 lg:col-span-7 lg:col-start-6">
            <figcaption className="mb-6 flex items-baseline justify-between gap-4 pb-3">
              <span className="font-semibold text-ink">{dataUtama.judul}</span>
              <span className="meta shrink-0">{[dataUtama.satuan, dataUtama.tahun].filter(Boolean).join(" · ")}</span>
            </figcaption>
            <StatView stat={dataUtama} />
            {dataUtama.deskripsi ? <p className="mt-5 text-sm text-muted">{dataUtama.deskripsi}</p> : null}
          </figure>
        </section>
      ) : null}

      {/* ===== Pasar Desa ===== */}
      {produkPilihan.length ? (
        <section aria-labelledby="judul-pasar">
          <div className="container-desa section-lg">
            <SectionHeading
              id="judul-pasar"
              index="04 — PASAR DESA"
              title="Belanja langsung dari warga"
              description="Olahan ikan, beras, dan kerajinan dari warga. Pesanan diteruskan ke WhatsApp penjual, dan pembayaran langsung ke mereka."
              action={{ href: "/pasar", label: "Belanja di Pasar Desa" }}
            />
            <ul className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
              {produkPilihan.map((p) => (
                <li key={p.id}>
                  <ProductCard p={p} detailHref={`/pasar?produk=${p.slug}`} />
                </li>
              ))}
            </ul>
            {wisataUnggulan.length ? (
              <p className="mt-12 border-t border-line pt-5 text-sm text-muted">
                Berkunjung ke desa? Dekat dari sini: {wisataUnggulan.map((w) => w.nama).join(", ")}.{" "}
                <Link href="/potensi" className="link">Lihat wisata & budaya</Link>
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ===== Galeri ===== */}
      {galeri.length ? (
        <section className="container-desa" aria-labelledby="judul-galeri">
          <SectionHeading id="judul-galeri" index="05 — GALERI" title="Galeri" action={{ href: "/galeri", label: `Lihat ${galeri.length} foto` }} />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
            {galeri.slice(0, 4).map((g) => (
              <li key={g.id}>
                <Link href="/galeri" className="group block">
                  <Img src={g.gambar} alt={g.judul} className="aspect-[4/3] w-full rounded-md transition-opacity group-hover:opacity-90" />
                  <p className="mt-2 text-sm leading-snug text-ink group-hover:underline">{g.judul}</p>
                  <p className="meta text-[0.6875rem] uppercase">{g.album}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ===== Peta ===== */}
      <section className="container-desa section-lg grid gap-8 lg:grid-cols-12" aria-labelledby="judul-peta">
        <div className="border-t border-ink pt-4 lg:col-span-4">
          <p className="mb-4 font-mono text-[0.75rem] text-muted">06 — LOKASI</p>
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
