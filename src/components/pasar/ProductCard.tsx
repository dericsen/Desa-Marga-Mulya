import Link from "next/link";
import { Img } from "@/components/site/ui";
import { formatRupiah } from "@/lib/format";
import type { Produk } from "@/lib/types";
import { AddToCart } from "./AddToCart";
import type { CartItem } from "./CartContext";

export function toCartProduct(p: Produk): Omit<CartItem, "qty"> {
  return {
    id: p.id,
    slug: p.slug,
    nama: p.nama,
    harga: p.harga,
    satuan: p.satuan,
    gambar: p.gambar,
    penjualId: p.penjual_id,
    penjualNama: p.penjual_nama,
    stok: p.stok,
  };
}

/** Kartu produk: gambar & nama membuka detail; tombol tambah langsung ke keranjang. */
export function ProductCard({ p, detailHref }: { p: Produk; detailHref: string }) {
  const habis = p.stok === 0;
  const menipis = p.stok !== null && p.stok > 0 && p.stok <= 5;
  return (
    <article className="flex h-full flex-col">
      <Link href={detailHref} scroll={false} className="group relative block overflow-hidden rounded-3xl">
        <Img src={p.gambar} alt={p.nama} className={`aspect-square w-full rounded-3xl ${habis ? "opacity-55 grayscale" : ""} transition-transform duration-500 group-hover:scale-[1.02]`} />
        {habis ? <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-muted">Habis</span> : null}
        {menipis ? <span className="absolute top-3 left-3 rounded-full bg-sun-400 px-2.5 py-1 text-xs font-medium text-ink">Sisa {p.stok}</span> : null}
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <p className="truncate text-xs text-muted">{p.penjual_nama}</p>
        <h3 className="mt-0.5 leading-snug font-semibold text-ink">
          <Link href={detailHref} scroll={false} className="hover:underline hover:underline-offset-4">
            {p.nama}
          </Link>
        </h3>
        {p.satuan ? <p className="mt-1 text-sm text-muted">{p.satuan}</p> : null}
        <p className="mt-2 text-[1.0625rem] font-semibold text-ink tabular-nums">{formatRupiah(p.harga)}</p>
        <div className="mt-auto pt-3">
          <AddToCart product={toCartProduct(p)} tersedia={!habis} />
        </div>
      </div>
    </article>
  );
}
