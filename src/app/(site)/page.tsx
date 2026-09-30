import Link from "next/link";
import { StatView } from "@/components/charts";
import { ProductCard } from "@/components/pasar/ProductCard";
import { Img, kategoriBerita, SectionHeading } from "@/components/site/ui";
import { Icon } from "@/components/Icon";
import { Contours } from "@/components/site/Contours";
import { OfficeStatus } from "@/components/site/OfficeStatus";
import { VillageMap } from "@/components/site/VillageMap";
import { STAT_CATEGORIES } from "@/lib/categories";
import { getBerita, getGaleri, getLokasi, getPotensi, getProduk, getSite, getStatistik } from "@/lib/data";
import { excerpt, formatDate, toDateInput, waLink } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Angka kunci: bagian angka besar, satuan kecil (mis. "7.842" + "jiwa"). Teks tanpa pola tetap utuh. */
function AngkaKunci({ nilai }: { nilai: string }) {
  const m = nilai.match(/^([\d.,]+)\s+([^\d]+)$/);
  if (!m) return <span className="block text-[1.375rem] leading-tight sm:text-[1.5rem]">{nilai}</span>;
  return (
    <>
      <span className="block text-[1.875rem] sm:text-[2.125rem]">{m[1]}</span>
      <span className="mt-1.5 block text-sm font-medium tracking-normal opacity-60">{m[2]}</span>
    </>
  );
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
      <section className="container-desa pt-2">
        <div className="panel-dark px-6 py-12 sm:px-12 sm:py-16 lg:px-14">
          <Contours className="right-[-6%] bottom-[-30%] h-[120%] w-[62%] text-sun-400/40 [mask-image:linear-gradient(to_right,transparent,black_55%)]" />
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm text-white/80">
                <Icon name="pin" className="h-3.5 w-3.5 text-sun-400" />
                Kec. {site.kecamatan}, Kab. {site.kabupaten}, {site.provinsi}
              </p>
              <h1 className="font-display mt-7 max-w-[12ch] text-[3.25rem] leading-[0.98] font-semibold sm:text-[4.75rem]">{site.heroJudul}</h1>
              {site.heroDeskripsi ? <p className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-white/70">{site.heroDeskripsi}</p> : null}
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="#layanan" className="btn-accent px-6 py-3">Lihat layanan administrasi</a>
                <Link href="/pasar" className="btn-ghost px-6 py-3">Belanja di Pasar Desa</Link>
              </div>
            </div>

            <aside aria-labelledby="kantor-desa" className="self-start rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-sm lg:col-span-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="kantor-desa" className="font-medium">Kantor Desa {site.namaDesa}</h2>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/85">
                  <OfficeStatus jamLayanan={site.jamLayanan} tone="dark" short />
                </span>
              </div>
              <dl className="mt-5 space-y-4 text-[0.9375rem]">
                {site.jamLayanan ? (
                  <div>
                    <dt className="text-xs text-white/50">Jam layanan</dt>
                    <dd className="mt-1 whitespace-pre-line text-white/90">{site.jamLayanan}</dd>
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-4">
                  {site.telepon ? (
                    <div>
                      <dt className="text-xs text-white/50">Telepon</dt>
                      <dd className="mt-1"><a href={`tel:${site.telepon.replace(/[^\d+]/g, "")}`} className="tabular-nums hover:text-sun-400">{site.telepon}</a></dd>
                    </div>
                  ) : null}
                  {wa ? (
                    <div>
                      <dt className="text-xs text-white/50">WhatsApp</dt>
                      <dd className="mt-1"><a href={wa} target="_blank" rel="noopener noreferrer" className="text-sun-400 hover:underline">Kirim pesan</a></dd>
                    </div>
                  ) : null}
                </div>
                {site.alamat ? (
                  <div>
                    <dt className="text-xs text-white/50">Alamat</dt>
                    <dd className="mt-1 text-white/90">{site.alamat}</dd>
                  </div>
                ) : null}
              </dl>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`} target="_blank" rel="noopener noreferrer" className="btn mt-6 w-full bg-white/10 text-white hover:bg-white/15">
                Petunjuk arah <Icon name="arrow" className="h-4 w-4" />
              </a>
            </aside>
          </div>
        </div>
      </section>

      {/* ===== Foto utama + angka kunci ===== */}
      <section className="container-desa mt-4 grid gap-4 lg:grid-cols-12" aria-label="Sekilas desa">
        <figure className={site.angkaKunci.length ? "lg:col-span-8" : "lg:col-span-12"}>
          <Img src={site.heroGambar} alt={site.heroKeterangan || `Pemandangan Desa ${site.namaDesa}`} className="aspect-[16/10] h-full w-full rounded-[1.75rem] lg:aspect-auto lg:min-h-[22rem]" />
          {site.heroKeterangan ? <figcaption className="sr-only">{site.heroKeterangan}</figcaption> : null}
        </figure>
        {site.angkaKunci.length ? (
          <dl className="grid grid-cols-2 gap-4 lg:col-span-4">
            {site.angkaKunci.map((a, i) => (
              <div key={i} className={`flex flex-col justify-between rounded-[1.5rem] p-5 ${i === 0 ? "bg-sun-400 text-ink" : "bg-white"}`}>
                <dt className={`text-sm ${i === 0 ? "text-ink/70" : "text-muted"}`}>{a.label}</dt>
                <dd className="font-display mt-6 leading-none font-semibold tabular-nums">
                  <AngkaKunci nilai={String(a.nilai)} />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>
      {site.heroKeterangan ? <p className="container-desa mt-3 text-xs text-muted">{site.heroKeterangan}</p> : null}

      {/* ===== Kabar desa: satu utama + daftar ===== */}
      {utama ? (
        <section className="container-desa section-lg" aria-labelledby="kabar">
          <SectionHeading id="kabar" eyebrow="Kabar desa" title="Kabar dan pengumuman" action={{ href: "/berita", label: "Semua berita" }} />
          <div className="grid gap-10 lg:grid-cols-12">
            <article className="group relative lg:col-span-7">
              <Img src={utama.gambar} alt="" className="aspect-[16/10] w-full rounded-[1.75rem] transition-transform duration-500 group-hover:scale-[1.01]" />
              <p className="meta mt-5">
                <span className="font-medium text-brand-600">{kategoriBerita(utama.kategori)}</span>
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
              <ol className="space-y-3 lg:col-span-5">
                {lainnya.map((b) => (
                  <li key={b.id} className="card-hover group relative p-5">
                    <p className="meta">
                      <time dateTime={toDateInput(b.tanggal)}>{formatDate(b.tanggal)}</time>
                      <span aria-hidden="true"> · </span>
                      {kategoriBerita(b.kategori)}
                    </p>
                    <h3 className="mt-1 text-[1.0625rem] leading-snug font-semibold text-ink">
                      <Link href={`/berita/${b.slug}`} className="after:absolute after:inset-0">
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
        <section id="layanan" className="container-desa scroll-mt-24" aria-labelledby="judul-layanan">
          <div className="panel-dark px-6 py-12 sm:px-12 sm:py-16">
            <Contours className="right-[-10%] bottom-[-40%] h-[80%] w-[55%] text-sun-400/15 [mask-image:linear-gradient(to_right,transparent,black_60%)]" />
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="mb-3 text-sm font-medium text-sun-400">Layanan kantor desa</p>
                <h2 id="judul-layanan" className="section-title text-white">Layanan administrasi</h2>
                {site.catatanLayanan ? <p className="mt-4 leading-relaxed text-white/70">{site.catatanLayanan}</p> : null}
                <p className="mt-6 inline-flex rounded-full bg-white/10 px-3.5 py-1.5 text-sm text-white/85">
                  <OfficeStatus jamLayanan={site.jamLayanan} tone="dark" />
                </p>
                <p className="mt-6 text-sm text-white/60">
                  Ada pertanyaan sebelum datang?{" "}
                  <Link href="/kontak" className="text-sun-400 hover:underline">Hubungi kantor desa</Link>
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
                {site.layanan.map((l, i) => (
                  <li
                    key={i}
                    className={`rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10 transition-colors hover:bg-white/[0.09] ${
                      i === site.layanan.length - 1 && site.layanan.length % 2 === 1 ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sun-400 text-xs font-semibold text-ink tabular-nums">{i + 1}</span>
                      <div>
                        <h3 className="font-medium text-white">{l.label}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                          <span className="sr-only">Yang perlu dibawa: </span>
                          {l.nilai}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== Data desa ===== */}
      {dataUtama ? (
        <section className="container-desa section-lg grid gap-10 lg:grid-cols-12" aria-labelledby="judul-data">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-3">Data terbuka</p>
            <h2 id="judul-data" className="section-title">Data desa</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Angka kependudukan, pendidikan, kesehatan, pertanian, ekonomi, dan infrastruktur yang dicatat pemerintah desa{tahunData ? ` hingga ${tahunData}` : ""}.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm">
              {kategoriData.map((c) => (
                <li key={c.key}>
                  <Link href={`/informasi?kategori=${c.key}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-ink shadow-[0_0_0_1px_rgb(11_19_16/0.06)] transition-shadow hover:shadow-[0_6px_16px_-8px_rgb(11_19_16/0.35)]">
                    {c.label}
                    <span className="rounded-full bg-paper px-1.5 text-xs text-muted tabular-nums">{c.jumlah}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <figure className="rounded-[1.75rem] bg-white p-6 sm:p-8 lg:col-span-7 lg:col-start-6">
            <figcaption className="mb-6 flex items-baseline justify-between gap-4">
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
              eyebrow="Pasar Desa"
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
              <p className="mt-12 rounded-2xl bg-white px-5 py-4 text-sm text-muted">
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
          <SectionHeading id="judul-galeri" eyebrow="Galeri" title="Potret kehidupan desa" action={{ href: "/galeri", label: `Lihat ${galeri.length} foto` }} />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {galeri.slice(0, 4).map((g) => (
              <li key={g.id}>
                <Link href="/galeri" className="group block">
                  <Img eager src={g.gambar} alt={g.judul} className="aspect-[4/5] w-full rounded-3xl transition-transform duration-500 group-hover:scale-[1.02]" />
                  <p className="mt-3 text-sm leading-snug font-medium text-ink">{g.judul}</p>
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
          <p className="eyebrow mb-3">Peta desa</p>
          <h2 id="judul-peta" className="section-title">Lokasi di desa</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Kantor desa, fasilitas kesehatan, sekolah, dan tempat usaha warga. Ketuk titik di peta untuk melihat keterangannya.
          </p>
          <p className="mt-5 text-sm">
            <Link href="/kontak" className="btn-light">Kirim pertanyaan atau aspirasi</Link>
          </p>
        </div>
        <div className="lg:col-span-8">
          <VillageMap center={[site.lat, site.lng]} lokasi={lokasi} height="400px" />
        </div>
      </section>
    </>
  );
}
