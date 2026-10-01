"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseFields } from "@/lib/form-parse";
import { ubahStatusPesanan } from "@/lib/pesanan";
import { slugify } from "@/lib/format";
import { hashPassword, normalizeLogin, verifyPassword } from "@/lib/password";
import { getResource, SETTINGS_GROUPS } from "@/lib/resources";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/session";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string>; values?: Record<string, unknown> } | null;

/* ---------------------------- Autentikasi ---------------------------- */

const attempts = new Map<string, { count: number; until: number }>();

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = String(formData.get("email") || "");
  const ident = normalizeLogin(raw);
  const password = String(formData.get("password") || "");
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "lokal").split(",")[0].trim();
  const a = attempts.get(ip);
  const values = { email: raw.trim() };
  if (a && a.count >= 5 && a.until > Date.now()) {
    return { message: "Terlalu banyak percobaan login. Coba lagi dalam 10 menit.", values };
  }
  if (!ident || !password) return { message: "Email/nomor HP dan kata sandi wajib diisi.", values };

  const rows = await db()<{ id: number; nama: string; email: string; password_hash: string; role: string; penjual_id: number | null; aktif: boolean; penjual_aktif: boolean | null }[]>`
    select u.id, u.nama, u.email, u.password_hash, u.role, u.penjual_id, u.aktif, j.aktif as penjual_aktif
    from users u left join penjual j on j.id = u.penjual_id
    where u.email = ${ident}`;
  const user = rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) {
    const cur = a && a.until > Date.now() ? a : { count: 0, until: 0 };
    attempts.set(ip, { count: cur.count + 1, until: Date.now() + 10 * 60 * 1000 });
    return { message: "Email/nomor HP atau kata sandi salah.", values };
  }
  const isPenjual = user.role === "penjual";
  if (!user.aktif || (isPenjual && (!user.penjual_id || !user.penjual_aktif))) {
    return { message: "Akun ini sedang dinonaktifkan. Hubungi admin desa.", values };
  }
  attempts.delete(ip);

  const token = await signSession({
    uid: user.id,
    email: user.email,
    nama: user.nama,
    role: isPenjual ? "penjual" : "admin",
    pid: isPenjual ? user.penjual_id : null,
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  redirect(isPenjual ? "/admin/toko" : "/admin");
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
  const res = await ubahStatusPesanan(id, String(formData.get("status") || ""));
  revalidatePath("/admin", "layout");
  revalidatePath("/pasar");
  return res;
}

/* ---------------------------- Tinjauan produk penjual ---------------------------- */

export async function tinjauProduk(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const keputusan = String(formData.get("keputusan") || "");
  const catatan = String(formData.get("catatan") || "").trim().slice(0, 500);
  if (keputusan !== "setujui" && keputusan !== "tolak") return { message: "Pilih setujui atau minta perbaikan." };
  if (keputusan === "tolak" && catatan.length < 5) return { errors: { catatan: "Tulis alasan agar penjual tahu apa yang harus diperbaiki." } };
  const res = await db()`
    update produk set status_tinjau = ${keputusan === "setujui" ? "disetujui" : "ditolak"},
      catatan_tinjau = ${keputusan === "tolak" ? catatan : null}, updated_at = now()
    where id = ${id} returning id`;
  if (!res.length) return { message: "Produk tidak ditemukan." };
  revalidatePath("/pasar");
  revalidatePath("/admin", "layout");
  return { ok: true, message: keputusan === "setujui" ? "Produk disetujui dan kini tampil di Pasar Desa." : "Permintaan perbaikan dikirim ke penjual." };
}

/* ---------------------------- Akun penjual ---------------------------- */

export async function buatAkunPenjual(penjualId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const nama = String(formData.get("nama") || "").trim();
  const loginRaw = String(formData.get("login") || "");
  const login = normalizeLogin(loginRaw);
  const password = String(formData.get("password") || "");
  const errors: Record<string, string> = {};
  if (nama.length < 2) errors.nama = "Nama pemegang akun wajib diisi.";
  if (!/^62\d{8,14}$/.test(login) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login)) errors.login = "Isi nomor HP (08…) atau email yang valid.";
  if (password.length < 8) errors.password = "Kata sandi minimal 8 karakter.";
  if (Object.keys(errors).length) return { errors, values: { nama, login: loginRaw } };

  const sql = db();
  const [j] = await sql`select id from penjual where id = ${penjualId}`;
  if (!j) return { message: "Pelaku usaha tidak ditemukan." };
  if ((await sql`select 1 from users where email = ${login}`).length) return { errors: { login: "Nomor/email ini sudah dipakai akun lain." }, values: { nama, login: loginRaw } };
  await sql`insert into users (nama, email, password_hash, role, penjual_id) values (${nama}, ${login}, ${hashPassword(password)}, 'penjual', ${penjualId})`;
  revalidatePath(`/admin/penjual/${penjualId}`);
  return { ok: true, message: `Akun penjual dibuat. Berikan login ${loginRaw.trim()} dan kata sandinya kepada ${nama}.` };
}

