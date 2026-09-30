"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container-desa max-w-[40rem] py-24">
      <p className="meta">Terjadi gangguan</p>
      <h1 className="font-display mt-3 text-[2.25rem] leading-tight font-semibold text-ink">Halaman belum bisa dimuat</h1>
      <p className="mt-3 leading-relaxed text-muted">
        Server desa sedang tidak dapat mengambil data. Tunggu sebentar lalu muat ulang. Jika berlanjut, hubungi kantor desa.
      </p>
      {error.digest ? <p className="mt-3 text-xs text-muted tabular-nums">Kode kejadian: {error.digest}</p> : null}
      <button type="button" onClick={reset} className="btn-primary mt-8">Muat ulang</button>
    </main>
  );
}
