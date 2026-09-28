import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { EmptyState, PageHeader, PotensiCard } from "@/components/site/ui";
import { POTENSI_TYPES } from "@/lib/categories";
import { getPotensi } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Potensi Desa" };

const DESKRIPSI: Record<string, string> = {
  wisata: "Destinasi rekreasi dan eduwisata di dalam dan sekitar desa.",
  budaya: "Kesenian dan tradisi yang dijaga bersama oleh warga.",
  umkm: "Produk olahan dan kerajinan warga — pesan langsung ke pelaku usaha melalui WhatsApp.",
};

export default async function PotensiPage({ searchParams }: { searchParams: Promise<{ jenis?: string }> }) {
  const { jenis } = await searchParams;
  const potensi = await getPotensi();
  const aktif = POTENSI_TYPES.find((t) => t.key === jenis)?.key ?? null;
  const groups = POTENSI_TYPES.filter((t) => !aktif || t.key === aktif)
    .map((t) => ({ ...t, items: potensi.filter((p) => p.tipe === t.key) }))
    .filter((g) => g.items.length);

  return (
    <>
      <PageHeader
        eyebrow="Potensi Desa"
        title="Wisata, Budaya & UMKM"
        description="Potensi lokal Desa Marga Mulya: kekayaan pesisir, hamparan sawah, kesenian warga, dan produk UMKM yang siap Anda dukung."
      />
      <div className="container-desa mt-10">
        <nav aria-label="Jenis potensi">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href="/potensi" aria-current={!aktif ? "page" : undefined} className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ring-1 ${!aktif ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-stone-700 ring-stone-200"}`}>
                Semua
              </Link>
            </li>
            {POTENSI_TYPES.map((t) => (
              <li key={t.key}>
                <Link
                  href={`/potensi?jenis=${t.key}`}
                  aria-current={aktif === t.key ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${aktif === t.key ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-stone-700 ring-stone-200"}`}
                >
                  <Icon name={t.icon} className="h-4 w-4" /> {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {groups.length === 0 ? <div className="mt-10"><EmptyState text="Belum ada data potensi." /></div> : null}

        {groups.map((g) => (
          <section key={g.key} className="mt-12" aria-labelledby={`potensi-${g.key}`}>
            <h2 id={`potensi-${g.key}`} className="section-title flex items-center gap-3">
              <Icon name={g.icon} className="h-7 w-7 text-brand-600" /> {g.label}
            </h2>
            <p className="mt-1 mb-6 text-stone-600">{DESKRIPSI[g.key]}</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((p) => (
                <PotensiCard key={p.id} item={p} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
