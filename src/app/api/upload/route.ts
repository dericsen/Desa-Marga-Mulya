import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_INLINE_BYTES = 1.5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function POST(req: Request) {
  if (!(await getSession())) return Response.json({ error: "Tidak diizinkan. Silakan login kembali." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Berkas tidak ditemukan." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return Response.json({ error: "Format gambar tidak didukung." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Ukuran gambar maksimal 4 MB." }, { status: 400 });

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60) || "gambar";

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`desa/${Date.now()}-${safeName}`, file, { access: "public", contentType: file.type });
      return Response.json({ url: blob.url });
    } catch (err) {
      console.error("[upload] Vercel Blob gagal", err);
      return Response.json({ error: "Gagal mengunggah ke penyimpanan. Coba lagi." }, { status: 500 });
    }
  }

  // Tanpa Vercel Blob: simpan sebagai data URL di database (cocok untuk gambar yang sudah dikompresi).
  if (file.size > MAX_INLINE_BYTES) {
    return Response.json({ error: "Gambar terlalu besar untuk disimpan tanpa Vercel Blob (maks. 1,5 MB)." }, { status: 400 });
  }
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return Response.json({ url: `data:${file.type};base64,${base64}` });
}
