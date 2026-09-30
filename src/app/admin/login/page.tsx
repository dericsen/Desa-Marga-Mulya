import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ keluar?: string }> }) {
  const { keluar } = await searchParams;
  const session = await getSession();
  if (session && keluar !== "nonaktif") redirect(session.role === "penjual" ? "/admin/toko" : "/admin");
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <img src="/logo-desa.svg" alt="" width={48} height={48} className="h-12 w-12" />
          <div>
            <p className="font-display text-lg font-semibold text-ink">Desa Marga Mulya</p>
            <p className="text-sm text-muted">Pengelola website & Pasar Desa</p>
          </div>
        </div>
        {keluar === "nonaktif" ? (
          <p role="alert" className="mb-4 border-l-2 border-red-600 pl-3 text-sm text-red-700">Akun atau toko Anda sedang dinonaktifkan. Hubungi admin desa.</p>
        ) : null}
        <LoginForm />
        <p className="mt-6 text-sm text-muted">
          <Link href="/" className="hover:underline">← Kembali ke website</Link>
        </p>
      </div>
    </main>
  );
}
