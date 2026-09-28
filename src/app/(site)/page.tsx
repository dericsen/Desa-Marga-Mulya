import Link from "next/link";
import { Icon } from "@/components/Icon";
import { StatView } from "@/components/charts";
import { BeritaCard, Img, PotensiCard, SectionHeading } from "@/components/site/ui";
import { VillageMap } from "@/components/site/VillageMap";
import type { IconName } from "@/lib/categories";
import { getBerita, getGaleri, getLokasi, getPotensi, getSite, getStatistik } from "@/lib/data";

export const dynamic = "force-dynamic";

const AKSES: { href: string; label: string; desc: string; icon: IconName }[] = [
  { href: "/profil", label: "Profil Desa", desc: "Sejarah, visi-misi, aparat", icon: "landmark" },
  { href: "/informasi", label: "Data Desa", desc: "Statistik & grafik interaktif", icon: "chart" },
  { href: "/potensi", label: "Wisata & UMKM", desc: "Produk lokal dan destinasi", icon: "store" },
  { href: "/berita", label: "Berita & Kegiatan", desc: "Kabar terbaru warga", icon: "news" },
  { href: "/galeri", label: "Galeri", desc: "Dokumentasi desa", icon: "camera" },
  { href: "/kontak", label: "Layanan & Aspirasi", desc: "Hubungi kantor desa", icon: "mail" },
];

