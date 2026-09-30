# Website & CMS Desa Marga Mulya

Website resmi dan Sistem Manajemen Konten (CMS) untuk **Desa Marga Mulya, Kecamatan Mauk, Kabupaten Tangerang, Banten (15530)**. Proyek ini dibuat untuk EcoQuest Web Application, IIT Challenge 2026.

Semua konten publik diambil dari database dan dikelola melalui CMS. Tidak ada data desa yang ditulis langsung (*hardcoded*) di halaman.

## Fitur

**Website publik (10 halaman, sesuai batas lomba)**

| Halaman | Isi |
|---|---|
| `/` Beranda | Hero, angka kunci, sambutan kepala desa, akses cepat, sorotan data, potensi unggulan, berita terbaru, galeri, peta |
| `/profil` Profil Desa | Sejarah, visi & misi, identitas wilayah, batas wilayah, peta interaktif, struktur aparat |
| `/informasi` Informasi Desa | Dasbor data (bagian A–I dokumen EcoQuest) dengan grafik batang, grafik donat, dan tabel per kategori, lengkap dengan unduhan CSV |
| `/pasar` Pasar Desa | Katalog produk UMKM (bagian M): pencarian, kategori, urutan harga, detail produk, keranjang, dan pemesanan ke WhatsApp penjual |
| `/potensi` Wisata & Budaya | Tempat wisata serta budaya & kesenian (bagian J, K) |
| `/berita` dan `/berita/[slug]` | Berita, kegiatan, pengumuman, serta organisasi & kegiatan rutin (bagian L) |
| `/galeri` Galeri | Album foto dengan filter dan *lightbox* (bisa dikendalikan dengan keyboard) |
| `/kontak` Kontak | Info kontak, jam layanan, WhatsApp, peta & petunjuk arah, formulir aspirasi yang tersimpan ke CMS |
| `/cari` Pencarian | Pencarian di berita, data, potensi, organisasi, dan galeri |

**Pasar Desa (marketplace UMKM)**
- Pembeli memasukkan produk dari satu atau beberapa penjual ke keranjang, lalu mengisi nama, nomor HP, dan cara pengambilan (ambil sendiri atau diantar di dalam desa).
- Setiap penjual mendapat pesanan terpisah dengan kode unik (mis. `MM-260929-4K7Q`). Pembeli menekan tombol untuk mengirim rincian pesanan ke WhatsApp penjual.
- Harga dan stok dihitung ulang di server dalam satu transaksi database, sehingga tidak bisa dimanipulasi dari browser. Stok berkurang otomatis dan dikembalikan bila pesanan dibatalkan.
- Pembayaran langsung ke penjual (tunai/transfer). Website tidak memakai payment gateway, sehingga tidak ada biaya atau izin tambahan bagi desa.
- Admin mengelola Pelaku Usaha, Produk (harga, stok, foto, kategori), dan Pesanan (baru → diproses → selesai/dibatalkan) di CMS.

**Asisten AI "Tanya Desa"**: tombol mengambang di semua halaman.
- Menjawab hanya berdasarkan data di CMS. Memakai Google Gemini bila `GEMINI_API_KEY` diisi.
- Jika tanpa kunci API (atau API sedang gagal), asisten beralih ke **mode pencarian data lokal**, jadi tetap bisa menjawab.
- Menolak pertanyaan bernuansa SARA dengan sopan.

**CMS (`/admin`)**
- Login admin dengan sesi aman (cookie HttpOnly bertanda tangan HMAC, kata sandi di-hash scrypt, pembatasan percobaan login).
- Kelola: Pengaturan Situs, Berita & Kegiatan, Produk Pasar Desa, Pelaku Usaha, Pesanan, Data Statistik (editor baris label/nilai), Potensi, Galeri, Aparat Desa, Organisasi, Titik Peta, dan Pesan Masuk (tandai dibaca, balas via email/WhatsApp).
- Unggah gambar. Gambar dikompres otomatis di browser, lalu disimpan ke Vercel Blob. Jika Blob tidak diatur, gambar disimpan di database.
- Kelola akun admin: ganti kata sandi, tambah/hapus admin.

**Aksesibilitas & responsif**
- HTML semantik, tautan "lewati ke konten", label form, `aria-*`, fokus yang terlihat.
- Menghormati pengaturan *reduced motion*.
- Tata letak *mobile-first* dan seluruh antarmuka berbahasa Indonesia.

## Teknologi

- Next.js 15 (App Router, Server Actions), React 19, TypeScript
- Tailwind CSS 4
- PostgreSQL melalui `postgres` (kompatibel dengan Neon, Supabase, dan Postgres lokal)
- Leaflet + OpenStreetMap untuk peta
- Grafik SVG buatan sendiri, tanpa pustaka grafik
- Google Gemini API (REST) untuk asisten AI
- Vercel Blob (opsional) untuk gambar

## Menjalankan secara lokal

```bash
cp .env.example .env.local        # isi DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET
npm install
npm run db:setup                  # membuat tabel + mengisi data awal
npm run dev                       # http://localhost:3000, CMS di /admin
```

