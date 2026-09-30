import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-desa max-w-[40rem] py-24">
      <p className="meta">Kesalahan 404</p>
      <h1 className="font-display mt-3 text-[2.25rem] leading-tight font-semibold text-ink">Halaman ini tidak ada</h1>
      <p className="mt-3 leading-relaxed text-muted">
        Tautan mungkin salah ketik, atau halaman sudah dipindahkan oleh admin desa. Coba mulai dari beranda atau gunakan pencarian.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href="/" className="btn-primary">Kembali ke beranda</Link>
        <Link href="/cari" className="link text-sm">Cari informasi</Link>
      </div>
    </main>
  );
}
