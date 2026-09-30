import Link from "next/link";
import { notFound } from "next/navigation";
import { saveResource } from "@/app/admin/actions";
import { CmsForm } from "@/components/admin/CmsForm";
import { withRelationOptions } from "@/lib/relations";
import { getResource } from "@/lib/resources";

type Props = { params: Promise<{ resource: string }> };

export async function generateMetadata({ params }: Props) {
  const { resource } = await params;
  return { title: `Tambah ${getResource(resource)?.singular ?? "Data"}` };
}

export default async function NewResourcePage({ params }: Props) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource || resource.readonly) notFound();

  const initial: Record<string, unknown> = {};
  for (const f of resource.fields) {
    if (f.type === "date") initial[f.name] = new Date().toISOString().slice(0, 10);
    if (f.type === "boolean" && f.name === "terbit") initial[f.name] = true;
    if (f.name === "tahun") initial[f.name] = new Date().getFullYear();
    if (f.type === "boolean" && (f.name === "tersedia" || f.name === "aktif")) initial[f.name] = true;
  }
  const fields = await withRelationOptions(resource.fields);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/admin/${key}`} className="text-sm font-semibold text-brand-700 hover:underline">← {resource.label}</Link>
      <h1 className="mt-2 mb-6 text-2xl font-extrabold text-stone-900">Tambah {resource.singular}</h1>
      <CmsForm action={saveResource.bind(null, key, null)} groups={[{ fields }]} initial={initial} cancelHref={`/admin/${key}`} />
    </div>
  );
}
