import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, verifySession, type Session } from "./session";

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Admin atau penjual yang sudah login. */
export async function requireStaff(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role === "penjual") await assertPenjualAktif(session);
  return session;
}

/** Hanya admin desa. Penjual diarahkan ke portal penjual. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "admin") redirect("/admin/toko");
  return session;
}

export type PenjualSession = Session & { role: "penjual"; pid: number };

/** Hanya penjual; memeriksa ulang ke database agar akun/toko yang dinonaktifkan langsung kehilangan akses. */
export async function requirePenjual(): Promise<PenjualSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "penjual" || session.pid === null) redirect("/admin");
  await assertPenjualAktif(session);
  return session as PenjualSession;
}

async function assertPenjualAktif(session: Session) {
  const rows = await db()`
    select 1 from users u join penjual j on j.id = u.penjual_id
    where u.id = ${session.uid} and u.aktif = true and j.aktif = true and u.penjual_id = ${session.pid}`;
  if (!rows.length) redirect("/admin/login?keluar=nonaktif");
}
