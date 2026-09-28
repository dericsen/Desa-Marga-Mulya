"use client";

import { useActionState, useEffect, useRef } from "react";
import { kirimPesan, type KontakState } from "@/app/(site)/kontak/actions";
import { Icon } from "@/components/Icon";

export function ContactForm() {
  const [state, action, pending] = useActionState<KontakState, FormData>(kirimPesan, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const err = (name: string) => state?.errors?.[name];

  return (
    <form ref={formRef} action={action} className="card space-y-4 p-6 sm:p-8" noValidate>
      <div>
        <h2 className="text-xl font-extrabold text-stone-900">Kirim Pesan & Aspirasi</h2>
        <p className="mt-1 text-sm text-stone-500">Pesan akan diterima oleh admin desa melalui CMS.</p>
      </div>

      <div className="hidden" aria-hidden="true">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Nama Lengkap" name="nama" required error={err("nama")} autoComplete="name" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" error={err("email")} autoComplete="email" />
        <Field label="Nomor Telepon / WhatsApp" name="telepon" type="tel" error={err("telepon")} autoComplete="tel" />
      </div>
      <Field label="Subjek" name="subjek" error={err("subjek")} placeholder="mis. Pertanyaan layanan surat domisili" />
      <div>
        <label htmlFor="pesan" className="label">
          Pesan <span className="text-red-600">*</span>
        </label>
        <textarea
          id="pesan"
          name="pesan"
          rows={5}
          required
          className="input"
          aria-invalid={Boolean(err("pesan"))}
          aria-describedby={err("pesan") ? "pesan-error" : undefined}
        />
        {err("pesan") ? <p id="pesan-error" className="mt-1 text-sm text-red-600">{err("pesan")}</p> : null}
      </div>

      {state?.message ? (
        <p role="status" className={`rounded-xl p-3 text-sm font-semibold ${state.ok ? "bg-brand-50 text-brand-800" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
        <Icon name="send" className="h-4 w-4" />
        {pending ? "Mengirim…" : "Kirim Pesan"}
      </button>
    </form>
  );
}

function Field({
  label, name, type = "text", required, error, placeholder, autoComplete,
}: { label: string; name: string; type?: string; required?: boolean; error?: string; placeholder?: string; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label} {required ? <span className="text-red-600">*</span> : null}
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
      {error ? <p id={`${name}-error`} className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
