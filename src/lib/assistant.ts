// Asisten "Tanya Desa": menjawab pertanyaan warga hanya berdasarkan konten yang dikelola di CMS.
// Mode utama memakai Google Gemini (bila GEMINI_API_KEY diatur); jika tidak tersedia/gagal,
// asisten memakai pencarian kata kunci lokal atas data yang sama sehingga tetap berfungsi.
import { categoryLabel, POTENSI_TYPES, PRODUK_KATEGORI } from "./categories";
import { getAparat, getBerita, getGaleri, getLokasi, getOrganisasi, getPenjual, getPotensi, getProduk, getSite, getStatistik } from "./data";
import { formatDate, formatNumber, formatRupiah } from "./format";
import { getCuaca } from "./cuaca";
import { jawabLokal, type DataDesa } from "./assistant-lokal";
import { parseJamLayanan, statusKantor } from "./jam";

export type ChatMessage = { role: "user" | "assistant"; content: string };
type Doc = { title: string; text: string; link: string };
type Knowledge = { context: string; docs: Doc[]; namaDesa: string; jamLayanan: string; data: DataDesa; at: number };

let cached: Knowledge | null = null;

/**
 * Basis pengetahuan = SELURUH konten publik website yang dikelola di CMS:
 * pengaturan situs (profil, sejarah, visi-misi, wilayah, kontak, jam, layanan), semua tabel statistik,
 * aparat, organisasi, potensi/wisata, semua berita terbit (isi lengkap), galeri, titik peta,
 * pelaku usaha, semua produk Pasar Desa, dan cuaca.
 * Data privat (pesan warga, pesanan & data pembeli, akun login) sengaja TIDAK dimasukkan.
 * Dibangun ulang tiap 60 detik sehingga perubahan di CMS cepat terbaca asisten.
 */
