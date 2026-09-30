import Link from "next/link";
import { StatView } from "@/components/charts";
import { ProductCard } from "@/components/pasar/ProductCard";
import { OfficeStatus } from "@/components/site/OfficeStatus";
import { Img, kategoriBerita, SectionHeading } from "@/components/site/ui";
import { VillageMap } from "@/components/site/VillageMap";
import { STAT_CATEGORIES } from "@/lib/categories";
import { getBerita, getGaleri, getLokasi, getPotensi, getProduk, getSite, getStatistik } from "@/lib/data";
import { excerpt, formatDate, toDateInput, waLink } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Angka kunci: angka besar, satuan kecil (mis. "7.842" + "jiwa"). Nilai berbentuk "6 RW / 24 RT" dipecah per baris. */
function AngkaKunci({ nilai }: { nilai: string }) {
  const m = nilai.match(/^([\d.,]+)\s+([^\d]+)$/);
  if (m) {
    return (
      <>
        <span className="block text-[2.25rem] leading-none">{m[1]}</span>
        <span className="mt-2 block text-base font-normal tracking-normal text-muted">{m[2]}</span>
      </>
    );
  }
  return (
    <span className="block text-[1.5rem] leading-tight">
      {nilai.split(/\s*\/\s*/).map((p, i) => (
        <span key={i} className="block whitespace-nowrap">{p}</span>
      ))}
    </span>
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

  const renderedAt = new Date().toISOString();
  const wa = waLink(site.whatsapp, `Halo Pemerintah Desa ${site.namaDesa}, saya ingin bertanya tentang layanan desa.`);
  const [utama, ...lainnya] = berita;
  const dataUtama = statistik.find((s) => /mata pencaharian/i.test(s.judul)) ?? statistik.find((s) => s.tipe_grafik === "bar");
  const kategoriData = STAT_CATEGORIES.map((c) => ({ ...c, jumlah: statistik.filter((s) => s.kategori === c.key).length })).filter((c) => c.jumlah > 0);
  const tahunData = Math.max(0, ...statistik.map((s) => s.tahun ?? 0));
  const wisataUnggulan = potensi.filter((p) => p.tipe === "wisata" && p.unggulan).slice(0, 3);

  return (
    <>
      {/* ===== Pembuka: nama desa, lalu status kantor sebagai satu elemen yang paling menonjol ===== */}
      <section className="container-desa pt-10 sm:pt-16">
        <h1 className="font-display text-[3rem] leading-[1] text-ink sm:text-[4.5rem]">{site.heroJudul}</h1>
        <p className="mt-4 text-lg text-muted">
          Kecamatan {site.kecamatan}, Kabupaten {site.kabupaten}, {site.provinsi}
        </p>

        <div className="mt-10 grid gap-8 border-t border-line pt-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <OfficeStatus jamLayanan={site.jamLayanan} initialNow={renderedAt} variant="hero" />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#layanan" className="btn-primary px-5 py-3">Lihat layanan administrasi</a>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-light px-5 py-3">Tanya lewat WhatsApp</a>
              ) : null}
            </div>
          </div>
          <dl className="grid content-start gap-4 text-base lg:col-span-4">
            {site.jamLayanan ? (
              <div>
                <dt className="text-sm text-muted">Jam layanan</dt>
                <dd className="mt-1 whitespace-pre-line">{site.jamLayanan}</dd>
              </div>
            ) : null}
            {site.telepon ? (
              <div>
                <dt className="text-sm text-muted">Telepon</dt>
                <dd className="mt-1"><a href={`tel:${site.telepon.replace(/[^\d+]/g, "")}`} className="link tabular-nums">{site.telepon}</a></dd>
              </div>
            ) : null}
            {site.alamat ? (
              <div>
                <dt className="text-sm text-muted">Alamat</dt>
                <dd className="mt-1">
                  {site.alamat}{" "}
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`} target="_blank" rel="noopener noreferrer" className="link whitespace-nowrap">
                    Petunjuk arah
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      {/* ===== Foto utama dan angka kunci ===== */}
      <section className="container-desa mt-14" aria-label="Sekilas desa">
        <figure>
          <Img eager src={site.heroGambar} alt={site.heroKeterangan || `Pemandangan Desa ${site.namaDesa}`} className="aspect-[16/10] w-full rounded-2xl sm:aspect-[21/8]" />
          {site.heroKeterangan ? <figcaption className="mt-3 text-sm text-muted">{site.heroKeterangan}</figcaption> : null}
        </figure>
        {site.angkaKunci.length ? (
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
            {site.angkaKunci.map((a, i) => (
              <div key={i} className="border-l-2 border-ink pl-4">
                <dt className="text-sm text-muted">{a.label}</dt>
                <dd className="font-display mt-2 tabular-nums">
                  <AngkaKunci nilai={String(a.nilai)} />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      {/* ===== Kabar desa ===== */}
      {utama ? (
        <section className="container-desa section-lg" aria-labelledby="kabar">
          <SectionHeading id="kabar" title="Kabar dan pengumuman" action={{ href: "/berita", label: "Semua berita" }} />
          <div className="grid gap-10 lg:grid-cols-12">
            <article className="group relative lg:col-span-7">
              <Img src={utama.gambar} alt="" className="aspect-[16/10] w-full rounded-2xl" />
              <p className="meta mt-5">
                {kategoriBerita(utama.kategori)}, <time dateTime={toDateInput(utama.tanggal)}>{formatDate(utama.tanggal)}</time>
              </p>
              <h3 className="font-display mt-2 text-[1.5rem] leading-snug text-ink">
                <Link href={`/berita/${utama.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-slate group-hover:underline-offset-4">
                  {utama.judul}
                </Link>
              </h3>
              <p className="mt-3 max-w-[60ch] text-muted">{utama.ringkasan || excerpt(utama.konten)}</p>
            </article>

            {lainnya.length ? (
              <ol className="divide-y divide-line border-t border-line lg:col-span-5 lg:border-t-0">
                {lainnya.map((b) => (
                  <li key={b.id} className="group relative py-5 lg:first:pt-0">
                    <p className="meta">
                      <time dateTime={toDateInput(b.tanggal)}>{formatDate(b.tanggal)}</time>, {kategoriBerita(b.kategori).toLowerCase()}
                    </p>
                    <h3 className="mt-1 text-lg leading-snug font-bold text-ink">
                      <Link href={`/berita/${b.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-slate group-hover:underline-offset-4">
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

      {/* ===== Layanan administrasi: satu-satunya panel gelap di beranda ===== */}
      {site.layanan.length ? (
        <section id="layanan" className="container-desa scroll-mt-24" aria-labelledby="judul-layanan">
          <div className="panel-dark px-6 py-12 sm:px-12 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 id="judul-layanan" className="section-title text-white">Layanan administrasi</h2>
                {site.catatanLayanan ? <p className="mt-4 text-white/80">{site.catatanLayanan}</p> : null}
                <p className="mt-6 text-sm text-white/85">
                  <OfficeStatus jamLayanan={site.jamLayanan} initialNow={renderedAt} tone="dark" />
                </p>
                <p className="mt-6 text-sm text-white/70">
                  Ada pertanyaan sebelum datang?{" "}
                  <Link href="/kontak" className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">Hubungi kantor desa</Link>
                </p>
              </div>
              <dl className="divide-y divide-white/15 border-y border-white/15 lg:col-span-8">
                {site.layanan.map((l, i) => (
                  <div key={i} className="grid gap-1 py-4 sm:grid-cols-[16rem_1fr] sm:gap-6">
                    <dt className="font-bold text-white">{l.label}</dt>
                    <dd className="text-white/75">
                      <span className="sr-only">Yang perlu dibawa: </span>
                      {l.nilai}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== Data desa ===== */}
      {dataUtama ? (
        <section className="container-desa section-lg grid gap-10 lg:grid-cols-12" aria-labelledby="judul-data">
          <div className="lg:col-span-4">
            <h2 id="judul-data" className="section-title">Data desa</h2>
            <p className="mt-3 text-muted">
              Kependudukan, pendidikan, kesehatan, pertanian, ekonomi, dan infrastruktur yang dicatat pemerintah desa{tahunData ? ` hingga ${tahunData}` : ""}.
            </p>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {kategoriData.map((c) => (
                <li key={c.key}>
                  <Link href={`/informasi?kategori=${c.key}`} className="flex items-baseline justify-between gap-4 py-2.5 hover:underline hover:decoration-slate hover:underline-offset-4">
                    <span>{c.label}</span>
                    <span className="text-sm text-muted tabular-nums">{c.jumlah} tabel</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <figure className="card p-6 sm:p-8 lg:col-span-7 lg:col-start-6">
            <figcaption className="mb-6">
              <span className="block font-bold text-ink">{dataUtama.judul}</span>
              <span className="meta mt-0.5 block">
                {[dataUtama.tahun ? `Tahun ${dataUtama.tahun}` : null, dataUtama.satuan ? `dalam ${dataUtama.satuan}` : null].filter(Boolean).join(", ")}
              </span>
            </figcaption>
            <StatView stat={dataUtama} />
            {dataUtama.deskripsi ? <p className="mt-5 text-sm text-muted">{dataUtama.deskripsi}</p> : null}
          </figure>
        </section>
      ) : null}

      {/* ===== Pasar Desa ===== */}
      {produkPilihan.length ? (
        <section className="container-desa" aria-labelledby="judul-pasar">
          <SectionHeading
            id="judul-pasar"
            title="Pasar Desa"
            description="Olahan ikan, beras, dan kerajinan buatan warga. Pesanan diteruskan ke WhatsApp penjual, dan pembayaran langsung kepada mereka."
            action={{ href: "/pasar", label: "Buka Pasar Desa" }}
          />
          <ul className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {produkPilihan.map((p) => (
              <li key={p.id}>
                <ProductCard p={p} detailHref={`/pasar?produk=${p.slug}`} />
              </li>
            ))}
          </ul>
          {wisataUnggulan.length ? (
            <p className="mt-12 text-muted">
              Berkunjung ke desa? Tempat terdekat: {wisataUnggulan.map((w) => w.nama).join(", ")}.{" "}
              <Link href="/potensi" className="link">Lihat wisata dan budaya</Link>
            </p>
          ) : null}
        </section>
      ) : null}

      {/* ===== Galeri ===== */}
      {galeri.length ? (
        <section className="container-desa section-lg" aria-labelledby="judul-galeri">
          <SectionHeading id="judul-galeri" title="Galeri" action={{ href: "/galeri", label: `Lihat ${galeri.length} foto` }} />
          <ul className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
            {galeri.slice(0, 4).map((g) => (
              <li key={g.id}>
                <Link href="/galeri" className="group block">
                  <Img eager src={g.gambar} alt={g.judul} className="aspect-[4/3] w-full rounded-xl" />
                  <p className="mt-3 leading-snug font-bold text-ink group-hover:underline group-hover:decoration-slate group-hover:underline-offset-4">{g.judul}</p>
                  <p className="text-sm text-muted">{g.album}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ===== Peta ===== */}
      <section className="container-desa grid gap-8 lg:grid-cols-12" aria-labelledby="judul-peta">
        <div className="lg:col-span-4">
          <h2 id="judul-peta" className="section-title">Peta desa</h2>
          <p className="mt-3 text-muted">
            Kantor desa, fasilitas kesehatan, sekolah, dan tempat usaha warga. Pilih titik di peta untuk melihat keterangannya.
          </p>
          <p className="mt-6">
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
