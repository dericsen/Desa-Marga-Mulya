import type { Metadata } from "next";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { EmptyState, PageHeader } from "@/components/site/ui";
import { getGaleri } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Galeri" };

export default async function GaleriPage() {
  const galeri = await getGaleri();
  const items = galeri.map((g) => ({
    id: g.id,
    judul: g.judul,
    deskripsi: g.deskripsi,
    gambar: g.gambar,
    album: g.album,
    tanggalText: formatDate(g.tanggal),
  }));

  return (
    <>
      <PageHeader eyebrow="Galeri" title="Galeri Desa" description="Dokumentasi alam, kegiatan warga, budaya, dan potensi Desa Marga Mulya." />
      <div className="container-desa mt-10">{items.length ? <GalleryGrid items={items} /> : <EmptyState text="Belum ada foto di galeri." />}</div>
    </>
  );
}
