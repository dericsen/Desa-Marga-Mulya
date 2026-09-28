"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type KontakState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

const recent = new Map<string, number[]>();

export async function kirimPesan(_prev: KontakState, formData: FormData): Promise<KontakState> {
  // Honeypot anti-spam: kolom tersembunyi harus kosong.
  if (String(formData.get("website") || "")) return { ok: true, message: "Terima kasih, pesan Anda sudah kami terima." };

  const nama = String(formData.get("nama") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const telepon = String(formData.get("telepon") || "").trim();
  const subjek = String(formData.get("subjek") || "").trim();
  const pesan = String(formData.get("pesan") || "").trim();

  const errors: Record<string, string> = {};
  if (nama.length < 2 || nama.length > 100) errors.nama = "Nama wajib diisi (2–100 karakter).";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Format email tidak valid.";
  if (!email && !telepon) errors.email = "Isi email atau nomor telepon agar kami dapat membalas.";
  if (telepon && !/^[+\d][\d\s-]{6,19}$/.test(telepon)) errors.telepon = "Nomor telepon tidak valid.";
  if (pesan.length < 10 || pesan.length > 3000) errors.pesan = "Pesan minimal 10 karakter dan maksimal 3000 karakter.";
  if (subjek.length > 150) errors.subjek = "Subjek terlalu panjang.";
  if (Object.keys(errors).length) return { ok: false, message: "Periksa kembali isian formulir.", errors };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "lokal").split(",")[0].trim();
  const now = Date.now();
  const list = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (list.length >= 5) return { ok: false, message: "Terlalu banyak pesan dalam waktu singkat. Silakan coba lagi nanti." };
  list.push(now);
  recent.set(ip, list);

  try {
    await db()`insert into pesan (nama, email, telepon, subjek, pesan) values (${nama}, ${email || null}, ${telepon || null}, ${subjek || null}, ${pesan})`;
  } catch (err) {
    console.error("[kontak] gagal menyimpan pesan", err);
    return { ok: false, message: "Maaf, pesan gagal dikirim. Silakan coba lagi atau hubungi kami melalui WhatsApp." };
  }
  revalidatePath("/admin");
  return { ok: true, message: "Terima kasih! Pesan Anda sudah diterima dan akan ditindaklanjuti oleh pemerintah desa." };
}
