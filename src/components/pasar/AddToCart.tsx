"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./CartContext";

type Props = {
  product: Omit<CartItem, "qty">;
  tersedia: boolean;
  variant?: "compact" | "full";
};

/** Tombol tambah ke keranjang. Menampilkan status "Habis" dan konfirmasi singkat setelah ditambahkan. */
export function AddToCart({ product, tersedia, variant = "compact" }: Props) {
  const { add, items, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.id === product.id)?.qty ?? 0;
  const habis = !tersedia || product.stok === 0;
  const sisa = product.stok === null ? null : Math.max(product.stok - inCart, 0);
  const penuh = sisa !== null && sisa <= 0;

  if (habis) {
    return (
      <p className="text-sm font-semibold text-muted" aria-live="polite">
        Stok habis
      </p>
    );
  }

  function tambah() {
    add(product, qty);
    setAdded(true);
    setQty(1);
    window.setTimeout(() => setAdded(false), 2200);
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        <button type="button" onClick={tambah} disabled={penuh} className="btn-light py-2" aria-label={`Tambah ke keranjang: ${product.nama}`}>
          {added ? "Ditambahkan ✓" : "Tambah"}
        </button>
        {inCart > 0 ? <span className="text-xs text-muted tabular-nums">{inCart} di keranjang</span> : null}
      </div>
    );
  }

  const maxQty = sisa ?? 99;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-md border border-line-strong bg-white" role="group" aria-label="Jumlah">
          <button type="button" className="px-3 py-2 text-lg leading-none text-ink disabled:text-stone-300" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Kurangi jumlah">
            −
          </button>
          <span className="w-10 text-center font-semibold tabular-nums" aria-live="polite">{qty}</span>
          <button type="button" className="px-3 py-2 text-lg leading-none text-ink disabled:text-stone-300" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Tambah jumlah">
            +
          </button>
        </div>
        <button type="button" onClick={tambah} disabled={penuh} className="btn-primary px-5" aria-label={`Tambah ke keranjang: ${product.nama}`}>
          {penuh ? "Stok sudah di keranjang" : "Tambah ke keranjang"}
        </button>
      </div>
      <p className="mt-2 min-h-5 text-sm text-muted" aria-live="polite">
        {added ? (
          <>
            Ditambahkan.{" "}
            <button type="button" className="link" onClick={() => setOpen(true)}>Lihat keranjang</button>
          </>
        ) : sisa !== null ? (
          `Tersisa ${sisa}${inCart ? ` (${inCart} sudah di keranjang)` : ""}`
        ) : (
          "Selalu tersedia"
        )}
      </p>
    </div>
  );
}