`npm run db:reset` menghapus semua tabel lalu mengisi ulang data awal.

## Deploy ke Vercel

1. **Import repositori** di [vercel.com/new](https://vercel.com/new). Framework akan terdeteksi otomatis sebagai Next.js.
2. **Tambah database**: *Project → Storage → Create Database → Neon (Postgres)*, lalu hubungkan ke proyek. `DATABASE_URL` akan terisi otomatis.
3. **Tambah Environment Variables** (*Settings → Environment Variables*):

   | Nama | Wajib | Keterangan |
   |---|---|---|
   | `ADMIN_EMAIL` | ya | Email admin awal |
   | `ADMIN_PASSWORD` | ya | Kata sandi admin awal (min. 8 karakter) |
   | `SESSION_SECRET` | ya | String acak panjang, misalnya hasil `openssl rand -hex 32` |
   | `GEMINI_API_KEY` | disarankan | Dari [Google AI Studio](https://aistudio.google.com/apikey), gratis |
   | `GEMINI_MODEL` | tidak | Bawaan `gemini-flash-latest` |
   | `BLOB_READ_WRITE_TOKEN` | tidak | Otomatis terisi bila membuat *Storage → Blob* |

4. **Deploy.** Perintah build (`npm run build`) otomatis menjalankan migrasi dan seed, lalu `next build`. Proses ini aman diulang: data yang sudah ada tidak akan ditimpa.
5. Buka `https://<proyek>.vercel.app/admin`, masuk dengan `ADMIN_EMAIL`/`ADMIN_PASSWORD`, dan **ganti kata sandi** di menu Akun Admin.

Status konfigurasi (AI, Blob, kunci sesi) dapat dicek di Dasbor CMS.

## Deploy ke Railway (alternatif)

> Catatan: ketentuan lomba mewajibkan URL **Vercel**. Railway bisa dipakai sebagai server cadangan atau untuk uji coba.

Konfigurasi sudah tersedia di `railway.json`: build memakai `next build`, lalu saat server start migrasi + seed dijalankan dulu sebelum `next start`. Urutan ini dipakai karena jaringan privat Railway belum tersedia saat proses build.

1. Di [railway.com](https://railway.com): *New Project → Deploy from GitHub repo*, lalu pilih repositori ini.
2. Di proyek yang sama: *New → Database → PostgreSQL*.
3. Buka service aplikasi → *Variables*, lalu tambahkan:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (referensi ke database Railway)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, dan opsional `GEMINI_API_KEY`
4. *Settings → Networking → Generate Domain* untuk mendapatkan URL publik `*.up.railway.app`.

SSL otomatis dimatikan untuk alamat `*.railway.internal`. Untuk database lain tanpa SSL, atur `DB_SSL=false`.

Di Railway gambar tersimpan di database, karena Vercel Blob hanya tersedia di Vercel.

## Data desa

- **Data nyata**: nama desa, kecamatan, kabupaten, provinsi, dan kode pos. Roemah Tjoen (tempat rekreasi di Desa Marga Mulya) dan Pantai Tanjung Kait (destinasi pantai terdekat) juga nyata.
- **Data contoh**: angka statistik, nama aparat, batas wilayah, koordinat peta, kontak, dan produk UMKM. Semuanya disusun mengikuti struktur dokumen *Data EcoQuest IIT Challenge 2026* (bagian A–M), sesuai ketentuan lomba yang memperbolehkan data *dummy*. Semua data ini dapat diganti dengan data resmi melalui CMS, dan keterangan sumber data ditampilkan di halaman Informasi Desa (dapat diedit).
- **Ketentuan SARA**: jumlah penduduk menurut agama (bagian D) sengaja **tidak ditampilkan**. Sarana ibadah hanya dicatat sebagai jumlah fasilitas umum, tanpa rincian.

## Pengujian

GitHub Actions (`.github/workflows/ci.yml`) menjalankan pengujian pada PostgreSQL 16:
- build, migrasi ulang (uji idempoten), dan server produksi;
- uji end-to-end Playwright (`scripts/e2e.mjs`) untuk semua halaman publik (desktop & seluler), asisten AI, formulir kontak, galeri, serta alur CMS (login, tambah berita, ubah statistik, ubah pengaturan, pesan masuk).

Screenshot hasil uji diunggah sebagai artefak `hasil-uji`.

## Atribusi & lisensi pihak ketiga

- Peta: © kontributor [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL); pustaka [Leaflet](https://leafletjs.com) (BSD-2-Clause).
- Huruf: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (SIL Open Font License).
- Ilustrasi di `public/img`, logo, dan ikon dibuat khusus untuk proyek ini. Ilustrasi hanya sebagai pengganti sementara; unggah foto asli desa melalui CMS.
- Asisten AI memakai Google Gemini API sesuai ketentuan layanan Google.
- Kode dikembangkan dengan bantuan AI, lalu ditinjau dan disesuaikan oleh tim.
