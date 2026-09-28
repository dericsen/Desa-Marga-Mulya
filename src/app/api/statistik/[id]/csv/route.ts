import { getStatistikById } from "@/lib/data";
import { slugify } from "@/lib/format";

export const dynamic = "force-dynamic";

function csvCell(v: string | number) {
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  const stat = Number.isInteger(num) && num > 0 ? await getStatistikById(num) : null;
  if (!stat) return new Response("Data tidak ditemukan", { status: 404 });

  const rows = [["Uraian", `Jumlah${stat.satuan ? ` (${stat.satuan})` : ""}`], ...stat.items.map((i) => [i.label, i.nilai])];
  const csv = "\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slugify(stat.judul) || "data"}-${stat.tahun ?? ""}.csv"`,
    },
  });
}
