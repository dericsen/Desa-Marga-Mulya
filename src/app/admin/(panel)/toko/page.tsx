import type { Metadata } from "next";
import Link from "next/link";
import { requirePenjual } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatRupiah } from "@/lib/format";
import type { PesananItem } from "@/lib/types";

export const metadata: Metadata = { title: "Ringkasan toko" };

export default async function RingkasanTokoPage() {
  const s = await requirePenjual();
  const sql = db();
  const [[toko], [stat], perlu, pesananBaru, [omzet]] = await Promise.all([
    sql<{ nama: string; slug: string }[]>`select nama, slug from penjual where id = ${s.pid}`,
    sql<{ tayang: number; menunggu: number; ditolak: number; habis: number; menipis: number }[]>`
      select
        count(*) filter (where status_tinjau = 'disetujui' and tersedia and (stok is null or stok > 0))::int as tayang,
        count(*) filter (where status_tinjau = 'menunggu')::int as menunggu,
        count(*) filter (where status_tinjau = 'ditolak')::int as ditolak,
        count(*) filter (where status_tinjau = 'disetujui' and stok = 0)::int as habis,
        count(*) filter (where status_tinjau = 'disetujui' and stok between 1 and 5)::int as menipis
      from produk where penjual_id = ${s.pid}`,
    sql<{ id: number; nama: string; stok: number | null; status_tinjau: string; catatan_tinjau: string | null }[]>`
      select id, nama, stok, status_tinjau, catatan_tinjau from produk
      where penjual_id = ${s.pid} and (status_tinjau = 'ditolak' or (status_tinjau = 'disetujui' and stok is not null and stok <= 5))
      order by status_tinjau = 'ditolak' desc, stok asc nulls last limit 8`,
    sql<{ id: number; kode: string; nama_pembeli: string; total: number; items: PesananItem[]; created_at: Date }[]>`
      select id, kode, nama_pembeli, total, items, created_at from pesanan
      where penjual_id = ${s.pid} and status = 'baru' order by created_at desc, id desc limit 5`,
    sql<{ n: number; total: number | null }[]>`
      select count(*)::int as n, sum(total)::int as total from pesanan
      where penjual_id = ${s.pid} and status = 'selesai' and created_at > now() - interval '30 days'`,
  ]);

  const angka = [
    { label: "Produk tayang", nilai: stat.tayang, href: "/admin/toko/produk" },
    { label: "Menunggu tinjauan", nilai: stat.menunggu, href: "/admin/toko/produk" },
    { label: "Pesanan baru", nilai: pesananBaru.length, href: "/admin/toko/pesanan?status=baru" },
    { label: "Penjualan selesai (30 hari)", nilai: formatRupiah(omzet.total ?? 0), sub: `${omzet.n} pesanan`, href: "/admin/toko/pesanan?status=selesai" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm text-muted">Halo, {s.nama}</p>
      <h1 className="font-display mt-1 text-2xl font-semibold text-ink">{toko?.nama}</h1>

      <dl className="mt-6 grid grid-cols-2 border-y border-line sm:grid-cols-4">
        {angka.map((a, i) => (
          <div key={a.label} className={`py-4 ${i % 2 ? "border-l border-line pl-4" : "pr-4"} ${i >= 2 ? "border-t border-line sm:border-t-0" : ""} ${i === 2 ? "sm:border-l sm:pl-4" : ""}`}>
            <dt className="text-xs text-muted">{a.label}</dt>
            <dd className="mt-1 text-xl font-semibold text-ink tabular-nums">
              <Link href={a.href} className="hover:underline">{a.nilai}</Link>
              {a.sub ? <span className="block text-xs font-normal text-muted">{a.sub}</span> : null}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/toko/produk/baru" className="btn-primary">Tambah produk</Link>
        <Link href="/admin/toko/produk" className="btn-light">Perbarui harga & stok</Link>
      </div>

      {/* Yang perlu ditindaklanjuti */}
      <section className="mt-10" aria-labelledby="judul-baru">
        <div className="flex items-end justify-between border-b border-ink pb-2">
          <h2 id="judul-baru" className="font-semibold text-ink">Pesanan baru</h2>
          <Link href="/admin/toko/pesanan" className="link text-sm">Semua pesanan</Link>
        </div>
        {pesananBaru.length ? (
          <ul className="divide-y divide-line">
            {pesananBaru.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/toko/pesanan/${p.id}`} className="group flex items-start justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink group-hover:underline">{p.nama_pembeli}</span>
                    <span className="block truncate text-sm text-muted">{p.items.map((i) => `${i.qty}× ${i.nama}`).join(", ")}</span>
                    <span className="block text-xs text-muted tabular-nums">{p.kode} · {formatDateTime(p.created_at)}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-ink tabular-nums">{formatRupiah(p.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted">Tidak ada pesanan baru. Pesanan yang masuk juga dikirim pembeli ke WhatsApp Anda.</p>
        )}
      </section>

      {perlu.length ? (
        <section className="mt-10" aria-labelledby="judul-perlu">
          <h2 id="judul-perlu" className="border-b border-ink pb-2 font-semibold text-ink">Perlu perhatian</h2>
          <ul className="divide-y divide-line">
            {perlu.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="block font-semibold text-ink">{p.nama}</span>
                  <span className={`block ${p.status_tinjau === "ditolak" ? "text-red-700" : "text-sun-600"}`}>
                    {p.status_tinjau === "ditolak" ? `Perlu diperbaiki${p.catatan_tinjau ? `: ${p.catatan_tinjau}` : ""}` : p.stok === 0 ? "Stok habis — tidak bisa dipesan" : `Stok tinggal ${p.stok}`}
                  </span>
                </span>
                <Link href={p.status_tinjau === "ditolak" ? `/admin/toko/produk/${p.id}` : "/admin/toko/produk"} className="link shrink-0">
                  {p.status_tinjau === "ditolak" ? "Perbaiki" : "Tambah stok"}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10 rounded-md border border-line bg-white p-5 text-sm">
        <h2 className="font-semibold text-ink">Bagikan toko Anda</h2>
        <p className="mt-1 text-muted">Kirim tautan ini ke grup WhatsApp warga atau status WhatsApp:</p>
        <p className="mt-2 rounded-sm bg-paper px-3 py-2 font-mono text-[0.8125rem] break-all text-ink">/pasar?penjual={toko?.slug}</p>
        <Link href={`/pasar?penjual=${toko?.slug}`} target="_blank" className="link mt-3 inline-block">Buka halaman toko</Link>
      </section>
    </div>
  );
}
