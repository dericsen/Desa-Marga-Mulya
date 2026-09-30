import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { Img, kategoriBerita } from "@/components/site/ui";
import { getBerita, getBeritaBySlug } from "@/lib/data";
import { excerpt, formatDate, toDateInput } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getBeritaBySlug(slug);
  if (!item) return { title: "Berita tidak ditemukan" };
  return { title: item.judul, description: item.ringkasan || excerpt(item.konten) };
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getBeritaBySlug(slug);
  if (!item) notFound();
  const lainnya = (await getBerita({ limit: 4 })).filter((b) => b.id !== item.id).slice(0, 3);

  return (
    <article>
      <header className="container-desa max-w-[48rem] pt-8 sm:pt-10">
        <nav aria-label="Remah roti" className="meta">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-ink hover:underline">Beranda</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/berita" className="hover:text-ink hover:underline">Berita & Kegiatan</Link></li>
          </ol>
        </nav>
        <p className="meta mt-8">
          <span className="font-semibold text-brand-700">{kategoriBerita(item.kategori)}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={toDateInput(item.tanggal)}>{formatDate(item.tanggal, true)}</time>
        </p>
        <h1 className="font-display mt-3 text-[2.125rem] leading-[1.15] font-semibold text-ink sm:text-[2.625rem]">{item.judul}</h1>
        {item.ringkasan ? <p className="mt-5 text-xl leading-relaxed text-muted">{item.ringkasan}</p> : null}
      </header>

      {item.gambar ? (
        <div className="container-desa mt-10 max-w-[60rem]">
          <Img src={item.gambar} alt={item.judul} className="aspect-[16/9] w-full rounded-[1.75rem]" />
        </div>
      ) : null}

      <div className="container-desa mt-10 max-w-[48rem]">
        <Markdown text={item.konten} />
        <p className="mt-12 rounded-2xl bg-white p-5 text-sm text-muted">
          Ada koreksi atau pertanyaan tentang tulisan ini? <Link href="/kontak" className="link">Hubungi pemerintah desa</Link>.
        </p>
      </div>

      {lainnya.length ? (
        <section className="container-desa mt-20 max-w-[60rem]" aria-labelledby="berita-lain">
          <h2 id="berita-lain" className="font-display pb-3 text-xl font-semibold text-ink">Tulisan lainnya</h2>
          <ul className="space-y-2">
            {lainnya.map((b) => (
              <li key={b.id} className="card-hover group relative p-5">
                <p className="meta text-xs">{formatDate(b.tanggal)} · {kategoriBerita(b.kategori)}</p>
                <Link href={`/berita/${b.slug}`} className="mt-1 block font-semibold text-ink after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
                  {b.judul}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
