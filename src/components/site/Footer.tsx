import Link from "next/link";
import { waLink } from "@/lib/format";
import { NAV } from "@/lib/nav";
import type { SiteSettings } from "@/lib/types";

const FULL: Record<string, string> = { "/pasar": "Pasar Desa", "/potensi": "Wisata dan budaya", "/informasi": "Informasi desa", "/profil": "Profil desa", "/berita": "Berita dan kegiatan" };

export function Footer({ site }: { site: SiteSettings }) {
  const wa = waLink(site.whatsapp);
  const socials = [
    { href: site.instagram, label: "Instagram" },
    { href: site.facebook, label: "Facebook" },
    { href: site.youtube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-desa grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-[1.3125rem] text-white">Pemerintah Desa {site.namaDesa}</p>
          <p className="mt-1 text-sm text-white/70">
            Kecamatan {site.kecamatan}, Kabupaten {site.kabupaten}, {site.provinsi} {site.kodePos}
          </p>
          {site.alamat ? <p className="mt-5 max-w-[40ch] text-sm">{site.alamat}</p> : null}
        </div>

        <nav aria-label="Tautan halaman" className="md:col-span-3">
          <h2 className="text-sm font-bold text-white">Halaman</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-white hover:underline hover:underline-offset-4">{FULL[n.href] ?? n.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/cari" className="hover:text-white hover:underline hover:underline-offset-4">Pencarian</Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="text-sm font-bold text-white">Hubungi kami</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {site.telepon ? (
              <div>
                <dt className="text-white/60">Telepon</dt>
                <dd><a href={`tel:${site.telepon.replace(/[^\d+]/g, "")}`} className="tabular-nums hover:text-white hover:underline">{site.telepon}</a></dd>
              </div>
            ) : null}
            {site.email ? (
              <div>
                <dt className="text-white/60">Email</dt>
                <dd><a href={`mailto:${site.email}`} className="break-all hover:text-white hover:underline">{site.email}</a></dd>
              </div>
            ) : null}
            {wa ? (
              <div>
                <dt className="text-white/60">WhatsApp layanan</dt>
                <dd><a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Kirim pesan</a></dd>
              </div>
            ) : null}
          </dl>
          {socials.length ? (
            <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 underline-offset-4 hover:text-white">
                  {s.label}
                </a>
              ))}
            </p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container-desa flex flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Pemerintah Desa {site.namaDesa}. Peta dari kontributor OpenStreetMap.</p>
          <Link href="/admin" className="hover:text-white hover:underline">Masuk untuk pengelola dan penjual</Link>
        </div>
      </div>
    </footer>
  );
}
