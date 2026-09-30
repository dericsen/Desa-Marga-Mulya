import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Desa Marga Mulya — Kecamatan Mauk, Kabupaten Tangerang",
    template: "%s · Desa Marga Mulya",
  },
  description:
    "Website resmi Desa Marga Mulya, Kecamatan Mauk, Kabupaten Tangerang, Banten: layanan kantor desa, pengumuman, data desa, Pasar Desa, wisata, dan kontak pemerintah desa.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0b1310",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
