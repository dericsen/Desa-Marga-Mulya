"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/pasar/CartContext";
import { NAV } from "@/lib/nav";
import type { StatusManual } from "@/lib/jam";
import { OfficeStatus } from "./OfficeStatus";

type Props = { namaDesa: string; wilayah: string; jamRingkas: string; jamLayanan: string; statusManual?: StatusManual | null; telepon: string };

export function Header({ namaDesa, wilayah, jamRingkas, jamLayanan, statusManual }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cart = useCart();
  const showCart = cart.ready && (cart.count > 0 || pathname.startsWith("/pasar"));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${scrolled || open ? "bg-paper/85 backdrop-blur-md" : "bg-transparent"}`}>
      <div className="container-desa flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`Beranda Desa ${namaDesa}`}>
          <img src="/logo-desa.svg" alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="font-display block truncate text-[1.0625rem] font-semibold text-ink">Desa {namaDesa}</span>
            <span className="block truncate text-xs text-muted">{wilayah}</span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden xl:block">
          <ul className="flex items-center gap-0.5 rounded-full bg-white p-1 shadow-[0_1px_2px_rgb(11_19_16/0.05),0_0_0_1px_rgb(11_19_16/0.06)]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                    isActive(item.href) ? "bg-ink font-medium text-white" : "text-muted hover:bg-paper hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs text-ink shadow-[0_0_0_1px_rgb(11_19_16/0.06)] md:inline-flex">
            <OfficeStatus jamLayanan={jamLayanan} manual={statusManual} tone="light" fallback={jamRingkas} short />
          </span>
          <Link href="/cari" className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-white" aria-label="Cari informasi">
            <Icon name="search" className="h-[18px] w-[18px]" />
          </Link>
          {showCart ? (
            <button
              type="button"
              onClick={() => cart.setOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center gap-2 rounded-full bg-white text-sm font-medium text-ink shadow-[0_0_0_1px_rgb(11_19_16/0.06)] hover:shadow-[0_4px_14px_-6px_rgb(11_19_16/0.25)] sm:w-auto sm:px-3.5"
              aria-label={`Buka keranjang, ${cart.count} barang`}
            >
              <Icon name="store" className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline">Keranjang</span>
              <span
                className={`absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.6875rem] tabular-nums ring-2 ring-paper sm:static sm:text-xs sm:ring-0 ${
                  cart.count ? "bg-sun-400 text-ink" : "hidden bg-paper text-muted sm:grid"
                }`}
              >
                {cart.count}
              </span>
            </button>
          ) : null}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white xl:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open ? (
        <nav id="menu-mobile" aria-label="Navigasi seluler" className="h-[calc(100dvh-4.5rem)] overflow-y-auto xl:hidden">
          <div className="container-desa pb-8">
            <p className="mb-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs text-ink">
              <OfficeStatus jamLayanan={jamLayanan} manual={statusManual} tone="light" fallback={jamRingkas} />
            </p>
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg tracking-[-0.02em] ${isActive(item.href) ? "bg-ink font-medium text-white" : "bg-white text-ink"}`}
                  >
                    {item.label}
                    <Icon name="arrow" className={`h-4 w-4 ${isActive(item.href) ? "text-sun-400" : "text-muted"}`} />
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
