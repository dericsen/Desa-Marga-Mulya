"use client";

import { useActionState, useEffect, useRef } from "react";
import { addAdmin, changePassword, type FormState } from "@/app/admin/actions";

function Input({ name, label, type = "text", error, autoComplete }: { name: string; label: string; type?: string; error?: string; autoComplete?: string }) {
  const id = `acc-${name}`;
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} name={name} type={type} className="input" autoComplete={autoComplete} required aria-invalid={Boolean(error)} />
      {error ? <p className="mt-1 text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

function Status({ state }: { state: FormState }) {
  if (!state?.message) return null;
  return <p role="status" className={`text-sm font-semibold ${state.ok ? "text-brand-700" : "text-red-600"}`}>{state.message}</p>;
}

export function AccountForms() {
  const [pwState, pwAction, pwPending] = useActionState<FormState, FormData>(changePassword, null);
  const [adState, adAction, adPending] = useActionState<FormState, FormData>(addAdmin, null);
  const adRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (adState?.ok) adRef.current?.reset();
  }, [adState]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form action={pwAction} className="card space-y-4 p-5">
        <h2 className="font-bold text-stone-900">Ganti Kata Sandi</h2>
        <Input name="current" label="Kata sandi saat ini" type="password" autoComplete="current-password" error={pwState?.errors?.current} />
        <Input name="next" label="Kata sandi baru (min. 8 karakter)" type="password" autoComplete="new-password" error={pwState?.errors?.next} />
        <Input name="confirm" label="Ulangi kata sandi baru" type="password" autoComplete="new-password" error={pwState?.errors?.confirm} />
        <Status state={pwState} />
        <button type="submit" className="btn-primary" disabled={pwPending}>{pwPending ? "Menyimpan…" : "Ganti Kata Sandi"}</button>
      </form>

      <form ref={adRef} action={adAction} className="card space-y-4 p-5">
        <h2 className="font-bold text-stone-900">Tambah Admin</h2>
        <Input name="nama" label="Nama" error={adState?.errors?.nama} />
        <Input name="email" label="Email" type="email" error={adState?.errors?.email} />
        <Input name="password" label="Kata sandi awal" type="password" autoComplete="new-password" error={adState?.errors?.password} />
        <Status state={adState} />
        <button type="submit" className="btn-primary" disabled={adPending}>{adPending ? "Menyimpan…" : "Tambah Admin"}</button>
      </form>
    </div>
  );
}
