import type { Cuaca, JenisCuaca } from "@/lib/cuaca";

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const bulat = (n: number) => Math.round(n);

/** Ikon cuaca garis sederhana, selaras dengan ikon lain di website. */
function IkonCuaca({ jenis, siang = true, className = "h-6 w-6" }: { jenis: JenisCuaca; siang?: boolean; className?: string }) {
  const awan = "M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 11.1 3.5 3.5 0 0 0 7 18z";
  const p: Record<JenisCuaca, React.ReactNode> = {
    cerah: siang ? (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ) : (
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    ),
    berawan: (
      <>
        <path d="M8 5.5a4 4 0 0 1 6.9 1.6" />
        <path d={awan} />
      </>
    ),
    mendung: <path d={awan} />,
    kabut: <path d="M4 9h16M3 13h18M5 17h14" />,
    gerimis: (
      <>
        <path d={awan} transform="translate(0 -3)" />
        <path d="M9 19v1M13 19v1M17 19v1" />
      </>
    ),
    hujan: (
      <>
        <path d={awan} transform="translate(0 -3)" />
        <path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" />
      </>
    ),
    "hujan-lebat": (
      <>
        <path d={awan} transform="translate(0 -3)" />
        <path d="M8 18l-1.5 4M12 18l-1.5 4M16 18l-1.5 4M19.5 17l-1 2.5" />
      </>
    ),
    badai: (
      <>
        <path d={awan} transform="translate(0 -3)" />
        <path d="M13 15l-3 4h4l-2 4" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {p[jenis]}
    </svg>
  );
}

function namaHari(tanggal: string, i: number) {
  if (i === 0) return "Hari ini";
  if (i === 1) return "Besok";
  const [y, m, d] = tanggal.split("-").map(Number);
  return HARI[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function CuacaDesa({ cuaca, namaDesa }: { cuaca: Cuaca; namaDesa: string }) {
  const k = cuaca.sekarang;
  const hariIni = cuaca.hari[0];
  const jam = cuaca.diperbarui.slice(11, 16).replace(":", ".");
  const suhuMin = Math.min(...cuaca.hari.map((h) => h.suhuMin));
  const suhuMaks = Math.max(...cuaca.hari.map((h) => h.suhuMaks));
  const rentang = Math.max(suhuMaks - suhuMin, 1);

  return (
    <section id="cuaca" className="container-desa section scroll-mt-24" aria-labelledby="judul-cuaca">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Cuaca desa</p>
          <h2 id="judul-cuaca" className="section-title">Prakiraan cuaca {namaDesa}</h2>
        </div>
        <p className="meta text-xs">Diperbarui pukul {jam} WIB · sumber Open-Meteo</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Kondisi sekarang */}
        <div className="panel-dark p-6 sm:p-7 lg:col-span-5" data-cuaca-sekarang>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">Sekarang</p>
              <p className="font-display mt-1 text-[3.5rem] leading-none font-semibold tabular-nums">{bulat(k.suhu)}°</p>
              <p className="mt-2 font-medium">{k.label}</p>
              <p className="text-sm text-white/60">Terasa {bulat(k.terasa)}°C</p>
            </div>
            <IkonCuaca jenis={k.jenis} siang={k.siang} className="h-16 w-16 text-sun-400" />
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-sm">
            <div>
              <dt className="text-xs text-white/50">Angin</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{bulat(k.angin)} km/j</dd>
              <dd className="text-xs text-white/50">dari {k.arahAngin}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/50">Kelembapan</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{bulat(k.kelembapan)}%</dd>
            </div>
            <div>
              <dt className="text-xs text-white/50">Gelombang laut</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{k.gelombang !== null ? `${k.gelombang.toFixed(1)} m` : "–"}</dd>
            </div>
          </dl>
          {hariIni ? (
            <p className="mt-5 rounded-2xl bg-white/[0.06] px-4 py-3 text-sm text-white/80 ring-1 ring-white/10">
              Hari ini {bulat(hariIni.suhuMin)}–{bulat(hariIni.suhuMaks)}°C
              {hariIni.peluangHujan !== null ? <> · peluang hujan <span className="font-semibold text-white">{hariIni.peluangHujan}%</span></> : null}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 lg:col-span-7">
          {/* 7 hari */}
          <div className="rounded-[1.75rem] bg-white p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-ink">7 hari ke depan</h3>
            <ol className="mt-3 divide-y divide-line">
              {cuaca.hari.map((h, i) => {
                const kiri = ((h.suhuMin - suhuMin) / rentang) * 100;
                const lebar = Math.max(((h.suhuMaks - h.suhuMin) / rentang) * 100, 6);
                return (
                  <li key={h.tanggal} className="grid grid-cols-[4.5rem_1.75rem_2.75rem_1fr] items-center gap-3 py-2 text-sm sm:grid-cols-[5rem_1.75rem_3.5rem_1fr_5.5rem]">
                    <span className={i === 0 ? "font-semibold text-ink" : "text-ink/85"}>{namaHari(h.tanggal, i)}</span>
                    <IkonCuaca jenis={h.jenis} className="h-6 w-6 text-ink/80" />
                    <span className={`text-xs tabular-nums ${h.peluangHujan !== null && h.peluangHujan >= 60 ? "font-semibold text-brand-600" : "text-muted"}`} title="Peluang hujan">
                      {h.peluangHujan !== null ? `${h.peluangHujan}%` : ""}
                    </span>
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="w-6 text-right text-muted">{bulat(h.suhuMin)}°</span>
                      <span className="relative h-1.5 flex-1 rounded-full bg-paper" aria-hidden="true">
                        <span className="absolute inset-y-0 rounded-full bg-gradient-to-r from-brand-300 to-sun-500" style={{ left: `${kiri}%`, width: `${lebar}%` }} />
                      </span>
                      <span className="w-6 font-semibold text-ink">{bulat(h.suhuMaks)}°</span>
                    </span>
                    <span className="hidden text-right text-xs text-muted tabular-nums sm:block">{h.gelombangMaks !== null ? `ombak ${h.gelombangMaks.toFixed(1)} m` : ""}</span>
                    <span className="sr-only">{h.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Saran untuk petani & nelayan */}
          {cuaca.saran.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {cuaca.saran.map((s) => (
                <li key={s.untuk} className={`rounded-3xl p-5 ${s.waspada ? "bg-sun-400 text-ink" : "bg-white"} ${cuaca.saran.length % 2 === 1 && s === cuaca.saran[cuaca.saran.length - 1] ? "sm:col-span-2" : ""}`}>
                  <p className={`text-xs font-semibold ${s.waspada ? "text-ink/70" : "text-brand-600"}`}>{s.waspada ? `Perhatian · ${s.untuk}` : s.untuk}</p>
                  <p className="mt-1 text-sm leading-relaxed">{s.teks}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">Prakiraan otomatis untuk membantu perencanaan, bukan peringatan resmi. Untuk peringatan dini cuaca ekstrem, ikuti informasi BMKG.</p>
    </section>
  );
}
