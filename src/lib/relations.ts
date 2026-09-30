import { db } from "./db";
import type { Field, Relation } from "./resources";

// Nama tabel & kolom relasi berasal dari konfigurasi CMS (bukan input pengguna), aman disisipkan.
async function loadOptions(rel: Relation): Promise<{ value: string; label: string }[]> {
  const rows = (await db().unsafe(`select id, "${rel.labelColumn}" as label from "${rel.table}" order by "${rel.labelColumn}"`)) as unknown as {
    id: number;
    label: string;
  }[];
  return rows.map((r) => ({ value: String(r.id), label: r.label }));
}

/** Melengkapi field bertipe relasi dengan daftar pilihan dari database. */
export async function withRelationOptions(fields: Field[]): Promise<Field[]> {
  return Promise.all(fields.map(async (f) => (f.type === "relation" && f.relation ? { ...f, options: await loadOptions(f.relation) } : f)));
}

/** Peta id → label untuk menampilkan kolom relasi di tabel daftar CMS. */
export async function relationLabels(rel: Relation): Promise<Map<string, string>> {
  const opts = await loadOptions(rel);
  return new Map(opts.map((o) => [o.value, o.label]));
}
