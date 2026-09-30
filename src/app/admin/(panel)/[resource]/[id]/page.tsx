import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteResource, saveResource, setPesanDibaca } from "@/app/admin/actions";
import { CmsForm } from "@/components/admin/CmsForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Icon } from "@/components/Icon";
import { db } from "@/lib/db";
import { formatDateTime, toDateInput, waLink } from "@/lib/format";
import { withRelationOptions } from "@/lib/relations";
import { getResource } from "@/lib/resources";
import { PesananDetail } from "@/components/admin/PesananDetail";

type Props = { params: Promise<{ resource: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { resource } = await params;
  return { title: `Ubah ${getResource(resource)?.singular ?? "Data"}` };
}

export default async function EditResourcePage({ params }: Props) {
  const { resource: key, id: rawId } = await params;
  const resource = getResource(key);
  const id = Number(rawId);
  if (!resource || !Number.isInteger(id) || id <= 0) notFound();

  const sql = db();
  const rows = await sql<Record<string, unknown>[]>`select * from ${sql(resource.table)} where id = ${id}`;
  const row = rows[0];
  if (!row) notFound();

  const remove = deleteResource.bind(null, key, id);

  if (key === "pesanan") {
    return <PesananDetail row={row} id={id} />;
  }

  if (resource.readonly) {
    if (key === "pesan" && !row.dibaca) await sql`update pesan set dibaca = true where id = ${id}`;
    const wa = waLink(row.telepon as string | null, `Halo ${row.nama}, menanggapi pesan Anda kepada Pemerintah Desa Marga Mulya: `);
    return (
      <div className="mx-auto max-w-3xl">
        <Link href={`/admin/${key}`} className="text-sm font-semibold text-brand-700 hover:underline">← {resource.label}</Link>
        <article className="card mt-3 p-6">
          <h1 className="text-xl font-extrabold text-stone-900">{String(row.subjek || "(tanpa subjek)")}</h1>
          <p className="mt-1 text-sm text-stone-500">Diterima {formatDateTime(row.created_at as Date)}</p>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-stone-500">Nama</dt><dd className="font-semibold">{String(row.nama)}</dd></div>
            <div><dt className="text-stone-500">Email</dt><dd className="font-semibold break-all">{String(row.email || "-")}</dd></div>
            <div><dt className="text-stone-500">Telepon</dt><dd className="font-semibold">{String(row.telepon || "-")}</dd></div>
          </dl>
          <p className="mt-5 rounded-xl bg-stone-50 p-4 whitespace-pre-line text-stone-800">{String(row.pesan)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {row.email ? (
              <a href={`mailto:${row.email}?subject=${encodeURIComponent(`Re: ${row.subjek || "Pesan untuk Desa Marga Mulya"}`)}`} className="btn-primary">
                <Icon name="mail" className="h-4 w-4" /> Balas via Email
              </a>
            ) : null}
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-[#1f9d55] text-white hover:bg-[#178246]">
                <Icon name="whatsapp" className="h-4 w-4" /> Balas via WhatsApp
              </a>
            ) : null}
            <form action={setPesanDibaca.bind(null, id, false)}>
              <button type="submit" className="btn-light">Tandai belum dibaca</button>
            </form>
            <form action={remove}>
              <ConfirmButton message="Hapus pesan ini?" className="btn-light text-red-600">
                <Icon name="trash" className="h-4 w-4" /> Hapus
              </ConfirmButton>
            </form>
          </div>
        </article>
      </div>
    );
  }

  const initial: Record<string, unknown> = {};
  for (const f of resource.fields) {
    const v = row[f.name];
    initial[f.name] = f.type === "date" ? toDateInput(v as Date | string | null) : v;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/admin/${key}`} className="text-sm font-semibold text-brand-700 hover:underline">← {resource.label}</Link>
      <div className="mt-2 mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-stone-900">Ubah {resource.singular}</h1>
        <form action={remove}>
          <ConfirmButton message="Hapus data ini secara permanen?" className="btn-light text-red-600">
            <Icon name="trash" className="h-4 w-4" /> Hapus
          </ConfirmButton>
        </form>
      </div>
      <CmsForm action={saveResource.bind(null, key, id)} groups={[{ fields: await withRelationOptions(resource.fields) }]} initial={initial} cancelHref={`/admin/${key}`} />
    </div>
  );
}
