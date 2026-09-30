"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { IconName } from "@/lib/categories";

export type MenuItem = { href: string; label: string; short?: string; icon: IconName; badge?: number; exact?: boolean };

function useActive() {
  const pathname = usePathname();
  return (m: MenuItem) => (m.exact ? pathname === m.href : pathname === m.href || pathname.startsWith(m.href + "/") || pathname.startsWith(m.href + "?"));
}

/** Menu samping CMS (desktop) dan daftar menu di laci seluler. */
export function SideNav({ items }: { items: MenuItem[] }) {
  const isActive = useActive();
  return (
    <ul className="space-y-0.5">
      {items.map((m) => {
        const active = isActive(m);
        return (
          <li key={m.href}>
            <Link
              href={m.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active ? "bg-white/12 font-semibold text-white" : "text-brand-100/85 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon name={m.icon} className="h-[18px] w-[18px] shrink-0 opacity-80" />
              <span className="flex-1">{m.label}</span>
              {m.badge ? <span className="rounded-sm bg-sun-400 px-1.5 py-0.5 text-xs font-semibold text-ink tabular-nums">{m.badge}</span> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Bilah menu bawah untuk penjual di HP — target sentuh besar, 4 tujuan utama. */
export function BottomNav({ items }: { items: MenuItem[] }) {
  const isActive = useActive();
  return (
    <nav aria-label="Menu penjual" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((m) => {
          const active = isActive(m);
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[0.6875rem] font-semibold ${active ? "text-brand-700" : "text-muted"}`}
              >
                {active ? <span className="absolute inset-x-6 top-0 h-0.5 bg-brand-700" aria-hidden="true" /> : null}
                <span className="relative">
                  <Icon name={m.icon} className="h-5 w-5" />
                  {m.badge ? (
                    <span className="absolute -top-1.5 -right-2.5 min-w-4 rounded-sm bg-sun-400 px-1 text-center text-[0.625rem] leading-4 font-semibold text-ink tabular-nums">{m.badge}</span>
                  ) : null}
                </span>
                {m.short ?? m.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
