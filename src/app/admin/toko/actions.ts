"use server";

// Aksi portal penjual. Setiap aksi memeriksa sesi penjual dan kepemilikan data (penjual_id = sesi.pid),
// sehingga penjual tidak dapat mengubah produk atau pesanan toko lain meski menebak id.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/admin/actions";
import { requirePenjual } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseFields } from "@/lib/form-parse";
import { slugify } from "@/lib/format";
import { ubahStatusPesanan } from "@/lib/pesanan";
import { PRODUK_PENJUAL_FIELDS, PROFIL_TOKO_FIELDS } from "@/lib/resources";

const MAX_HARGA = 100_000_000;

function cekAngka(data: Record<string, unknown>, errors: Record<string, string>) {
  const harga = data.harga as number | null;
  if (harga === null || harga === undefined) errors.harga = "Harga wajib diisi.";
  else if (!Number.isInteger(harga) || harga < 0 || harga > MAX_HARGA) errors.harga = "Tulis harga dalam rupiah bulat, mis. 45.000.";
  const stok = data.stok as number | null;
  if (stok !== null && stok !== undefined && (!Number.isInteger(stok) || stok < 0 || stok > 100000)) errors.stok = "Stok harus bilangan bulat 0 atau lebih. Kosongkan bila selalu tersedia.";
}

async function slugUnik(nama: string, exceptId: number | null): Promise<string> {
  const sql = db();
  const base = slugify(nama) || `produk-${Date.now()}`;
  let slug = base;
  for (let n = 2; ; n++) {
    const clash = await sql`select 1 from produk where slug = ${slug} and id <> ${exceptId ?? 0}`;
    if (!clash.length) return slug;
    slug = `${base}-${n}`;
  }
}

function segarkan() {
  revalidatePath("/pasar");
  revalidatePath("/admin", "layout");
}

/** Tambah atau ubah produk milik penjual. Produk baru dan perubahan isi (nama/foto/kategori/deskripsi) ditinjau admin. */
export async function saveProdukPenjual(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const s = await requirePenjual();
  const { data, errors } = parseFields(PRODUK_PENJUAL_FIELDS, formData);
  cekAngka(data, errors);
  if (Object.keys(errors).length) return { message: "Periksa kembali isian yang ditandai.", errors, values: data };

  const sql = db();
  const isi = {
    nama: data.nama as string,
    kategori: data.kategori as string,
    harga: data.harga as number,
    satuan: (data.satuan as string | null) ?? null,
    stok: (data.stok as number | null) ?? null,
    tersedia: Boolean(data.tersedia),
    gambar: (data.gambar as string | null) ?? null,
    deskripsi: (data.deskripsi as string | null) ?? null,
  };

  let pesan = "diajukan";
  if (id) {
    const rows = await sql<{ nama: string; kategori: string; gambar: string | null; deskripsi: string | null; status_tinjau: string }[]>`
      select nama, kategori, gambar, deskripsi, status_tinjau from produk where id = ${id} and penjual_id = ${s.pid}`;
    const cur = rows[0];
    if (!cur) return { message: "Produk tidak ditemukan di toko Anda." };

    const isiBerubah = (["nama", "kategori", "gambar", "deskripsi"] as const).some((k) => (cur[k] ?? null) !== (isi[k] ?? null));
    let status = cur.status_tinjau;
    if (cur.status_tinjau === "ditolak" || (cur.status_tinjau === "disetujui" && isiBerubah)) status = "menunggu";
    const diajukanUlang = status === "menunggu" && cur.status_tinjau !== "menunggu";

    await sql`
      update produk set
        nama = ${isi.nama}, kategori = ${isi.kategori}, harga = ${isi.harga}, satuan = ${isi.satuan}, stok = ${isi.stok},
        tersedia = ${isi.tersedia}, gambar = ${isi.gambar}, deskripsi = ${isi.deskripsi},
        slug = ${isiBerubah ? await slugUnik(isi.nama, id) : sql`slug`},
        status_tinjau = ${status},
        catatan_tinjau = ${diajukanUlang ? null : sql`catatan_tinjau`},
        diajukan_at = ${diajukanUlang ? sql`now()` : sql`diajukan_at`},
        updated_at = now()
      where id = ${id} and penjual_id = ${s.pid}`;
    pesan = diajukanUlang ? "ditinjau-ulang" : "diperbarui";
  } else {
    await sql`
      insert into produk (penjual_id, nama, slug, kategori, harga, satuan, stok, tersedia, gambar, deskripsi, status_tinjau, diajukan_at)
      values (${s.pid}, ${isi.nama}, ${await slugUnik(isi.nama, null)}, ${isi.kategori}, ${isi.harga}, ${isi.satuan}, ${isi.stok},
              ${isi.tersedia}, ${isi.gambar}, ${isi.deskripsi}, 'menunggu', now())`;
  }
  segarkan();
  redirect(`/admin/toko/produk?pesan=${pesan}`);
}

/** Ubah cepat harga, stok, dan status jual. Langsung berlaku tanpa tinjauan. */
export async function updateHargaStok(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const s = await requirePenjual();
  const hargaRaw = String(formData.get("harga") ?? "").replace(/[^\d]/g, "");
  const stokRaw = String(formData.get("stok") ?? "").trim();
  const data: Record<string, unknown> = {
    harga: hargaRaw === "" ? null : Number(hargaRaw),
    stok: stokRaw === "" ? null : Number(stokRaw),
  };
  const errors: Record<string, string> = {};
  cekAngka(data, errors);
  if (Object.keys(errors).length) return { ok: false, message: Object.values(errors)[0], errors };

  const res = await db()`
    update produk set harga = ${data.harga as number}, stok = ${data.stok as number | null}, tersedia = ${formData.get("tersedia") === "on"}, updated_at = now()
    where id = ${id} and penjual_id = ${s.pid} returning id`;
  if (!res.length) return { ok: false, message: "Produk tidak ditemukan di toko Anda." };
  segarkan();
  return { ok: true, message: "Tersimpan" };
}

export async function hapusProdukPenjual(id: number) {
  const s = await requirePenjual();
  await db()`delete from produk where id = ${id} and penjual_id = ${s.pid}`;
  segarkan();
  redirect("/admin/toko/produk?pesan=dihapus");
}

export async function ubahStatusPesananPenjual(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const s = await requirePenjual();
  const res = await ubahStatusPesanan(id, String(formData.get("status") || ""), s.pid);
  segarkan();
  return res;
}

/** Penjual dapat memperbarui profil toko; nama usaha & nomor WhatsApp hanya diubah admin (tujuan pesanan). */
export async function saveProfilToko(_prev: FormState, formData: FormData): Promise<FormState> {
  const s = await requirePenjual();
  const { data, errors } = parseFields(PROFIL_TOKO_FIELDS, formData);
  if (Object.keys(errors).length) return { message: "Periksa kembali isian yang ditandai.", errors, values: data };
  await db()`
    update penjual set pemilik = ${(data.pemilik as string) ?? null}, alamat = ${(data.alamat as string) ?? null},
      deskripsi = ${(data.deskripsi as string) ?? null}, foto = ${(data.foto as string) ?? null}, updated_at = now()
    where id = ${s.pid}`;
  segarkan();
  return { ok: true, message: "Profil toko disimpan.", values: data };
}
