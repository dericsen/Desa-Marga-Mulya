import { CartProvider } from "@/components/pasar/CartContext";
import { CartDrawer } from "@/components/pasar/CartDrawer";
import { ChatWidget } from "@/components/site/ChatWidget";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getSite, getStatusManual } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, statusManual] = await Promise.all([getSite(), getStatusManual()]);
  const jamRingkas = site.jamLayanan.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 2).join(" · ") || "Hubungi kami untuk jam layanan";
  return (
    <CartProvider>
      <a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold">
        Lewati ke konten utama
      </a>
      <Header namaDesa={site.namaDesa} wilayah={`Kec. ${site.kecamatan} · Kab. ${site.kabupaten}`} jamRingkas={jamRingkas} jamLayanan={site.jamLayanan} statusManual={statusManual} telepon={site.telepon} />
      <main id="konten">{children}</main>
      <Footer site={site} />
      <ChatWidget namaDesa={site.namaDesa} />
      <CartDrawer />
    </CartProvider>
  );
}
