"use server";

import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { PENGIRIMAN } from "@/lib/categories";
import { db } from "@/lib/db";
import { formatRupiah, waLink } from "@/lib/format";
import type { PesananItem } from "@/lib/types";

export type CheckoutInput = {
  items: { id: number; qty: number }[];
  nama: string;
  telepon: string;
  pengiriman: string;
  alamat: string;
  catatan: string;
};

export type PesananDibuat = { kode: string; penjual: string; total: number; waUrl: string | null; items: PesananItem[] };

export type CheckoutResult =
  | { ok: true; pesanan: PesananDibuat[] }
  | { ok: false; message: string; errors?: Record<string, string>; bermasalah?: { id: number; alasan: string }[] };

const ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function kodePesanan(): string {
  const d = new Date(Date.now() + 7 * 3600 * 1000); // WIB
  const tgl = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  let acak = "";
  for (let i = 0; i < 4; i++) acak += ALFABET[randomInt(ALFABET.length)];
  return `MM-${tgl}-${acak}`;
}

const recent = new Map<string, number[]>();

class StokError extends Error {
  constructor(public bermasalah: { id: number; alasan: string }[]) {
    super("stok");
  }
}

type Row = { id: number; nama: string; satuan: string | null; harga: number; stok: number | null; penjual_id: number; penjual_nama: string; whatsapp: string };

export async function buatPesanan(input: CheckoutInput): Promise<CheckoutResult> {
  // ---- Validasi isian pembeli ----
  const nama = String(input?.nama ?? "").trim();
  const telepon = String(input?.telepon ?? "").trim();
  const pengiriman = String(input?.pengiriman ?? "");
  const alamat = String(input?.alamat ?? "").trim();
  const catatan = String(input?.catatan ?? "").trim().slice(0, 500);

  const errors: Record<string, string> = {};
  if (nama.length < 2 || nama.length > 100) errors.nama = "Nama wajib diisi (2–100 karakter).";
  if (!/^(\+?62|0)8[\d\s-]{7,14}$/.test(telepon)) errors.telepon = "Masukkan nomor HP yang aktif, mis. 0812 3456 7890.";
  if (!PENGIRIMAN.some((p) => p.key === pengiriman)) errors.pengiriman = "Pilih cara pengambilan.";
  if (pengiriman === "antar" && alamat.length < 5) errors.alamat = "Tulis alamat pengantaran (RT/RW dan patokan).";
  if (alamat.length > 300) errors.alamat = "Alamat terlalu panjang.";
  if (Object.keys(errors).length) return { ok: false, message: "Periksa kembali data pemesan.", errors };

  // ---- Validasi isi keranjang ----
  const qtyById = new Map<number, number>();
  for (const it of Array.isArray(input?.items) ? input.items : []) {
    const id = Number(it?.id);
    const qty = Math.floor(Number(it?.qty));
    if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(qty) || qty < 1) continue;
    qtyById.set(id, Math.min((qtyById.get(id) ?? 0) + qty, 99));
  }
  if (!qtyById.size) return { ok: false, message: "Keranjang masih kosong." };
  if (qtyById.size > 30) return { ok: false, message: "Terlalu banyak jenis produk dalam satu pesanan." };

  // ---- Pembatasan laju sederhana ----
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "lokal").split(",")[0].trim();
  const now = Date.now();
  const list = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (list.length >= 6) return { ok: false, message: "Terlalu banyak pesanan dalam waktu singkat. Coba lagi beberapa menit lagi." };

  const sql = db();
  const ids = [...qtyById.keys()];

  try {
    const hasil = await sql.begin(async (tx) => {
      const rows = await tx<Row[]>`
        select p.id, p.nama, p.satuan, p.harga, p.stok, p.penjual_id, j.nama as penjual_nama, j.whatsapp
        from produk p join penjual j on j.id = p.penjual_id
        where p.id in ${tx(ids)} and p.tersedia = true and j.aktif = true
        for update of p`;
      const byId = new Map(rows.map((r) => [r.id, r]));

      const bermasalah: { id: number; alasan: string }[] = [];
      for (const [id, qty] of qtyById) {
        const r = byId.get(id);
        if (!r) bermasalah.push({ id, alasan: "Produk sudah tidak dijual." });
        else if (r.stok !== null && r.stok < qty) bermasalah.push({ id, alasan: r.stok === 0 ? `${r.nama} sedang habis.` : `Stok ${r.nama} tinggal ${r.stok}.` });
      }
      if (bermasalah.length) throw new StokError(bermasalah);

      // Kelompokkan per penjual: satu pesanan untuk setiap penjual.
      const perPenjual = new Map<number, { nama: string; whatsapp: string; items: PesananItem[] }>();
      for (const [id, qty] of qtyById) {
        const r = byId.get(id)!;
        const g = perPenjual.get(r.penjual_id) ?? { nama: r.penjual_nama, whatsapp: r.whatsapp, items: [] };
        g.items.push({ produk_id: r.id, nama: r.nama, satuan: r.satuan, harga: r.harga, qty, subtotal: r.harga * qty });
        perPenjual.set(r.penjual_id, g);
        await tx`update produk set stok = stok - ${qty}, updated_at = now() where id = ${id} and stok is not null`;
      }

      const dibuat: PesananDibuat[] = [];
      const labelKirim = PENGIRIMAN.find((p) => p.key === pengiriman)!.label;
      for (const [penjualId, g] of perPenjual) {
        const total = g.items.reduce((s, i) => s + i.subtotal, 0);
        let kode = kodePesanan();
        for (let n = 0; n < 5; n++) {
          const clash = await tx`select 1 from pesanan where kode = ${kode}`;
          if (!clash.length) break;
          kode = kodePesanan();
        }
        await tx`
          insert into pesanan (kode, penjual_id, penjual_nama, nama_pembeli, telepon, alamat, pengiriman, catatan, items, total)
          values (${kode}, ${penjualId}, ${g.nama}, ${nama}, ${telepon}, ${alamat || null}, ${pengiriman}, ${catatan || null}, ${tx.json(g.items as never)}, ${total})`;

        const pesanWa = [
          `Halo ${g.nama}, saya ${nama} ingin memesan lewat Pasar Desa Marga Mulya.`,
          `Kode pesanan: ${kode}`,
          "",
          ...g.items.map((i) => `• ${i.qty} × ${i.nama}${i.satuan ? ` (${i.satuan})` : ""} = ${formatRupiah(i.subtotal)}`),
          `Total: ${formatRupiah(total)}`,
          "",
          `Pengambilan: ${labelKirim}`,
          alamat ? `Alamat: ${alamat}` : null,
          catatan ? `Catatan: ${catatan}` : null,
          `No. HP: ${telepon}`,
        ]
          .filter((l) => l !== null)
          .join("\n");
        dibuat.push({ kode, penjual: g.nama, total, items: g.items, waUrl: waLink(g.whatsapp, pesanWa) });
      }
      return dibuat;
    });

    list.push(now);
    recent.set(ip, list);
    revalidatePath("/pasar");
    revalidatePath("/admin", "layout");
    return { ok: true, pesanan: hasil };
  } catch (err) {
    if (err instanceof StokError) {
      return { ok: false, message: "Sebagian produk di keranjang tidak bisa dipesan. Sesuaikan jumlahnya lalu coba lagi.", bermasalah: err.bermasalah };
    }
    console.error("[pasar] gagal membuat pesanan", err);
    return { ok: false, message: "Pesanan gagal disimpan karena gangguan server. Silakan coba lagi." };
  }
}
