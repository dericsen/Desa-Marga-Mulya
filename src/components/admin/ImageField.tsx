"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";

async function resizeImage(file: File, maxSize = 1600, quality = 0.82): Promise<Blob> {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality));
}

export function ImageField({ name, defaultValue, id }: { name: string; defaultValue?: string | null; id: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Berkas harus berupa gambar.");
      return;
    }
    setBusy(true);
    setStatus("Mengunggah gambar…");
    try {
      const blob = await resizeImage(file);
      const body = new FormData();
      const ext = blob.type === "image/jpeg" ? "jpg" : file.name.split(".").pop() || "img";
      body.append("file", blob, `${file.name.replace(/\.[^.]+$/, "") || "gambar"}.${ext}`);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Gagal mengunggah.");
      setValue(data.url);
      setStatus("Gambar berhasil diunggah. Jangan lupa klik Simpan.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Gagal mengunggah gambar.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-stone-300 p-3">
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-stone-100">
          {value ? (
            <img src={value} alt="Pratinjau gambar" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-stone-400">
              <Icon name="image" className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <label className={`btn-light cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
              <Icon name="plus" className="h-4 w-4" /> {value ? "Ganti Gambar" : "Unggah Gambar"}
              <input ref={fileRef} id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {value ? (
              <button type="button" className="btn-light text-red-600" onClick={() => setValue("")}>
                <Icon name="trash" className="h-4 w-4" /> Hapus
              </button>
            ) : null}
          </div>
          <input
            type="text"
            value={value.startsWith("data:") ? "(gambar tersimpan di database)" : value}
            onChange={(e) => setValue(e.target.value)}
            readOnly={value.startsWith("data:")}
            placeholder="atau tempel URL gambar (https://…)"
            className="input text-xs"
            aria-label="URL gambar"
          />
          {status ? <p className="text-xs text-stone-500" role="status">{status}</p> : null}
        </div>
      </div>
    </div>
  );
}
