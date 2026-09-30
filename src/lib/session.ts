// Sesi login berbasis cookie bertanda tangan HMAC-SHA256.
// Hanya memakai Web Crypto sehingga dapat dipakai di middleware (Edge) maupun server (Node).

export const SESSION_COOKIE = "mm_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type Role = "admin" | "penjual";
/** pid = id penjual (hanya untuk role penjual). */
export type Session = { uid: number; email: string; nama: string; role: Role; pid: number | null; exp: number };

const enc = new TextEncoder();
const dec = new TextDecoder();

function secret(): string {
  return process.env.SESSION_SECRET || `mm-fallback:${process.env.DATABASE_URL || process.env.POSTGRES_URL || "dev"}`;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function signSession(data: Omit<Session, "exp">): Promise<string> {
  const payload: Session = { ...data, exp: Date.now() + MAX_AGE_MS };
  const body = toB64Url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body)));
  return `${body}.${toB64Url(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64Url(sig) as BufferSource, enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(fromB64Url(body))) as Partial<Session>;
    if (!payload.exp || payload.exp < Date.now() || typeof payload.uid !== "number") return null;
    // Sesi lama (sebelum ada peran) selalu milik admin.
    const role: Role = payload.role === "penjual" ? "penjual" : "admin";
    const pid = role === "penjual" && typeof payload.pid === "number" ? payload.pid : null;
    if (role === "penjual" && pid === null) return null;
    return { uid: payload.uid, email: String(payload.email ?? ""), nama: String(payload.nama ?? ""), role, pid, exp: payload.exp };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE_SECONDS = MAX_AGE_MS / 1000;

/** Halaman CMS yang boleh dibuka penjual. Selain ini hanya untuk admin. */
export function sellerMayAccess(pathname: string): boolean {
  return pathname === "/admin/toko" || pathname.startsWith("/admin/toko/") || pathname === "/admin/akun";
}
