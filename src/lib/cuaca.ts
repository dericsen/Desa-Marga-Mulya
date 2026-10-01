// Prakiraan cuaca dari Open-Meteo (gratis, tanpa API key) + tinggi gelombang dari Open-Meteo Marine.
// Data diambil di server dan disimpan sementara 30 menit agar website tetap cepat.
// Bila layanan tidak bisa dihubungi, fungsi mengembalikan null dan bagian cuaca disembunyikan.

export type JenisCuaca = "cerah" | "berawan" | "mendung" | "kabut" | "gerimis" | "hujan" | "hujan-lebat" | "badai";

export type HariCuaca = {
  tanggal: string; // YYYY-MM-DD
  jenis: JenisCuaca;
  label: string;
  suhuMaks: number;
  suhuMin: number;
  peluangHujan: number | null; // %
  curahHujan: number; // mm
  anginMaks: number; // km/jam
  gelombangMaks: number | null; // meter
};

export type Cuaca = {
  diperbarui: string; // ISO waktu data
  sekarang: {
    suhu: number;
    terasa: number;
    kelembapan: number;
    angin: number;
    arahAngin: string;
    jenis: JenisCuaca;
    label: string;
    siang: boolean;
    gelombang: number | null;
  };
  hari: HariCuaca[];
  saran: { untuk: "Petani" | "Nelayan" | "Warga"; teks: string; waspada: boolean }[];
};

/** Kode cuaca WMO → jenis & label bahasa Indonesia. */
function kodeCuaca(kode: number): { jenis: JenisCuaca; label: string } {
  if (kode === 0) return { jenis: "cerah", label: "Cerah" };
  if (kode === 1) return { jenis: "cerah", label: "Cerah berawan" };
  if (kode === 2) return { jenis: "berawan", label: "Berawan" };
  if (kode === 3) return { jenis: "mendung", label: "Mendung" };
  if (kode === 45 || kode === 48) return { jenis: "kabut", label: "Berkabut" };
  if (kode >= 51 && kode <= 57) return { jenis: "gerimis", label: "Gerimis" };
  if (kode === 61 || kode === 80) return { jenis: "hujan", label: "Hujan ringan" };
  if (kode === 63 || kode === 81) return { jenis: "hujan", label: "Hujan sedang" };
  if (kode === 65 || kode === 82 || kode === 66 || kode === 67) return { jenis: "hujan-lebat", label: "Hujan lebat" };
  if (kode >= 95) return { jenis: "badai", label: "Hujan petir" };
  if (kode >= 71 && kode <= 77) return { jenis: "hujan", label: "Hujan" };
  return { jenis: "berawan", label: "Berawan" };
}

function arah(derajat: number): string {
  const nama = ["utara", "timur laut", "timur", "tenggara", "selatan", "barat daya", "barat", "barat laut"];
  return nama[Math.round(((derajat % 360) + 360) / 45) % 8];
}

/** Saran sederhana berbasis aturan (bukan peringatan resmi BMKG). */
function buatSaran(h: HariCuaca, gelombangKini: number | null): Cuaca["saran"] {
  const out: Cuaca["saran"] = [];
  const gel = h.gelombangMaks ?? gelombangKini;
  if (gel !== null) {
    if (gel >= 1.25 || h.anginMaks >= 30) out.push({ untuk: "Nelayan", teks: `Gelombang hingga ${gel.toFixed(1)} m dan angin ${Math.round(h.anginMaks)} km/jam. Pertimbangkan menunda melaut dengan perahu kecil.`, waspada: true });
    else out.push({ untuk: "Nelayan", teks: `Gelombang sekitar ${gel.toFixed(1)} m — umumnya aman untuk melaut di perairan dekat pantai.`, waspada: false });
  }
  if ((h.peluangHujan ?? 0) >= 70 || h.curahHujan >= 10) out.push({ untuk: "Petani", teks: "Peluang hujan tinggi. Tunda pemupukan dan penyemprotan, periksa saluran air sawah dan tanggul tambak.", waspada: true });
  else if ((h.peluangHujan ?? 0) <= 30 && h.curahHujan < 1) out.push({ untuk: "Petani", teks: "Cenderung kering — waktu yang baik untuk menjemur gabah atau menyemprot tanaman.", waspada: false });
  else out.push({ untuk: "Petani", teks: "Hujan mungkin turun sebagian waktu. Kerjakan pekerjaan lapangan lebih pagi.", waspada: false });
  if (h.jenis === "badai") out.push({ untuk: "Warga", teks: "Ada potensi hujan petir. Hindari berteduh di bawah pohon dan amankan barang di luar rumah.", waspada: true });
  else if (h.suhuMaks >= 34) out.push({ untuk: "Warga", teks: `Suhu bisa mencapai ${Math.round(h.suhuMaks)}°C. Cukupi minum air, terutama saat bekerja di luar.`, waspada: false });
  return out;
}

