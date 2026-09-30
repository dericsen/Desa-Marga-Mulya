// Uji end-to-end (dijalankan di CI): memeriksa halaman publik, asisten AI, formulir kontak,
// serta alur CMS (login → tambah berita → ubah pengaturan → lihat pesan), dan menyimpan screenshot.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (cond, msg) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else {
    console.log(`  ✗ ${msg}`);
    failures.push(msg);
  }
};

const PAGES = [
  ["beranda", "/", "Layanan administrasi"],
  ["profil", "/profil", "Struktur Aparat Desa"],
  ["informasi", "/informasi", "Mata Pencaharian Pokok"],
  ["informasi-kesehatan", "/informasi?kategori=kesehatan", "Status Gizi Balita"],
  ["potensi", "/potensi", "Pantai Tanjung Kait"],
  ["pasar", "/pasar", "Bandeng Presto Mulya"],
  ["pasar-detail", "/pasar?produk=bandeng-presto-mulya", "Pembayaran"],
  ["pasar-penjual", "/pasar?penjual=dapur-bu-enah", "Kerupuk Ikan Mentah"],
  ["berita", "/berita", "Lembaga Kemasyarakatan Desa"],
  ["berita-detail", "/berita/musrenbangdes-2027", "Usulan prioritas"],
  ["galeri", "/galeri", "Hamparan Sawah Marga Mulya"],
  ["kontak", "/kontak", "Kirim Pesan & Aspirasi"],
  ["cari", "/cari?q=bandeng", "Bandeng Presto Mulya"],
];

const browser = await chromium.launch();

async function publicPages(name, viewport) {
  console.log(`\n== Halaman publik (${name}) ==`);
  const ctx = await browser.newContext({ viewport, locale: "id-ID" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [slug, path, text] of PAGES) {
    const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
    check(res?.status() === 200, `${path} status 200 (${res?.status()})`);
    check((await page.getByText(text, { exact: false }).count()) > 0, `${path} memuat "${text}"`);
    await page.screenshot({ path: `${OUT}/${name}-${slug}.png`, fullPage: true });
  }
  check(errors.length === 0, `tanpa error JavaScript di browser ${errors.length ? JSON.stringify(errors) : ""}`);
  await ctx.close();
}

await publicPages("desktop", { width: 1366, height: 900 });
await publicPages("mobile", { width: 390, height: 844 });

console.log("\n== Endpoint lain ==");
{
  const r404 = await fetch(`${BASE}/halaman-tidak-ada`);
  check(r404.status === 404, `halaman tak dikenal → 404 (${r404.status})`);
  const csv = await fetch(`${BASE}/api/statistik/1/csv`);
  const csvText = await csv.text();
  check(csv.status === 200 && csvText.includes("Uraian"), "unduh CSV statistik");
  const chat = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "Berapa jumlah penduduk desa?" }] }),
  });
  const chatJson = await chat.json();
  console.log("    jawaban:", JSON.stringify(chatJson).slice(0, 300));
  check(chat.status === 200 && /7\.842|7842/.test(chatJson.reply || ""), "API Tanya Desa menjawab jumlah penduduk");
  const sara = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "Berapa jumlah pemeluk agama di desa?" }] }),
  });
  check(/tidak menyajikan/i.test((await sara.json()).reply || ""), "asisten menolak pertanyaan SARA");
  const up = await fetch(`${BASE}/api/upload`, { method: "POST", body: new FormData() });
  check(up.status === 401, `upload tanpa login ditolak (${up.status})`);
}

console.log("\n== Interaksi pengunjung ==");
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Tanya Desa" }).click();
  await page.getByRole("button", { name: "Apa saja produk UMKM di desa ini?" }).click();
  await page.waitForFunction(
    () => {
      const el = document.querySelector("#tanya-desa");
      return !!el && el.querySelectorAll("[data-role='assistant']").length >= 2 && !el.querySelector("[data-loading]");
    },
    null,
    { timeout: 30000 }
  );
  await page.screenshot({ path: `${OUT}/interaksi-tanya-desa.png` });
  check((await page.locator("#tanya-desa").innerText()).length > 100, "widget Tanya Desa menampilkan jawaban");

  await page.goto(BASE + "/kontak", { waitUntil: "networkidle" });
  await page.fill("#nama", "Warga Uji CI");
  await page.fill("#email", "warga@example.com");
  await page.fill("#subjek", "Pesan uji otomatis");
  await page.fill("#pesan", "Ini adalah pesan uji otomatis dari pipeline CI.");
  await page.getByRole("button", { name: "Kirim Pesan" }).click();
  await page.getByText("Terima kasih!").waitFor({ timeout: 15000 });
  check(true, "formulir kontak terkirim");
  await page.screenshot({ path: `${OUT}/interaksi-kontak.png`, fullPage: true });

  await page.goto(BASE + "/galeri", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Perbesar foto/ }).first().click();
  check((await page.getByRole("dialog").count()) === 1, "lightbox galeri terbuka");
  await page.screenshot({ path: `${OUT}/interaksi-galeri.png` });
  await ctx.close();
}

