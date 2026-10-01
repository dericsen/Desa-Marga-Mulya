"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pop-up konfirmasi untuk SEMUA tombol simpan, hapus, dan keluar di CMS & portal penjual.
 *
 * Cara kerja: menangkap event "submit" di fase capture (sebelum React menjalankan server action),
 * menahannya, menampilkan dialog, lalu mengirim ulang form dengan tombol yang sama bila disetujui.
 *
 * Pesan bisa diatur per tombol/form:
 *   data-confirm="Teks pertanyaan"  data-confirm-title="Judul"  data-confirm-ok="Ya, simpan"
 *   data-confirm-tone="danger"      data-no-confirm (lewati, mis. form pencarian)
 */
type Ask = { title: string; message: string; ok: string; danger: boolean; form: HTMLFormElement; submitter: HTMLElement | null };

const label = (el: HTMLElement | null) => (el?.getAttribute("aria-label") || el?.textContent || "").replace(/\s+/g, " ").trim();

function bacaPesan(form: HTMLFormElement, submitter: HTMLElement | null): Omit<Ask, "form" | "submitter"> {
  const attr = (n: string) => submitter?.getAttribute(n) ?? form.getAttribute(n);
  const teks = label(submitter);
  let preset: Omit<Ask, "form" | "submitter">;
  if (/^keluar/i.test(teks)) preset = { title: "Keluar dari akun?", message: "Anda perlu masuk lagi untuk membuka CMS.", ok: "Ya, keluar", danger: false };
  else if (/hapus/i.test(teks)) preset = { title: "Hapus data ini?", message: "Data yang dihapus tidak dapat dikembalikan.", ok: "Ya, hapus", danger: true };
  else if (/nonaktif/i.test(teks)) preset = { title: "Nonaktifkan akun?", message: "Penjual tidak bisa masuk sampai akun diaktifkan lagi.", ok: "Ya, nonaktifkan", danger: true };
  else if (/tolak/i.test(teks)) preset = { title: "Tolak pengajuan ini?", message: "Pengajuan akan dikembalikan ke penjual.", ok: "Ya, tolak", danger: true };
  else if (/setujui|tayang/i.test(teks)) preset = { title: "Setujui dan tayangkan?", message: "Data akan langsung tampil di website publik.", ok: "Ya, setujui", danger: false };
  else if (/kirim/i.test(teks)) preset = { title: "Kirim sekarang?", message: "Pastikan data sudah benar sebelum dikirim.", ok: "Ya, kirim", danger: false };
  else if (/buat|tambah/i.test(teks)) preset = { title: "Buat data baru?", message: "Pastikan data sudah benar sebelum disimpan.", ok: "Ya, buat", danger: false };
  else preset = { title: "Simpan perubahan?", message: "Pastikan data sudah benar sebelum disimpan.", ok: "Ya, simpan", danger: false };
  return {
    title: attr("data-confirm-title") || preset.title,
    message: attr("data-confirm") || preset.message,
    ok: attr("data-confirm-ok") || preset.ok,
    danger: attr("data-confirm-tone") ? attr("data-confirm-tone") === "danger" : preset.danger,
  };
}

export function ConfirmGuard() {
  const [ask, setAsk] = useState<Ask | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  const lolos = useRef(new WeakSet<HTMLFormElement>());

  useEffect(() => {
    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement | null;
      if (!(form instanceof HTMLFormElement)) return;
      if (lolos.current.has(form)) {
        lolos.current.delete(form);
        return; // sudah disetujui → biarkan React menjalankan aksinya
      }
      const submitter = (e.submitter as HTMLElement | null) ?? null;
      if (form.hasAttribute("data-no-confirm") || submitter?.hasAttribute("data-no-confirm") || form.getAttribute("role") === "search") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setAsk({ ...bacaPesan(form, submitter), form, submitter });
    };
    window.addEventListener("submit", onSubmit, true);
    return () => window.removeEventListener("submit", onSubmit, true);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (ask && !d.open) {
      d.showModal();
      okRef.current?.focus();
    } else if (!ask && d.open) d.close();
  }, [ask]);

  const lanjut = () => {
    if (!ask) return;
    const { form, submitter } = ask;
    setAsk(null);
    lolos.current.add(form);
    if (submitter && (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement)) form.requestSubmit(submitter);
    else form.requestSubmit();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={() => setAsk(null)}
      onClick={(e) => {
        if (e.target === dialogRef.current) setAsk(null); // klik latar = batal
      }}
      aria-labelledby="konfirmasi-judul"
      aria-describedby="konfirmasi-isi"
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-3xl bg-white p-0 text-ink shadow-[0_30px_80px_-20px_rgb(11_19_16/0.5)] backdrop:bg-ink/45 backdrop:backdrop-blur-[2px]"
    >
      {ask ? (
        <div className="p-6" data-konfirmasi>
          <span
            className={`grid h-11 w-11 place-items-center rounded-full text-lg font-semibold ${ask.danger ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-700"}`}
            aria-hidden="true"
          >
            {ask.danger ? "!" : "?"}
          </span>
          <h2 id="konfirmasi-judul" className="font-display mt-4 text-xl font-semibold">{ask.title}</h2>
          <p id="konfirmasi-isi" className="mt-1.5 text-sm leading-relaxed text-muted">{ask.message}</p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-light" onClick={() => setAsk(null)}>Batal</button>
            <button ref={okRef} type="button" data-confirm-ok-button className={ask.danger ? "btn-danger" : "btn-primary"} onClick={lanjut}>
              {ask.ok}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
