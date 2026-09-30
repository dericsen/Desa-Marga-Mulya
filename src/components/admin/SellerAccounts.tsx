"use client";

import { useActionState, useEffect, useRef } from "react";
import { aturAkunPenjual, buatAkunPenjual, hapusAkunPenjual, resetSandiPenjual, type FormState } from "@/app/admin/actions";
import { ConfirmButton } from "./ConfirmButton";

type Akun = { id: number; nama: string; email: string; aktif: boolean };

export function SellerAccounts({ penjualId, penjualNama, akun }: { penjualId: number; penjualNama: string; akun: Akun[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(buatAkunPenjual.bind(null, penjualId), null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <section aria-labelledby="judul-akun-penjual" className="card mb-6 p-5 sm:p-6">
      <h2 id="judul-akun-penjual" className="font-bold text-ink">Akun login penjual</h2>
      <p className="mt-1 text-sm text-muted">
        Penjual yang punya akun dapat menambah produk (ditinjau admin), mengubah harga & stok, dan mengelola pesanan tokonya sendiri di <span className="font-mono text-xs">/admin</span>.
      </p>

      {akun.length ? (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {akun.map((a) => (
            <AkunRow key={a.id} a={a} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">{penjualNama} belum memiliki akun.</p>
      )}

      <form ref={ref} action={action} className="mt-5 grid gap-4 sm:grid-cols-3" noValidate>
        <div>
          <label htmlFor="akun-nama" className="label">Nama pemegang akun</label>
          <input id="akun-nama" name="nama" className="input" defaultValue={String(state?.values?.nama ?? "")} aria-invalid={Boolean(state?.errors?.nama)} />
          {state?.errors?.nama ? <p className="mt-1 text-sm text-red-700">{state.errors.nama}</p> : null}
        </div>
        <div>
          <label htmlFor="akun-login" className="label">Nomor HP atau email</label>
          <input id="akun-login" name="login" className="input" placeholder="0812…" defaultValue={String(state?.values?.login ?? "")} aria-invalid={Boolean(state?.errors?.login)} />
          {state?.errors?.login ? <p className="mt-1 text-sm text-red-700">{state.errors.login}</p> : null}
        </div>
        <div>
          <label htmlFor="akun-password" className="label">Kata sandi awal</label>
          <input id="akun-password" name="password" type="text" autoComplete="off" className="input" placeholder="min. 8 karakter" aria-invalid={Boolean(state?.errors?.password)} />
          {state?.errors?.password ? <p className="mt-1 text-sm text-red-700">{state.errors.password}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
          <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Membuat…" : "Buat akun penjual"}</button>
          {state?.message ? <p role="status" className={`text-sm ${state.ok ? "text-brand-700" : "text-red-700"}`}>{state.message}</p> : null}
        </div>
      </form>
    </section>
  );
}

function AkunRow({ a }: { a: Akun }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetSandiPenjual.bind(null, a.id), null);
  return (
    <li className="py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          <span className="font-bold text-ink">{a.nama}</span> <span className="text-muted tabular-nums">· {a.email}</span>
          {!a.aktif ? <span className="ml-2 rounded-sm border border-red-200 bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-700">Nonaktif</span> : null}
        </span>
        <span className="flex gap-3">
          <form action={aturAkunPenjual.bind(null, a.id, !a.aktif)}>
            <button type="submit" className="text-sm font-bold text-brand-700 hover:underline">{a.aktif ? "Nonaktifkan" : "Aktifkan"}</button>
          </form>
          <form action={hapusAkunPenjual.bind(null, a.id)}>
            <ConfirmButton message={`Hapus akun ${a.nama}? Produk dan pesanan toko tetap ada.`} className="text-sm font-bold text-red-700 hover:underline">Hapus</ConfirmButton>
          </form>
        </span>
      </div>
      <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
        <label htmlFor={`reset-${a.id}`} className="sr-only">Kata sandi baru untuk {a.nama}</label>
        <input id={`reset-${a.id}`} name="password" type="text" autoComplete="off" placeholder="Kata sandi baru" className="input w-48 py-1.5" />
        <button type="submit" className="btn-light py-1.5" disabled={pending}>Atur ulang sandi</button>
        {state?.errors?.password || state?.message ? (
          <span role="status" className={`text-xs ${state?.ok ? "text-brand-700" : "text-red-700"}`}>{state?.errors?.password ?? state?.message}</span>
        ) : null}
      </form>
    </li>
  );
}