async function buildKnowledge(): Promise<Knowledge> {
  if (cached && Date.now() - cached.at < 60_000) return cached;
  const site = await getSite();
  const [statistik, aparat, potensi, organisasi, berita, lokasi, produk, galeri, penjual, cuaca] = await Promise.all([
    getStatistik(), getAparat(), getPotensi(), getOrganisasi(), getBerita({ limit: 500 }), getLokasi(), getProduk({ limit: 1000 }), getGaleri(), getPenjual(), getCuaca(site.lat, site.lng),
  ]);

  const docs: Doc[] = [];
  const add = (title: string, text: string, link: string) => {
    const t = text.replace(/\s+\n/g, "\n").trim();
    if (t) docs.push({ title, text: t, link });
  };
  const md = (x: string | null | undefined) => (x ?? "").replace(/[#*_>]/g, "").replace(/\n{2,}/g, "\n").trim();

  add(
    "Halaman website",
    "Beranda (/): status kantor, layanan, cuaca, kabar, data, Pasar Desa, galeri, peta. Profil Desa (/profil): sambutan, sejarah, visi-misi, wilayah, aparat. Informasi Desa (/informasi): semua data statistik + unduh CSV. Pasar Desa (/pasar): belanja produk warga. Wisata & Budaya (/potensi). Berita & Kegiatan (/berita): berita dan lembaga desa. Galeri (/galeri). Kontak (/kontak): formulir pesan & aspirasi. Pencarian (/cari). Pengelola dan penjual masuk di /admin.",
    "/"
  );
  add(
    "Identitas dan wilayah desa",
    `Desa ${site.namaDesa}, Kecamatan ${site.kecamatan}, Kabupaten ${site.kabupaten}, Provinsi ${site.provinsi}, kode pos ${site.kodePos}. ${site.tagline ? `Semboyan: ${site.tagline}. ` : ""}Luas wilayah ${site.luasWilayah}. Batas utara: ${site.batasUtara}; selatan: ${site.batasSelatan}; timur: ${site.batasTimur}; barat: ${site.batasBarat}. Koordinat kantor desa: ${site.lat}, ${site.lng}.${site.heroDeskripsi ? ` ${site.heroDeskripsi}` : ""}`,
    "/profil"
  );
  add(
    "Kontak dan jam layanan kantor desa",
    `Alamat: ${site.alamat}. Telepon: ${site.telepon}. Email: ${site.email}. WhatsApp: ${site.whatsapp}. Jam layanan: ${site.jamLayanan.replace(/\n/g, "; ")}.${[site.instagram && ` Instagram: ${site.instagram}.`, site.facebook && ` Facebook: ${site.facebook}.`, site.youtube && ` YouTube: ${site.youtube}.`].filter(Boolean).join("")} Warga dapat mengirim pesan dan aspirasi melalui formulir di halaman Kontak.`,
    "/kontak"
  );
  if (site.layanan.length) {
    add("Layanan administrasi kantor desa dan persyaratannya", `${site.layanan.map((l) => `${l.label}: bawa ${l.nilai}`).join(". ")}. ${site.catatanLayanan}`, "/#layanan");
  }
  add("Visi dan misi desa", `Visi: ${site.visi}. Misi: ${site.misi.map((m, i) => `${i + 1}) ${m}`).join(" ")}`, "/profil");
  add("Sejarah desa", md(site.sejarah), "/profil");
  if (site.namaKepalaDesa) add("Kepala desa dan sambutannya", `Kepala Desa ${site.namaDesa} adalah ${site.namaKepalaDesa}. Sambutan: ${site.sambutan}`, "/profil");
  if (site.angkaKunci.length) add("Angka kunci desa", site.angkaKunci.map((a) => `${a.label}: ${a.nilai}`).join("; "), "/");
  if (site.catatanData) add("Catatan sumber data", site.catatanData, "/informasi");

  for (const s of statistik) {
    const total = s.items.reduce((t, i) => t + i.nilai, 0);
    add(
      `${s.judul} (${categoryLabel(s.kategori)})`,
      `${s.judul}${s.tahun ? ` tahun ${s.tahun}` : ""}${s.satuan ? ` (satuan ${s.satuan})` : ""}: ${s.items
        .map((i) => `${i.label} = ${formatNumber(i.nilai)}`)
        .join("; ")}${s.tipe_grafik !== "tabel" && s.items.length > 1 ? `; total = ${formatNumber(total)}` : ""}.${s.deskripsi ? ` ${s.deskripsi}` : ""}`,
      `/informasi?kategori=${s.kategori}`
    );
  }
  if (aparat.length) add("Aparat / perangkat desa", aparat.map((a) => `${a.jabatan}: ${a.nama}`).join("; "), "/profil");
  for (const o of organisasi) {
    add(o.nama, `${o.nama}.${o.ketua ? ` Ketua: ${o.ketua}.` : ""} ${o.deskripsi ?? ""}${o.jadwal ? ` Kegiatan rutin: ${o.jadwal}.` : ""}${o.anggota ? ` Anggota: ${o.anggota} orang.` : ""}`, "/berita#organisasi");
  }
  for (const p of potensi) {
    const tipe = POTENSI_TYPES.find((t) => t.key === p.tipe)?.label ?? p.tipe;
    add(
      `${p.nama} (${tipe})`,
      `${p.nama} — ${tipe}${p.unggulan ? " (unggulan)" : ""}. ${p.deskripsi ?? ""}${p.harga ? ` Harga: ${p.harga}.` : ""}${p.alamat ? ` Lokasi: ${p.alamat}.` : ""}${p.kontak ? ` WhatsApp: ${p.kontak}.` : ""}`,
      `/potensi?jenis=${p.tipe}`
    );
  }
  if (penjual.length) {
    add(
      "Pelaku usaha (penjual) di Pasar Desa",
      penjual
        .map((j) => `${j.nama}${j.pemilik ? `, pemilik ${j.pemilik}` : ""}${j.alamat ? `, ${j.alamat}` : ""}, WhatsApp ${j.whatsapp}, ${j.jumlah_produk} produk${j.harga_min !== null ? ` mulai ${formatRupiah(j.harga_min)}` : ""}${j.deskripsi ? `. ${j.deskripsi}` : ""}`)
        .join(" | "),
      "/pasar"
    );
  }
  if (produk.length) {
    add(
      "Cara belanja di Pasar Desa",
      "Pilih produk di halaman Pasar Desa, masukkan ke keranjang (boleh dari beberapa penjual), isi nama dan nomor HP, pilih ambil sendiri atau diantar di dalam desa, lalu pesanan dikirim ke WhatsApp penjual. Pembayaran langsung ke penjual (tunai/transfer). Tanpa potongan komisi. Warga yang ingin berjualan dapat mendaftar ke kantor desa; admin membuatkan akun penjual (login dengan nomor HP).",
      "/pasar"
    );
    for (const p of produk) {
      const kat = PRODUK_KATEGORI.find((k) => k.key === p.kategori)?.label ?? p.kategori;
      add(
        `Produk: ${p.nama}${p.satuan ? ` (${p.satuan})` : ""}`,
        `${p.nama}${p.satuan ? `, ${p.satuan}` : ""} — ${formatRupiah(p.harga)}, kategori ${kat}, dijual oleh ${p.penjual_nama}${p.penjual_alamat ? ` (${p.penjual_alamat})` : ""}. Stok: ${p.stok === null ? "selalu tersedia" : p.stok === 0 ? "sedang habis" : `${p.stok}`}.${p.deskripsi ? ` ${p.deskripsi}` : ""}`,
        `/pasar?produk=${p.slug}`
      );
    }
  }
  for (const b of berita) {
    add(`Berita: ${b.judul}`, `${formatDate(b.tanggal)} (${b.kategori}) — ${b.ringkasan ?? ""}\n${md(b.konten)}`, `/berita/${b.slug}`);
  }
  if (galeri.length) add("Galeri foto desa", galeri.map((g) => `${g.judul} (album ${g.album})${g.deskripsi ? `: ${g.deskripsi}` : ""}`).join("; "), "/galeri");
  if (lokasi.length) add("Lokasi penting di peta desa", lokasi.map((l) => `${l.nama} (${l.kategori}, koordinat ${l.lat}, ${l.lng})${l.deskripsi ? `: ${l.deskripsi}` : ""}`).join("; "), "/profil");
  if (cuaca) {
    const k = cuaca.sekarang;
    add(
      "Cuaca dan prakiraan cuaca desa, gelombang laut",
      `Cuaca sekarang (pukul ${cuaca.diperbarui.slice(11, 16)} WIB): ${k.label}, suhu ${Math.round(k.suhu)}°C (terasa ${Math.round(k.terasa)}°C), kelembapan ${Math.round(k.kelembapan)}%, angin ${Math.round(k.angin)} km/jam dari ${k.arahAngin}${k.gelombang !== null ? `, gelombang laut ${k.gelombang.toFixed(1)} m` : ""}. Prakiraan 7 hari: ${cuaca.hari
        .map((h) => `${h.tanggal}: ${h.label}, ${Math.round(h.suhuMin)}–${Math.round(h.suhuMaks)}°C${h.peluangHujan !== null ? `, peluang hujan ${h.peluangHujan}%` : ""}, angin maks ${Math.round(h.anginMaks)} km/jam${h.gelombangMaks !== null ? `, gelombang maks ${h.gelombangMaks.toFixed(1)} m` : ""}`)
        .join("; ")}. Saran: ${cuaca.saran.map((x) => `${x.untuk}: ${x.teks}`).join(" ")} Sumber Open-Meteo, bukan peringatan resmi BMKG.`,
      "/#cuaca"
    );
  }

  const context = docs.map((d) => `### ${d.title}\n${d.text}\n(Halaman: ${d.link})`).join("\n\n");
  cached = {
    context,
    docs,
    namaDesa: site.namaDesa,
    jamLayanan: site.jamLayanan,
    data: { site, statistik, aparat, potensi, organisasi, berita, lokasi, produk, cuaca, docs },
    at: Date.now(),
  };
  return cached;
}

const SENSITIF = /\b(agama|suku|etnis|pemeluk|keyakinan|rasial|sara|antargolongan|antar golongan)\b/i;

function waktuSekarang(k: Knowledge): string {
  const now = new Date();
  const teks = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(now);
  const jd = k.jamLayanan ? parseJamLayanan(k.jamLayanan) : null;
  const st = jd ? statusKantor(jd, now) : null;
  return `Waktu sekarang: ${teks} WIB.${st ? ` Status kantor desa saat ini: ${st.buka ? "BUKA" : "TUTUP"} (${st.teks}).` : ""}`;
}

function systemPrompt(k: Knowledge) {
  return `Anda adalah "Tanya Desa", asisten virtual resmi website Desa ${k.namaDesa}, Kecamatan Mauk, Kabupaten Tangerang, Banten.
${waktuSekarang(k)}
Aturan:
1. Selalu jawab dalam Bahasa Indonesia yang ramah, sopan, dan mudah dipahami warga. Langsung jawab inti pertanyaan pada kalimat pertama; total 1–5 kalimat atau daftar poin singkat (maksimal sekitar 120 kata). Jangan menyalin seluruh data.
2. Jawab HANYA berdasarkan DATA DESA di bawah. Jika informasi tidak tersedia, katakan dengan jujur dan sarankan menghubungi kantor desa melalui halaman Kontak.
3. Jangan mengarang angka, nama, harga, atau jadwal.
4. Jangan membahas atau membandingkan warga berdasarkan suku, agama, ras, dan antargolongan (SARA). Tolak dengan sopan bila diminta.
5. Jika relevan, sebutkan halaman website terkait (mis. "lihat halaman Informasi Desa").
6. Gunakan **tebal** untuk angka penting. Untuk daftar gunakan baris berawalan "• ". Jangan gunakan tabel, HTML, atau judul markdown (#).
7. Untuk pertanyaan "buka/tutup sekarang", gunakan status kantor di atas. Untuk cuaca, gunakan data cuaca dan sebutkan bahwa itu prakiraan, bukan peringatan resmi BMKG.
8. Jika pertanyaan tidak berkaitan dengan desa (mis. pengetahuan umum), jelaskan singkat bahwa Anda hanya menjawab seputar Desa ${k.namaDesa}.

DATA DESA:
${k.context}`;
}

async function askGemini(k: Knowledge, messages: ChatMessage[]): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const models = Array.from(new Set([process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"].filter(Boolean))) as string[];
  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  // Gemini mensyaratkan percakapan diawali pesan pengguna.
  while (contents.length && contents[0].role === "model") contents.shift();

  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt(k) }] },
          contents,
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) {
        console.warn(`[tanya-desa] model ${model} gagal: ${res.status}`);
        if (res.status === 404 || res.status === 400) continue;
        return null;
      }
      const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
      const text = data.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? "").join("").trim();
      if (text) return text;
    } catch (err) {
      console.warn(`[tanya-desa] model ${model} error`, err);
    }
  }
  return null;
}

export async function answer(messages: ChatMessage[]): Promise<{ reply: string; mode: "ai" | "lokal" }> {
  const question = messages[messages.length - 1]?.content ?? "";
  if (SENSITIF.test(question)) {
    return {
      mode: "lokal",
      reply:
        "Mohon maaf, website desa tidak menyajikan data atau pembahasan berdasarkan suku, agama, ras, maupun antargolongan. Saya dengan senang hati membantu informasi lain seperti layanan, data penduduk, pendidikan, kesehatan, atau potensi desa.",
    };
  }
  const k = await buildKnowledge();
  const ai = await askGemini(k, messages);
  if (ai) return { reply: ai, mode: "ai" };
  return { reply: jawabLokal(k.data, question), mode: "lokal" };
}
