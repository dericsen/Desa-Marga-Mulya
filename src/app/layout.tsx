import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// DejaVu Sans (subset LGC) — lisensi Bitstream Vera, lihat public/fonts/LICENSE-DejaVu.md
const dejavu = localFont({
  src: [
    { path: "../../public/fonts/DejaVuLGCSans.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/DejaVuLGCSans-Oblique.woff2", weight: "400", style: "italic" },
    { path: "../../public/fonts/DejaVuLGCSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dejavu",
  display: "swap",
  fallback: ["Verdana", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Desa Marga Mulya — Kecamatan Mauk, Kabupaten Tangerang",
    template: "%s | Desa Marga Mulya",
  },
  description:
    "Website resmi Desa Marga Mulya, Kecamatan Mauk, Kabupaten Tangerang, Banten: layanan kantor desa, pengumuman, data desa, Pasar Desa, wisata, dan kontak pemerintah desa.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#36454f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={dejavu.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