type Cache = { key: string; until: number; data: Cuaca };
let cache: Cache | null = null;

async function ambil<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000), next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function getCuaca(lat: number, lng: number): Promise<Cuaca | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (cache && cache.key === key && cache.until > Date.now()) return cache.data;

  const q = (o: Record<string, string | number>) => new URLSearchParams(Object.entries(o).map(([k, v]) => [k, String(v)])).toString();
  const forecastUrl =
    "https://api.open-meteo.com/v1/forecast?" +
    q({
      latitude: lat,
      longitude: lng,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,is_day",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max",
      timezone: "Asia/Jakarta",
      forecast_days: 7,
    });
  // Titik laut ±5 km di utara desa (perairan Teluk Jakarta bagian barat).
  const marineUrl =
    "https://marine-api.open-meteo.com/v1/marine?" +
    q({ latitude: (lat + 0.05).toFixed(4), longitude: lng, current: "wave_height", daily: "wave_height_max", timezone: "Asia/Jakarta", forecast_days: 7 });

  type F = {
    current: { time: string; temperature_2m: number; relative_humidity_2m: number; apparent_temperature: number; weather_code: number; wind_speed_10m: number; wind_direction_10m: number; is_day: number };
    daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: (number | null)[]; precipitation_sum: number[]; wind_speed_10m_max: number[] };
  };
  type M = { current?: { wave_height: number | null }; daily?: { time: string[]; wave_height_max: (number | null)[] } };

  try {
    const [f, m] = await Promise.all([ambil<F>(forecastUrl), ambil<M>(marineUrl).catch(() => null)]);
    const gelHari = new Map((m?.daily?.time ?? []).map((t, i) => [t, m?.daily?.wave_height_max[i] ?? null]));
    const hari: HariCuaca[] = f.daily.time.map((t, i) => {
      const k = kodeCuaca(f.daily.weather_code[i]);
      return {
        tanggal: t,
        ...k,
        suhuMaks: f.daily.temperature_2m_max[i],
        suhuMin: f.daily.temperature_2m_min[i],
        peluangHujan: f.daily.precipitation_probability_max[i] ?? null,
        curahHujan: f.daily.precipitation_sum[i] ?? 0,
        anginMaks: f.daily.wind_speed_10m_max[i],
        gelombangMaks: gelHari.get(t) ?? null,
      };
    });
    const k = kodeCuaca(f.current.weather_code);
    const gelombang = m?.current?.wave_height ?? null;
    const data: Cuaca = {
      diperbarui: f.current.time,
      sekarang: {
        suhu: f.current.temperature_2m,
        terasa: f.current.apparent_temperature,
        kelembapan: f.current.relative_humidity_2m,
        angin: f.current.wind_speed_10m,
        arahAngin: arah(f.current.wind_direction_10m),
        ...k,
        siang: f.current.is_day === 1,
        gelombang,
      },
      hari,
      saran: hari[0] ? buatSaran(hari[0], gelombang) : [],
    };
    cache = { key, until: Date.now() + 30 * 60 * 1000, data };
    return data;
  } catch (e) {
    console.warn("[cuaca] gagal mengambil prakiraan:", (e as Error).message);
    return cache?.key === key ? cache.data : null; // pakai data lama bila ada
  }
}
