import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteResource } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Icon } from "@/components/Icon";
import { db } from "@/lib/db";
import { formatDate, formatDateTime, formatRupiah } from "@/lib/format";
import { relationLabels } from "@/lib/relations";
import { getResource, optionLabel } from "@/lib/resources";

const PESAN: Record<string, string> = {
  ditambahkan: "Data berhasil ditambahkan.",
  diperbarui: "Perubahan berhasil disimpan.",
  dihapus: "Data berhasil dihapus.",
  "gagal-hapus": "Data tidak dapat dihapus karena masih dipakai data lain (mis. penjual yang masih punya produk). Hapus atau pindahkan data terkait terlebih dahulu.",
};

type Props = { params: Promise<{ resource: string }>; searchParams: Promise<{ q?: string; pesan?: string }> };

export async function generateMetadata({ params }: Props) {
  const { resource } = await params;
  return { title: getResource(resource)?.label ?? "CMS" };
}

export default async function ResourceListPage({ params, searchParams }: Props) {
  const { resource: key } = await params;
  const { q = "", pesan } = await searchParams;
  const resource = getResource(key);
  if (!resource) notFound();

  const searchCol = resource.searchColumn ?? resource.columns.find((c) => !c.type)?.name ?? "id";
  const sql = db();
  const keyword = q.trim().slice(0, 100);
  const rows = (await sql.unsafe(
    `select * from "${resource.table}" ${keyword ? `where "${searchCol}"::text ilike $1` : ""} order by ${resource.orderBy} limit 500`,
    keyword ? [`%${keyword}%`] : []
  )) as unknown as Record<string, unknown>[];

  const relMaps = new Map<string, Map<string, string>>();
  for (const c of resource.columns) if (c.type === "relation" && c.relation) relMaps.set(c.name, await relationLabels(c.relation));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">{resource.label}</h1>
          <p className="mt-1 text-stone-600">{resource.description}</p>
        </div>
        <div className="flex gap-2">
          {resource.publicPath ? (
            <Link href={resource.publicPath} target="_blank" className="btn-light">
              <Icon name="arrow" className="h-4 w-4" /> Lihat di Website
            </Link>
          ) : null}
          {!resource.readonly ? (
            <Link href={`/admin/${key}/baru`} className="btn-primary">
              <Icon name="plus" className="h-4 w-4" /> Tambah {resource.singular}
            </Link>
          ) : null}
        </div>
      </div>

      {pesan && PESAN[pesan] ? (
        <p
          role="status"
          className={`mt-5 rounded-md border p-3 text-sm font-semibold ${pesan === "gagal-hapus" ? "border-red-200 bg-red-50 text-red-800" : "border-brand-200 bg-brand-50 text-brand-800"}`}
        >
          {PESAN[pesan]}
        </p>
      ) : null}

      <form className="mt-5 flex max-w-md gap-2" role="search">
        <label htmlFor="q" className="sr-only">Cari</label>
        <input id="q" name="q" defaultValue={keyword} placeholder={`Cari ${(resource.columns.find((c) => c.name === searchCol) ?? resource.columns.find((c) => !c.type))?.label.toLowerCase() ?? ""}…`} className="input" />
        <button type="submit" className="btn-light">
          <Icon name="search" className="h-4 w-4" />
          <span className="sr-only">Cari</span>
        </button>
      </form>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs font-bold tracking-wide text-stone-500 uppercase">
              {resource.columns.map((c) => (
                <th key={c.name} scope="col" className={`px-4 py-3 ${c.type === "image" ? "w-16" : ""}`}>
                  {c.label || <span className="sr-only">Gambar</span>}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = Number(row.id);
              const remove = deleteResource.bind(null, key, id);
              return (
                <tr key={id} className={`border-b border-stone-100 last:border-0 hover:bg-stone-50 ${(key === "pesan" && !row.dibaca) || (key === "pesanan" && row.status === "baru") ? "font-semibold" : ""}`}>
                  {resource.columns.map((c) => (
                    <td key={c.name} className="px-4 py-3 align-middle text-stone-700">
                      <Cell
                        type={c.type}
                        name={c.name}
                        value={row[c.name]}
                        label={
                          c.type === "select"
                            ? optionLabel(resource, c.name, row[c.name])
                            : c.type === "relation"
                              ? (relMaps.get(c.name)?.get(String(row[c.name])) ?? "–")
                              : undefined
                        }
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/${key}/${id}`} className="rounded-lg p-2 text-brand-700 hover:bg-brand-50" aria-label={resource.readonly ? "Buka" : "Ubah"}>
                        <Icon name={resource.readonly ? "inbox" : "edit"} className="h-4 w-4" />
                      </Link>
                      <form action={remove}>
                        <ConfirmButton message="Hapus data ini secara permanen?" className="rounded-lg p-2 text-red-600 hover:bg-red-50" label="Hapus">
                          <Icon name="trash" className="h-4 w-4" />
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={resource.columns.length + 1} className="px-4 py-10 text-center text-stone-500">
                  {keyword ? "Tidak ada data yang cocok." : "Belum ada data."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-stone-500">{rows.length} data</p>
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  baru: "bg-sun-50 text-sun-600 border-sun-400/50",
  diproses: "bg-brand-50 text-brand-700 border-brand-200",
  selesai: "bg-stone-100 text-stone-600 border-stone-200",
  dibatalkan: "bg-red-50 text-red-700 border-red-200",
};

function Cell({ type, name, value, label }: { type?: string; name: string; value: unknown; label?: string }) {
  if (name === "status" && typeof value === "string") {
    return <span className={`rounded-sm border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[value] ?? ""}`}>{label}</span>;
  }
  if (type === "rupiah") return <span className="tabular-nums">{formatRupiah(value as number)}</span>;
  if (type === "number") return <span className="tabular-nums">{value === null || value === undefined ? "Selalu ada" : String(value)}</span>;
  if (type === "relation") return <>{label}</>;
  if (type === "image") {
    return value ? <img src={String(value)} alt="" className="h-10 w-14 rounded-md object-cover" /> : <span className="block h-10 w-14 rounded-md bg-stone-100" />;
  }
  if (type === "boolean") {
    return value ? (
      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">Ya</span>
    ) : (
      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-500">Tidak</span>
    );
  }
  if (type === "date") return <>{formatDate(value as string)}</>;
  if (type === "datetime") return <>{formatDateTime(value as string)}</>;
  if (type === "select") return <>{label}</>;
  const s = value === null || value === undefined ? "" : String(value);
  return <span className="line-clamp-2">{s || "-"}</span>;
}
