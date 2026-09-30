import { formatNumber } from "@/lib/format";
import type { Statistik } from "@/lib/types";

// Palet terbatas: gradasi hijau + satu oker + netral. Warna menandai urutan, bukan dekorasi.
export const CHART_COLORS = ["#0b1310", "#23845a", "#aad62f", "#6bbc92", "#8a918b", "#13573c", "#c8f250", "#9fd5b7", "#59615c", "#c4c9be"];

/** Batang horizontal satu warna; nilai terbesar ditebalkan agar mudah dipindai. */
export function BarChart({ stat }: { stat: Statistik }) {
  const max = Math.max(...stat.items.map((i) => i.nilai), 0) || 1;
  const total = stat.items.reduce((s, i) => s + i.nilai, 0);
  return (
    <ul className="space-y-3.5">
      {stat.items.map((item, i) => {
        const isMax = item.nilai === max;
        return (
          <li key={`${item.label}-${i}`}>
            <div className="mb-1.5 flex items-baseline justify-between gap-4 text-[0.9375rem]">
              <span className={isMax ? "font-semibold text-ink" : "text-ink/85"}>{item.label}</span>
              <span className="shrink-0 tabular-nums">
                <span className="font-semibold text-ink">{formatNumber(item.nilai)}</span>
                {total > 0 && stat.items.length > 2 ? (
                  <span className="ml-2 inline-block w-12 text-right font-mono text-[0.6875rem] text-muted">{formatNumber(Math.round((item.nilai / total) * 1000) / 10)}%</span>
                ) : null}
              </span>
            </div>
            <div className="relative h-2 bg-line/70" aria-hidden="true">
              <div
                className={isMax ? "h-full bg-ink" : "h-full bg-brand-300"}
                style={{ width: `${Math.max((item.nilai / max) * 100, item.nilai > 0 ? 1.5 : 0)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function DonutChart({ stat }: { stat: Statistik }) {
  const total = stat.items.reduce((s, i) => s + i.nilai, 0);
  const r = 15.9155;
  let offset = 0;
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-36 w-36 shrink-0 sm:mx-0">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="21" cy="21" r={r} fill="none" stroke="#e4e6de" strokeWidth="4" />
          {total > 0 &&
            stat.items.map((item, i) => {
              const pct = (item.nilai / total) * 100;
              const el = (
                <circle key={i} cx="21" cy="21" r={r} fill="none" stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth="4" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset} />
              );
              offset += pct;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-xl font-semibold text-ink tabular-nums">{formatNumber(total)}</p>
            <p className="font-mono text-[0.6875rem] text-muted uppercase">{stat.satuan || "total"}</p>
          </div>
        </div>
      </div>
      <ul className="w-full divide-y divide-line text-[0.9375rem]">
        {stat.items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-3 py-1.5">
            <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden="true" />
            <span className="flex-1 text-ink/85">{item.label}</span>
            <span className="font-semibold text-ink tabular-nums">{formatNumber(item.nilai)}</span>
            <span className="w-12 text-right font-mono text-[0.6875rem] text-muted tabular-nums">{total ? `${formatNumber(Math.round((item.nilai / total) * 1000) / 10)}%` : "–"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatTable({ stat }: { stat: Statistik }) {
  return (
    <table className="w-full text-[0.9375rem]">
      <caption className="sr-only">{stat.judul}</caption>
      <thead>
        <tr className="border-b border-line-strong text-left">
          <th scope="col" className="pb-2 font-mono text-[0.6875rem] font-normal tracking-[0.12em] text-muted uppercase">Uraian</th>
          <th scope="col" className="pb-2 text-right font-mono text-[0.6875rem] font-normal tracking-[0.12em] text-muted uppercase">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        {stat.items.map((item, i) => (
          <tr key={`${item.label}-${i}`} className="border-b border-line last:border-0">
            <th scope="row" className="py-2 pr-3 text-left font-normal text-ink/85">{item.label}</th>
            <td className="py-2 text-right font-semibold text-ink tabular-nums">
              {formatNumber(item.nilai)}
              {stat.satuan ? <span className="ml-1 font-normal text-muted">{stat.satuan}</span> : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function StatView({ stat }: { stat: Statistik }) {
  if (stat.items.length === 0) return <p className="text-sm text-muted">Data untuk bagian ini belum diisi oleh admin desa.</p>;
  if (stat.tipe_grafik === "donut") return <DonutChart stat={stat} />;
  if (stat.tipe_grafik === "tabel") return <StatTable stat={stat} />;
  return <BarChart stat={stat} />;
}
