import Link from "next/link";
import { Icon } from "@/components/Icon";
import { StatView } from "@/components/charts";
import { Section } from "@/components/site/Section";
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

  const unggulan = potensi.filter((p) => p.unggulan).slice(0, 3);
  const utama = statistik.find((s) => /mata pencaharian/i.test(s.judul)) ?? statistik[0];
  const pendukung = statistik.filter((s) => s.id !== utama?.id && (s.tipe_grafik === "donut" || s.tipe_grafik === "tabel")).slice(0, 3);

  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative isolate overflow-hidden bg-brand-950">
        <Img src={site.heroGambar} alt="" className="absolute inset-0 -z-10 h-full w-full opacity-80" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-brand-950 via-brand-950/85 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-stone-50 to-transparent" aria-hidden="true" />
        <div className="container-desa pt-24 pb-32 sm:pt-28 sm:pb-40 lg:pt-32">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-50 ring-1 ring-white/20 backdrop-blur">
            <Icon name="pin" className="h-3.5 w-3.5" />
            Kec. {site.kecamatan}, Kab. {site.kabupaten}, {site.provinsi}
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {site.heroJudul}
          </h1>
          {site.heroDeskripsi ? <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-50/90">{site.heroDeskripsi}</p> : null}
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/profil" className="btn bg-sun-400 px-5 py-3 text-stone-900 shadow-lg shadow-sun-500/20 hover:bg-sun-500">
              Kenali Desa Kami <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link href="/informasi" className="btn bg-white/10 px-5 py-3 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/20">
              <Icon name="chart" className="h-4 w-4" /> Lihat Data Desa
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Angka kunci (menimpa hero) ===== */}
      {site.angkaKunci.length ? (
        <div className="container-desa relative z-10 -mt-24 sm:-mt-28">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-stone-200/70 shadow-xl shadow-brand-950/10 ring-1 ring-stone-200/70 lg:grid-cols-4">
            {site.angkaKunci.map((a, i) => (
              <li key={i} className="bg-white p-6">
                <p className="text-3xl font-extrabold tracking-tight text-brand-800 sm:text-4xl">{a.nilai}</p>
                <p className="mt-1.5 text-sm font-medium text-stone-500">{a.label}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* ===== Sambutan + akses cepat ===== */}
      <Section size="band-lg">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          {site.sambutan ? (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="mx-auto w-36 shrink-0 sm:mx-0">
                {site.fotoKepalaDesa ? (
                  <img src={site.fotoKepalaDesa} alt={`Foto ${site.namaKepalaDesa}`} className="aspect-[4/5] w-full rounded-2xl object-cover shadow-md ring-1 ring-stone-200" />
                ) : (
                  <div className="grid aspect-[4/5] w-full place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-600 ring-1 ring-brand-200" aria-hidden="true">
                    <Icon name="user" className="h-16 w-16" />
                  </div>
                )}
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
                  <span className="h-px w-6 bg-brand-400" aria-hidden="true" /> Sambutan Kepala Desa
                </p>
                <blockquote className="mt-4 text-lg leading-relaxed text-stone-700">
                  <span className="mr-1 text-3xl leading-none font-serif text-brand-300 align-top">“</span>
                  {site.sambutan}”
                </blockquote>
                {site.namaKepalaDesa ? (
                  <p className="mt-4 font-bold text-stone-900">
                    {site.namaKepalaDesa}
                    <span className="block text-sm font-normal text-stone-500">Kepala Desa {site.namaDesa}</span>
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <nav aria-label="Akses cepat" className="lg:pt-2">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
              <span className="h-px w-6 bg-brand-400" aria-hidden="true" /> Jelajahi Desa
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AKSES.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="card-hover flex h-full flex-col gap-3 p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon name={a.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-stone-900">{a.label}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-stone-500">{a.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Section>

      {/* ===== Sorotan data: satu cerita utama + pendukung ===== */}
      {utama ? (
        <Section tone="surface">
          <SectionHeading
            eyebrow="Data Desa"
            title="Sekilas Data Marga Mulya"
            description="Seluruh data dikelola langsung oleh pemerintah desa melalui CMS dan diperbarui berkala — bukan angka statis."
            action={{ href: "/informasi", label: "Lihat semua data" }}
          />
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <article className="rounded-2xl bg-gradient-to-br from-brand-800 to-brand-600 p-7 text-white shadow-lg shadow-brand-900/20 sm:p-8">
              <p className="text-xs font-bold tracking-widest text-brand-200 uppercase">{utama.tahun ? `Tahun ${utama.tahun}` : "Sorotan"}</p>
              <h3 className="mt-1 text-xl font-bold">{utama.judul}</h3>
              <div className="mt-6 rounded-xl bg-white/95 p-5 text-stone-800">
                <StatView stat={utama} />
              </div>
              {utama.deskripsi ? <p className="mt-4 text-sm text-brand-50/85">{utama.deskripsi}</p> : null}
            </article>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {pendukung.map((s) => (
                <article key={s.id} className="card flex flex-col p-5">
                  <h3 className="text-sm font-bold text-stone-900">{s.judul}</h3>
                  <div className="mt-3 flex-1">
                    <StatView stat={s} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {/* ===== Potensi ===== */}
      {unggulan.length ? (
        <Section tone="brand-soft">
          <SectionHeading
            eyebrow="Potensi Desa"
            title="Wisata, Budaya & Produk Unggulan"
            description="Dukung ekonomi warga dengan mengunjungi destinasi dan membeli produk lokal Marga Mulya."
            action={{ href: "/potensi", label: "Semua potensi" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {unggulan.map((p) => (
              <PotensiCard key={p.id} item={p} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ===== Berita ===== */}
      {berita.length ? (
        <Section>
          <SectionHeading eyebrow="Kabar Desa" title="Berita & Kegiatan Terbaru" action={{ href: "/berita", label: "Semua berita" }} />
          <div className="grid gap-6 md:grid-cols-3">
            {berita.map((b) => (
              <BeritaCard key={b.id} item={b} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ===== Galeri ===== */}
      {galeri.length ? (
        <Section tone="surface">
          <SectionHeading eyebrow="Galeri" title="Potret Desa" action={{ href: "/galeri", label: "Buka galeri" }} />
          {/* Grid mosaik: tile utama menempati 2×2, tinggi baris tetap agar rapi di semua ukuran */}
          <ul className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[180px] sm:gap-4 md:grid-cols-4">
            {galeri.slice(0, 6).map((g, i) => (
              <li key={g.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                <Link href="/galeri" className="group relative block h-full w-full overflow-hidden rounded-2xl ring-1 ring-stone-200/70">
                  <Img src={g.gambar} alt={g.judul} className="absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold text-white">{g.judul}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* ===== Peta & kontak ===== */}
      <Section size="band-lg">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <SectionHeading eyebrow="Peta Desa" title="Lokasi Penting di Marga Mulya" />
            <VillageMap center={[site.lat, site.lng]} lokasi={lokasi} height="420px" />
          </div>
          <aside className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-brand-900 p-8 text-white">
            <svg className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
              <circle cx="50" cy="50" r="50" />
            </svg>
            <div className="relative">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-sun-400">
                <Icon name="chat" className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-2xl font-extrabold">Punya pertanyaan atau aspirasi?</h2>
              <p className="mt-3 text-brand-50/85">
                Sampaikan langsung kepada pemerintah desa melalui formulir kontak, atau tanyakan ke asisten AI <strong className="font-bold text-white">Tanya Desa</strong> di pojok kanan bawah.
              </p>
            </div>
            <Link href="/kontak" className="btn relative mt-8 bg-white text-brand-800 hover:bg-brand-50">
              Hubungi Kantor Desa <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </Section>
    </>
  );
}
