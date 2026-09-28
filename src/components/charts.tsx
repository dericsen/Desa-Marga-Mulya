import { formatNumber } from "@/lib/format";
import type { Statistik } from "@/lib/types";

export const CHART_COLORS = ["#116759", "#1f9f85", "#f59e0b", "#0891b2", "#78d5bd", "#b45309", "#2563eb", "#65a30d", "#db2777", "#6b7280", "#7c3aed", "#0f766e"];

export function BarChart({ stat }: { stat: Statistik }) {
  const max = Math.max(...stat.items.map((i) => i.nilai), 0) || 1;
  return (
    <ul className="space-y-3">
      {stat.items.map((item, i) => (
        <li key={`${item.label}-${i}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-stone-700">{item.label}</span>
            <span className="shrink-0 font-bold text-stone-900 tabular-nums">
              {formatNumber(item.nilai)} <span className="font-normal text-stone-500">{stat.satuan}</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max((item.nilai / max) * 100, item.nilai > 0 ? 2 : 0)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DonutChart({ stat }: { stat: Statistik }) {
  const total = stat.items.reduce((s, i) => s + i.nilai, 0);
  const r = 15.9155; // keliling ≈ 100
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="21" cy="21" r={r} fill="none" stroke="#f5f5f4" strokeWidth="6" />
          {total > 0 &&
            stat.items.map((item, i) => {
              const pct = (item.nilai / total) * 100;
              const el = (
                <circle
                  key={i}
                  cx="21"
                  cy="21"
                  r={r}
                  fill="none"
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth="6"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += pct;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-lg font-extrabold text-stone-900 tabular-nums">{formatNumber(total)}</p>
            <p className="text-xs text-stone-500">{stat.satuan || "total"}</p>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {stat.items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden="true" />
            <span className="flex-1 text-stone-700">{item.label}</span>
            <span className="font-bold text-stone-900 tabular-nums">{formatNumber(item.nilai)}</span>
            <span className="w-12 text-right text-xs text-stone-500 tabular-nums">{total ? `${formatNumber(Math.round((item.nilai / total) * 1000) / 10)}%` : "-"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatTable({ stat }: { stat: Statistik }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{stat.judul}</caption>
      <thead>
        <tr className="border-b border-stone-200 text-left text-xs tracking-wide text-stone-500 uppercase">
          <th scope="col" className="py-2 font-semibold">Uraian</th>
          <th scope="col" className="py-2 text-right font-semibold">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        {stat.items.map((item, i) => (
          <tr key={`${item.label}-${i}`} className="border-b border-stone-100 last:border-0">
            <th scope="row" className="py-2.5 pr-3 text-left font-normal text-stone-700">{item.label}</th>
            <td className="py-2.5 text-right font-bold text-stone-900 tabular-nums">
              {formatNumber(item.nilai)} {stat.satuan ? <span className="font-normal text-stone-500">{stat.satuan}</span> : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function StatView({ stat }: { stat: Statistik }) {
  if (stat.items.length === 0) return <p className="text-sm text-stone-500">Belum ada data.</p>;
  if (stat.tipe_grafik === "donut") return <DonutChart stat={stat} />;
  if (stat.tipe_grafik === "tabel") return <StatTable stat={stat} />;
  return <BarChart stat={stat} />;
}
