import type { ReactNode } from "react";

type Tone = "plain" | "surface" | "brand" | "brand-soft";

const TONE: Record<Tone, string> = {
  plain: "",
  surface: "bg-white ring-1 ring-stone-200/60",
  "brand-soft": "bg-brand-50/70",
  brand: "bg-brand-900 text-white",
};

/**
 * Bagian halaman dengan ritme vertikal dan zona latar yang konsisten.
 * `tone` memisahkan kelompok konten lewat containment (bukan hanya jarak).
 * Padding vertikal (band) dipasang pada elemen terluar agar warna zona mengisi penuh.
 */
export function Section({
  children,
  tone = "plain",
  size = "band",
  as: Tag = "section",
  className = "",
  ...rest
}: {
  children: ReactNode;
  tone?: Tone;
  size?: "band" | "band-lg";
  as?: "section" | "div";
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  const pad = size === "band-lg" ? "section-lg" : "section";
  return (
    <Tag className={`${TONE[tone]} ${pad} ${className}`} {...rest}>
      <div className="container-desa">{children}</div>
    </Tag>
  );
}
