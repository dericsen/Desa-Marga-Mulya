"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-stone-900">Terjadi kendala</h1>
        <p className="mt-2 text-stone-600">
          Maaf, halaman belum dapat ditampilkan. Pastikan koneksi database sudah dikonfigurasi, lalu coba lagi.
        </p>
        {error.digest ? <p className="mt-2 text-xs text-stone-400">Kode: {error.digest}</p> : null}
        <button type="button" onClick={reset} className="btn-primary mt-6">Coba Lagi</button>
      </div>
    </main>
  );
}
