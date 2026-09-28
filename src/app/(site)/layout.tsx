import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChatWidget } from "@/components/site/ChatWidget";
import { getSite } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <>
      <a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold">
        Lewati ke konten utama
      </a>
      <Header namaDesa={site.namaDesa} wilayah={`Kec. ${site.kecamatan}, Kab. ${site.kabupaten}`} />
      <main id="konten">{children}</main>
      <Footer site={site} />
      <ChatWidget namaDesa={site.namaDesa} />
    </>
  );
}
