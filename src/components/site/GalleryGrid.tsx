"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import type { Galeri } from "@/lib/types";

type Item = Pick<Galeri, "id" | "judul" | "deskripsi" | "gambar" | "album"> & { tanggalText: string };

export function GalleryGrid({ items }: { items: Item[] }) {
  const albums = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) m.set(i.album, (m.get(i.album) ?? 0) + 1);
    return Array.from(m.entries());
  }, [items]);
  const [album, setAlbum] = useState<string | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const shown = album ? items.filter((i) => i.album === album) : items;

  const close = useCallback(() => setIndex(null), []);
  const move = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + shown.length) % shown.length)), [shown.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, move]);

  const current = index !== null ? shown[index] : null;

  return (
    <>
      <div className="-mx-5 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0" role="group" aria-label="Filter album">
        <div className="flex min-w-max gap-6">
          {[[null, items.length] as const, ...albums].map(([a, n]) => (
            <button
              key={a ?? "semua"}
              type="button"
              aria-pressed={album === a}
              onClick={() => setAlbum(a)}
              className={`-mb-px border-b-2 py-3 text-sm font-semibold transition-colors ${
                album === a ? "border-brand-700 text-ink" : "border-transparent text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {a ?? "Semua album"} <span className="font-normal text-muted tabular-nums">{n}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((g, i) => (
          <li key={g.id}>
            <button type="button" onClick={() => setIndex(i)} className="group block w-full text-left" aria-label={`Perbesar foto: ${g.judul}`}>
              <img src={g.gambar} alt={g.judul} loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover transition-opacity group-hover:opacity-90" />
              <span className="mt-2 block text-sm leading-snug text-ink group-hover:underline">{g.judul}</span>
              <span className="block text-xs text-muted">
                {g.album}
                {g.tanggalText ? ` · ${g.tanggalText}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {current ? (
        <div role="dialog" aria-modal="true" aria-label={current.judul} className="fixed inset-0 z-[60] flex flex-col bg-brand-950/95 p-4 sm:p-6" onClick={close}>
          <div className="flex items-center justify-between text-sm text-brand-100">
            <span className="tabular-nums">{index! + 1} / {shown.length}</span>
            <button type="button" onClick={close} className="rounded-md p-2 text-white hover:bg-white/10" aria-label="Tutup" autoFocus>
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => move(-1)} className="hidden rounded-md p-3 text-white hover:bg-white/10 sm:block" aria-label="Foto sebelumnya">
              <Icon name="arrow" className="h-5 w-5 rotate-180" />
            </button>
            <figure className="max-w-5xl">
              <img src={current.gambar} alt={current.judul} className="max-h-[72vh] w-auto rounded-md object-contain" />
              <figcaption className="mt-4 max-w-[60ch] text-brand-50">
                <p className="font-semibold">{current.judul}</p>
                {current.deskripsi ? <p className="mt-1 text-sm text-brand-200">{current.deskripsi}</p> : null}
                <p className="mt-1 text-xs text-brand-300">
                  {current.album}
                  {current.tanggalText ? ` · ${current.tanggalText}` : ""}
                </p>
              </figcaption>
            </figure>
            <button type="button" onClick={() => move(1)} className="hidden rounded-md p-3 text-white hover:bg-white/10 sm:block" aria-label="Foto berikutnya">
              <Icon name="arrow" className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-center gap-3 pt-3 sm:hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => move(-1)} className="btn border border-white/25 text-white">Sebelumnya</button>
            <button type="button" onClick={() => move(1)} className="btn border border-white/25 text-white">Berikutnya</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
