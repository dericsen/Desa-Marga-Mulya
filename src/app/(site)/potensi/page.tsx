import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, FilterTabs, PageHeader, PotensiCard } from "@/components/site/ui";
import { POTENSI_TYPES } from "@/lib/categories";
import { getPotensi } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wisata & Budaya" };

const DESKRIPSI: Record<string, string> = {
  wisata: "Tempat rekreasi dan eduwisata di dalam dan sekitar desa.",
  budaya: "Kesenian dan tradisi yang dijaga bersama warga.",
  umkm: "Olahan hasil tambak, laut, dan sawah serta kerajinan warga. Pesan langsung ke pembuatnya lewat WhatsApp.",
};

export default async function PotensiPage({ searchParams }: { searchParams: Promise<{ jenis?: string }> }) {
  const { jenis } = await searchParams;
  const potensi = await getPotensi();
  const aktif = POTENSI_TYPES.find((t) => t.key === jenis && t.key !== "umkm")?.key ?? null;
  // Produk UMKM kini ada di Pasar Desa; halaman ini fokus pada wisata dan budaya.
  const urutan = ["wisata", "budaya"];
  const groups = urutan
    .map((k) => POTENSI_TYPES.find((t) => t.key === k)!)
    .filter((t) => !aktif || t.key === aktif)
    .map((t) => ({ ...t, items: potensi.filter((p) => p.tipe === t.key) }))
    .filter((g) => g.items.length);

  return (
    <>
      <PageHeader
        title="Wisata & Budaya"
        crumb="Potensi desa"
        description="Tempat yang bisa dikunjungi serta kesenian dan tradisi yang dijaga warga Desa Marga Mulya."
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

        <aside className="mt-16 flex flex-col gap-4 rounded-2xl bg-paper p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="max-w-[60ch] text-ink">
            <span className="font-bold">Mencari oleh-oleh?</span> <span className="text-ink/75">Bandeng presto, kerupuk ikan, beras, dan anyaman bambu dijual langsung oleh warga di Pasar Desa.</span>
          </p>
          <Link href="/pasar" className="btn-primary shrink-0">Buka Pasar Desa</Link>
        </aside>
      </div>
    </>
  );
}
