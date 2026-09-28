import type { Metadata } from "next";
import { deleteAdmin } from "@/app/admin/actions";
import { AccountForms } from "@/components/admin/AccountForms";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Icon } from "@/components/Icon";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Akun Admin" };

export default async function AkunPage() {
  const session = await requireAdmin();
  const users = await db()<{ id: number; nama: string; email: string; created_at: Date }[]>`
    select id, nama, email, created_at from users order by id`;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-extrabold text-stone-900">Akun Admin</h1>
      <p className="mt-1 mb-6 text-stone-600">Ganti kata sandi dan kelola pengelola CMS.</p>

      <section className="card mb-6 p-5">
        <h2 className="font-bold text-stone-900">Daftar Admin</h2>
        <ul className="mt-3 divide-y divide-stone-100">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>
                <span className="block font-semibold text-stone-900">
                  {u.nama} {u.id === session.uid ? <span className="ml-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">Anda</span> : null}
                </span>
                <span className="block text-stone-500">{u.email} · sejak {formatDateTime(u.created_at)}</span>
              </span>
              {u.id !== session.uid && users.length > 1 ? (
                <form action={deleteAdmin.bind(null, u.id)}>
                  <ConfirmButton message={`Hapus admin ${u.nama}?`} className="rounded-lg p-2 text-red-600 hover:bg-red-50" label={`Hapus ${u.nama}`}>
                    <Icon name="trash" className="h-4 w-4" />
                  </ConfirmButton>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <AccountForms />
    </div>
  );
}
