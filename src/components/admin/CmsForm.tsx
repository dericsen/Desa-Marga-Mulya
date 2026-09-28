"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import type { FormState } from "@/app/admin/actions";
import { Icon } from "@/components/Icon";
import type { Field } from "@/lib/resources";
import { FieldInput } from "./FieldInput";

type Group = { title?: string; description?: string; fields: Field[] };

export function CmsForm({
  action,
  groups,
  initial,
  submitLabel = "Simpan",
  cancelHref,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  groups: Group[];
  initial: Record<string, unknown>;
  submitLabel?: string;
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);
  // React 19 mengosongkan form setelah aksi selesai; remount field memakai nilai terakhir.
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (state) setVersion((v) => v + 1);
  }, [state]);

  const values = { ...initial, ...(state?.values ?? {}) };

  return (
    <form action={formAction} className="space-y-6">
      <div key={version} className="space-y-6">
        {groups.map((g, gi) => (
          <fieldset key={gi} className="card p-5 sm:p-6">
            {g.title ? (
              <legend className="contents">
                <span className="block text-lg font-bold text-stone-900">{g.title}</span>
                {g.description ? <span className="mt-0.5 block text-sm text-stone-500">{g.description}</span> : null}
              </legend>
            ) : null}
            <div className={`grid gap-5 sm:grid-cols-2 ${g.title ? "mt-5" : ""}`}>
              {g.fields.map((f) => (
                <FieldInput key={f.name} field={f} value={values[f.name]} error={state?.errors?.[f.name]} />
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
        <button type="submit" className="btn-primary" disabled={pending}>
          <Icon name="send" className="h-4 w-4" /> {pending ? "Menyimpan…" : submitLabel}
        </button>
        {cancelHref ? (
          <Link href={cancelHref} className="btn-light">
            Batal
          </Link>
        ) : null}
        {state?.message ? (
          <p role="status" className={`text-sm font-semibold ${state.ok ? "text-brand-700" : "text-red-600"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
