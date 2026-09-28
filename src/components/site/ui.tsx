import Link from "next/link";
import { Icon } from "@/components/Icon";
import { BERITA_TYPES, POTENSI_TYPES } from "@/lib/categories";
import { excerpt, formatDate, toDateInput, waLink } from "@/lib/format";
import type { Berita, Potensi } from "@/lib/types";

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 text-white">
      <svg className="absolute right-0 bottom-0 h-full w-2/3 opacity-15" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 150 Q100 110 200 150 T400 150 V200 H0Z" fill="#fff" />
        <path d="M0 170 Q100 135 200 170 T400 170 V200 H0Z" fill="#fff" />
      </svg>
      <div className="container-desa relative py-14 sm:py-16">
        {eyebrow ? <p className="text-xs font-bold tracking-[0.18em] text-brand-200 uppercase">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-brand-50/90">{description}</p> : null}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="section-title mt-1">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-stone-600">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900">
          {action.label} <Icon name="arrow" className="h-4 w-4" />
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
    <article className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <Img src={item.gambar} alt="" className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 font-bold text-brand-700">{kategori}</span>
          <time dateTime={toDateInput(item.tanggal)} className="text-stone-500">{formatDate(item.tanggal)}</time>
        </div>
        <h3 className="mt-3 text-lg leading-snug font-bold text-stone-900">
          <Link href={`/berita/${item.slug}`} className="after:absolute after:inset-0 focus:outline-none group-hover:text-brand-800">
            {item.judul}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-stone-600">{item.ringkasan || excerpt(item.konten)}</p>
      </div>
    </article>
  );
}

export function PotensiCard({ item }: { item: Potensi }) {
  const tipe = POTENSI_TYPES.find((t) => t.key === item.tipe);
  const wa = waLink(item.kontak, `Halo, saya tertarik dengan ${item.nama} dari website Desa Marga Mulya.`);
  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="relative">
        <Img src={item.gambar} alt={item.nama} className="aspect-[4/3] w-full" />
        {item.unggulan ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-sun-400 px-2.5 py-1 text-xs font-bold text-stone-900">
            <Icon name="star" className="h-3.5 w-3.5" /> Unggulan
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {tipe ? <p className="eyebrow">{tipe.label}</p> : null}
        <h3 className="mt-1 text-lg font-bold text-stone-900">{item.nama}</h3>
        {item.deskripsi ? <p className="mt-2 flex-1 text-sm text-stone-600">{item.deskripsi}</p> : <div className="flex-1" />}
        <dl className="mt-4 space-y-1.5 text-sm">
          {item.harga ? (
            <div className="flex gap-2">
              <dt className="sr-only">Harga</dt>
              <dd className="font-bold text-brand-800">{item.harga}</dd>
            </div>
          ) : null}
          {item.alamat ? (
            <div className="flex gap-2 text-stone-500">
              <dt><Icon name="pin" className="mt-0.5 h-4 w-4" /><span className="sr-only">Lokasi</span></dt>
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
