import { PESANAN_STATUS } from "./categories";
import { db } from "./db";

/**
 * Mengubah status pesanan beserta penyesuaian stok:
 * dibatalkan → stok dikembalikan; dibuka lagi dari batal → stok dikurangi lagi.
 * Bila `penjualId` diisi, hanya pesanan milik penjual tersebut yang boleh diubah.
 */
export async function ubahStatusPesanan(id: number, status: string, penjualId?: number): Promise<{ ok: boolean; message: string }> {
  if (!PESANAN_STATUS.some((s) => s.key === status)) return { ok: false, message: "Status tidak valid." };
  const sql = db();
  const rows = await sql<{ status: string; items: { produk_id: number; qty: number }[] }[]>`
    select status, items from pesanan
    where id = ${id} ${penjualId !== undefined ? sql`and penjual_id = ${penjualId}` : sql``}`;
  const cur = rows[0];
  if (!cur) return { ok: false, message: "Pesanan tidak ditemukan." };
  if (cur.status === status) return { ok: true, message: "Status tidak berubah." };

  await sql.begin(async (tx) => {
    if (status === "dibatalkan") {
      for (const it of cur.items) await tx`update produk set stok = stok + ${it.qty} where id = ${it.produk_id} and stok is not null`;
    } else if (cur.status === "dibatalkan") {
      for (const it of cur.items) await tx`update produk set stok = greatest(stok - ${it.qty}, 0) where id = ${it.produk_id} and stok is not null`;
    }
    await tx`update pesanan set status = ${status}, updated_at = now() where id = ${id}`;
  });
  return { ok: true, message: "Status pesanan diperbarui." };
}
