"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);
  return (
    <form action={action} className="card space-y-4 p-6">
      <h1 className="text-xl font-extrabold text-stone-900">Masuk Admin</h1>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" defaultValue={String(state?.values?.email ?? "")} />
      </div>
      <div>
        <label htmlFor="password" className="label">Kata Sandi</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state?.message ? (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{state.message}</p>
      ) : null}
      <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
