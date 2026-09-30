"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

/** Jendela detail produk yang dirender server lewat parameter ?produk=; tutup kembali ke daftar. */
export function ProductDialog({ closeHref, title, children }: { closeHref: string; title: string; children: ReactNode }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push(closeHref, { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [closeHref, router]);

  const close = () => router.push(closeHref, { scroll: false });

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 h-full w-full cursor-default bg-ink/45" aria-label="Tutup detail produk" onClick={close} tabIndex={-1} />
      <div ref={ref} tabIndex={-1} className="relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-md bg-paper focus:outline-none sm:rounded-md">
        <button type="button" onClick={close} className="absolute top-3 right-3 z-10 rounded-md bg-white/90 p-1.5 text-ink hover:bg-white" aria-label="Tutup">
          <Icon name="close" className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
