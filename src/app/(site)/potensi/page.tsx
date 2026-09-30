import type { Metadata } from "next";
import { EmptyState, FilterTabs, PageHeader, PotensiCard } from "@/components/site/ui";
import { POTENSI_TYPES } from "@/lib/categories";
import { getPotensi } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Potensi Desa" };

const DESKRIPSI: Record<string, string> = {
  wisata: "Tempat rekreasi dan eduwisata di dalam dan sekitar desa.",
  budaya: "Kesenian dan tradisi yang dijaga bersama warga.",
  umkm: "Olahan hasil tambak, laut, dan sawah serta kerajinan warga. Pesan langsung ke pembuatnya lewat WhatsApp.",
};

export default async function PotensiPage({ searchParams }: { searchParams: Promise<{ jenis?: string }> }) {
  const { jenis } = await searchParams;
  const potensi = await getPotensi();
  const aktif = POTENSI_TYPES.find((t) => t.key === jenis)?.key ?? null;
  // UMKM ditampilkan lebih dulu: paling berdampak langsung pada penghasilan warga.
  const urutan = ["umkm", "wisata", "budaya"];
  const groups = urutan
    .map((k) => POTENSI_TYPES.find((t) => t.key === k)!)
    .filter((t) => !aktif || t.key === aktif)
    .map((t) => ({ ...t, items: potensi.filter((p) => p.tipe === t.key) }))
    .filter((g) => g.items.length);

  return (
    <>
      <PageHeader
        title="Potensi Desa"
        description="Produk UMKM, tempat wisata, serta budaya dan kesenian Desa Marga Mulya."
      />
      <div className="container-desa pt-8">
        <FilterTabs
          label="Jenis potensi"
          items={[
            { href: "/potensi", label: "Semua", active: !aktif },
            ...urutan.map((k) => {
              const t = POTENSI_TYPES.find((x) => x.key === k)!;
              return { href: `/potensi?jenis=${t.key}`, label: t.label, active: aktif === t.key };
            }),
          ]}
        />

        {groups.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Belum ada potensi pada kategori ini" text="Admin desa dapat menambahkan wisata, budaya, atau produk UMKM melalui CMS." />
          </div>
        ) : null}

        {groups.map((g) => (
          <section key={g.key} className="pt-12" aria-labelledby={`potensi-${g.key}`}>
            <div className="mb-8 max-w-[60ch]">
              <h2 id={`potensi-${g.key}`} className="section-title">{g.label}</h2>
              <p className="mt-2 text-muted">{DESKRIPSI[g.key]}</p>
            </div>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
