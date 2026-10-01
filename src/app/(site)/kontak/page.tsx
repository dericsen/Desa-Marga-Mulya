import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { JamLayanan } from "@/components/site/JamLayanan";
import { PageHeader } from "@/components/site/ui";
import { VillageMap } from "@/components/site/VillageMap";
import { getLokasi, getSite } from "@/lib/data";
import { waLink } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kontak" };

export default async function KontakPage() {
  const [site, lokasi] = await Promise.all([getSite(), getLokasi()]);
  const wa = waLink(site.whatsapp, `Halo Pemerintah Desa ${site.namaDesa}, saya ingin bertanya.`);
  const kantor = lokasi.filter((l) => l.kategori === "pemerintahan");

  const baris: { label: string; isi: React.ReactNode }[] = [];
  if (site.alamat) baris.push({ label: "Alamat", isi: site.alamat });
  if (site.jamLayanan) baris.push({ label: "Jam layanan", isi: <JamLayanan teks={site.jamLayanan} /> });
  if (site.telepon) baris.push({ label: "Telepon", isi: <a className="tabular-nums hover:underline" href={`tel:${site.telepon.replace(/[^\d+]/g, "")}`}>{site.telepon}</a> });
  if (site.email) baris.push({ label: "Email", isi: <a className="break-all hover:underline" href={`mailto:${site.email}`}>{site.email}</a> });
  if (wa) baris.push({ label: "WhatsApp", isi: <a className="link" href={wa} target="_blank" rel="noopener noreferrer">Kirim pesan WhatsApp</a> });

  return (
    <>
      <PageHeader
        title="Kontak"
        description="Datang langsung ke kantor desa pada jam layanan, hubungi lewat telepon atau WhatsApp, atau kirim pesan tertulis melalui formulir di halaman ini."
      />
      <div className="container-desa grid gap-12 pt-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="text-sm font-medium text-muted">Kantor Desa {site.namaDesa}</h2>
          <dl className="mt-3 divide-y divide-line rounded-3xl bg-white px-5 text-[0.9375rem]">
            {baris.map((b) => (
              <div key={b.label} className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr] sm:gap-3">
                <dt className="text-sm text-muted sm:text-[0.9375rem]">{b.label}</dt>
                <dd className="text-ink">{b.isi}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <VillageMap center={[site.lat, site.lng]} lokasi={kantor.length ? kantor : lokasi} zoom={16} height="300px" showFilter={false} />
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-block text-sm">
              Buka petunjuk arah di Google Maps
            </a>
          </div>
        </div>
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </>
  );
}
