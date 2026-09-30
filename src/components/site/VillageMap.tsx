"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { LOKASI_TYPES } from "@/lib/categories";
import type { Lokasi } from "@/lib/types";

type Props = {
  center: [number, number];
  lokasi: Lokasi[];
  zoom?: number;
  height?: string;
  showFilter?: boolean;
};

type LeafletModule = typeof import("leaflet");
async function loadLeaflet(): Promise<LeafletModule> {
  const mod = (await import("leaflet")) as LeafletModule & { default?: LeafletModule };
  return mod.default ?? mod;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export function VillageMap({ center, lokasi, zoom = 15, height = "420px", showFilter = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [aktif, setAktif] = useState<string[]>(LOKASI_TYPES.map((t) => t.key));
  const [ready, setReady] = useState(false);

  const tersedia = useMemo(() => LOKASI_TYPES.filter((t) => lokasi.some((l) => l.kategori === t.key)), [lokasi]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await loadLeaflet();
      if (cancelled || !ref.current || mapRef.current) return;
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center, zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      const L = await loadLeaflet();
      const layer = layerRef.current;
      if (!layer) return;
      layer.clearLayers();
      for (const l of lokasi) {
        if (!aktif.includes(l.kategori)) continue;
        const tipe = LOKASI_TYPES.find((t) => t.key === l.kategori) ?? LOKASI_TYPES[LOKASI_TYPES.length - 1];
        L.circleMarker([l.lat, l.lng], { radius: 9, color: "#fff", weight: 2, fillColor: tipe.color, fillOpacity: 0.95 })
          .bindPopup(
            `<strong>${escapeHtml(l.nama)}</strong><br/><span style="color:${tipe.color};font-weight:600">${escapeHtml(tipe.label)}</span>${
              l.deskripsi ? `<br/>${escapeHtml(l.deskripsi)}` : ""
            }`
          )
          .addTo(layer);
      }
    })();
  }, [ready, lokasi, aktif]);

  const toggle = (key: string) => setAktif((a) => (a.includes(key) ? a.filter((k) => k !== key) : [...a, key]));

  return (
    <div>
      {showFilter && tersedia.length > 0 ? (
        <fieldset className="mb-3">
          <legend className="sr-only">Tampilkan kategori lokasi</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {tersedia.map((t) => (
              <label key={t.key} className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink select-none">
                <input type="checkbox" checked={aktif.includes(t.key)} onChange={() => toggle(t.key)} className="h-4 w-4 accent-brand-700" />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} aria-hidden="true" />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <div ref={ref} style={{ height }} className="w-full overflow-hidden rounded-md border border-line bg-line/40" role="region" aria-label="Peta interaktif desa" />
      {lokasi.length > 0 ? (
        <details className="mt-3 text-sm text-muted">
          <summary className="cursor-pointer font-semibold text-brand-700 hover:underline">Daftar lokasi ({lokasi.length})</summary>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {lokasi.map((l) => (
              <li key={l.id}>
                <a
                  className="hover:underline"
                  href={`https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.nama}
                </a>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
