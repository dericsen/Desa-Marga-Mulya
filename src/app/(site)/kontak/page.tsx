import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { ContactForm } from "@/components/site/ContactForm";
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

  return (
    <>
      <PageHeader eyebrow="Kontak" title="Hubungi Kantor Desa" description="Layanan informasi, administrasi, pengaduan, dan aspirasi warga Desa Marga Mulya." />
      <div className="container-desa mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <ul className="grid gap-4 sm:grid-cols-2">
            {site.alamat ? (
              <InfoCard icon="pin" title="Alamat">
                {site.alamat}
              </InfoCard>
            ) : null}
            {site.jamLayanan ? (
              <InfoCard icon="clock" title="Jam Layanan">
                <span className="whitespace-pre-line">{site.jamLayanan}</span>
              </InfoCard>
            ) : null}
            {site.telepon ? (
              <InfoCard icon="phone" title="Telepon">
                <a className="font-semibold text-brand-700 hover:underline" href={`tel:${site.telepon.replace(/[^\d+]/g, "")}`}>{site.telepon}</a>
              </InfoCard>
            ) : null}
            {site.email ? (
              <InfoCard icon="mail" title="Email">
                <a className="font-semibold break-all text-brand-700 hover:underline" href={`mailto:${site.email}`}>{site.email}</a>
              </InfoCard>
            ) : null}
          </ul>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn w-full bg-[#1f9d55] py-3.5 text-base text-white hover:bg-[#178246]">
              <Icon name="whatsapp" /> Chat WhatsApp Layanan Desa
            </a>
          ) : null}
          <VillageMap center={[site.lat, site.lng]} lokasi={kantor.length ? kantor : lokasi} zoom={16} height="320px" showFilter={false} />
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-light w-full"
          >
            <Icon name="map" className="h-4 w-4" /> Petunjuk Arah ke Kantor Desa
          </a>
        </div>
        <ContactForm />
      </div>
    </>
  );
}

function InfoCard({ icon, title, children }: { icon: "pin" | "clock" | "phone" | "mail"; title: string; children: React.ReactNode }) {
  return (
    <li className="card p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <Icon name={icon} />
      </span>
      <h2 className="mt-3 text-sm font-bold tracking-wide text-stone-500 uppercase">{title}</h2>
      <div className="mt-1 text-sm text-stone-800">{children}</div>
    </li>
  );
}
