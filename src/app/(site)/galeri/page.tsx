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
      <PageHeader title="Galeri" description="Dokumentasi alam, kegiatan warga, pemerintahan, dan budaya Desa Marga Mulya. Pilih foto untuk melihat versi besarnya." />
      <div className="container-desa pt-8">
        {items.length ? <GalleryGrid items={items} /> : <EmptyState title="Galeri masih kosong" text="Foto kegiatan desa akan tampil di sini setelah diunggah oleh admin." />}
      </div>
    </>
  );
}
