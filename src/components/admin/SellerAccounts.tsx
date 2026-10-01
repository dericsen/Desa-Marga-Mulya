"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { aturAkunPenjual, buatAkunPenjual, hapusAkunPenjual, resetSandiPenjual, type FormState } from "@/app/admin/actions";
import { ConfirmButton } from "./ConfirmButton";

type Akun = { id: number; nama: string; email: string; aktif: boolean };

/** Sandi acak mudah dibaca/diketik di HP: tanpa huruf/angka yang mirip (0/O, 1/l). */
function sandiAcak(): string {
  const huruf = "abcdefghjkmnpqrstuvwxyz";
  const angka = "23456789";
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let out = "";
  for (let i = 0; i < 6; i++) out += pick(huruf);
  for (let i = 0; i < 4; i++) out += pick(angka);
  return out;
}

export function SellerAccounts({ penjualId, penjualNama, akun }: { penjualId: number; penjualNama: string; akun: Akun[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(buatAkunPenjual.bind(null, penjualId), null);
  const ref = useRef<HTMLFormElement>(null);
  const kirim = useRef<{ nama: string; login: string; password: string } | null>(null);
  const [dibuat, setDibuat] = useState<{ nama: string; login: string; password: string } | null>(null);
  const [sandi, setSandi] = useState("");
  useEffect(() => {
    if (state?.ok && kirim.current) {
      setDibuat(kirim.current);
      setSandi("");
      ref.current?.reset();
    }
  }, [state]);
  const loginUrl = typeof window !== "undefined" ? `${window.location.origin}/admin/login` : "/admin/login";
  const waPesan = dibuat
    ? `Halo ${dibuat.nama}, akun Pasar Desa untuk ${penjualNama} sudah dibuat.\n\nMasuk di: ${loginUrl}\nNomor HP: ${dibuat.login}\nKata sandi: ${dibuat.password}\n\nSetelah masuk, silakan ganti kata sandi di menu Akun.`
    : "";
  const waNomor = dibuat ? dibuat.login.replace(/\D/g, "").replace(/^0/, "62") : "";

  return (
    <section aria-labelledby="judul-akun-penjual" className="card mb-6 p-5 sm:p-6">
      <h2 id="judul-akun-penjual" className="font-semibold text-ink">Akun login penjual</h2>
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

      {dibuat ? (
        <div role="status" className="mt-5 rounded-2xl bg-brand-50 p-4 text-sm">
          <p className="font-semibold text-ink">Akun untuk {dibuat.nama} sudah dibuat. Berikan data login ini kepada penjual:</p>
          <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-y-1">
            <dt className="text-muted">Halaman masuk</dt>
            <dd className="break-all text-ink">{loginUrl}</dd>
            <dt className="text-muted">Nomor HP</dt>
            <dd className="font-semibold text-ink tabular-nums">{dibuat.login}</dd>
            <dt className="text-muted">Kata sandi</dt>
            <dd className="font-mono font-semibold text-ink">{dibuat.password}</dd>
          </dl>
          <p className="mt-3 text-xs text-muted">Kata sandi hanya ditampilkan sekali. Jika lupa, gunakan “Atur ulang sandi” di atas.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {/^62\d{8,}$/.test(waNomor) ? (
              <a href={`https://wa.me/${waNomor}?text=${encodeURIComponent(waPesan)}`} target="_blank" rel="noopener noreferrer" className="btn-primary py-2">Kirim lewat WhatsApp</a>
            ) : null}
            <button type="button" className="btn-light py-2" onClick={() => navigator.clipboard?.writeText(waPesan)}>Salin pesan</button>
            <button type="button" className="btn-light py-2" onClick={() => setDibuat(null)}>Tutup</button>
          </div>
        </div>
      ) : null}

      <form
        ref={ref}
        action={action}
        onSubmit={(e) => {
          const fd = new FormData(e.currentTarget);
          kirim.current = { nama: String(fd.get("nama") || "").trim(), login: String(fd.get("login") || "").trim(), password: String(fd.get("password") || "") };
        }}
        className="mt-5 grid gap-4 sm:grid-cols-3"
        noValidate
      >
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
          <div className="flex gap-2">
            <input id="akun-password" name="password" type="text" autoComplete="off" className="input font-mono" placeholder="min. 8 karakter" value={sandi} onChange={(e) => setSandi(e.target.value)} aria-invalid={Boolean(state?.errors?.password)} aria-describedby="akun-password-bantuan" />
            <button type="button" className="btn-light shrink-0 px-3" onClick={() => setSandi(sandiAcak())}>Buat acak</button>
          </div>
          {state?.errors?.password ? <p className="mt-1 text-sm text-red-700">{state.errors.password}</p> : null}
          <p id="akun-password-bantuan" className="mt-1 text-xs text-muted">Penjual masuk dengan nomor HP di samping dan kata sandi <strong>ini</strong>.</p>
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
          <span className="font-semibold text-ink">{a.nama}</span> <span className="text-muted tabular-nums">· {a.email}</span>
          {!a.aktif ? <span className="ml-2 rounded-sm border border-red-200 bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-700">Nonaktif</span> : null}
        </span>
        <span className="flex gap-3">
          <form action={aturAkunPenjual.bind(null, a.id, !a.aktif)}>
            <button type="submit" className="text-sm font-semibold text-brand-700 hover:underline">{a.aktif ? "Nonaktifkan" : "Aktifkan"}</button>
          </form>
          <form action={hapusAkunPenjual.bind(null, a.id)}>
            <ConfirmButton message={`Hapus akun ${a.nama}? Produk dan pesanan toko tetap ada.`} className="text-sm font-semibold text-red-700 hover:underline">Hapus</ConfirmButton>
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
