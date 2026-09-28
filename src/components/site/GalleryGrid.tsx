"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import type { Galeri } from "@/lib/types";

type Item = Pick<Galeri, "id" | "judul" | "deskripsi" | "gambar" | "album"> & { tanggalText: string };

export function GalleryGrid({ items }: { items: Item[] }) {
  const albums = useMemo(() => Array.from(new Set(items.map((i) => i.album))), [items]);
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
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter album">
        {[null, ...albums].map((a) => (
          <button
            key={a ?? "semua"}
            type="button"
            aria-pressed={album === a}
            onClick={() => setAlbum(a)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${album === a ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50"}`}
          >
            {a ?? "Semua Album"}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((g, i) => (
          <li key={g.id}>
            <button type="button" onClick={() => setIndex(i)} className="group relative block w-full overflow-hidden rounded-2xl text-left" aria-label={`Perbesar foto: ${g.judul}`}>
              <img src={g.gambar} alt={g.judul} loading="lazy" className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3">
                <span className="block text-sm font-semibold text-white">{g.judul}</span>
                <span className="block text-xs text-white/80">{g.album}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {current ? (
        <div role="dialog" aria-modal="true" aria-label={current.judul} className="fixed inset-0 z-[60] flex flex-col bg-black/90 p-4" onClick={close}>
          <div className="flex justify-end">
            <button type="button" onClick={close} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Tutup" autoFocus>
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => move(-1)} className="absolute left-0 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Foto sebelumnya">
              <Icon name="arrow" className="h-5 w-5 rotate-180" />
            </button>
            <figure className="max-h-full max-w-5xl">
              <img src={current.gambar} alt={current.judul} className="max-h-[70vh] w-auto rounded-xl object-contain" />
              <figcaption className="mt-4 text-center text-white">
                <p className="font-bold">{current.judul}</p>
                {current.deskripsi ? <p className="text-sm text-white/80">{current.deskripsi}</p> : null}
                <p className="mt-1 text-xs text-white/60">
                  {current.album}
                  {current.tanggalText ? ` · ${current.tanggalText}` : ""} · {index! + 1}/{shown.length}
                </p>
              </figcaption>
            </figure>
            <button type="button" onClick={() => move(1)} className="absolute right-0 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Foto berikutnya">
              <Icon name="arrow" className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
