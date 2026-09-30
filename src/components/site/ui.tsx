import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Contours } from "./Contours";
import { BERITA_TYPES, POTENSI_TYPES } from "@/lib/categories";
import { excerpt, formatDate, toDateInput, waLink } from "@/lib/format";
import type { Berita, Potensi } from "@/lib/types";

/** Kepala halaman dalam: panel gelap membulat dengan motif kontur sawah. */
export function PageHeader({ title, description, crumb }: { title: string; description?: string; crumb?: string; index?: string }) {
  return (
    <header className="container-desa pt-2">
      <div className="panel-dark px-6 pt-7 pb-12 sm:px-12 sm:pt-9 sm:pb-16">
        <Contours className="right-[-10%] bottom-[-20%] h-[140%] w-[80%] text-sun-400/40" />
        <nav aria-label="Remah roti" className="text-sm text-white/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white">Beranda</Link>
            </li>
            <li aria-hidden="true" className="text-white/30">›</li>
            <li aria-current="page" className="text-white">{crumb ?? title}</li>
          </ol>
        </nav>
        <h1 className="font-display mt-10 max-w-[18ch] text-[2.5rem] leading-[1.02] font-semibold sm:text-[3.5rem]">{title}</h1>
        {description ? <p className="mt-5 max-w-[58ch] text-[1.0625rem] leading-relaxed text-white/70">{description}</p> : null}
      </div>
    </header>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  id,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  id?: string;
  eyebrow?: string;
  /** @deprecated nomor bagian tidak lagi ditampilkan */
  index?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-[60ch]">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 id={id} className="section-title">{title}</h2>
        {description ? <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="btn-light group shrink-0">
          {action.label}
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
    <article className="group relative grid gap-4 rounded-3xl p-3 transition-colors hover:bg-white sm:grid-cols-[14rem_1fr] sm:gap-6">
      <Img src={item.gambar} alt="" className="aspect-[3/2] w-full rounded-2xl" />
      <div className="sm:py-2">
        <p className="meta">
          <span className="font-medium text-brand-600">{kategoriBerita(item.kategori)}</span>
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
        <Img src={item.gambar} alt={item.nama} className="aspect-[4/3] w-full rounded-3xl" />
        {item.unggulan ? (
          <span className="absolute top-3 left-3 rounded-full bg-sun-400 px-2.5 py-1 text-xs font-medium text-ink">Unggulan</span>
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
    <div className="rounded-3xl bg-white px-6 py-12 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {text ? <p className="mx-auto mt-1 max-w-[48ch] text-sm text-muted">{text}</p> : null}
      {action ? (
        <Link href={action.href} className="link mt-3 inline-block text-sm">{action.label}</Link>
      ) : null}
    </div>
  );
}

/** Filter kategori berbentuk kapsul yang dapat digulir di HP. */
export function FilterTabs({ items, label }: { items: { href: string; label: string; active: boolean }[]; label: string }) {
  return (
    <nav aria-label={label} className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={`inline-block rounded-full px-4 py-2 text-sm transition-colors ${
                it.active ? "bg-ink font-medium text-white" : "bg-white text-muted shadow-[0_0_0_1px_rgb(11_19_16/0.06)] hover:text-ink"
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
