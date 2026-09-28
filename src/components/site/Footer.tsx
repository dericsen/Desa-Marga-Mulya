import Link from "next/link";
import { Icon } from "@/components/Icon";
import { waLink } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";
import { NAV } from "@/lib/nav";

export function Footer({ site }: { site: SiteSettings }) {
  const wa = waLink(site.whatsapp);
  const socials = [
    { href: site.instagram, label: "Instagram" },
    { href: site.facebook, label: "Facebook" },
    { href: site.youtube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="mt-20 bg-brand-950 text-brand-50">
      <div className="container-desa grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo-desa.svg" alt="" width={44} height={44} className="h-11 w-11" />
            <div>
              <p className="text-lg font-extrabold">Desa {site.namaDesa}</p>
              <p className="text-sm text-brand-200">
                Kec. {site.kecamatan}, Kab. {site.kabupaten}, {site.provinsi}
              </p>
            </div>
          </div>
          {site.tagline ? <p className="mt-4 text-sm text-brand-100/80">{site.tagline}</p> : null}
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-wider text-brand-300 uppercase">Jelajahi</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-brand-50/90 hover:text-white hover:underline">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/cari" className="text-brand-50/90 hover:text-white hover:underline">
                Pencarian
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-wider text-brand-300 uppercase">Kantor Desa</h2>
          <ul className="mt-4 space-y-3 text-sm text-brand-50/90">
            {site.alamat ? (
              <li className="flex gap-3">
                <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <span>{site.alamat}</span>
              </li>
            ) : null}
            {site.telepon ? (
              <li className="flex gap-3">
                <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <a href={`tel:${site.telepon.replace(/[^\d+]/g, "")}`} className="hover:underline">{site.telepon}</a>
              </li>
            ) : null}
            {site.email ? (
              <li className="flex gap-3">
                <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>
              </li>
            ) : null}
            {wa ? (
              <li className="flex gap-3">
                <Icon name="whatsapp" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp Layanan Desa</a>
              </li>
            ) : null}
          </ul>
          {socials.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-desa flex flex-col gap-2 py-5 text-xs text-brand-200/80 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Pemerintah Desa {site.namaDesa}. Seluruh konten dikelola melalui CMS desa.</p>
          <Link href="/admin" className="hover:text-white hover:underline">Masuk Admin</Link>
        </div>
      </div>
    </footer>
  );
}
