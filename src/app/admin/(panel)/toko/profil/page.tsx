import type { Metadata } from "next";
import { saveProfilToko } from "@/app/admin/toko/actions";
import { CmsForm } from "@/components/admin/CmsForm";
import { requirePenjual } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROFIL_TOKO_FIELDS } from "@/lib/resources";

export const metadata: Metadata = { title: "Profil toko" };

export default async function ProfilTokoPage() {
  const s = await requirePenjual();
  const [row] = await db()<Record<string, unknown>[]>`select * from penjual where id = ${s.pid}`;
  const initial: Record<string, unknown> = {};
  for (const f of PROFIL_TOKO_FIELDS) initial[f.name] = row?.[f.name];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink">Profil toko</h1>
      <p className="mt-1 text-sm text-muted">Tampil di halaman toko Anda di Pasar Desa.</p>

      <dl className="mt-6 mb-6 divide-y divide-line border-y border-line text-sm">
        <div className="grid grid-cols-[9rem_1fr] gap-3 py-3">
          <dt className="text-muted">Nama usaha</dt>
          <dd className="font-bold text-ink">{String(row?.nama ?? "")}</dd>
        </div>
        <div className="grid grid-cols-[9rem_1fr] gap-3 py-3">
          <dt className="text-muted">WhatsApp pesanan</dt>
          <dd className="text-ink tabular-nums">
            {String(row?.whatsapp ?? "")}
            <span className="mt-0.5 block text-xs text-muted">Pesanan pembeli dikirim ke nomor ini. Untuk mengganti nama usaha atau nomor, hubungi admin desa.</span>
          </dd>
        </div>
      </dl>

      <CmsForm action={saveProfilToko} groups={[{ fields: PROFIL_TOKO_FIELDS }]} initial={initial} submitLabel="Simpan profil" />
    </div>
  );
}