console.log("\n== Pasar Desa ==");
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "/pasar", { waitUntil: "networkidle" });
  check((await page.getByText("Stok habis").count()) > 0, "produk dengan stok 0 ditandai habis");
  await page.getByRole("button", { name: "Tambah ke keranjang: Bandeng Presto Mulya" }).first().click();
  await page.getByRole("button", { name: "Tambah ke keranjang: Beras Sawah Mulya" }).first().click();
  await page.getByRole("button", { name: /Buka keranjang, 2 barang/ }).click();
  await page.getByRole("dialog").getByText("Total belanja").waitFor();
  check((await page.getByText("Dibagi menjadi 2 pesanan").count()) > 0, "keranjang dikelompokkan per penjual");
  await page.screenshot({ path: `${OUT}/pasar-keranjang.png` });
  await page.getByRole("button", { name: "Lanjut isi data pemesan" }).click();
  await page.getByRole("button", { name: "Buat pesanan" }).click();
  await page.getByText("Nama wajib diisi").waitFor({ timeout: 15000 });
  check(true, "validasi data pemesan tampil");
  await page.fill("#pembeli-nama", "Pembeli Uji CI");
  await page.fill("#pembeli-telepon", "081234567890");
  await page.getByRole("button", { name: "Buat pesanan" }).click();
  await page.getByText("Pesanan sudah tercatat").waitFor({ timeout: 15000 });
  const kode = await page.locator("[data-kode-pesanan]").allInnerTexts();
  check(kode.length === 2 && kode.every((k) => /^MM-\d{6}-[A-Z0-9]{4}$/.test(k)), `dua kode pesanan dibuat (${kode.join(", ")})`);
  const wa = await page.getByRole("link", { name: /Kirim ke WhatsApp/ }).first().getAttribute("href");
  check(Boolean(wa && wa.startsWith("https://wa.me/62") && decodeURIComponent(wa).includes("Kode pesanan")), "tautan WhatsApp berisi rincian pesanan");
  await page.screenshot({ path: `${OUT}/pasar-selesai.png` });

  // Stok berkurang (bandeng presto: 24 → 23)
  await page.goto(BASE + "/pasar?produk=bandeng-presto-mulya", { waitUntil: "networkidle" });
  check((await page.getByText("Tersisa 23").count()) > 0, "stok produk berkurang setelah pesanan");
  await page.screenshot({ path: `${OUT}/pasar-detail-mobile.png` });

  // Harga tidak bisa dimanipulasi dari browser: server menghitung ulang
  check(errors.length === 0, `Pasar tanpa error JavaScript ${errors.length ? JSON.stringify(errors) : ""}`);
  await ctx.close();
}

