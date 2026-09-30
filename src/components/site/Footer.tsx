import Link from "next/link";
import { waLink } from "@/lib/format";
import { NAV } from "@/lib/nav";
import type { SiteSettings } from "@/lib/types";

const FULL: Record<string, string> = { "/pasar": "Pasar Desa", "/potensi": "Wisata & Budaya", "/informasi": "Informasi Desa", "/profil": "Profil Desa", "/berita": "Berita & Kegiatan" };

export function Footer({ site }: { site: SiteSettings }) {
  const wa = waLink(site.whatsapp);
  const socials = [
    { href: site.instagram, label: "Instagram" },
    { href: site.facebook, label: "Facebook" },
    { href: site.youtube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="mt-24 bg-brand-950 text-brand-100">
      <div className="container-desa grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-xl font-semibold text-white">Pemerintah Desa {site.namaDesa}</p>
          <p className="mt-1 text-sm text-brand-200">
            Kecamatan {site.kecamatan}, Kabupaten {site.kabupaten}, {site.provinsi} {site.kodePos}
          </p>
          {site.alamat ? <p className="mt-5 max-w-[40ch] text-sm leading-relaxed">{site.alamat}</p> : null}
          {site.tagline ? <p className="mt-5 text-sm text-brand-200 italic">{site.tagline}</p> : null}
        </div>

        <nav aria-label="Tautan halaman" className="md:col-span-3">
          <h2 className="text-xs font-semibold tracking-[0.08em] text-brand-300 uppercase">Halaman</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-white hover:underline">{FULL[n.href] ?? n.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/cari" className="hover:text-white hover:underline">Pencarian</Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="text-xs font-semibold tracking-[0.08em] text-brand-300 uppercase">Hubungi kami</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {site.telepon ? (
              <div>
                <dt className="text-brand-300">Telepon</dt>
                <dd><a href={`tel:${site.telepon.replace(/[^\d+]/g, "")}`} className="tabular-nums hover:text-white hover:underline">{site.telepon}</a></dd>
              </div>
            ) : null}
            {site.email ? (
              <div>
                <dt className="text-brand-300">Email</dt>
                <dd><a href={`mailto:${site.email}`} className="break-all hover:text-white hover:underline">{site.email}</a></dd>
              </div>
            ) : null}
            {wa ? (
              <div>
                <dt className="text-brand-300">WhatsApp layanan</dt>
                <dd><a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">Kirim pesan</a></dd>
              </div>
            ) : null}
          </dl>
          {socials.length ? (
            <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="underline decoration-brand-500 underline-offset-4 hover:text-white">
                  {s.label}
                </a>
              ))}
            </p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-desa flex flex-col gap-2 py-5 text-xs text-brand-300 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Pemerintah Desa {site.namaDesa}. Peta © kontributor OpenStreetMap.</p>
          <Link href="/admin" className="hover:text-white hover:underline">Masuk pengelola</Link>
        </div>
      </div>
    </footer>
  );
}
