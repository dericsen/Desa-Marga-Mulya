import type { Metadata } from "next";
import Link from "next/link";
import { requirePenjual } from "@/lib/auth";
import { PESANAN_STATUS } from "@/lib/categories";
import { db } from "@/lib/db";
import { formatDateTime, formatRupiah } from "@/lib/format";
import type { PesananItem } from "@/lib/types";

export const metadata: Metadata = { title: "Pesanan" };

type Row = { id: number; kode: string; nama_pembeli: string; telepon: string; pengiriman: string; total: number; status: string; items: PesananItem[]; created_at: Date };

const STATUS_STYLE: Record<string, string> = {
  baru: "border-sun-400/60 bg-sun-50 text-sun-600",
  diproses: "border-brand-200 bg-brand-50 text-brand-700",
  selesai: "border-line-strong bg-paper text-muted",
  dibatalkan: "border-red-200 bg-red-50 text-red-700",
};

export default async function PesananPenjualPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const s = await requirePenjual();
  const { status } = await searchParams;
  const aktif = PESANAN_STATUS.find((x) => x.key === status)?.key;
  const sql = db();
  const [rows, counts] = await Promise.all([
    sql<Row[]>`
      select id, kode, nama_pembeli, telepon, pengiriman, total, status, items, created_at from pesanan
      where penjual_id = ${s.pid} ${aktif ? sql`and status = ${aktif}` : sql``}
      order by created_at desc, id desc limit 200`,
    sql<{ status: string; n: number }[]>`select status, count(*)::int as n from pesanan where penjual_id = ${s.pid} group by status`,
  ]);
  const count = new Map(counts.map((c) => [c.status, c.n]));
  const semua = counts.reduce((a, c) => a + c.n, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink">Pesanan</h1>
      <p className="mt-1 text-sm text-muted">Pesanan dari Pasar Desa untuk toko Anda. Hubungi pembeli, lalu perbarui statusnya agar pembeli dan admin desa tahu.</p>

      <nav aria-label="Filter status" className="-mx-4 mt-5 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-5">
          {[{ key: "", label: "Semua", n: semua }, ...PESANAN_STATUS.map((x) => ({ ...x, n: count.get(x.key) ?? 0 }))].map((x) => {
            const on = (aktif ?? "") === x.key;
            return (
              <li key={x.key || "semua"}>
                <Link
                  href={x.key ? `/admin/toko/pesanan?status=${x.key}` : "/admin/toko/pesanan"}
                  aria-current={on ? "page" : undefined}
                  className={`-mb-px inline-block border-b-2 py-3 text-sm font-bold ${on ? "border-brand-700 text-ink" : "border-transparent text-muted hover:text-ink"}`}
                >
                  {x.label} <span className="font-normal tabular-nums">{x.n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {rows.length ? (
        <ul className="divide-y divide-line">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/toko/pesanan/${r.id}`} className="group block py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-ink group-hover:underline">{r.nama_pembeli}</span>
                      <span className={`rounded-sm border px-1.5 py-0.5 text-xs font-bold ${STATUS_STYLE[r.status] ?? ""}`}>
                        {PESANAN_STATUS.find((x) => x.key === r.status)?.label ?? r.status}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted">{r.items.map((i) => `${i.qty}× ${i.nama}`).join(", ")}</p>
                    <p className="mt-0.5 text-xs text-muted tabular-nums">
                      {r.kode} · {formatDateTime(r.created_at)} · {r.pengiriman === "antar" ? "Diantar" : "Ambil sendiri"}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-ink tabular-nums">{formatRupiah(r.total)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-md border border-dashed border-line-strong px-6 py-10 text-center">
          <p className="font-bold text-ink">{aktif ? "Tidak ada pesanan dengan status ini" : "Belum ada pesanan"}</p>
          <p className="mx-auto mt-1 max-w-[44ch] text-sm text-muted">Pesanan baru juga dikirim pembeli ke WhatsApp Anda. Bagikan tautan toko agar lebih banyak warga menemukan produk Anda.</p>
        </div>
      )}
    </div>
  );
}
