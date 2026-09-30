"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseFields } from "@/lib/form-parse";
import { slugify } from "@/lib/format";
import { hashPassword, verifyPassword } from "@/lib/password";
import { PESANAN_STATUS } from "@/lib/categories";
import { getResource, SETTINGS_GROUPS } from "@/lib/resources";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/session";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string>; values?: Record<string, unknown> } | null;

/* ---------------------------- Autentikasi ---------------------------- */

const attempts = new Map<string, { count: number; until: number }>();

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "lokal").split(",")[0].trim();
  const a = attempts.get(ip);
  if (a && a.count >= 5 && a.until > Date.now()) {
    return { message: "Terlalu banyak percobaan login. Coba lagi dalam 10 menit.", values: { email } };
  }
  if (!email || !password) return { message: "Email dan kata sandi wajib diisi.", values: { email } };

  const rows = await db()<{ id: number; nama: string; email: string; password_hash: string }[]>`
    select id, nama, email, password_hash from users where email = ${email}`;
  const user = rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) {
    const cur = a && a.until > Date.now() ? a : { count: 0, until: 0 };
    attempts.set(ip, { count: cur.count + 1, until: Date.now() + 10 * 60 * 1000 });
    return { message: "Email atau kata sandi salah.", values: { email } };
  }
  attempts.delete(ip);

  const token = await signSession({ uid: user.id, email: user.email, nama: user.nama });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------------------------- Koleksi konten ---------------------------- */

const NOT_NULL_NUMBER_DEFAULTS: Record<string, number> = { urutan: 0 };
const NOT_NULL_TEXT_DEFAULTS: Record<string, string> = { satuan: "" };

export async function saveResource(key: string, id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const resource = getResource(key);
  if (!resource || resource.readonly) return { message: "Koleksi tidak dapat diubah." };

  const { data, errors } = parseFields(resource.fields, formData);
  const values = { ...data };

  for (const [k, v] of Object.entries(NOT_NULL_NUMBER_DEFAULTS)) if (k in data && data[k] === null) data[k] = v;
  for (const [k, v] of Object.entries(NOT_NULL_TEXT_DEFAULTS)) if (k in data && data[k] === null) data[k] = v;

  if (key === "statistik") {
    const items = (data.items as { label: string; nilai: string }[]) ?? [];
    const parsed = items.map((i) => ({ label: i.label, nilai: Number(String(i.nilai).replace(",", ".")) }));
    if (parsed.some((i) => Number.isNaN(i.nilai))) errors.items = "Semua nilai harus berupa angka.";
    if (!parsed.length) errors.items = "Tambahkan minimal satu baris data.";
    data.items = parsed;
  }

  if (Object.keys(errors).length) return { message: "Periksa kembali isian yang ditandai.", errors, values };

  const sql = db();

  if (resource.slugFrom && resource.fields.some((f) => f.name === "slug")) {
    const base = slugify(String(data.slug || data[resource.slugFrom] || "")) || `${key}-${Date.now()}`;
    let slug = base;
    for (let n = 2; ; n++) {
      const clash = await sql`select 1 from ${sql(resource.table)} where slug = ${slug} and id <> ${id ?? 0}`;
      if (!clash.length) break;
      slug = `${base}-${n}`;
    }
    data.slug = slug;
  }

  const row: Record<string, unknown> = { ...data };
  if ("items" in row) row.items = sql.json(row.items as never);

  try {
    if (id) {
      await sql`update ${sql(resource.table)} set ${sql(row)}, updated_at = now() where id = ${id}`;
    } else {
      await sql`insert into ${sql(resource.table)} ${sql(row)}`;
    }
  } catch (err) {
    console.error("[cms] gagal menyimpan", err);
    return { message: "Gagal menyimpan data. Silakan coba lagi.", values };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/${key}?pesan=${id ? "diperbarui" : "ditambahkan"}`);
}

export async function deleteResource(key: string, id: number) {
  await requireAdmin();
  const resource = getResource(key);
  if (!resource) return;
  let ok = true;
  try {
    await db()`delete from ${db()(resource.table)} where id = ${id}`;
  } catch (err) {
    // Biasanya pelanggaran foreign key (mis. penjual masih memiliki produk).
    console.warn("[cms] gagal menghapus", err);
    ok = false;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/${key}?pesan=${ok ? "dihapus" : "gagal-hapus"}`);
}

