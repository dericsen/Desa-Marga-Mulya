import type { Metadata } from "next";
import Link from "next/link";
import { AddToCart } from "@/components/pasar/AddToCart";
import { ProductCard, toCartProduct } from "@/components/pasar/ProductCard";
import { ProductDialog } from "@/components/pasar/ProductDialog";
import { EmptyState, FilterTabs, Img, PageHeader } from "@/components/site/ui";
import { PRODUK_KATEGORI } from "@/lib/categories";
import { getPenjual, getProduk, getProdukBySlug } from "@/lib/data";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Pasar Desa",
  description: "Belanja produk olahan ikan, hasil tani, camilan, dan kerajinan langsung dari warga Desa Marga Mulya.",
};

type SP = { q?: string; kategori?: string; penjual?: string; urut?: string; produk?: string };
const URUT = [
  { key: "populer", label: "Pilihan" },
  { key: "termurah", label: "Termurah" },
  { key: "termahal", label: "Termahal" },
  { key: "terbaru", label: "Terbaru" },
] as const;

function href(base: SP, patch: Partial<SP>): string {
  const merged: Record<string, string | undefined> = { ...base, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/pasar?${s}` : "/pasar";
}

export default async function PasarPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (sp.q || "").trim().slice(0, 80);
  const kategori = PRODUK_KATEGORI.find((k) => k.key === sp.kategori)?.key;
  const urut = URUT.find((u) => u.key === sp.urut)?.key ?? "populer";
  const base: SP = { q: q || undefined, kategori, penjual: sp.penjual || undefined, urut: urut === "populer" ? undefined : urut };

  const [produk, penjual, detail] = await Promise.all([
    getProduk({ q, kategori, penjual: sp.penjual, urut }),
    getPenjual(),
    sp.produk ? getProdukBySlug(sp.produk) : Promise.resolve(null),
  ]);
  const penjualAktif = sp.penjual ? penjual.find((p) => p.slug === sp.penjual) : undefined;
  const lainDariPenjual = detail ? (await getProduk({ penjual: detail.penjual_slug, limit: 5 })).filter((p) => p.id !== detail.id).slice(0, 4) : [];
  const adaFilter = Boolean(q || kategori || sp.penjual);

  return (
    <>
      <PageHeader
        title="Pasar Desa"
        description="Olahan ikan, hasil tani, camilan, dan kerajinan buatan warga Marga Mulya. Pesan di sini, lalu penjual menghubungi Anda lewat WhatsApp."
      />

      {/* Cara belanja: tiga langkah, ringkas */}
      <div className="container-desa pt-4">
        <ol className="grid gap-5 rounded-[1.75rem] bg-white p-6 text-sm sm:grid-cols-3 sm:gap-8">
          {[
            ["Pilih produk", "Masukkan ke keranjang. Boleh dari beberapa penjual sekaligus."],
            ["Isi nama dan nomor HP", "Pilih ambil sendiri atau diantar di dalam desa."],
            ["Kirim ke WhatsApp penjual", "Bayar langsung ke penjual, tunai atau transfer."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sun-400 text-xs font-semibold text-ink tabular-nums">{i + 1}</span>
              <span>
                <span className="block font-semibold text-ink">{t}</span>
                <span className="text-muted">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="container-desa pt-8">
        {/* Pencarian + urutan */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form action="/pasar" method="get" role="search" className="flex w-full max-w-md gap-2">
            {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
            {sp.penjual ? <input type="hidden" name="penjual" value={sp.penjual} /> : null}
            <label htmlFor="cari-produk" className="sr-only">Cari produk</label>
            <input id="cari-produk" name="q" defaultValue={q} placeholder="Cari produk atau penjual" className="input" />
            <button type="submit" className="btn-light">Cari</button>
          </form>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="text-muted">Urutkan:</span>
            {URUT.map((u) => (
              <Link
                key={u.key}
                href={href(base, { urut: u.key === "populer" ? undefined : u.key })}
                aria-current={urut === u.key ? "true" : undefined}
                className={`rounded-full px-3 py-1 ${urut === u.key ? "bg-white font-medium text-ink shadow-[0_0_0_1px_rgb(11_19_16/0.08)]" : "text-muted hover:text-ink"}`}
              >
                {u.label}
              </Link>
            ))}
          </p>
        </div>

        <div className="mt-6">
          <FilterTabs
            label="Kategori produk"
            items={[
              { href: href(base, { kategori: undefined }), label: "Semua", active: !kategori },
              ...PRODUK_KATEGORI.map((k) => ({ href: href(base, { kategori: k.key }), label: k.label, active: kategori === k.key })),
            ]}
          />
        </div>

        {penjualAktif ? (
          <section className="mt-8 grid gap-5 rounded-[1.75rem] bg-white p-6 sm:grid-cols-[6rem_1fr]" aria-label={`Tentang ${penjualAktif.nama}`}>
            <Img src={penjualAktif.foto} alt="" className="aspect-square w-24 rounded-2xl" />
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">{penjualAktif.nama}</h2>
              <p className="meta mt-1">{[penjualAktif.pemilik, penjualAktif.alamat].filter(Boolean).join(" · ")}</p>
              {penjualAktif.deskripsi ? <p className="mt-2 max-w-[60ch] leading-relaxed text-muted">{penjualAktif.deskripsi}</p> : null}
              <Link href={href(base, { penjual: undefined })} className="link mt-3 inline-block text-sm">Lihat semua penjual</Link>
            </div>
          </section>
        ) : null}

        <p className="mt-6 text-sm text-muted" role="status">
          <span className="font-semibold text-ink tabular-nums">{produk.length}</span> produk
          {q ? <> untuk “{q}”</> : null}
          {adaFilter ? (
            <>
              {" · "}
              <Link href="/pasar" className="link font-normal">Hapus filter</Link>
            </>
          ) : null}
        </p>

        {produk.length ? (
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {produk.map((p) => (
              <li key={p.id}>
                <ProductCard p={p} detailHref={href(base, { produk: p.slug })} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="Tidak ada produk yang cocok"
              text={q ? "Coba kata kunci lain, misalnya “bandeng” atau “beras”." : "Belum ada produk di kategori ini. Admin desa dapat menambahkannya melalui CMS."}
              action={{ href: "/pasar", label: "Lihat semua produk" }}
            />
          </div>
        )}

        {/* Direktori pelaku usaha */}
        {penjual.length && !penjualAktif ? (
          <section className="mt-20" aria-labelledby="judul-penjual">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 id="judul-penjual" className="section-title">Pelaku usaha</h2>
              <p className="text-sm text-muted tabular-nums">{penjual.length} usaha warga</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {penjual.map((j) => (
                <li key={j.id}>
                  <Link href={href({}, { penjual: j.slug })} className="card-hover group grid grid-cols-[3.5rem_1fr] items-center gap-4 p-4">
                    <Img src={j.foto} alt="" className="aspect-square w-14 rounded-2xl" />
                    <span>
                      <span className="block font-semibold text-ink">{j.nama}</span>
                      <span className="block text-sm text-muted">{[j.pemilik, j.alamat].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="col-start-2 text-sm text-muted tabular-nums">
                      {j.jumlah_produk} produk{j.harga_min !== null ? ` · mulai ${formatRupiah(j.harga_min)}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              Warga yang ingin berjualan di Pasar Desa dapat mendaftar ke kantor desa atau <Link href="/kontak" className="link">mengirim pesan</Link>.
            </p>
          </section>
        ) : null}
      </div>

      {/* Detail produk */}
      {detail ? (
        <ProductDialog closeHref={href(base, {})} title={detail.nama}>
          <div className="grid md:grid-cols-2">
            <Img src={detail.gambar} alt={detail.nama} className="aspect-square w-full md:aspect-auto md:h-full md:min-h-[26rem]" />
            <div className="flex flex-col p-6 sm:p-8">
              <Link href={href({}, { penjual: detail.penjual_slug })} className="text-sm text-muted hover:text-ink hover:underline">
                {detail.penjual_nama}
              </Link>
              <h2 className="font-display mt-1 pr-8 text-[1.75rem] leading-tight font-semibold text-ink">{detail.nama}</h2>
              {detail.satuan ? <p className="mt-1 text-muted">{detail.satuan}</p> : null}
              <p className="mt-4 text-2xl font-semibold text-ink tabular-nums">{formatRupiah(detail.harga)}</p>
              {detail.deskripsi ? <p className="mt-4 leading-relaxed text-ink/85">{detail.deskripsi}</p> : null}
              <div className="mt-6">
                <AddToCart product={toCartProduct(detail)} tersedia={detail.stok !== 0} variant="full" />
              </div>
              <dl className="mt-6 space-y-2 rounded-2xl bg-white p-4 text-sm">
                {detail.penjual_alamat ? (
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-muted">Lokasi</dt>
                    <dd className="text-ink">{detail.penjual_alamat}, Desa Marga Mulya</dd>
                  </div>
                ) : null}
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-muted">Pembayaran</dt>
                  <dd className="text-ink">Langsung ke penjual, tunai atau transfer</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-muted">Kategori</dt>
                  <dd className="text-ink">{PRODUK_KATEGORI.find((k) => k.key === detail.kategori)?.label ?? detail.kategori}</dd>
                </div>
              </dl>
              {lainDariPenjual.length ? (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-ink">Produk lain dari {detail.penjual_nama}</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {lainDariPenjual.map((p) => (
                      <li key={p.id} className="flex justify-between gap-3">
                        <Link href={href(base, { produk: p.slug })} scroll={false} className="text-ink hover:underline">
                          {p.nama} <span className="text-muted">{p.satuan}</span>
                        </Link>
                        <span className="shrink-0 text-muted tabular-nums">{formatRupiah(p.harga)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </ProductDialog>
      ) : sp.produk ? (
        <ProductDialog closeHref={href(base, {})} title="Produk tidak ditemukan">
          <div className="p-8">
            <p className="font-semibold text-ink">Produk ini sudah tidak dijual.</p>
            <p className="mt-1 text-sm text-muted">Penjual mungkin sedang menghentikan produk ini sementara.</p>
          </div>
        </ProductDialog>
      ) : null}
    </>
  );
}
