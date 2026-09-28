const numberFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export function formatNumber(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? Number(n) : n;
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  return numberFormat.format(v);
}

/** Mengubah nilai tanggal (Date atau string) menjadi "yyyy-mm-dd" (UTC) untuk input form. */
export function toDateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function formatDate(value: Date | string | null | undefined, withDay = false): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", {
    timeZone: "UTC",
    weekday: withDay ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function waLink(nomor: string | null | undefined, pesan?: string): string | null {
  if (!nomor) return null;
  let digits = nomor.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (!digits) return null;
  return `https://wa.me/${digits}${pesan ? `?text=${encodeURIComponent(pesan)}` : ""}`;
}

export function excerpt(text: string | null | undefined, len = 160): string {
  if (!text) return "";
  const plain = text.replace(/[#*>_`\[\]()-]/g, "").replace(/\s+/g, " ").trim();
  return plain.length > len ? plain.slice(0, len).trimEnd() + "…" : plain;
}
