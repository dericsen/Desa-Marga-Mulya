import type { Metadata } from "next";
import Link from "next/link";
import { QuickStockRow } from "@/components/admin/QuickStockRow";
import { requirePenjual } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Produk saya" };

const PESAN: Record<string, string> = {
  diajukan: "Produk baru sudah dikirim. Admin desa akan meninjaunya sebelum tampil di Pasar Desa.",
  "ditinjau-ulang": "Perubahan disimpan dan dikirim untuk ditinjau ulang. Sementara itu produk tidak tampil di Pasar Desa.",
  diperbarui: "Perubahan tersimpan dan langsung berlaku.",
  dihapus: "Produk dihapus.",
};

type Row = {
  id: number;
  nama: string;
  satuan: string | null;
  harga: number;
  stok: number | null;
  tersedia: boolean;
  gambar: string | null;
  status_tinjau: string;
  catatan_tinjau: string | null;
};

export default async function ProdukSayaPage({ searchParams }: { searchParams: Promise<{ pesan?: string }> }) {
  const s = await requirePenjual();
  const { pesan } = await searchParams;
  const rows = await db()<Row[]>`
    select id, nama, satuan, harga, stok, tersedia, gambar, status_tinjau, catatan_tinjau
    from produk where penjual_id = ${s.pid}
    order by case status_tinjau when 'ditolak' then 0 when 'menunggu' then 1 else 2 end, urutan, id`;
  const produk = rows.map((r) => ({ ...r, harga: Number(r.harga), stok: r.stok === null ? null : Number(r.stok) }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Produk saya</h1>
          <p className="mt-1 text-sm text-muted">Ubah harga dan stok langsung di daftar ini. Perubahan harga dan stok berlaku seketika.</p>
        </div>
        <Link href="/admin/toko/produk/baru" className="btn-primary">Tambah produk</Link>
      </div>

      {pesan && PESAN[pesan] ? (
        <p role="status" className="mt-5 border-l-2 border-brand-600 bg-white py-2.5 pr-3 pl-3 text-sm text-ink">{PESAN[pesan]}</p>
      ) : null}

      {produk.length ? (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {produk.map((p) => (
            <QuickStockRow key={p.id} p={p} />
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-md border border-dashed border-line-strong px-6 py-10 text-center">
          <p className="font-semibold text-ink">Belum ada produk</p>
          <p className="mx-auto mt-1 max-w-[42ch] text-sm text-muted">Tambahkan produk pertama Anda. Siapkan foto, harga, dan kemasannya.</p>
          <Link href="/admin/toko/produk/baru" className="btn-primary mt-4">Tambah produk</Link>
        </div>
      )}
    </div>
  );
}
