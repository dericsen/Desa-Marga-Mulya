"use client";

import type { Field } from "@/lib/resources";
import { ImageField } from "./ImageField";
import { ItemsEditor } from "./ItemsEditor";

export function FieldInput({ field, value, error }: { field: Field; value: unknown; error?: string }) {
  const id = `f-${field.name}`;
  const describedBy = [field.help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const common = { id, name: field.name, "aria-invalid": Boolean(error), "aria-describedby": describedBy };
  const str = value === null || value === undefined ? "" : String(value);

  let control: React.ReactNode;
  switch (field.type) {
    case "textarea":
      control = <textarea {...common} rows={4} defaultValue={str} className="input" required={field.required} placeholder={field.placeholder} />;
      break;
    case "markdown":
      control = <textarea {...common} rows={14} defaultValue={str} className="input font-mono text-[13px] leading-relaxed" required={field.required} />;
      break;
    case "list":
      control = <textarea {...common} rows={6} defaultValue={Array.isArray(value) ? value.join("\n") : str} className="input" />;
      break;
    case "number":
      control = <input {...common} type="number" step={field.step ?? "1"} defaultValue={str} className="input" required={field.required} placeholder={field.placeholder} />;
      break;
    case "date":
      control = <input {...common} type="date" defaultValue={str} className="input" required={field.required} />;
      break;
    case "email":
      control = <input {...common} type="email" defaultValue={str} className="input" required={field.required} />;
      break;
    case "relation":
      control = (
        <select {...common} defaultValue={str} className="input" required={field.required}>
          <option value="" disabled>
            Pilih {field.label.toLowerCase()}
          </option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      if (!field.options?.length) {
        control = (
          <>
            {control}
            <p className="mt-1 text-xs text-sun-600">Belum ada data {field.label.toLowerCase()}. Tambahkan terlebih dahulu di menunya.</p>
          </>
        );
      }
      break;
    case "select":
      control = (
        <select {...common} defaultValue={str || field.options?.[0]?.value} className="input" required={field.required}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "boolean":
      return (
        <div className={field.wide ? "sm:col-span-2" : ""}>
          <label htmlFor={id} className="flex h-full cursor-pointer items-center gap-3 rounded-xl border border-stone-200 px-3 py-3 text-sm font-semibold text-stone-700">
            <input id={id} name={field.name} type="checkbox" defaultChecked={Boolean(value)} className="h-5 w-5 accent-brand-700" />
            {field.label}
          </label>
        </div>
      );
    case "image":
      control = <ImageField id={id} name={field.name} defaultValue={str} />;
      break;
    case "items":
      control = <ItemsEditor name={field.name} defaultValue={Array.isArray(value) ? value : []} />;
      break;
    default:
      control = <input {...common} type="text" defaultValue={str} className="input" required={field.required} placeholder={field.placeholder} />;
  }

  return (
    <div className={field.wide ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="label">
        {field.label} {field.required ? <span className="text-red-600">*</span> : null}
      </label>
      {control}
      {field.help ? <p id={`${id}-help`} className="mt-1 text-xs text-stone-500">{field.help}</p> : null}
      {error ? <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
