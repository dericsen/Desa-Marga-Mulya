"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { NAV } from "@/lib/nav";
import { useCart } from "@/components/pasar/CartContext";

type Props = { namaDesa: string; wilayah: string; jamRingkas: string; telepon: string };

export function Header({ namaDesa, wilayah, jamRingkas, telepon }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const showCart = cart.ready && (cart.count > 0 || pathname.startsWith("/pasar"));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm">
      {/* Bilah layanan: informasi paling sering dicari warga */}
      <div className="bg-brand-900 text-brand-50">
        <div className="container-desa flex h-9 items-center justify-between gap-4 text-[0.8125rem]">
          <p className="truncate">
            <span className="font-semibold">Kantor desa</span>
            <span className="text-brand-200"> · {jamRingkas}</span>
          </p>
          {telepon ? (
            <a href={`tel:${telepon.replace(/[^\d+]/g, "")}`} className="hidden shrink-0 tabular-nums hover:underline sm:inline">
              {telepon}
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-b border-line">
        <div className="container-desa flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`Beranda Desa ${namaDesa}`}>
            <img src="/logo-desa.svg" alt="" width={34} height={34} className="h-[34px] w-[34px] shrink-0" />
            <span className="min-w-0 leading-tight">
              <span className="font-display block truncate text-[1.125rem] font-semibold text-ink">Desa {namaDesa}</span>
              <span className="block truncate text-xs text-muted">{wilayah}</span>
            </span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden h-full lg:block">
            <ul className="flex h-full items-stretch gap-5 xl:gap-6">
              {NAV.map((item) => (
                <li key={item.href} className="flex">
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`-mb-px flex items-center border-b-2 text-[0.9375rem] transition-colors ${
                      isActive(item.href) ? "border-brand-700 font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/cari" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-muted hover:bg-line/50 hover:text-ink" aria-label="Cari informasi">
              <Icon name="search" className="h-[18px] w-[18px]" />
              <span className="hidden xl:inline">Cari</span>
            </Link>
            {showCart ? (
              <button
                type="button"
                onClick={() => cart.setOpen(true)}
                className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-semibold text-ink hover:bg-line/50"
                aria-label={`Buka keranjang, ${cart.count} barang`}
              >
                <Icon name="store" className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Keranjang</span>
                <span className={`min-w-5 rounded-sm px-1 text-center text-xs tabular-nums ${cart.count ? "bg-brand-700 text-white" : "bg-line text-muted"}`}>{cart.count}</span>
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-md p-2 text-ink hover:bg-line/50 lg:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <nav id="menu-mobile" aria-label="Navigasi seluler" className="h-[calc(100dvh-100px)] overflow-y-auto border-b border-line bg-paper lg:hidden">
          <ul className="container-desa divide-y divide-line py-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center justify-between py-4 text-lg ${isActive(item.href) ? "font-semibold text-brand-700" : "text-ink"}`}
                >
                  {item.label}
                  <Icon name="arrow" className="h-4 w-4 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