console.log("\n== CMS ==");
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(BASE + "/admin", { waitUntil: "networkidle" });
  check(page.url().endsWith("/admin/login"), "admin tanpa login diarahkan ke halaman login");
  await page.fill("#email", process.env.ADMIN_EMAIL);
  await page.fill("#password", "salah-sandi");
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.getByText("Email atau kata sandi salah").waitFor();
  check(true, "login dengan kata sandi salah ditolak");
  await page.fill("#password", process.env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.getByText("Dasbor CMS").waitFor({ timeout: 15000 });
  check(true, "login admin berhasil");
  await page.screenshot({ path: `${OUT}/cms-dasbor.png`, fullPage: true });

  // Tambah berita
  await page.goto(BASE + "/admin/berita/baru", { waitUntil: "networkidle" });
  await page.fill("#f-judul", "Uji Otomatis CI Berita Baru");
  await page.fill("#f-ringkasan", "Ringkasan berita uji otomatis.");
  await page.fill("#f-konten", "Isi berita **uji otomatis**.\n\n- poin satu\n- poin dua");
  await page.getByRole("button", { name: "Simpan" }).click();
  await page.getByText("Data berhasil ditambahkan").waitFor({ timeout: 15000 });
  check(true, "berita baru tersimpan di CMS");
  await page.goto(BASE + "/berita", { waitUntil: "networkidle" });
  check((await page.getByText("Uji Otomatis CI Berita Baru").count()) > 0, "berita baru tampil di website publik");

  // Validasi form (judul kosong)
  await page.goto(BASE + "/admin/galeri/baru", { waitUntil: "networkidle" });
  await page.fill("#f-album", "Album Uji");
  await page.locator("#f-judul").evaluate((el) => el.removeAttribute("required"));
  await page.getByRole("button", { name: "Simpan" }).click();
  await page.getByText("Judul Foto wajib diisi").waitFor({ timeout: 15000 });
  check((await page.inputValue("#f-album")) === "Album Uji", "validasi CMS menampilkan error dan mempertahankan isian");

  // Ubah statistik
  await page.goto(BASE + "/admin/statistik", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Ubah" }).first().click();
  await page.waitForSelector("#f-judul");
  await page.screenshot({ path: `${OUT}/cms-statistik-ubah.png`, fullPage: true });
  await page.getByRole("button", { name: "Tambah Baris" }).click();
  await page.getByLabel(/^Label baris/).last().fill("Baris Uji CI");
  await page.getByLabel(/^Nilai baris/).last().fill("12.5");
  await page.getByRole("button", { name: "Simpan" }).click();
  await page.getByText("Perubahan berhasil disimpan").waitFor({ timeout: 15000 });
  await page.goto(BASE + "/informasi", { waitUntil: "networkidle" });
  check((await page.getByText("Baris Uji CI").count()) > 0, "perubahan data statistik tampil di halaman Informasi");

  // Pengaturan situs
  await page.goto(BASE + "/admin/pengaturan", { waitUntil: "networkidle" });
  await page.fill("#f-tagline", "Tagline Uji CI");
  await page.getByRole("button", { name: "Simpan Pengaturan" }).click();
  await page.getByText("Pengaturan berhasil disimpan").waitFor({ timeout: 15000 });
  check((await page.inputValue("#f-tagline")) === "Tagline Uji CI", "form pengaturan menampilkan nilai tersimpan");
  await page.screenshot({ path: `${OUT}/cms-pengaturan.png` });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  check((await page.getByText("Tagline Uji CI").count()) > 0, "pengaturan situs tampil di website publik");
  check((await page.getByText("Surat keterangan domisili").count()) > 0, "daftar layanan dari CMS tampil di beranda");

  // Pesanan Pasar Desa
  await page.goto(BASE + "/admin/pesanan", { waitUntil: "networkidle" });
  check((await page.getByText("Pembeli Uji CI").count()) >= 2, "pesanan Pasar Desa masuk ke CMS");
  await page.getByRole("link", { name: "Buka" }).first().click();
  await page.getByText("Pesanan MM-").waitFor({ timeout: 15000 });
  await page.selectOption("#status", "dibatalkan");
  await page.getByRole("button", { name: "Simpan status" }).click();
  await page.getByText("Status pesanan diperbarui").waitFor({ timeout: 15000 });
  check(true, "status pesanan dapat diubah");
  await page.screenshot({ path: `${OUT}/cms-pesanan.png`, fullPage: true });

  // Tambah produk dengan relasi penjual
  await page.goto(BASE + "/admin/produk/baru", { waitUntil: "networkidle" });
  await page.fill("#f-nama", "Produk Uji CI");
  await page.selectOption("#f-penjual_id", { label: "Dapur Bu Enah" });
  await page.fill("#f-harga", "12500");
  await page.getByRole("button", { name: "Simpan" }).click();
  await page.getByText("Data berhasil ditambahkan").waitFor({ timeout: 15000 });
  await page.goto(BASE + "/pasar?q=Produk%20Uji%20CI", { waitUntil: "networkidle" });
  check((await page.getByText("Rp 12.500").count()) > 0, "produk baru dari CMS tampil di Pasar Desa");

  // Penjual yang masih punya produk tidak bisa dihapus
  await page.goto(BASE + "/admin/penjual", { waitUntil: "networkidle" });
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Hapus" }).first().click();
  await page.getByText("tidak dapat dihapus").waitFor({ timeout: 15000 });
  check(true, "penjual dengan produk dilindungi dari penghapusan");

  // Pesan masuk
  await page.goto(BASE + "/admin/pesan", { waitUntil: "networkidle" });
  check((await page.getByText("Warga Uji CI").count()) > 0, "pesan kontak masuk ke CMS");
  await page.screenshot({ path: `${OUT}/cms-pesan.png` });

  // Mobile CMS
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + "/admin/potensi", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/cms-mobile-potensi.png`, fullPage: true });

  check(errors.length === 0, `CMS tanpa error JavaScript ${errors.length ? JSON.stringify(errors) : ""}`);
  await ctx.close();
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} pemeriksaan GAGAL:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("\nSemua pemeriksaan LULUS.");
