import Link from "next/link";
import { deleteResource, setPesananStatus } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { StatusForm } from "@/components/admin/StatusForm";
import { Icon } from "@/components/Icon";
import { PENGIRIMAN } from "@/lib/categories";
import { formatDateTime, formatRupiah, waLink } from "@/lib/format";
import type { PesananItem } from "@/lib/types";

export function PesananDetail({ row, id }: { row: Record<string, unknown>; id: number }) {
  const items = (Array.isArray(row.items) ? row.items : []) as PesananItem[];
  const pengiriman = PENGIRIMAN.find((p) => p.key === row.pengiriman)?.label ?? String(row.pengiriman);
  const wa = waLink(String(row.telepon || ""), `Halo ${row.nama_pembeli}, pesanan Anda ${row.kode} di Pasar Desa Marga Mulya: `);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/pesanan" className="text-sm font-semibold text-brand-700 hover:underline">← Pesanan</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink tabular-nums">Pesanan {String(row.kode)}</h1>
          <p className="mt-1 text-sm text-muted">Masuk {formatDateTime(row.created_at as Date)} · untuk {String(row.penjual_nama)}</p>
        </div>
        <StatusForm action={setPesananStatus.bind(null, id)} current={String(row.status)} />
      </div>

      <section className="card mt-6 p-5">
        <h2 className="text-sm font-semibold text-ink">Pembeli</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Nama</dt><dd className="font-semibold text-ink">{String(row.nama_pembeli)}</dd></div>
          <div><dt className="text-muted">Telepon</dt><dd className="font-semibold text-ink tabular-nums">{String(row.telepon)}</dd></div>
          <div><dt className="text-muted">Pengambilan</dt><dd className="text-ink">{pengiriman}</dd></div>
          {row.alamat ? <div><dt className="text-muted">Alamat</dt><dd className="text-ink">{String(row.alamat)}</dd></div> : null}
          {row.catatan ? <div className="sm:col-span-2"><dt className="text-muted">Catatan</dt><dd className="whitespace-pre-line text-ink">{String(row.catatan)}</dd></div> : null}
        </dl>
      </section>

      <section className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <caption className="sr-only">Rincian barang</caption>
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold tracking-[0.06em] text-muted uppercase">
              <th scope="col" className="px-5 py-3">Produk</th>
              <th scope="col" className="px-5 py-3 text-right">Harga</th>
              <th scope="col" className="px-5 py-3 text-right">Jumlah</th>
              <th scope="col" className="px-5 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <td className="px-5 py-3 text-ink">
                  {it.nama}
                  {it.satuan ? <span className="block text-xs text-muted">{it.satuan}</span> : null}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">{formatRupiah(it.harga)}</td>
                <td className="px-5 py-3 text-right tabular-nums">{it.qty}</td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatRupiah(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-ink">
              <th scope="row" colSpan={3} className="px-5 py-3 text-right font-semibold">Total</th>
              <td className="px-5 py-3 text-right text-base font-semibold tabular-nums">{formatRupiah(row.total as number)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <div className="mt-5 flex flex-wrap gap-2">
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-light">
            <Icon name="whatsapp" className="h-4 w-4 text-[#1f8a4c]" /> Hubungi pembeli
          </a>
        ) : null}
        <form action={deleteResource.bind(null, "pesanan", id)}>
          <ConfirmButton message="Hapus pesanan ini? Stok tidak dikembalikan otomatis — batalkan dulu bila perlu." className="btn-light text-red-700">
            <Icon name="trash" className="h-4 w-4" /> Hapus
          </ConfirmButton>
        </form>
      </div>
      <p className="mt-4 text-xs text-muted">Membatalkan pesanan akan mengembalikan stok produk secara otomatis.</p>
    </div>
  );
}
