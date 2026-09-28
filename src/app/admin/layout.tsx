import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "CMS Desa", template: "%s | CMS Desa Marga Mulya" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-stone-100">{children}</div>;
}
