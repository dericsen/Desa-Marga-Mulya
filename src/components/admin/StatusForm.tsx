"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/actions";
import { PESANAN_STATUS } from "@/lib/categories";

export function StatusForm({ action, current }: { action: (prev: FormState, fd: FormData) => Promise<FormState>; current: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <label htmlFor="status" className="text-sm text-muted">Status</label>
      <select key={current} id="status" name="status" defaultValue={current} className="input w-auto py-2">
        {PESANAN_STATUS.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
      <button type="submit" className="btn-primary py-2" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan status"}
      </button>
      {state?.message ? (
        <p role="status" className={`w-full text-sm ${state.ok ? "text-brand-700" : "text-red-700"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
