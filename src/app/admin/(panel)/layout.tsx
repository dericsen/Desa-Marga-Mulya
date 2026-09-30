import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { BottomNav, SideNav, type MenuItem } from "@/components/admin/PanelNav";
import { Icon } from "@/components/Icon";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { RESOURCES } from "@/lib/resources";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  const sql = db();
  const isPenjual = session.role === "penjual";

  let menu: MenuItem[];
  let toko: { nama: string; slug: string } | null = null;

  if (isPenjual) {
    const [[j], [{ count: baru }]] = await Promise.all([
      sql<{ nama: string; slug: string }[]>`select nama, slug from penjual where id = ${session.pid}`,
      sql<{ count: number }[]>`select count(*)::int as count from pesanan where penjual_id = ${session.pid} and status = 'baru'`,
    ]);
    toko = j ?? null;
    menu = [
      { href: "/admin/toko", label: "Ringkasan", icon: "home", exact: true },
      { href: "/admin/toko/produk", label: "Produk saya", short: "Produk", icon: "store" },
      { href: "/admin/toko/pesanan", label: "Pesanan", icon: "inbox", badge: baru },
      { href: "/admin/toko/profil", label: "Profil toko", short: "Toko", icon: "user" },
    ];
  } else {
    const [[{ count: unread }], [{ count: pesananBaru }], [{ count: menunggu }]] = await Promise.all([
      sql<{ count: number }[]>`select count(*)::int as count from pesan where dibaca = false`,
      sql<{ count: number }[]>`select count(*)::int as count from pesanan where status = 'baru'`,
      sql<{ count: number }[]>`select count(*)::int as count from produk where status_tinjau = 'menunggu'`,
    ]);
    const badge: Record<string, number> = { pesan: unread, pesanan: pesananBaru, produk: menunggu };
    menu = [
      { href: "/admin", label: "Dasbor", icon: "home", exact: true },
      { href: "/admin/pengaturan", label: "Pengaturan Situs", icon: "settings" },
      ...RESOURCES.map((r) => ({
        href: r.key === "produk" && menunggu ? `/admin/produk?saring=1` : `/admin/${r.key}`,
        label: r.label,
        icon: r.icon,
        badge: badge[r.key] || undefined,
      })),
      { href: "/admin/akun", label: "Akun Admin", icon: "user" },
    ];
  }

  const footer = (
    <div className="space-y-0.5 border-t border-white/10 pt-3 text-sm">
      {isPenjual ? (
        <Link href="/admin/akun" className="flex items-center gap-3 rounded-md px-3 py-2 text-brand-100/85 hover:bg-white/8 hover:text-white">
          <Icon name="settings" className="h-[18px] w-[18px] opacity-80" /> Ganti kata sandi
        </Link>
      ) : null}
      <Link
        href={isPenjual && toko ? `/pasar?penjual=${toko.slug}` : "/"}
        target="_blank"
        className="flex items-center gap-3 rounded-md px-3 py-2 text-brand-100/85 hover:bg-white/8 hover:text-white"
      >
        <Icon name="arrow" className="h-[18px] w-[18px] opacity-80" /> {isPenjual ? "Lihat toko di website" : "Lihat website"}
      </Link>
      <form action={logout}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-brand-100/85 hover:bg-white/8 hover:text-white">
          <Icon name="logout" className="h-[18px] w-[18px] opacity-80" /> Keluar
        </button>
      </form>
      <p className="px-3 pt-2 text-xs text-brand-300">Masuk sebagai {session.nama}</p>
    </div>
  );

  const brand = (
    <span className="leading-tight">
      <span className="font-display block text-[1.0625rem] font-bold">{isPenjual ? toko?.nama ?? "Toko saya" : "CMS Desa"}</span>
      <span className="block text-xs text-brand-300">{isPenjual ? "Penjual · Pasar Desa" : "Desa Marga Mulya"}</span>
    </span>
  );

  return (
    <div className="lg:flex">
      <aside className="hidden w-64 shrink-0 bg-brand-950 lg:block">
        <div className="sticky top-0 flex h-screen flex-col gap-5 overflow-y-auto p-4 text-white">
          <Link href={isPenjual ? "/admin/toko" : "/admin"} className="flex items-center gap-3 px-2 py-1.5">
            <img src="/logo-desa.svg" alt="" width={34} height={34} className="h-[34px] w-[34px]" />
            {brand}
          </Link>
          <nav aria-label="Menu CMS" className="flex-1">
            <SideNav items={menu} />
          </nav>
          {footer}
        </div>
      </aside>

      {/* Seluler */}
      {isPenjual ? (
        <header className="flex items-center justify-between gap-3 bg-brand-950 px-4 py-3 text-white lg:hidden">
          <Link href="/admin/toko" className="flex items-center gap-3">
            <img src="/logo-desa.svg" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
            {brand}
          </Link>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-md p-1.5 hover:bg-white/10" aria-label="Menu akun">
              <Icon name="menu" className="h-6 w-6" />
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-60 rounded-md bg-brand-950 p-2 shadow-lg ring-1 ring-white/10">{footer}</div>
          </details>
        </header>
      ) : (
        <details className="bg-brand-950 text-white lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4">
            <span className="flex items-center gap-3">
              <img src="/logo-desa.svg" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
              {brand}
            </span>
            <Icon name="menu" className="h-6 w-6" />
          </summary>
          <nav aria-label="Menu CMS seluler" className="space-y-3 px-4 pb-4">
            <SideNav items={menu} />
            {footer}
          </nav>
        </details>
      )}

      <main className={`min-w-0 flex-1 p-4 sm:p-8 ${isPenjual ? "pb-24 lg:pb-8" : ""}`}>{children}</main>
      {isPenjual ? <BottomNav items={menu} /> : null}
    </div>
  );
}
