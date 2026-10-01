"use client";

import { useRef, useState } from "react";

const MAX_DIGIT = 10; // sampai Rp 9.999.999.999

/** "45000" / 45000 → "45.000" */
export function formatRibuan(v: string | number | null | undefined): string {
  const d = String(v ?? "").replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_DIGIT);
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Input harga: titik ribuan muncul otomatis saat mengetik (10000 → 10.000).
 * Nilai yang dikirim tetap teks berformat; server membuang titiknya.
 * Posisi kursor dijaga agar tidak melompat ke akhir saat mengedit di tengah.
 */
export function RupiahInput({
  id,
  name,
  defaultValue,
  className = "",
  required,
  invalid,
  describedBy,
  placeholder = "45.000",
}: {
  id: string;
  name: string;
  defaultValue?: string | number | null;
  className?: string;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
}) {
  const [nilai, setNilai] = useState(() => formatRibuan(defaultValue));
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted" aria-hidden="true">Rp</span>
      <input
        ref={ref}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={required}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        placeholder={placeholder}
        value={nilai}
        onChange={(e) => {
          const el = e.target;
          const caret = el.selectionStart ?? el.value.length;
          // Jumlah digit di kanan kursor dipertahankan setelah diformat ulang.
          const digitKanan = el.value.slice(caret).replace(/\D/g, "").length;
          const baru = formatRibuan(el.value);
          setNilai(baru);
          requestAnimationFrame(() => {
            const input = ref.current;
            if (!input || document.activeElement !== input) return;
            let pos = baru.length;
            for (let n = 0; pos > 0 && n < digitKanan; pos--) if (/\d/.test(baru[pos - 1])) n++;
            input.setSelectionRange(pos, pos);
          });
        }}
        className="input pl-10 tabular-nums"
      />
    </div>
  );
}
