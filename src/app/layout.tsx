import type { Metadata, Viewport } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = Public_Sans({ subsets: ["latin"], variable: "--font-public", display: "swap" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Desa Marga Mulya — Kecamatan Mauk, Kabupaten Tangerang",
    template: "%s · Desa Marga Mulya",
  },
  description:
    "Website resmi Desa Marga Mulya, Kecamatan Mauk, Kabupaten Tangerang, Banten: layanan kantor desa, pengumuman, data desa, potensi wisata dan UMKM, serta kontak pemerintah desa.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#152d23",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