export async function resetSandiPenjual(userId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const password = String(formData.get("password") || "");
  if (password.length < 8) return { errors: { password: "Kata sandi minimal 8 karakter." } };
  const res = await db()`update users set password_hash = ${hashPassword(password)} where id = ${userId} and role = 'penjual' returning penjual_id`;
  if (!res.length) return { message: "Akun tidak ditemukan." };
  return { ok: true, message: "Kata sandi baru disimpan. Sampaikan kepada penjual." };
}

export async function aturAkunPenjual(userId: number, aktif: boolean) {
  await requireAdmin();
  const res = await db()`update users set aktif = ${aktif} where id = ${userId} and role = 'penjual' returning penjual_id`;
  if (res[0]) revalidatePath(`/admin/penjual/${res[0].penjual_id}`);
}

export async function hapusAkunPenjual(userId: number) {
  await requireAdmin();
  const res = await db()`delete from users where id = ${userId} and role = 'penjual' returning penjual_id`;
  if (res[0]) revalidatePath(`/admin/penjual/${res[0].penjual_id}`);
}

/* ---------------------------- Pengaturan situs ---------------------------- */

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const fields = SETTINGS_GROUPS.flatMap((g) => g.fields);
  const { data, errors } = parseFields(fields, formData);
  if (Object.keys(errors).length) return { message: "Periksa kembali isian yang ditandai.", errors, values: data };

  for (const f of fields) {
    if (f.type !== "number" && f.type !== "rupiah" && f.type !== "list" && f.type !== "items" && f.type !== "boolean" && data[f.name] === null) data[f.name] = "";
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
  const session = await requireStaff();
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
  await sql`insert into users (nama, email, password_hash, role) values (${nama}, ${email}, ${hashPassword(password)}, 'admin')`;
  revalidatePath("/admin/akun");
  return { ok: true, message: `Admin ${nama} berhasil ditambahkan.` };
}

export async function deleteAdmin(id: number) {
  const session = await requireAdmin();
  if (id === session.uid) return;
  const sql = db();
  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from users where role = 'admin'`;
  if (count <= 1) return;
  await sql`delete from users where id = ${id} and role = 'admin'`;
  revalidatePath("/admin/akun");
}

/* ------------------------- Status buka/tutup kantor ------------------------- */

/** Admin menimpa status otomatis kantor desa (mis. tutup sementara karena rapat). */
export async function aturStatusKantor(_prev: FormState, formData: FormData): Promise<FormState> {
  const s = await requireAdmin();
  const modeRaw = String(formData.get("mode") || "otomatis");
  const mode = modeRaw === "buka" || modeRaw === "tutup" ? modeRaw : "otomatis";
  const alasan = String(formData.get("alasan") || "").trim().slice(0, 120);
  const durasi = String(formData.get("durasi") || "tanpa");
  let sampai: string | null = null;
  if (mode !== "otomatis") {
    const now = Date.now();
    if (durasi === "1j") sampai = new Date(now + 60 * 60 * 1000).toISOString();
    else if (durasi === "2j") sampai = new Date(now + 2 * 60 * 60 * 1000).toISOString();
    else if (durasi === "hari-ini") {
      // 23.59 WIB hari ini
      const tgl = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date(now));
      sampai = new Date(`${tgl}T23:59:00+07:00`).toISOString();
    } else if (durasi === "pilih") {
      const v = String(formData.get("sampai") || "");
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return { ok: false, errors: { sampai: "Pilih tanggal dan jam berakhir." }, message: "Pilih tanggal dan jam berakhir." };
      const t = new Date(`${v}:00+07:00`);
      if (t.getTime() <= now) return { ok: false, errors: { sampai: "Waktu berakhir harus di masa depan." }, message: "Waktu berakhir harus di masa depan." };
      sampai = t.toISOString();
    }
  }
  const value = { mode, alasan: mode === "otomatis" ? "" : alasan, sampai, diubah: new Date().toISOString(), oleh: s.nama };
  await db()`
    insert into settings (key, value) values (kantor, ${db().json(value as never)})
    on conflict (key) do update set value = excluded.value, updated_at = now()`;
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: mode === "otomatis" ? "Status kantor kembali mengikuti jam layanan." : mode === "buka" ? "Kantor ditandai BUKA di website." : "Kantor ditandai TUTUP SEMENTARA di website.",
  };
}
