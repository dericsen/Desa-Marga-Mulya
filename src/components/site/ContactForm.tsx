"use client";

import { useActionState, useEffect, useRef } from "react";
import { kirimPesan, type KontakState } from "@/app/(site)/kontak/actions";

const SUBJEK = ["Pertanyaan layanan administrasi", "Pengaduan atau laporan", "Aspirasi dan usulan", "Informasi UMKM atau wisata", "Lainnya"];

export function ContactForm() {
  const [state, action, pending] = useActionState<KontakState, FormData>(kirimPesan, null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
    if (state) statusRef.current?.focus();
  }, [state]);

  const err = (name: string) => state?.errors?.[name];

  if (state?.ok) {
    return (
      <div className="rounded-2xl bg-paper p-6 text-ink sm:p-9" role="status">
        <h2 className="font-display text-xl font-bold text-ink">Terima kasih! Pesan Anda sudah kami terima.</h2>
        <p className="mt-2 leading-relaxed text-ink/80">
          Pesan akan dibaca oleh petugas kantor desa pada jam layanan. Balasan dikirim melalui email atau nomor telepon yang Anda cantumkan.
        </p>
        <button type="button" className="link mt-4 text-sm" onClick={() => window.location.reload()}>
          Kirim pesan lain
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="rounded-2xl bg-paper p-6 sm:p-9" noValidate>
      <h2 className="font-display text-2xl font-bold text-ink">Kirim Pesan & Aspirasi</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Pesan diterima langsung oleh admin desa. Isi email atau nomor telepon agar kami dapat membalas. Kolom bertanda * wajib diisi.
      </p>

      <div className="hidden" aria-hidden="true">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-6 space-y-5">
        <Field label="Nama lengkap" name="nama" required error={err("nama")} autoComplete="name" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" name="email" type="email" error={err("email")} autoComplete="email" />
          <Field label="Nomor telepon atau WhatsApp" name="telepon" type="tel" error={err("telepon")} autoComplete="tel" placeholder="08xx xxxx xxxx" />
        </div>
        <div>
          <label htmlFor="subjek" className="label">Perihal</label>
          <input id="subjek" name="subjek" list="subjek-list" className="input" placeholder="Pilih atau tulis perihal" aria-invalid={Boolean(err("subjek"))} />
          <datalist id="subjek-list">
            {SUBJEK.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          {err("subjek") ? <p className="mt-1.5 text-sm text-red-700">{err("subjek")}</p> : null}
        </div>
        <div>
          <label htmlFor="pesan" className="label">
            Pesan <span className="text-red-700">*</span>
          </label>
          <textarea
            id="pesan"
            name="pesan"
            rows={6}
            required
            className="input leading-relaxed"
            placeholder="Tuliskan pertanyaan, laporan, atau usulan Anda. Sertakan RT/RW bila terkait lokasi tertentu."
            aria-invalid={Boolean(err("pesan"))}
            aria-describedby={err("pesan") ? "pesan-error" : "pesan-hint"}
          />
          {err("pesan") ? (
            <p id="pesan-error" className="mt-1.5 text-sm text-red-700">{err("pesan")}</p>
          ) : (
            <p id="pesan-hint" className="mt-1.5 text-xs text-muted">Minimal 10 karakter.</p>
          )}
        </div>
      </div>

      {state?.message && !state.ok ? (
        <p ref={statusRef} tabIndex={-1} role="alert" className="mt-5 border-l-2 border-red-600 pl-3 text-sm text-red-700 focus:outline-none">
          {state.message}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary px-5" disabled={pending}>
          {pending ? "Mengirim…" : "Kirim Pesan"}
        </button>
        <p className="text-xs text-muted">Data Anda hanya dipakai untuk menindaklanjuti pesan ini.</p>
      </div>
    </form>
  );
}

function Field({
  label, name, type = "text", required, error, placeholder, autoComplete,
}: { label: string; name: string; type?: string; required?: boolean; error?: string; placeholder?: string; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label} {required ? <span className="text-red-700">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error ? <p id={`${name}-error`} className="mt-1.5 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
