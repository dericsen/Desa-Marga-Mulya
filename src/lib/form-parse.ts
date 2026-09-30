import type { Field } from "./resources";

export type ParseResult = { data: Record<string, unknown>; errors: Record<string, string> };

/** Mengubah FormData menjadi objek bertipe sesuai konfigurasi field CMS, beserta validasinya. */
export function parseFields(fields: Field[], formData: FormData): ParseResult {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const f of fields) {
    const raw = formData.get(f.name);
    const str = typeof raw === "string" ? raw.trim() : "";

    switch (f.type) {
      case "boolean":
        data[f.name] = raw === "on" || raw === "true";
        break;
      case "number": {
        if (!str) {
          data[f.name] = null;
          if (f.required) errors[f.name] = `${f.label} wajib diisi.`;
          break;
        }
        const n = Number(str.replace(",", "."));
        if (Number.isNaN(n)) errors[f.name] = `${f.label} harus berupa angka.`;
        data[f.name] = Number.isNaN(n) ? null : n;
        break;
      }
      case "relation": {
        const n = Number(str);
        if (!str || !Number.isInteger(n) || n <= 0) {
          data[f.name] = null;
          if (f.required) errors[f.name] = `${f.label} wajib dipilih.`;
        } else {
          data[f.name] = n;
        }
        break;
      }
      case "items": {
        let list: { label: string; nilai: string }[] = [];
        try {
          const parsed = JSON.parse(str || "[]");
          if (Array.isArray(parsed)) list = parsed;
        } catch {
          errors[f.name] = "Format data tidak valid.";
        }
        data[f.name] = list
          .map((i) => ({ label: String(i?.label ?? "").trim(), nilai: String(i?.nilai ?? "").trim() }))
          .filter((i) => i.label);
        break;
      }
      case "list":
        data[f.name] = str
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case "date":
        if (str && !/^\d{4}-\d{2}-\d{2}$/.test(str)) errors[f.name] = "Format tanggal tidak valid.";
        data[f.name] = str || null;
        if (!str && f.required) errors[f.name] = `${f.label} wajib diisi.`;
        break;
      case "email":
        if (str && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) errors[f.name] = "Format email tidak valid.";
        data[f.name] = str || null;
        break;
      default:
        data[f.name] = str || null;
        if (!str && f.required) errors[f.name] = `${f.label} wajib diisi.`;
        if (f.options && str && !f.options.some((o) => o.value === str)) errors[f.name] = `Pilihan ${f.label} tidak valid.`;
    }
  }
  return { data, errors };
}