export default async function BerandaPage() {
  const [site, statistik, potensi, berita, galeri, lokasi] = await Promise.all([
    getSite(),
    getStatistik(),
    getPotensi(),
    getBerita({ limit: 3 }),
    getGaleri(),
    getLokasi(),
  ]);

  const unggulan = potensi.filter((p) => p.unggulan).slice(0, 6);
  const sorotan = [
    statistik.find((s) => /mata pencaharian/i.test(s.judul)),
    statistik.find((s) => /penggunaan lahan/i.test(s.judul)),
  ].filter((s): s is NonNullable<typeof s> => Boolean(s));
  const sorotanData = sorotan.length ? sorotan : statistik.slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-brand-950">
        <Img src={site.heroGambar} alt="" className="absolute inset-0 -z-10 h-full w-full opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/95 via-brand-900/75 to-brand-900/20" aria-hidden="true" />
        <div className="container-desa py-20 sm:py-28 lg:py-32">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-50 ring-1 ring-white/20 backdrop-blur">
            <Icon name="pin" className="h-3.5 w-3.5" />
            Kec. {site.kecamatan}, Kab. {site.kabupaten}, {site.provinsi}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {site.heroJudul}
          </h1>
          {site.heroDeskripsi ? <p className="mt-5 max-w-2xl text-lg text-brand-50/90">{site.heroDeskripsi}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/profil" className="btn bg-sun-400 px-5 py-3 text-stone-900 hover:bg-sun-500">
              Kenali Desa Kami <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link href="/informasi" className="btn bg-white/10 px-5 py-3 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/20">
              <Icon name="chart" className="h-4 w-4" /> Lihat Data Desa
            </Link>
          </div>
        </div>
      </section>

      {/* Angka kunci */}
      {site.angkaKunci.length ? (
        <section aria-label="Angka kunci desa" className="container-desa relative z-10 -mt-10">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {site.angkaKunci.map((a, i) => (
              <li key={i} className="card p-5">
                <p className="text-2xl font-extrabold text-brand-800 sm:text-3xl">{a.nilai}</p>
                <p className="mt-1 text-sm text-stone-600">{a.label}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Sambutan */}
      {site.sambutan ? (
        <section className="container-desa mt-16 grid items-center gap-8 md:grid-cols-[220px_1fr]">
          <div className="mx-auto w-44 md:w-full">
            {site.fotoKepalaDesa ? (
              <img src={site.fotoKepalaDesa} alt={`Foto ${site.namaKepalaDesa}`} className="aspect-square w-full rounded-3xl object-cover shadow-md" />
            ) : (
              <div className="grid aspect-square w-full place-items-center rounded-3xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700" aria-hidden="true">
                <Icon name="user" className="h-20 w-20" />
              </div>
            )}
          </div>
          <div>
            <p className="eyebrow">Sambutan Kepala Desa</p>
            <blockquote className="mt-3 text-lg leading-relaxed text-stone-700 sm:text-xl">“{site.sambutan}”</blockquote>
            {site.namaKepalaDesa ? (
              <p className="mt-4 font-bold text-stone-900">
                {site.namaKepalaDesa}
                <span className="block text-sm font-normal text-stone-500">Kepala Desa {site.namaDesa}</span>
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Akses cepat */}
      <section className="container-desa mt-20" aria-labelledby="akses-cepat">
        <h2 id="akses-cepat" className="sr-only">Akses cepat</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {AKSES.map((a) => (
            <li key={a.href}>
              <Link href={a.href} className="card flex h-full flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-300">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon name={a.icon} />
                </span>
                <span>
                  <span className="block font-bold text-stone-900">{a.label}</span>
                  <span className="block text-xs text-stone-500">{a.desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Sorotan data */}
      {sorotanData.length ? (
        <section className="container-desa mt-20">
          <SectionHeading eyebrow="Data Desa" title="Sekilas Data Marga Mulya" description="Data dikelola langsung oleh pemerintah desa melalui CMS dan diperbarui secara berkala." action={{ href: "/informasi", label: "Lihat semua data" }} />
          <div className="grid gap-5 lg:grid-cols-2">
            {sorotanData.map((s) => (
              <article key={s.id} className="card p-6">
                <h3 className="font-bold text-stone-900">{s.judul}</h3>
                {s.tahun ? <p className="text-xs text-stone-500">Tahun {s.tahun}</p> : null}
                <div className="mt-5">
                  <StatView stat={s} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Potensi */}
      {unggulan.length ? (
        <section className="mt-20 bg-brand-50/60 py-16">
          <div className="container-desa">
            <SectionHeading eyebrow="Potensi Desa" title="Wisata, Budaya & Produk Unggulan" description="Dukung ekonomi warga dengan mengunjungi destinasi dan membeli produk lokal Marga Mulya." action={{ href: "/potensi", label: "Semua potensi" }} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {unggulan.map((p) => (
                <PotensiCard key={p.id} item={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Berita */}
      {berita.length ? (
        <section className="container-desa mt-20">
          <SectionHeading eyebrow="Kabar Desa" title="Berita & Kegiatan Terbaru" action={{ href: "/berita", label: "Semua berita" }} />
          <div className="grid gap-5 md:grid-cols-3">
            {berita.map((b) => (
              <BeritaCard key={b.id} item={b} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Galeri */}
      {galeri.length ? (
        <section className="container-desa mt-20">
          <SectionHeading eyebrow="Galeri" title="Potret Desa" action={{ href: "/galeri", label: "Buka galeri" }} />
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {galeri.slice(0, 6).map((g, i) => (
              <li key={g.id} className={i === 0 ? "col-span-2 row-span-2 md:col-span-1" : ""}>
                <Link href="/galeri" className="group relative block h-full overflow-hidden rounded-2xl">
                  <Img src={g.gambar} alt={g.judul} className="aspect-[4/3] h-full w-full transition duration-300 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-semibold text-white">{g.judul}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Peta & kontak */}
      <section className="container-desa mt-20 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <SectionHeading eyebrow="Peta Desa" title="Lokasi Penting di Marga Mulya" />
          <VillageMap center={[site.lat, site.lng]} lokasi={lokasi} height="380px" />
        </div>
        <aside className="card flex flex-col justify-between bg-gradient-to-br from-brand-800 to-brand-600 p-7 text-white ring-0">
          <div>
            <Icon name="chat" className="h-9 w-9 text-brand-200" />
            <h2 className="mt-4 text-2xl font-extrabold">Punya pertanyaan atau aspirasi?</h2>
            <p className="mt-2 text-brand-50/90">Sampaikan langsung kepada pemerintah desa melalui formulir kontak, atau tanyakan kepada asisten AI <strong>Tanya Desa</strong> di pojok kanan bawah.</p>
          </div>
          <Link href="/kontak" className="btn mt-6 bg-white text-brand-800 hover:bg-brand-50">
            Hubungi Kantor Desa <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </aside>
      </section>
    </>
  );
}
