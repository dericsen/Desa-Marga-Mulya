import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Markdown } from "@/components/Markdown";
import { BeritaCard, Img } from "@/components/site/ui";
import { BERITA_TYPES } from "@/lib/categories";
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
  const kategori = BERITA_TYPES.find((b) => b.key === item.kategori)?.label ?? item.kategori;

  return (
    <article>
      <header className="bg-brand-900 text-white">
        <div className="container-desa max-w-4xl py-12">
          <Link href="/berita" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-200 hover:text-white">
            <Icon name="arrow" className="h-4 w-4 rotate-180" /> Kembali ke Berita
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-white/15 px-3 py-1 font-bold">{kategori}</span>
            <time dateTime={toDateInput(item.tanggal)} className="text-brand-100">{formatDate(item.tanggal, true)}</time>
          </div>
          <h1 className="mt-4 text-3xl leading-tight font-extrabold sm:text-4xl">{item.judul}</h1>
          {item.ringkasan ? <p className="mt-4 text-lg text-brand-50/90">{item.ringkasan}</p> : null}
        </div>
      </header>

      <div className="container-desa max-w-4xl">
        {item.gambar ? <Img src={item.gambar} alt={item.judul} className="mt-8 aspect-[16/8] w-full rounded-3xl shadow-sm" /> : null}
        <Markdown text={item.konten} className="mt-8 text-lg" />
      </div>

      {lainnya.length ? (
        <section className="container-desa mt-16" aria-labelledby="berita-lain">
          <h2 id="berita-lain" className="section-title mb-6">Berita Lainnya</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {lainnya.map((b) => (
              <BeritaCard key={b.id} item={b} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
