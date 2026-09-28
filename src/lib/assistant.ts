// Asisten "Tanya Desa": menjawab pertanyaan warga hanya berdasarkan konten yang dikelola di CMS.
// Mode utama memakai Google Gemini (bila GEMINI_API_KEY diatur); jika tidak tersedia/gagal,
// asisten memakai pencarian kata kunci lokal atas data yang sama sehingga tetap berfungsi.
import { categoryLabel, POTENSI_TYPES } from "./categories";
import { getAparat, getBerita, getLokasi, getOrganisasi, getPotensi, getSite, getStatistik } from "./data";
import { excerpt, formatDate, formatNumber } from "./format";

export type ChatMessage = { role: "user" | "assistant"; content: string };
type Doc = { title: string; text: string; link: string };
type Knowledge = { context: string; docs: Doc[]; namaDesa: string; at: number };

let cached: Knowledge | null = null;

async function buildKnowledge(): Promise<Knowledge> {
  if (cached && Date.now() - cached.at < 60_000) return cached;
  const [site, statistik, aparat, potensi, organisasi, berita, lokasi] = await Promise.all([
    getSite(), getStatistik(), getAparat(), getPotensi(), getOrganisasi(), getBerita({ limit: 12 }), getLokasi(),
  ]);

  const docs: Doc[] = [];
  const add = (title: string, text: string, link: string) => docs.push({ title, text, link });

  add(
    "Identitas dan wilayah desa",
    `Desa ${site.namaDesa}, Kecamatan ${site.kecamatan}, Kabupaten ${site.kabupaten}, Provinsi ${site.provinsi}, kode pos ${site.kodePos}. Luas wilayah ${site.luasWilayah}. Batas utara: ${site.batasUtara}; selatan: ${site.batasSelatan}; timur: ${site.batasTimur}; barat: ${site.batasBarat}.`,
    "/profil"
  );
  add(
    "Kontak dan jam layanan kantor desa",
    `Alamat: ${site.alamat}. Telepon: ${site.telepon}. Email: ${site.email}. WhatsApp: ${site.whatsapp}. Jam layanan: ${site.jamLayanan.replace(/\n/g, "; ")}. Warga dapat mengirim pesan dan aspirasi melalui formulir di halaman Kontak.`,
    "/kontak"
  );
  add("Visi dan misi desa", `Visi: ${site.visi}. Misi: ${site.misi.map((m, i) => `${i + 1}) ${m}`).join(" ")}`, "/profil");
  add("Sejarah desa", excerpt(site.sejarah, 900), "/profil");
  if (site.namaKepalaDesa) add("Kepala desa", `Kepala Desa ${site.namaDesa} adalah ${site.namaKepalaDesa}. Sambutan: ${site.sambutan}`, "/profil");
  if (site.angkaKunci.length) add("Angka kunci desa", site.angkaKunci.map((a) => `${a.label}: ${a.nilai}`).join("; "), "/");

  for (const s of statistik) {
    add(
      `${s.judul} (${categoryLabel(s.kategori)})`,
      `${s.judul}${s.tahun ? ` tahun ${s.tahun}` : ""}${s.satuan ? ` (satuan ${s.satuan})` : ""}: ${s.items
        .map((i) => `${i.label} = ${formatNumber(i.nilai)}`)
        .join("; ")}.${s.deskripsi ? ` ${s.deskripsi}` : ""}`,
      `/informasi?kategori=${s.kategori}`
    );
  }
  if (aparat.length) add("Aparat / perangkat desa", aparat.map((a) => `${a.jabatan}: ${a.nama}`).join("; "), "/profil");
  for (const p of potensi) {
    const tipe = POTENSI_TYPES.find((t) => t.key === p.tipe)?.label ?? p.tipe;
    add(
      `${p.nama} (${tipe})`,
      `${p.nama} — ${tipe}. ${p.deskripsi ?? ""}${p.harga ? ` Harga: ${p.harga}.` : ""}${p.alamat ? ` Lokasi: ${p.alamat}.` : ""}${p.kontak ? ` WhatsApp: ${p.kontak}.` : ""}`,
      `/potensi?jenis=${p.tipe}`
    );
  }
  for (const o of organisasi) {
    add(o.nama, `${o.nama}. ${o.deskripsi ?? ""}${o.jadwal ? ` Kegiatan rutin: ${o.jadwal}.` : ""}${o.anggota ? ` Anggota: ${o.anggota}.` : ""}`, "/berita#organisasi");
  }
  for (const b of berita) {
    add(b.judul, `${formatDate(b.tanggal)} — ${b.ringkasan ?? ""} ${excerpt(b.konten, 700)}`, `/berita/${b.slug}`);
  }
  if (lokasi.length) add("Lokasi penting di peta desa", lokasi.map((l) => `${l.nama} (${l.kategori})${l.deskripsi ? `: ${l.deskripsi}` : ""}`).join("; "), "/profil");

  const context = docs.map((d) => `### ${d.title}\n${d.text}\n(Halaman: ${d.link})`).join("\n\n");
  cached = { context, docs, namaDesa: site.namaDesa, at: Date.now() };
  return cached;
}

