import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ubahStatusPesananPenjual } from "@/app/admin/toko/actions";
import { PesananDetail } from "@/components/admin/PesananDetail";
import { requirePenjual } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Detail pesanan" };

export default async function PesananPenjualDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requirePenjual();
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const rows = await db()<Record<string, unknown>[]>`select * from pesanan where id = ${id} and penjual_id = ${s.pid}`;
  if (!rows[0]) notFound();
  return <PesananDetail row={rows[0]} id={id} statusAction={ubahStatusPesananPenjual.bind(null, id)} backHref="/admin/toko/pesanan" allowDelete={false} />;
}
