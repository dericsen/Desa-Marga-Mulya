"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: number;
  slug: string;
  nama: string;
  harga: number;
  satuan: string | null;
  gambar: string | null;
  penjualId: number;
  penjualNama: string;
  /** null = tidak dibatasi */
  stok: number | null;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "mm_keranjang_v1";

const clampQty = (qty: number, stok: number | null) => Math.max(1, Math.min(qty, stok ?? 99, 99));

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter((i) => i && typeof i.id === "number" && typeof i.qty === "number"));
      }
    } catch {
      /* data rusak diabaikan */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.id === item.id);
      if (found) return cur.map((i) => (i.id === item.id ? { ...i, ...item, qty: clampQty(i.qty + qty, item.stok) } : i));
      return [...cur, { ...item, qty: clampQty(qty, item.stok) }];
    });
  }, []);

  const setQty = useCallback((id: number, qty: number) => {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, qty: clampQty(qty, i.stok) } : i)));
  }, []);
  const remove = useCallback((id: number) => setItems((cur) => cur.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.harga, 0),
      ready,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    }),
    [items, ready, open, add, setQty, remove, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart harus dipakai di dalam CartProvider");
  return c;
}