const SENSITIF = /\b(agama|suku|etnis|pemeluk|keyakinan|rasial|sara|antargolongan|antar golongan)\b/i;

function systemPrompt(k: Knowledge) {
  return `Anda adalah "Tanya Desa", asisten virtual resmi website Desa ${k.namaDesa}, Kecamatan Mauk, Kabupaten Tangerang, Banten.
Aturan:
1. Selalu jawab dalam Bahasa Indonesia yang ramah, sopan, singkat, dan mudah dipahami warga (maksimal sekitar 150 kata).
2. Jawab HANYA berdasarkan DATA DESA di bawah. Jika informasi tidak tersedia, katakan dengan jujur dan sarankan menghubungi kantor desa melalui halaman Kontak.
3. Jangan mengarang angka, nama, harga, atau jadwal.
4. Jangan membahas atau membandingkan warga berdasarkan suku, agama, ras, dan antargolongan (SARA). Tolak dengan sopan bila diminta.
5. Jika relevan, sebutkan halaman website terkait (mis. "lihat halaman Informasi Desa").
6. Gunakan **tebal** untuk angka penting. Jangan gunakan tabel atau HTML.

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
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
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

const STOPWORDS = new Set(
  "apa apakah berapa bagaimana gimana siapa dimana di mana kapan yang dan atau untuk dengan ada saja ini itu ke dari desa marga mulya saya mau ingin tahu tolong bisa dong ya kah nya adalah jumlah info informasi tentang cara bagaimanakah kami kita".split(" ")
);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function localAnswer(k: Knowledge, question: string): string {
  const q = question.toLowerCase().trim();
  if (/^(halo|hai|hi|selamat (pagi|siang|sore|malam)|assalam|permisi)\b/.test(q) && q.length < 30) {
    return `Halo! Silakan tanyakan apa saja seputar Desa ${k.namaDesa}, misalnya jumlah penduduk, jam layanan kantor desa, produk UMKM, atau wisata terdekat.`;
  }
  const qt = tokens(question);
  if (!qt.length) return "Boleh diperjelas pertanyaannya? Contoh: \"Berapa jumlah penduduk?\" atau \"Apa saja produk UMKM desa?\"";

  const scored = k.docs
    .map((d) => {
      const title = d.title.toLowerCase();
      const text = d.text.toLowerCase();
      let score = 0;
      for (const t of qt) {
        const stem = t.length >= 6 ? t.slice(0, 5) : t;
        if (title.includes(stem)) score += 3;
        if (text.includes(stem)) score += 1;
      }
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (!scored.length) {
    return `Maaf, saya belum menemukan informasi tersebut di data website desa. Silakan hubungi kantor desa melalui halaman **Kontak** atau coba kata kunci lain.`;
  }
  const parts = scored.map(({ d }) => `**${d.title}**\n${d.text.length > 600 ? d.text.slice(0, 600) + "…" : d.text}`);
  return `${parts.join("\n\n")}\n\nInformasi lengkap tersedia di halaman ${scored[0].d.link}.`;
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
  return { reply: localAnswer(k, question), mode: "lokal" };
}
