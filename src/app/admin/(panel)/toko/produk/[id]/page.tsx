import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hapusProdukPenjual, saveProdukPenjual } from "@/app/admin/toko/actions";
import { CmsForm } from "@/components/admin/CmsForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requirePenjual } from "@/lib/auth";
import { statusProdukPenjual } from "@/lib/categories";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { PRODUK_PENJUAL_FIELDS } from "@/lib/resources";

export const metadata: Metadata = { title: "Ubah produk" };

export default async function UbahProdukPenjualPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requirePenjual();
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const rows = await db()<Record<string, unknown>[]>`select * from produk where id = ${id} and penjual_id = ${s.pid}`;
  const row = rows[0];
  if (!row) notFound();

  const status = String(row.status_tinjau);
  const st = statusProdukPenjual({ status_tinjau: status, tersedia: Boolean(row.tersedia), stok: row.stok === null ? null : Number(row.stok) });
  const initial: Record<string, unknown> = {};
  for (const f of PRODUK_PENJUAL_FIELDS) initial[f.name] = row[f.name];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/toko/produk" className="text-sm font-bold text-brand-700 hover:underline">← Produk saya</Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{String(row.nama)}</h1>
          <p className="mt-1 text-sm text-muted">
            Status: <span className="font-bold text-ink">{st.label}</span>
            {status === "menunggu" && row.diajukan_at ? ` · diajukan ${formatDateTime(row.diajukan_at as Date)}` : ""}
          </p>
        </div>
        {status === "disetujui" ? (
          <Link href={`/pasar?produk=${row.slug}`} target="_blank" className="link text-sm">Lihat di Pasar Desa</Link>
        ) : null}
      </div>

      {status === "ditolak" ? (
        <div role="alert" className="mt-5 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm">
          <p className="font-bold text-red-800">Admin desa meminta perbaikan</p>
          {row.catatan_tinjau ? <p className="mt-1 text-red-900">{String(row.catatan_tinjau)}</p> : null}
          <p className="mt-1 text-red-800">Perbaiki isian di bawah, lalu simpan untuk mengajukan ulang.</p>
        </div>
      ) : null}

      <p className="mt-5 mb-6 text-sm leading-relaxed text-muted">
        Harga, stok, kemasan, dan status jual langsung berlaku.
        {status === "disetujui" ? " Mengubah nama, foto, kategori, atau deskripsi akan membuat produk ditinjau ulang dan sementara tidak tampil." : ""}
      </p>

      <CmsForm
        action={saveProdukPenjual.bind(null, id)}
        groups={[{ fields: PRODUK_PENJUAL_FIELDS }]}
        initial={initial}
        submitLabel={status === "ditolak" ? "Simpan dan ajukan ulang" : "Simpan perubahan"}
        cancelHref="/admin/toko/produk"
      />

      <form action={hapusProdukPenjual.bind(null, id)} className="mt-8 border-t border-line pt-5">
        <ConfirmButton message="Hapus produk ini dari toko Anda? Riwayat pesanan tetap tersimpan." className="text-sm font-bold text-red-700 hover:underline">
          Hapus produk ini
        </ConfirmButton>
        <p className="mt-1 text-xs text-muted">Ingin berhenti menjual sementara? Cukup hilangkan centang “Tampilkan dan jual”.</p>
      </form>
    </div>
  );
}
