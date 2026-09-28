"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { NAV } from "@/lib/nav";


export function Header({ namaDesa, wilayah }: { namaDesa: string; wilayah: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-40 border-b transition ${
        scrolled ? "border-stone-200 bg-white/95 shadow-sm backdrop-blur" : "border-transparent bg-white"
      }`}
    >
      <div className="container-desa flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`Beranda Desa ${namaDesa}`}>
          <img src="/logo-desa.svg" alt="" width={40} height={40} className="h-10 w-10 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-extrabold text-brand-900">Desa {namaDesa}</span>
            <span className="block truncate text-xs text-stone-500">{wilayah}</span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive(item.href) ? "bg-brand-50 text-brand-800" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/cari" className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" aria-label="Cari informasi">
            <Icon name="search" />
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-stone-700 hover:bg-stone-100 lg:hidden"
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
        <nav id="menu-mobile" aria-label="Navigasi seluler" className="border-t border-stone-200 bg-white lg:hidden">
          <ul className="container-desa grid gap-1 py-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3 text-base font-semibold ${
                    isActive(item.href) ? "bg-brand-50 text-brand-800" : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
