"use client";

import Link from "next/link";
import { RupiahInput } from "./RupiahInput";
import { useActionState } from "react";
import type { FormState } from "@/app/admin/actions";
import { updateHargaStok } from "@/app/admin/toko/actions";
import { statusProdukPenjual } from "@/lib/categories";

type P = {
  id: number;
  nama: string;
  satuan: string | null;
  harga: number;
  stok: number | null;
  tersedia: boolean;
  gambar: string | null;
  status_tinjau: string;
  catatan_tinjau: string | null;
};

const TONE: Record<string, string> = {
  live: "border-brand-200 bg-brand-50 text-brand-700",
  wait: "border-ink/40 bg-white text-ink",
  fix: "border-red-200 bg-red-50 text-red-700",
  off: "border-line-strong bg-paper text-muted",
};

/** Satu baris produk: status, lalu ubah harga/stok/tampil langsung di tempat. */
export function QuickStockRow({ p }: { p: P }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateHargaStok.bind(null, p.id), null);
  const st = statusProdukPenjual(p);

  return (
    <li className="py-5" data-produk={p.nama}>
      <div className="grid grid-cols-[3.5rem_1fr] gap-3 sm:grid-cols-[4rem_1fr]">
        {p.gambar ? <img src={p.gambar} alt="" className="aspect-square w-14 rounded-md object-cover sm:w-16" /> : <div className="aspect-square w-14 rounded-md bg-line/60 sm:w-16" />}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href={`/admin/toko/produk/${p.id}`} className="font-semibold text-ink hover:underline">{p.nama}</Link>
            <span className={`rounded-sm border px-1.5 py-0.5 text-xs font-semibold ${TONE[st.tone]}`}>{st.label}</span>
          </div>
          {p.satuan ? <p className="text-sm text-muted">{p.satuan}</p> : null}
          {p.status_tinjau === "ditolak" && p.catatan_tinjau ? (
            <p className="mt-1.5 border-l-2 border-red-600 pl-2 text-sm text-red-800">
              Catatan admin: {p.catatan_tinjau} <Link href={`/admin/toko/produk/${p.id}`} className="font-semibold underline">Perbaiki</Link>
            </p>
          ) : null}
          {p.status_tinjau === "menunggu" ? <p className="mt-1 text-xs text-muted">Produk tampil di Pasar Desa setelah disetujui admin desa.</p> : null}

          <form action={action} className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor={`harga-${p.id}`} className="block text-xs font-semibold text-muted">Harga</label>
              <RupiahInput id={`harga-${p.id}`} name="harga" defaultValue={p.harga} className="mt-1 w-36 [&_input]:py-2" invalid={Boolean(state?.errors?.harga)} />
            </div>
            <div>
              <label htmlFor={`stok-${p.id}`} className="block text-xs font-semibold text-muted">Stok</label>
              <input id={`stok-${p.id}`} name="stok" inputMode="numeric" defaultValue={p.stok ?? ""} placeholder="∞" className="input mt-1 w-20 py-2 tabular-nums" aria-invalid={Boolean(state?.errors?.stok)} />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-ink">
              <input type="checkbox" name="tersedia" defaultChecked={p.tersedia} className="h-4 w-4 accent-brand-700" />
              Dijual
            </label>
            <button type="submit" className="btn-light py-2" disabled={pending} aria-label={`Simpan harga dan stok ${p.nama}`}>
              {pending ? "Menyimpan…" : "Simpan"}
            </button>
            {state?.message ? (
              <span role="status" className={`pb-2 text-sm ${state.ok ? "text-brand-700" : "text-red-700"}`}>
                {state.ok ? "✓ " : ""}
                {state.message}
              </span>
            ) : null}
          </form>
        </div>
      </div>
    </li>
  );
}
