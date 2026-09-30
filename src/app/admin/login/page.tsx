import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <img src="/logo-desa.svg" alt="" width={48} height={48} className="h-12 w-12" />
          <div>
            <p className="font-display text-lg font-semibold text-ink">CMS Desa Marga Mulya</p>
            <p className="text-sm text-muted">Khusus pengelola website desa</p>
          </div>
        </div>
        <LoginForm />
        <p className="mt-6 text-sm text-muted">
          <Link href="/" className="hover:underline">← Kembali ke website</Link>
        </p>
      </div>
    </main>
  );
}
