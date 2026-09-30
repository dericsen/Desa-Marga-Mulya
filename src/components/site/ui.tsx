import Link from "next/link";
import { Icon } from "@/components/Icon";
import { BERITA_TYPES, POTENSI_TYPES } from "@/lib/categories";
import { excerpt, formatDate, toDateInput, waLink } from "@/lib/format";
import type { Berita, Potensi } from "@/lib/types";

/** Kepala halaman dalam: bidang gelap bergrid, remah roti mono, judul besar. */
export function PageHeader({ title, description, crumb, index }: { title: string; description?: string; crumb?: string; index?: string }) {
  return (
    <header className="band-dark">
      <div className="container-desa pt-8 pb-12 sm:pt-10 sm:pb-16">
        <nav aria-label="Remah roti" className="font-mono text-[0.75rem] text-white/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white">Beranda</Link>
            </li>
            <li aria-hidden="true" className="text-white/30">/</li>
            <li aria-current="page" className="text-white">{crumb ?? title}</li>
          </ol>
        </nav>
        {index ? <p className="mt-10 font-mono text-[0.75rem] text-sun-400">{index}</p> : <div className="mt-10" />}
        <h1 className="font-display mt-3 max-w-[18ch] text-[2.5rem] leading-[1] font-semibold sm:text-[3.5rem]">{title}</h1>
        {description ? <p className="mt-5 max-w-[60ch] text-[1.0625rem] leading-relaxed text-white/70">{description}</p> : null}
      </div>
    </header>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  id,
  index,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  id?: string;
  /** Nomor bagian, mis. "02" — memberi ritme dan orientasi di halaman panjang. */
  index?: string;
}) {
  return (
    <div className="mb-10 grid gap-4 border-t border-ink pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <div className="max-w-[60ch]">
        {index ? <p className="mb-4 font-mono text-[0.75rem] text-muted">{index}</p> : null}
        <h2 id={id} className="section-title">{title}</h2>
        {description ? <p className="mt-3 leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-ink">
          <span className="border-b border-ink/30 pb-0.5 group-hover:border-ink">{action.label}</span>
          <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function Img({ src, alt, className = "" }: { src: string | null | undefined; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`grid place-items-center bg-line/60 text-muted ${className}`} role="img" aria-label={alt || "Belum ada gambar"}>
        <span className="text-xs">Belum ada gambar</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`object-cover ${className}`} />;
}

export function kategoriBerita(key: string) {
  return BERITA_TYPES.find((b) => b.key === key)?.label ?? key;
}

/** Baris berita untuk daftar: gambar kecil di kiri, teks di kanan. */
export function BeritaRow({ item }: { item: Berita }) {
  return (
    <article className="group relative grid gap-4 py-6 sm:grid-cols-[13rem_1fr] sm:gap-6">
      <Img src={item.gambar} alt="" className="aspect-[3/2] w-full rounded-md" />
      <div>
        <p className="meta">
          <span className="text-ink">{kategoriBerita(item.kategori).toUpperCase()}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={toDateInput(item.tanggal)}>{formatDate(item.tanggal)}</time>
        </p>
        <h3 className="font-display mt-1.5 text-[1.3125rem] leading-snug font-semibold text-ink">
          <Link href={`/berita/${item.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
            {item.judul}
          </Link>
        </h3>
        <p className="mt-2 max-w-[65ch] leading-relaxed text-muted">{item.ringkasan || excerpt(item.konten)}</p>
      </div>
    </article>
  );
}

/** Kartu potensi tanpa bingkai: gambar, lalu teks. Tombol WhatsApp hanya bila ada kontak. */
export function PotensiCard({ item, showType = false }: { item: Potensi; showType?: boolean }) {
  const tipe = POTENSI_TYPES.find((t) => t.key === item.tipe);
  const wa = waLink(item.kontak, `Halo, saya melihat ${item.nama} di website Desa Marga Mulya dan ingin memesan.`);
  return (
    <article className="flex flex-col">
      <div className="relative">
        <Img src={item.gambar} alt={item.nama} className="aspect-[4/3] w-full rounded-md" />
        {item.unggulan ? (
          <span className="absolute top-2.5 left-2.5 rounded-sm bg-sun-400 px-1.5 py-0.5 font-mono text-[0.6875rem] font-medium text-ink uppercase">Unggulan</span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        {showType && tipe ? <p className="eyebrow mb-1">{tipe.label}</p> : null}
        <h3 className="text-lg leading-snug font-semibold text-ink">{item.nama}</h3>
        {item.deskripsi ? <p className="mt-1.5 line-clamp-3 leading-relaxed text-muted">{item.deskripsi}</p> : null}
        <dl className="mt-3 space-y-1 text-sm">
          {item.harga ? (
            <div className="flex gap-2">
              <dt className="sr-only">Harga</dt>
              <dd className="font-semibold text-ink tabular-nums">{item.harga}</dd>
            </div>
          ) : null}
          {item.alamat ? (
            <div className="flex gap-2 text-muted">
              <dt className="sr-only">Lokasi</dt>
              <dd>{item.alamat}</dd>
            </div>
          ) : null}
        </dl>
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-light mt-4 self-start">
            <Icon name="whatsapp" className="h-4 w-4 text-[#1f8a4c]" /> Pesan lewat WhatsApp
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: { href: string; label: string } }) {
  return (
    <div className="rounded-md border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {text ? <p className="mx-auto mt-1 max-w-[48ch] text-sm text-muted">{text}</p> : null}
      {action ? (
        <Link href={action.href} className="link mt-3 inline-block text-sm">{action.label}</Link>
      ) : null}
    </div>
  );
}

/** Tab bergaya garis bawah untuk filter kategori (berbasis tautan). */
export function FilterTabs({ items, label }: { items: { href: string; label: string; active: boolean }[]; label: string }) {
  return (
    <nav aria-label={label} className="-mx-5 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-6">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={`-mb-px inline-block border-b-2 py-3 text-sm font-semibold transition-colors ${
                it.active ? "border-ink text-ink" : "border-transparent text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
