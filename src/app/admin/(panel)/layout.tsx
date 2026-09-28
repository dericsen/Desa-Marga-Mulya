import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { Icon } from "@/components/Icon";
import { requireAdmin } from "@/lib/auth";
import type { IconName } from "@/lib/categories";
import { db } from "@/lib/db";
import { RESOURCES } from "@/lib/resources";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [{ count: unread }] = await db()<{ count: number }[]>`select count(*)::int as count from pesan where dibaca = false`;

  const menu: { href: string; label: string; icon: IconName; badge?: number }[] = [
    { href: "/admin", label: "Dasbor", icon: "home" },
    { href: "/admin/pengaturan", label: "Pengaturan Situs", icon: "settings" },
    ...RESOURCES.map((r) => ({ href: `/admin/${r.key}`, label: r.label, icon: r.icon, badge: r.key === "pesan" ? unread : undefined })),
    { href: "/admin/akun", label: "Akun Admin", icon: "user" },
  ];

  const nav = (
    <ul className="space-y-1">
      {menu.map((m) => (
        <li key={m.href}>
          <Link href={m.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-50/90 hover:bg-white/10 hover:text-white">
            <Icon name={m.icon} className="h-[18px] w-[18px]" />
            <span className="flex-1">{m.label}</span>
            {m.badge ? <span className="rounded-full bg-sun-400 px-2 py-0.5 text-xs font-bold text-stone-900">{m.badge}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );

  const footer = (
    <div className="space-y-1 border-t border-white/10 pt-3">
      <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-50/90 hover:bg-white/10">
        <Icon name="arrow" className="h-[18px] w-[18px]" /> Lihat Website
      </Link>
      <form action={logout}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-brand-50/90 hover:bg-white/10">
          <Icon name="logout" className="h-[18px] w-[18px]" /> Keluar
        </button>
      </form>
      <p className="px-3 pt-2 text-xs text-brand-200/70">Masuk sebagai {session.nama}</p>
    </div>
  );

  return (
    <div className="lg:flex">
      <aside className="hidden w-64 shrink-0 bg-brand-950 lg:block">
        <div className="sticky top-0 flex h-screen flex-col gap-4 overflow-y-auto p-4">
          <Link href="/admin" className="flex items-center gap-3 px-2 py-2 text-white">
            <img src="/logo-desa.svg" alt="" width={36} height={36} className="h-9 w-9" />
            <span className="leading-tight">
              <span className="block font-extrabold">CMS Desa</span>
              <span className="block text-xs text-brand-200">Marga Mulya</span>
            </span>
          </Link>
          <nav aria-label="Menu CMS" className="flex-1">{nav}</nav>
          {footer}
        </div>
      </aside>

      <details className="group bg-brand-950 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-white">
          <span className="flex items-center gap-3 font-extrabold">
            <img src="/logo-desa.svg" alt="" width={32} height={32} className="h-8 w-8" /> CMS Desa Marga Mulya
          </span>
          <Icon name="menu" className="h-6 w-6" />
        </summary>
        <nav aria-label="Menu CMS seluler" className="space-y-3 px-4 pb-4">
          {nav}
          {footer}
        </nav>
      </details>

      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
