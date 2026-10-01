import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { StatusKantorPanel } from "@/components/admin/StatusKantorPanel";
import { getSite, getStatusManual } from "@/lib/data";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { RESOURCES } from "@/lib/resources";
import type { Pesan } from "@/lib/types";

export const metadata: Metadata = { title: "Dasbor" };

export default async function DashboardPage() {
  await requireAdmin();
  const sql = db();
  const counts = await Promise.all(
    RESOURCES.map(async (r) => {
      const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from ${sql(r.table)}`;
      return { ...r, count };
    })
  );
  const [pesan, site, statusManual] = await Promise.all([sql<Pesan[]>`select * from pesan order by created_at desc limit 5`, getSite(), getStatusManual()]);

  const status = [
    { label: "Database", ok: true, info: "Terhubung" },
    { label: "Asisten AI (Gemini)", ok: Boolean(process.env.GEMINI_API_KEY), info: process.env.GEMINI_API_KEY ? "Aktif" : "Mode pencarian data lokal (GEMINI_API_KEY belum diatur)" },
    { label: "Penyimpanan Gambar", ok: Boolean(process.env.BLOB_READ_WRITE_TOKEN), info: process.env.BLOB_READ_WRITE_TOKEN ? "Vercel Blob" : "Disimpan di database (BLOB_READ_WRITE_TOKEN belum diatur)" },
    { label: "Kunci Sesi", ok: Boolean(process.env.SESSION_SECRET), info: process.env.SESSION_SECRET ? "Diatur" : "Memakai kunci cadangan — atur SESSION_SECRET" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold text-stone-900">Dasbor CMS</h1>
      <p className="mt-1 text-stone-600">Kelola seluruh konten website Desa Marga Mulya dari sini. Perubahan langsung tampil di website.</p>

      <StatusKantorPanel jamLayanan={site.jamLayanan} manual={statusManual} />

      <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {counts.map((c) => (
          <li key={c.key}>
            <Link href={`/admin/${c.key}`} className="card flex h-full flex-col gap-2 p-4 hover:ring-brand-300">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name={c.icon} className="h-[18px] w-[18px]" />
              </span>
              <span className="text-2xl font-extrabold text-stone-900">{c.count}</span>
              <span className="text-sm text-stone-600">{c.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-stone-900">Pesan Terbaru</h2>
            <Link href="/admin/pesan" className="text-sm font-semibold text-brand-700 hover:underline">Lihat semua</Link>
          </div>
          {pesan.length ? (
            <ul className="mt-4 divide-y divide-stone-100">
              {pesan.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/pesan/${p.id}`} className="flex items-start gap-3 py-3 hover:bg-stone-50">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${p.dibaca ? "bg-stone-300" : "bg-sun-500"}`} aria-label={p.dibaca ? "Sudah dibaca" : "Belum dibaca"} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-stone-900">{p.subjek || "(tanpa subjek)"} — {p.nama}</span>
                      <span className="block truncate text-sm text-stone-500">{p.pesan}</span>
                    </span>
                    <span className="shrink-0 text-xs text-stone-400">{formatDateTime(p.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-stone-500">Belum ada pesan masuk.</p>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-bold text-stone-900">Status Sistem</h2>
          <ul className="mt-4 space-y-3">
            {status.map((s) => (
              <li key={s.label} className="flex items-start gap-3 text-sm">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${s.ok ? "bg-brand-500" : "bg-sun-500"}`} aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-stone-800">{s.label}</span>
                  <span className="block text-stone-500">{s.info}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link href="/admin/pengaturan" className="btn-light mt-5 w-full">
            <Icon name="settings" className="h-4 w-4" /> Pengaturan Situs
          </Link>
        </section>
      </div>
    </div>
  );
}
