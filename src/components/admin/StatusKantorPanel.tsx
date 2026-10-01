"use client";

import { useActionState, useEffect, useState } from "react";
import { aturStatusKantor, type FormState } from "@/app/admin/actions";
import { OfficeStatus } from "@/components/site/OfficeStatus";
import { manualBerlaku, type StatusManual } from "@/lib/jam";

const MODE = [
  { key: "otomatis", label: "Otomatis", desc: "Ikut jam layanan" },
  { key: "buka", label: "Buka", desc: "Tandai sedang buka" },
  { key: "tutup", label: "Tutup sementara", desc: "Mis. rapat, libur" },
] as const;

const DURASI = [
  { key: "1j", label: "1 jam" },
  { key: "2j", label: "2 jam" },
  { key: "hari-ini", label: "Sampai akhir hari ini" },
  { key: "tanpa", label: "Sampai diubah lagi" },
  { key: "pilih", label: "Pilih waktu…" },
] as const;

const ALASAN_CEPAT = ["Rapat desa", "Petugas sedang dinas luar", "Libur nasional", "Pelayanan tambahan"];

/** Panel di Dasbor CMS: lihat status kantor yang tampil di website & ubah secara manual. */
export function StatusKantorPanel({ jamLayanan, manual }: { jamLayanan: string; manual: StatusManual }) {
  const [state, action, pending] = useActionState<FormState, FormData>(aturStatusKantor, null);
  const [sekarang, setSekarang] = useState<Date | null>(null);
  useEffect(() => setSekarang(new Date()), []);
  const aktif = sekarang ? manualBerlaku(manual, sekarang) : null;
  const [mode, setMode] = useState<StatusManual["mode"]>(manual.mode);
  const [durasi, setDurasi] = useState<string>("hari-ini");
  const [alasan, setAlasan] = useState(manual.alasan);
  useEffect(() => {
    setMode(aktif ? manual.mode : "otomatis");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manual, sekarang === null]);

  return (
    <section aria-labelledby="judul-status-kantor" className="card mt-6 p-5 sm:p-6" data-panel-status-kantor>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="judul-status-kantor" className="font-bold text-stone-900">Status Kantor Desa</h2>
          <p className="mt-1 text-sm text-muted">Yang sedang tampil di website:</p>
          <p className="mt-2 inline-flex rounded-full bg-paper px-3.5 py-1.5 text-sm text-ink ring-1 ring-line">
            <OfficeStatus jamLayanan={jamLayanan} manual={manual} tone="light" fallback="Jam layanan belum diisi" />
          </p>
          {aktif ? (
            <p className="mt-2 text-xs text-muted">
              Diatur manual{manual.oleh ? ` oleh ${manual.oleh}` : ""}. {manual.sampai ? "Kembali otomatis setelah waktunya habis." : "Berlaku sampai diubah lagi."}
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">Mengikuti jam layanan di Pengaturan Situs.</p>
          )}
        </div>
      </div>

      <form action={action} className="mt-5 space-y-4" data-confirm-title="Ubah status kantor?" data-confirm="Status baru langsung tampil di website untuk semua warga." data-confirm-ok="Ya, ubah">
        <fieldset>
          <legend className="label">Atur status</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {MODE.map((m) => (
              <label
                key={m.key}
                className={`flex cursor-pointer flex-col rounded-2xl px-4 py-3 ring-1 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-500 ${
                  mode === m.key
                    ? m.key === "tutup"
                      ? "bg-red-50 ring-2 ring-red-600"
                      : m.key === "buka"
                        ? "bg-brand-50 ring-2 ring-brand-600"
                        : "bg-paper ring-2 ring-ink"
                    : "bg-white ring-line hover:ring-line-strong"
                }`}
              >
                <input type="radio" name="mode" value={m.key} checked={mode === m.key} onChange={() => setMode(m.key)} className="sr-only" />
                <span className="font-semibold text-ink">{m.label}</span>
                <span className="text-xs text-muted">{m.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {mode !== "otomatis" ? (
          <>
            <div>
              <label htmlFor="status-alasan" className="label">
                Keterangan <span className="font-normal text-muted">(tampil di website, opsional)</span>
              </label>
              <input
                id="status-alasan"
                name="alasan"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                maxLength={120}
                className="input"
                placeholder={mode === "tutup" ? "mis. Rapat desa, buka kembali pukul 13.00" : "mis. Pelayanan tambahan hari Sabtu"}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ALASAN_CEPAT.map((a) => (
                  <button key={a} type="button" onClick={() => setAlasan(a)} className="rounded-full bg-paper px-3 py-1 text-xs text-ink ring-1 ring-line hover:bg-line">
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <fieldset>
              <legend className="label">Berlaku</legend>
              <div className="flex flex-wrap gap-2">
                {DURASI.map((d) => (
                  <label key={d.key} className={`cursor-pointer rounded-full px-3.5 py-2 text-sm ring-1 has-[:focus-visible]:outline-2 ${durasi === d.key ? "bg-ink text-white ring-ink" : "bg-white text-ink ring-line"}`}>
                    <input type="radio" name="durasi" value={d.key} checked={durasi === d.key} onChange={() => setDurasi(d.key)} className="sr-only" />
                    {d.label}
                  </label>
                ))}
              </div>
              {durasi === "pilih" ? (
                <div className="mt-3 max-w-xs">
                  <label htmlFor="status-sampai" className="text-xs font-semibold text-muted">Sampai (WIB)</label>
                  <input id="status-sampai" name="sampai" type="datetime-local" className="input mt-1" aria-invalid={Boolean(state?.errors?.sampai)} />
                </div>
              ) : null}
            </fieldset>
          </>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={mode === "tutup" ? "btn-danger" : "btn-primary"} disabled={pending}>
            {pending ? "Menyimpan…" : mode === "otomatis" ? "Kembalikan ke otomatis" : mode === "buka" ? "Tandai buka" : "Tandai tutup sementara"}
          </button>
          {state?.message ? <p role="status" className={`text-sm ${state.ok ? "text-brand-700" : "text-red-700"}`}>{state.message}</p> : null}
        </div>
      </form>
    </section>
  );
}
