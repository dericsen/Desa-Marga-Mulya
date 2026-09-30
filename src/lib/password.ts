import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algo, salt, hash] = stored.split(":");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Login bisa memakai email atau nomor HP. Nomor HP dinormalkan ke format 62xxxx. */
export function normalizeLogin(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (/^[+\d][\d\s-]{7,}$/.test(v)) {
    let d = v.replace(/\D/g, "");
    if (d.startsWith("0")) d = "62" + d.slice(1);
    return d;
  }
  return v;
}
