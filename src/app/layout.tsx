import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Desa Marga Mulya — Kecamatan Mauk, Kabupaten Tangerang",
    template: "%s | Desa Marga Mulya",
  },
  description:
    "Website resmi Desa Marga Mulya, Kecamatan Mauk, Kabupaten Tangerang, Banten: profil desa, data statistik, potensi wisata dan UMKM, berita kegiatan, galeri, dan layanan kontak.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#116759",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
