"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/pasar/CartContext";
import { NAV } from "@/lib/nav";
import { OfficeStatus } from "./OfficeStatus";

type Props = { namaDesa: string; wilayah: string; jamRingkas: string; jamLayanan: string; telepon: string };

export function Header({ namaDesa, wilayah, jamRingkas, jamLayanan }: Props) {
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
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="container-desa flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`Beranda Desa ${namaDesa}`}>
          <img src="/logo-desa.svg" alt="" width={32} height={32} className="h-8 w-8 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-bold text-ink">Desa {namaDesa}</span>
            <span className="block truncate text-xs text-muted">{wilayah}</span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden h-full xl:block">
          <ul className="flex h-full items-stretch gap-6">
            {NAV.map((item) => (
              <li key={item.href} className="flex">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`-mb-px flex items-center border-b-2 text-sm whitespace-nowrap transition-colors ${
                    isActive(item.href) ? "border-ink font-bold text-ink" : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <span className="mr-2 hidden text-sm text-ink md:inline-flex">
            <OfficeStatus jamLayanan={jamLayanan} variant="chip" fallback={jamRingkas} />
          </span>
          <Link href="/cari" className="grid h-10 w-10 place-items-center rounded-md text-ink hover:bg-paper" aria-label="Cari informasi">
            <Icon name="search" className="h-[18px] w-[18px]" />
          </Link>
          {showCart ? (
            <button
              type="button"
              onClick={() => cart.setOpen(true)}
              className="flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-ink hover:bg-paper"
              aria-label={`Buka keranjang, ${cart.count} barang`}
            >
              <span className="hidden sm:inline">Keranjang</span>
              <span className={`grid h-6 min-w-6 place-items-center rounded-md px-1.5 text-xs tabular-nums ${cart.count ? "bg-ink text-white" : "border border-line text-muted"}`}>{cart.count}</span>
            </button>
          ) : null}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md text-ink hover:bg-paper xl:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {open ? (
        <nav id="menu-mobile" aria-label="Navigasi seluler" className="h-[calc(100dvh-4rem)] overflow-y-auto bg-white xl:hidden">
          <div className="container-desa pt-4 pb-10">
            <p className="text-sm text-ink md:hidden">
              <OfficeStatus jamLayanan={jamLayanan} fallback={jamRingkas} />
            </p>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block py-4 text-xl ${isActive(item.href) ? "font-bold text-ink" : "text-ink/80"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
