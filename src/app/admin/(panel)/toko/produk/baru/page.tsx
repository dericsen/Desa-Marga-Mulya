import type { Metadata } from "next";
import Link from "next/link";
import { saveProdukPenjual } from "@/app/admin/toko/actions";
import { CmsForm } from "@/components/admin/CmsForm";
import { requirePenjual } from "@/lib/auth";
import { PRODUK_PENJUAL_FIELDS } from "@/lib/resources";

export const metadata: Metadata = { title: "Tambah produk" };

export default async function TambahProdukPenjualPage() {
  await requirePenjual();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/toko/produk" className="text-sm font-semibold text-brand-700 hover:underline">← Produk saya</Link>
      <h1 className="font-display mt-2 text-2xl font-semibold text-ink">Tambah produk</h1>
      <p className="mt-1 mb-6 max-w-[60ch] text-sm leading-relaxed text-muted">
        Produk baru akan ditinjau admin desa terlebih dahulu (biasanya pada hari kerja yang sama), lalu tampil di Pasar Desa.
      </p>
      <CmsForm
        action={saveProdukPenjual.bind(null, null)}
        groups={[{ fields: PRODUK_PENJUAL_FIELDS }]}
        initial={{ tersedia: true, kategori: "makanan" }}
        submitLabel="Kirim untuk ditinjau"
        cancelHref="/admin/toko/produk"
      />
    </div>
  );
}
