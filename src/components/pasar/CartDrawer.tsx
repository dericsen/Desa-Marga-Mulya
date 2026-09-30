"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { buatPesanan, type PesananDibuat } from "@/app/(site)/pasar/actions";
import { Icon } from "@/components/Icon";
import { PENGIRIMAN } from "@/lib/categories";
import { formatRupiah } from "@/lib/format";
import { useCart } from "./CartContext";

type Step = "keranjang" | "data" | "selesai";

export function CartDrawer() {
  const { items, total, open, setOpen, setQty, remove, clear } = useCart();
  const [step, setStep] = useState<Step>("keranjang");
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [bermasalah, setBermasalah] = useState<Map<number, string>>(new Map());
  const [hasil, setHasil] = useState<PesananDibuat[]>([]);
  const [pengiriman, setPengiriman] = useState("ambil");
  const panelRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    const m = new Map<number, { nama: string; items: typeof items }>();
    for (const i of items) {
      const g = m.get(i.penjualId) ?? { nama: i.penjualNama, items: [] };
      g.items.push(i);
      m.set(i.penjualId, g);
    }
    return [...m.values()];
  }, [items]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  // Kembali ke langkah awal saat drawer ditutup (kecuali konfirmasi baru saja ditampilkan).
  useEffect(() => {
    if (!open && step === "selesai") {
      setStep("keranjang");
      setHasil([]);
    }
  }, [open, step]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setMessage(null);
    setErrors({});
    startTransition(async () => {
      const res = await buatPesanan({
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
        nama: String(fd.get("nama") || ""),
        telepon: String(fd.get("telepon") || ""),
        pengiriman: String(fd.get("pengiriman") || ""),
        alamat: String(fd.get("alamat") || ""),
        catatan: String(fd.get("catatan") || ""),
      });
      if (res.ok) {
        setHasil(res.pesanan);
        setStep("selesai");
        setBermasalah(new Map());
        clear();
      } else {
        setMessage(res.message);
        setErrors(res.errors ?? {});
        if (res.bermasalah?.length) {
          setBermasalah(new Map(res.bermasalah.map((b) => [b.id, b.alasan])));
          setStep("keranjang");
        }
      }
    });
  }

  if (!open) return null;

  const judul = step === "keranjang" ? "Keranjang" : step === "data" ? "Data pemesan" : "Pesanan tercatat";

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="judul-keranjang">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default bg-ink/40" aria-label="Tutup keranjang" onClick={() => setOpen(false)} tabIndex={-1} />
      <div ref={panelRef} tabIndex={-1} className="absolute inset-y-0 right-0 flex w-full max-w-[28rem] flex-col overflow-hidden bg-paper shadow-[-12px_0_40px_-20px_rgb(12_27_21/0.5)] focus:outline-none sm:inset-y-3 sm:right-3 sm:rounded-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            {step === "data" ? (
              <button type="button" onClick={() => setStep("keranjang")} className="-ml-1 rounded-md p-1 text-muted hover:bg-paper hover:text-ink" aria-label="Kembali ke keranjang">
                <Icon name="arrow" className="h-5 w-5 rotate-180" />
              </button>
            ) : null}
            <h2 id="judul-keranjang" className="font-display text-xl font-bold text-ink">{judul}</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted hover:bg-paper hover:text-ink" aria-label="Tutup">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </header>

        {/* ---------- Langkah 1: isi keranjang ---------- */}
        {step === "keranjang" ? (
          items.length === 0 ? (
            <div className="flex flex-1 flex-col items-start justify-center px-6">
              <p className="font-bold text-ink">Keranjang masih kosong</p>
              <p className="mt-1 text-sm text-muted">Pilih produk warga di Pasar Desa, lalu pesan langsung ke pembuatnya.</p>
              <Link href="/pasar" className="btn-primary mt-5" onClick={() => setOpen(false)}>Buka Pasar Desa</Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {message ? <p role="alert" className="mb-4 border-l-2 border-red-600 pl-3 text-sm text-red-700">{message}</p> : null}
                {groups.map((g) => {
                  const sub = g.items.reduce((s, i) => s + i.harga * i.qty, 0);
                  return (
                    <section key={g.nama} className="mb-6 last:mb-0" aria-label={`Produk dari ${g.nama}`}>
                      <h3 className="flex items-baseline justify-between pb-2 text-sm">
                        <span className="font-bold text-ink">{g.nama}</span>
                        <span className="text-muted tabular-nums">{formatRupiah(sub)}</span>
                      </h3>
                      <ul className="divide-y divide-line rounded-2xl bg-paper px-3">
                        {g.items.map((i) => (
                          <li key={i.id} className="grid grid-cols-[3.5rem_1fr] gap-3 py-3">
                            {i.gambar ? <img src={i.gambar} alt="" className="aspect-square w-14 rounded-xl object-cover" /> : <div className="aspect-square w-14 rounded-md bg-line/60" />}
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-[0.9375rem] leading-snug text-ink">
                                  {i.nama}
                                  {i.satuan ? <span className="block text-xs text-muted">{i.satuan}</span> : null}
                                </p>
                                <p className="shrink-0 text-sm font-bold text-ink tabular-nums">{formatRupiah(i.harga * i.qty)}</p>
                              </div>
                              <div className="mt-2 flex items-center gap-4">
                                <div className="flex items-center rounded-md border border-line-strong bg-white" role="group" aria-label={`Jumlah ${i.nama}`}>
                                  <button type="button" className="px-2.5 py-1 text-ink disabled:text-stone-300" onClick={() => setQty(i.id, i.qty - 1)} disabled={i.qty <= 1} aria-label="Kurangi">−</button>
                                  <span className="w-8 text-center text-sm font-bold tabular-nums">{i.qty}</span>
                                  <button type="button" className="px-2.5 py-1 text-ink disabled:text-stone-300" onClick={() => setQty(i.id, i.qty + 1)} disabled={i.stok !== null && i.qty >= i.stok} aria-label="Tambah">+</button>
                                </div>
                                <button type="button" className="text-xs text-muted underline-offset-2 hover:text-red-700 hover:underline" onClick={() => remove(i.id)}>
                                  Hapus
                                </button>
                              </div>
                              {bermasalah.get(i.id) ? <p className="mt-1.5 text-xs font-bold text-red-700">{bermasalah.get(i.id)}</p> : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
              <footer className="border-t border-line bg-white px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted">Total belanja</span>
                  <span className="text-xl font-bold text-ink tabular-nums">{formatRupiah(total)}</span>
                </div>
                {groups.length > 1 ? <p className="mt-1 text-xs text-muted">Dibagi menjadi {groups.length} pesanan, satu untuk setiap penjual.</p> : null}
                <button type="button" className="btn-primary mt-4 w-full py-3" onClick={() => { setMessage(null); setStep("data"); }}>
                  Lanjut isi data pemesan
                </button>
                <p className="mt-3 text-xs leading-relaxed text-muted">Bayar langsung ke penjual (tunai atau transfer) setelah pesanan dikonfirmasi lewat WhatsApp. Website desa tidak memungut biaya.</p>
              </footer>
            </>
          )
        ) : null}

        {/* ---------- Langkah 2: data pemesan ---------- */}
        {step === "data" ? (
          <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden" noValidate>
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <Input name="nama" label="Nama pemesan" autoComplete="name" error={errors.nama} required />
              <Input name="telepon" label="Nomor HP / WhatsApp" type="tel" autoComplete="tel" placeholder="0812 3456 7890" error={errors.telepon} required hint="Penjual akan menghubungi nomor ini." />
              <fieldset>
                <legend className="label">Cara pengambilan</legend>
                <div className="space-y-2">
                  {PENGIRIMAN.map((p) => (
                    <label key={p.key} className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 bg-white px-4 py-3 text-[0.9375rem] ${pengiriman === p.key ? "border-ink" : "border-line"}`}>
                      <input type="radio" name="pengiriman" value={p.key} checked={pengiriman === p.key} onChange={() => setPengiriman(p.key)} className="mt-1 accent-brand-700" />
                      <span className="text-ink">{p.label}</span>
                    </label>
                  ))}
                </div>
                {errors.pengiriman ? <p className="mt-1.5 text-sm text-red-700">{errors.pengiriman}</p> : null}
              </fieldset>
              <div>
                <label htmlFor="pembeli-alamat" className="label">
                  Alamat {pengiriman === "antar" ? <span className="text-red-700">*</span> : <span className="font-normal text-muted">(opsional)</span>}
                </label>
                <textarea id="pembeli-alamat" name="alamat" rows={2} className="input" placeholder="mis. RT 03/RW 02, dekat musala" aria-invalid={Boolean(errors.alamat)} />
                {errors.alamat ? <p className="mt-1.5 text-sm text-red-700">{errors.alamat}</p> : null}
              </div>
              <div>
                <label htmlFor="pembeli-catatan" className="label">Catatan untuk penjual <span className="font-normal text-muted">(opsional)</span></label>
                <textarea id="pembeli-catatan" name="catatan" rows={2} maxLength={500} className="input" placeholder="mis. diambil hari Sabtu sore" />
              </div>
              {message ? <p role="alert" className="border-l-2 border-red-600 pl-3 text-sm text-red-700">{message}</p> : null}
            </div>
            <footer className="border-t border-line bg-white px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">{items.reduce((s, i) => s + i.qty, 0)} barang</span>
                <span className="text-xl font-bold text-ink tabular-nums">{formatRupiah(total)}</span>
              </div>
              <button type="submit" className="btn-primary mt-4 w-full py-3" disabled={pending}>
                {pending ? "Menyimpan pesanan…" : "Buat pesanan"}
              </button>
            </footer>
          </form>
        ) : null}

        {/* ---------- Langkah 3: konfirmasi ---------- */}
        {step === "selesai" ? (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <p className="leading-relaxed text-ink">
              Pesanan sudah tercatat. <strong className="font-bold">Langkah terakhir:</strong> kirim rincian pesanan ke WhatsApp penjual agar segera diproses.
            </p>
            <ol className="mt-5 space-y-4">
              {hasil.map((p) => (
                <li key={p.kode} className="rounded-2xl bg-paper p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-bold text-ink">{p.penjual}</p>
                    <p className="font-bold text-ink tabular-nums">{formatRupiah(p.total)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    Kode pesanan <span className="font-bold text-ink tabular-nums" data-kode-pesanan>{p.kode}</span>
                  </p>
                  <ul className="mt-2 text-sm text-muted">
                    {p.items.map((i) => (
                      <li key={i.produk_id}>{i.qty} × {i.nama}</li>
                    ))}
                  </ul>
                  {p.waUrl ? (
                    <a href={p.waUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 w-full">
                      <Icon name="whatsapp" className="h-4 w-4" /> Kirim ke WhatsApp {p.penjual}
                    </a>
                  ) : null}
                </li>
              ))}
            </ol>
            <p className="mt-5 text-xs leading-relaxed text-muted">
              Simpan kode pesanan untuk ditanyakan ke penjual. Pembayaran dilakukan langsung kepada penjual setelah pesanan dikonfirmasi.
            </p>
            <button type="button" className="link mt-4 text-sm" onClick={() => setOpen(false)}>Selesai</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Input({
  name, label, type = "text", error, required, autoComplete, placeholder, hint,
}: { name: string; label: string; type?: string; error?: string; required?: boolean; autoComplete?: string; placeholder?: string; hint?: string }) {
  const id = `pembeli-${name}`;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {required ? <span className="text-red-700">*</span> : null}
      </label>
      <input id={id} name={name} type={type} required={required} autoComplete={autoComplete} placeholder={placeholder} className="input" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
