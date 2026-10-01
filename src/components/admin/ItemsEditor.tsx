"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

type Row = { label: string; nilai: string };

export function ItemsEditor({ name, defaultValue }: { name: string; defaultValue?: { label: string; nilai: string | number }[] | null }) {
  const [rows, setRows] = useState<Row[]>(
    (defaultValue && defaultValue.length ? defaultValue : [{ label: "", nilai: "" }]).map((r) => ({ label: String(r.label ?? ""), nilai: String(r.nilai ?? "") }))
  );

  const update = (i: number, key: keyof Row, v: string) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  const remove = (i: number) => setRows((r) => r.filter((_, j) => j !== i));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const copy = [...r];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <div className="rounded-xl border border-stone-200">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <div className="grid grid-cols-[1fr_140px_92px] gap-2 border-b border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-500 uppercase">
        <span>Label</span>
        <span>Nilai</span>
        <span className="sr-only">Aksi</span>
      </div>
      <ul className="divide-y divide-stone-100">
        {rows.map((row, i) => (
          <li key={i} className="grid grid-cols-[1fr_140px_92px] items-center gap-2 px-3 py-2">
            <input value={row.label} onChange={(e) => update(i, "label", e.target.value)} className="input py-2" aria-label={`Label baris ${i + 1}`} placeholder="mis. Laki-laki" />
            <input value={row.nilai} onChange={(e) => update(i, "nilai", e.target.value)} className="input py-2" aria-label={`Nilai baris ${i + 1}`} placeholder="0" inputMode="decimal" />
            <div className="flex justify-end gap-1">
              <button type="button" onClick={() => move(i, -1)} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100" aria-label="Naikkan">
                <Icon name="arrow" className="h-4 w-4 -rotate-90" />
              </button>
              <button type="button" onClick={() => move(i, 1)} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100" aria-label="Turunkan">
                <Icon name="arrow" className="h-4 w-4 rotate-90" />
              </button>
              <button type="button" onClick={() => remove(i)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" aria-label="Hapus baris">
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-stone-200 p-2">
        <button type="button" onClick={() => setRows((r) => [...r, { label: "", nilai: "" }])} className="btn-light py-2 text-xs">
          <Icon name="plus" className="h-4 w-4" /> Tambah Baris
        </button>
      </div>
    </div>
  );
}