export async function setPesanDibaca(id: number, dibaca: boolean) {
  await requireAdmin();
  await db()`update pesan set dibaca = ${dibaca}, updated_at = now() where id = ${id}`;
  revalidatePath("/admin", "layout");
}

export async function setPesananStatus(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const status = String(formData.get("status") || "");
  if (!PESANAN_STATUS.some((s) => s.key === status)) return { message: "Status tidak valid." };
  const sql = db();
  const rows = await sql<{ status: string; items: { produk_id: number; qty: number }[] }[]>`select status, items from pesanan where id = ${id}`;
  const cur = rows[0];
  if (!cur) return { message: "Pesanan tidak ditemukan." };
  await sql.begin(async (tx) => {
    // Pesanan dibatalkan: kembalikan stok. Dibuka kembali dari batal: kurangi stok lagi.
    if (status === "dibatalkan" && cur.status !== "dibatalkan") {
      for (const it of cur.items) await tx`update produk set stok = stok + ${it.qty} where id = ${it.produk_id} and stok is not null`;
    } else if (cur.status === "dibatalkan" && status !== "dibatalkan") {
      for (const it of cur.items) await tx`update produk set stok = greatest(stok - ${it.qty}, 0) where id = ${it.produk_id} and stok is not null`;
    }
    await tx`update pesanan set status = ${status}, updated_at = now() where id = ${id}`;
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/pasar");
  return { ok: true, message: "Status pesanan diperbarui." };
}

/* ---------------------------- Pengaturan situs ---------------------------- */

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const fields = SETTINGS_GROUPS.flatMap((g) => g.fields);
  const { data, errors } = parseFields(fields, formData);
  if (Object.keys(errors).length) return { message: "Periksa kembali isian yang ditandai.", errors, values: data };

  for (const f of fields) {
    if (f.type !== "number" && f.type !== "list" && f.type !== "items" && f.type !== "boolean" && data[f.name] === null) data[f.name] = "";
  }

  const sql = db();
  const rows = await sql<{ value: Record<string, unknown> }[]>`select value from settings where key = 'site'`;
  const merged = { ...(rows[0]?.value ?? {}), ...data };
  await sql`
    insert into settings (key, value) values ('site', ${sql.json(merged as never)})
    on conflict (key) do update set value = excluded.value, updated_at = now()`;

  revalidatePath("/", "layout");
  return { ok: true, message: "Pengaturan berhasil disimpan.", values: merged };
}

/* ---------------------------- Akun admin ---------------------------- */

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const confirm = String(formData.get("confirm") || "");
  if (next.length < 8) return { errors: { next: "Kata sandi baru minimal 8 karakter." } };
  if (next !== confirm) return { errors: { confirm: "Konfirmasi kata sandi tidak sama." } };

  const sql = db();
  const rows = await sql<{ password_hash: string }[]>`select password_hash from users where id = ${session.uid}`;
  if (!rows[0] || !verifyPassword(current, rows[0].password_hash)) return { errors: { current: "Kata sandi saat ini salah." } };
  await sql`update users set password_hash = ${hashPassword(next)} where id = ${session.uid}`;
  return { ok: true, message: "Kata sandi berhasil diganti." };
}

export async function addAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const nama = String(formData.get("nama") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const errors: Record<string, string> = {};
  if (nama.length < 2) errors.nama = "Nama wajib diisi.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email tidak valid.";
  if (password.length < 8) errors.password = "Kata sandi minimal 8 karakter.";
  if (Object.keys(errors).length) return { errors };

  const sql = db();
  const exists = await sql`select 1 from users where email = ${email}`;
  if (exists.length) return { errors: { email: "Email sudah terdaftar." } };
  await sql`insert into users (nama, email, password_hash) values (${nama}, ${email}, ${hashPassword(password)})`;
  revalidatePath("/admin/akun");
  return { ok: true, message: `Admin ${nama} berhasil ditambahkan.` };
}

export async function deleteAdmin(id: number) {
  const session = await requireAdmin();
  if (id === session.uid) return;
  const sql = db();
  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from users`;
  if (count <= 1) return;
  await sql`delete from users where id = ${id}`;
  revalidatePath("/admin/akun");
}
