"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/admin/actions";

/** Panel keputusan tinjauan produk yang diajukan penjual. */
export function ReviewPanel({
  action,
  status,
  penjual,
  diajukan,
  catatan,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  status: string;
  penjual: string;
  diajukan: string | null;
  catatan: string | null;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);
  const [mode, setMode] = useState<"idle" | "tolak">("idle");

  if (state?.ok) {
    return (
      <div role="status" className="mb-6 border-l-2 border-brand-600 bg-brand-50 px-4 py-3 text-sm text-ink">
        {state.message} <span className="text-muted">Muat ulang halaman untuk melihat status terbaru.</span>
      </div>
    );
  }

  if (status === "disetujui") return null;

  return (
    <section aria-label="Tinjauan produk" className="mb-6 rounded-md border border-sun-400/60 bg-sun-50 p-5">
      <h2 className="font-bold text-ink">{status === "menunggu" ? "Produk menunggu tinjauan" : "Menunggu perbaikan dari penjual"}</h2>
      <p className="mt-1 text-sm text-ink/80">
        Diajukan oleh <strong className="font-bold">{penjual}</strong>
        {diajukan ? ` pada ${diajukan}` : ""}. Periksa nama, foto, harga, dan deskripsi di bawah sebelum memutuskan.
      </p>
      {status === "ditolak" && catatan ? <p className="mt-2 text-sm text-ink/80">Catatan terakhir: “{catatan}”</p> : null}

      <form action={formAction} className="mt-4">
        {mode === "tolak" ? (
          <div className="mb-3">
            <label htmlFor="catatan-tinjau" className="label">Apa yang perlu diperbaiki?</label>
            <textarea
              id="catatan-tinjau"
              name="catatan"
              rows={2}
              className="input"
              placeholder="mis. Foto terlalu gelap, mohon foto ulang di tempat terang."
              aria-invalid={Boolean(state?.errors?.catatan)}
              autoFocus
            />
            {state?.errors?.catatan ? <p className="mt-1 text-sm text-red-700">{state.errors.catatan}</p> : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {mode === "idle" ? (
            <>
              <button type="submit" name="keputusan" value="setujui" className="btn-primary" disabled={pending}>
                {pending ? "Menyimpan…" : "Setujui dan tayangkan"}
              </button>
              <button type="button" className="btn-light" onClick={() => setMode("tolak")}>Minta perbaikan</button>
            </>
          ) : (
            <>
              <button type="submit" name="keputusan" value="tolak" className="btn-primary" disabled={pending}>
                {pending ? "Mengirim…" : "Kirim ke penjual"}
              </button>
              <button type="button" className="btn-light" onClick={() => setMode("idle")}>Batal</button>
            </>
          )}
        </div>
        {state?.message && !state.ok ? <p className="mt-2 text-sm text-red-700">{state.message}</p> : null}
      </form>
    </section>
  );
}
