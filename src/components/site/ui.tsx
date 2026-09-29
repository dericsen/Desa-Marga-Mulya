import Link from "next/link";
import { Icon } from "@/components/Icon";
import { BERITA_TYPES, POTENSI_TYPES } from "@/lib/categories";
import { excerpt, formatDate, toDateInput, waLink } from "@/lib/format";
import type { Berita, Potensi } from "@/lib/types";

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-900 text-white">
      {/* Lapisan organik bertekstur, senada dengan ilustrasi beranda */}
      <svg className="absolute inset-0 -z-10 h-full w-full opacity-[0.12]" viewBox="0 0 1600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M0 300 C300 250 500 340 800 300 C1100 260 1300 340 1600 300 L1600 400 L0 400 Z" fill="#fff" />
        <path d="M0 340 C300 300 500 380 800 340 C1100 300 1300 380 1600 340 L1600 400 L0 400 Z" fill="#fff" opacity="0.6" />
      </svg>
      <div className="absolute right-[-4rem] top-[-4rem] -z-10 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" aria-hidden="true" />
      <div className="absolute left-[-6rem] bottom-[-6rem] -z-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
      <div className="container-desa relative py-16 sm:py-20">
        {eyebrow ? (
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-200 uppercase">
            <span className="h-px w-6 bg-brand-300/70" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-50/85">{description}</p> : null}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  invert?: boolean;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className={`flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase ${invert ? "text-brand-200" : "text-brand-600"}`}>
            <span className={`h-px w-6 ${invert ? "bg-brand-300/70" : "bg-brand-400"}`} aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h2 className={`mt-3 text-3xl leading-tight font-extrabold tracking-tight sm:text-[2.1rem] ${invert ? "text-white" : "text-stone-900"}`}>{title}</h2>
        {description ? <p className={`mt-3 text-base leading-relaxed ${invert ? "text-brand-50/85" : "text-stone-600"}`}>{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${
            invert ? "text-brand-50 ring-white/25 hover:bg-white/10" : "text-brand-700 ring-brand-200 hover:bg-brand-50"
          }`}
        >
          {action.label}
          <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function Img({ src, alt, className = "" }: { src: string | null | undefined; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 ${className}`} role="img" aria-label={alt}>
        <Icon name="image" className="h-8 w-8" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`object-cover ${className}`} />;
}

export function BeritaCard({ item }: { item: Berita }) {
  const kategori = BERITA_TYPES.find((b) => b.key === item.kategori)?.label ?? item.kategori;
  return (
    <article className="card-hover group relative flex flex-col overflow-hidden">
      <div className="relative overflow-hidden">
        <Img src={item.gambar} alt="" className="aspect-[16/10] w-full transition duration-500 group-hover:scale-[1.04]" />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-700 shadow-sm backdrop-blur">{kategori}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <time dateTime={toDateInput(item.tanggal)} className="text-xs font-medium text-stone-500">{formatDate(item.tanggal)}</time>
        <h3 className="mt-2 text-lg leading-snug font-bold text-stone-900">
          <Link href={`/berita/${item.slug}`} className="after:absolute after:inset-0 focus:outline-none group-hover:text-brand-800">
            {item.judul}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{item.ringkasan || excerpt(item.konten)}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
          Baca selengkapnya <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

export function PotensiCard({ item }: { item: Potensi }) {
  const tipe = POTENSI_TYPES.find((t) => t.key === item.tipe);
  const wa = waLink(item.kontak, `Halo, saya tertarik dengan ${item.nama} dari website Desa Marga Mulya.`);
  return (
    <article className="card-hover group flex flex-col overflow-hidden">
      <div className="relative overflow-hidden">
        <Img src={item.gambar} alt={item.nama} className="aspect-[5/4] w-full transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
          {tipe ? (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-700 shadow-sm backdrop-blur">{tipe.label}</span>
          ) : (
            <span />
          )}
          {item.unggulan ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-sun-400 px-2.5 py-1 text-xs font-bold text-stone-900 shadow-sm">
              <Icon name="star" className="h-3.5 w-3.5" /> Unggulan
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug font-bold text-stone-900">{item.nama}</h3>
        {item.deskripsi ? <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-600">{item.deskripsi}</p> : <div className="flex-1" />}
        <dl className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-sm">
          {item.harga ? (
            <div className="flex items-baseline gap-2">
              <dt className="text-stone-500">Harga</dt>
              <dd className="ml-auto text-right font-extrabold text-brand-800">{item.harga}</dd>
            </div>
          ) : null}
          {item.alamat ? (
            <div className="flex gap-2 text-stone-500">
              <dt><Icon name="pin" className="mt-0.5 h-4 w-4 text-brand-500" /><span className="sr-only">Lokasi</span></dt>
              <dd>{item.alamat}</dd>
            </div>
          ) : null}
        </dl>
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn mt-4 bg-[#1f9d55] text-white hover:bg-[#178246]">
            <Icon name="whatsapp" className="h-4 w-4" /> Pesan via WhatsApp
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="card p-8 text-center text-stone-500">{text}</p>;
}
