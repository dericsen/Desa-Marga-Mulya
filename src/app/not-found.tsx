import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div>
        <p className="text-6xl font-extrabold text-brand-700">404</p>
        <h1 className="mt-3 text-2xl font-bold text-stone-900">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-stone-600">Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.</p>
        <Link href="/" className="btn-primary mt-6">Kembali ke Beranda</Link>
      </div>
    </main>
  );
}
