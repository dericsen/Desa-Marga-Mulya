import { requireAdmin } from "@/lib/auth";
import type { Metadata } from "next";
import { saveSettings } from "@/app/admin/actions";
import { CmsForm } from "@/components/admin/CmsForm";
import { getSite } from "@/lib/data";
import { SETTINGS_GROUPS } from "@/lib/resources";

export const metadata: Metadata = { title: "Pengaturan Situs" };

export default async function PengaturanPage() {
  await requireAdmin();
  const site = await getSite();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-stone-900">Pengaturan Situs</h1>
      <p className="mt-1 mb-6 text-stone-600">Identitas desa, isi Beranda, profil, visi-misi, dan informasi kontak.</p>
      <CmsForm action={saveSettings} groups={SETTINGS_GROUPS} initial={site as unknown as Record<string, unknown>} submitLabel="Simpan Pengaturan" />
    </div>
  );
}
