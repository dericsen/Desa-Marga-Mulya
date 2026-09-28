// Data awal (seed) Desa Marga Mulya, Kecamatan Mauk, Kabupaten Tangerang, Banten.
// Struktur mengikuti dokumen "Data EcoQuest IIT Challenge 2026" (bagian A–M).
// Identitas wilayah (desa, kecamatan, kabupaten, provinsi, kode pos) adalah data nyata.
// Angka statistik, nama aparat, dan kegiatan adalah DATA CONTOH yang realistis dan dapat
// diperbarui kapan saja oleh admin melalui CMS dengan data resmi desa.
// Catatan: sesuai ketentuan lomba, data pemeluk agama (bagian D) sengaja tidak ditampilkan
// per kelompok; hanya jumlah sarana ibadah secara umum yang dicatat sebagai fasilitas publik.

const items = (obj) => Object.entries(obj).map(([label, nilai]) => ({ label, nilai }));

export const site = {
  namaDesa: "Marga Mulya",
  kecamatan: "Mauk",
  kabupaten: "Tangerang",
  provinsi: "Banten",
  kodePos: "15530",
  tagline: "Desa pesisir yang agraris, guyub, dan berdaya",
  heroJudul: "Selamat Datang di Desa Marga Mulya",
  heroDeskripsi:
    "Desa di pesisir utara Kabupaten Tangerang dengan hamparan sawah, tambak bandeng, dan masyarakat yang guyub. Temukan informasi desa, data pembangunan, potensi lokal, dan kegiatan warga di sini.",
  heroGambar: "/img/hero-desa.svg",
  namaKepalaDesa: "Ahmad Suryadi",
  fotoKepalaDesa: "",
  sambutan:
    "Salam sejahtera untuk kita semua. Website ini kami hadirkan sebagai jendela informasi Desa Marga Mulya agar warga, perantau, investor, dan wisatawan dapat mengenal desa kami dengan mudah, cepat, dan terbuka. Mari bersama membangun Marga Mulya yang maju, mandiri, dan sejahtera.",
  sejarah:
    "Desa Marga Mulya adalah salah satu desa di **Kecamatan Mauk, Kabupaten Tangerang, Provinsi Banten**. Wilayahnya berada di dataran rendah pesisir utara Tangerang, tidak jauh dari kawasan pantai Tanjung Kait.\n\nNama *Marga Mulya* dimaknai oleh warga sebagai \"jalan menuju kemuliaan\" — sebuah harapan agar desa senantiasa menjadi tempat hidup yang layak, rukun, dan sejahtera bagi seluruh warganya.\n\nSejak dahulu, kehidupan masyarakat bertumpu pada pertanian padi sawah, perikanan tambak, dan hasil laut. Seiring berkembangnya kawasan utara Tangerang, sebagian warga kini juga bekerja di sektor industri, perdagangan, dan jasa, sementara usaha rumah tangga seperti olahan ikan dan kerupuk terus tumbuh sebagai sumber penghasilan keluarga.\n\n> Sejarah lengkap desa dapat dilengkapi oleh pemerintah desa melalui menu **Pengaturan Situs** di CMS.",
  visi: "Terwujudnya Desa Marga Mulya yang maju, mandiri, sejahtera, dan berwawasan lingkungan melalui tata kelola pemerintahan yang terbuka.",
  misi: [
    "Meningkatkan kualitas pelayanan publik yang cepat, ramah, dan transparan berbasis digital.",
    "Mengembangkan ekonomi desa melalui pertanian, perikanan, UMKM, dan BUMDes.",
    "Meningkatkan kualitas pendidikan dan kesehatan masyarakat.",
    "Membangun infrastruktur desa yang merata dan berkelanjutan.",
    "Menjaga kelestarian lingkungan pesisir, sawah, dan saluran irigasi.",
    "Memperkuat gotong royong, keamanan, dan kerukunan warga.",
  ],
  luasWilayah: "412 Ha",
  batasUtara: "Desa Tanjung Anom",
  batasSelatan: "Desa Mauk Barat",
  batasTimur: "Desa Ketapang",
  batasBarat: "Desa Kedung Dalem",
  angkaKunci: [
    { label: "Jumlah Penduduk", nilai: "7.842 jiwa" },
    { label: "Kepala Keluarga", nilai: "2.318 KK" },
    { label: "Luas Wilayah", nilai: "412 Ha" },
    { label: "RW / RT", nilai: "6 RW / 24 RT" },
  ],
  alamat: "Jl. Raya Tanjung Kait, Desa Marga Mulya, Kec. Mauk, Kab. Tangerang, Banten 15530",
  telepon: "(021) 0000-0000",
  email: "pemdes@margamulya.desa.id",
  whatsapp: "6281200000000",
  jamLayanan: "Senin – Kamis: 08.00 – 15.00 WIB\nJumat: 08.00 – 11.00 WIB\nSabtu, Minggu & hari libur: tutup",
  lat: -6.0355,
  lng: 106.5185,
  instagram: "",
  facebook: "",
  youtube: "",
  catatanData:
    "Data statistik pada halaman ini disusun mengikuti struktur Data EcoQuest IIT Challenge 2026 dan berfungsi sebagai data contoh. Pemerintah desa dapat memperbarui seluruh angka melalui CMS sesuai data resmi terbaru.",
};

export const statistik = [
  // A. Kondisi Geografis
  {
    kategori: "geografi", judul: "Penggunaan Lahan", satuan: "Ha", tipe_grafik: "donut", tahun: 2025, urutan: 1,
    deskripsi: "Luas wilayah desa menurut penggunaannya. Total luas wilayah 412 Ha.",
    items: items({ Persawahan: 142, Pemukiman: 98, Tambak: 86, Pekarangan: 36, "Prasarana Umum Lainnya": 24.5, Perkebunan: 18, Perkuburan: 4, Taman: 2, Perkantoran: 1.5 }),
  },
  // B. Pemerintahan Desa
  {
    kategori: "pemerintahan", judul: "Wilayah Administratif", satuan: "unit", tipe_grafik: "tabel", tahun: 2025, urutan: 1,
    deskripsi: "Jumlah Rukun Warga (RW), Rukun Tetangga (RT), dan dusun.",
    items: items({ Dusun: 3, "Rukun Warga (RW)": 6, "Rukun Tetangga (RT)": 24 }),
  },
  {
    kategori: "pemerintahan", judul: "Aparat Desa menurut Pendidikan", satuan: "orang", tipe_grafik: "bar", tahun: 2025, urutan: 2,
    deskripsi: "Tingkat pendidikan terakhir perangkat desa.",
    items: items({ "SLTA/Sederajat": 6, "Diploma (D3)": 2, "Sarjana (S1)": 5, "Magister (S2)": 1 }),
  },
  {
    kategori: "pemerintahan", judul: "Aparat Desa menurut Jenis Kelamin", satuan: "orang", tipe_grafik: "donut", tahun: 2025, urutan: 3,
    items: items({ "Laki-laki": 9, Perempuan: 5 }),
  },
  {
    kategori: "pemerintahan", judul: "Aparat Kecamatan menurut Status", satuan: "orang", tipe_grafik: "bar", tahun: 2025, urutan: 4,
    deskripsi: "Aparatur Kecamatan Mauk yang melayani wilayah desa.",
    items: items({ "PNS": 28, "PPPK": 9, "Tenaga Honorer": 14 }),
  },
  {
    kategori: "pemerintahan", judul: "Keamanan dan Ketertiban", satuan: "unit", tipe_grafik: "tabel", tahun: 2025, urutan: 5,
    items: items({ "Pos Polisi": 1, "Anggota Linmas (orang)": 24, "Pos Kamling": 12 }),
  },
  {
    kategori: "pemerintahan", judul: "Fasilitas Umum Desa", satuan: "unit", tipe_grafik: "tabel", tahun: 2025, urutan: 6,
    deskripsi: "Fasilitas pemerintahan dan sarana umum yang tersedia untuk warga.",
    items: items({ "Kantor Pemerintahan Desa": 1, "Balai Desa": 1, "Sarana Ibadah": 15, "Lapangan Olahraga": 3, "Tempat Pemakaman Umum": 2 }),
  },
  // C. Kependudukan & Angkatan Kerja
  {
    kategori: "kependudukan", judul: "Ringkasan Kependudukan", satuan: "", tipe_grafik: "tabel", tahun: 2025, urutan: 1,
    items: items({ "Jumlah Penduduk (jiwa)": 7842, "Laki-laki (jiwa)": 3962, "Perempuan (jiwa)": 3880, "Kepala Keluarga (KK)": 2318, "Tenaga Kerja Usia 18–56 Tahun": 4615, "Pencari Kerja Terdaftar": 312 }),
  },
  {
    kategori: "kependudukan", judul: "Penduduk menurut Jenis Kelamin", satuan: "jiwa", tipe_grafik: "donut", tahun: 2025, urutan: 2,
    items: items({ "Laki-laki": 3962, Perempuan: 3880 }),
  },
  {
    kategori: "kependudukan", judul: "Mata Pencaharian Pokok", satuan: "orang", tipe_grafik: "bar", tahun: 2025, urutan: 3,
    deskripsi: "Mata pencaharian utama penduduk usia kerja.",
    items: items({ "Karyawan Swasta": 1105, Petani: 612, "Buruh Tani": 540, Nelayan: 486, Pedagang: 402, Pengrajin: 74, Guru: 67, PNS: 38, POLRI: 12, TNI: 9, Lainnya: 690 }),
  },
  {
    kategori: "kependudukan", judul: "Tingkat Pendidikan Penduduk", satuan: "jiwa", tipe_grafik: "bar", tahun: 2025, urutan: 4,
    items: items({ "Belum/Tidak Sekolah": 1210, "Tidak Tamat SD": 640, "Tamat SD/Sederajat": 2105, "Tamat SLTP/Sederajat": 1640, "Tamat SLTA/Sederajat": 1790, "Diploma (D1–D3)": 212, "Sarjana (S1)": 225, "Pascasarjana (S2)": 20 }),
  },
  {
    kategori: "kependudukan", judul: "Pernikahan dan Perceraian", satuan: "peristiwa", tipe_grafik: "bar", tahun: 2025, urutan: 5,
    items: items({ Pernikahan: 68, Perceraian: 7 }),
  },
  // E. Pendidikan
  {
    kategori: "pendidikan", judul: "Jumlah Sekolah per Jenjang", satuan: "sekolah", tipe_grafik: "tabel", tahun: 2025, urutan: 1,
    items: items({ "SD/MI Negeri": 3, "SD/MI Swasta": 2, "SLTP/MTs Negeri": 1, "SLTP/MTs Swasta": 2, "SLTA/SMK/MA Swasta": 1, "Perguruan Tinggi": 0 }),
  },
  {
    kategori: "pendidikan", judul: "Jumlah Murid per Jenjang", satuan: "murid", tipe_grafik: "bar", tahun: 2025, urutan: 2,
    items: items({ "SD/MI": 1184, "SLTP/MTs": 612, "SLTA/SMK/MA": 298 }),
  },
  {
    kategori: "pendidikan", judul: "Jumlah Guru per Jenjang", satuan: "guru", tipe_grafik: "bar", tahun: 2025, urutan: 3,
    items: items({ "SD/MI": 58, "SLTP/MTs": 36, "SLTA/SMK/MA": 21 }),
  },
  {
    kategori: "pendidikan", judul: "Jumlah Ruang Kelas per Jenjang", satuan: "ruang", tipe_grafik: "bar", tahun: 2025, urutan: 4,
    items: items({ "SD/MI": 42, "SLTP/MTs": 21, "SLTA/SMK/MA": 9 }),
  },
  {
    kategori: "pendidikan", judul: "Lembaga Pendidikan Non-formal", satuan: "lembaga", tipe_grafik: "bar", tahun: 2025, urutan: 5,
    items: items({ Menjahit: 2, Komputer: 1, Bahasa: 1, Kecantikan: 1, Montir: 1, Elektronik: 1 }),
  },
  {
    kategori: "pendidikan", judul: "Pendidikan Luar Sekolah (Peserta)", satuan: "peserta", tipe_grafik: "bar", tahun: 2025, urutan: 6,
    items: items({ "Paket A": 12, "Paket B": 28, "Paket C": 41 }),
  },
  // F. Kesehatan
  {
    kategori: "kesehatan", judul: "Fasilitas Kesehatan", satuan: "unit", tipe_grafik: "tabel", tahun: 2025, urutan: 1,
    deskripsi: "Puskesmas dan rumah sakit rujukan terdekat berada di pusat Kecamatan Mauk.",
    items: items({ "Rumah Sakit": 0, Puskesmas: 0, "Puskesmas Pembantu (Pustu)": 1, "Praktik Dokter": 2, "Praktik Bidan": 3, Posyandu: 8, Apotek: 2 }),
  },
  {
    kategori: "kesehatan", judul: "Tenaga Kesehatan", satuan: "orang", tipe_grafik: "bar", tahun: 2025, urutan: 2,
    items: items({ Dokter: 2, Bidan: 4, Perawat: 5, "Dukun Bayi Terlatih": 3 }),
  },
  {
    kategori: "kesehatan", judul: "Imunisasi Dasar Bayi", satuan: "bayi", tipe_grafik: "donut", tahun: 2025, urutan: 3,
    items: items({ "Imunisasi Lengkap": 118, "Belum Lengkap": 9 }),
  },
  {
    kategori: "kesehatan", judul: "Status Gizi Balita", satuan: "balita", tipe_grafik: "bar", tahun: 2025, urutan: 4,
    items: items({ "Gizi Baik": 512, "Gizi Kurang": 34, "Gizi Buruk": 3, "Gizi Lebih": 21 }),
  },
  {
    kategori: "kesehatan", judul: "Sumber Air Bersih Rumah Tangga", satuan: "KK", tipe_grafik: "donut", tahun: 2025, urutan: 5,
    items: items({ "Sumur Bor/Pompa": 1380, PDAM: 420, "Sumur Gali": 260, "Air Isi Ulang": 258 }),
  },
  {
    kategori: "kesehatan", judul: "Jenis Rumah", satuan: "unit", tipe_grafik: "donut", tahun: 2025, urutan: 6,
    items: items({ Permanen: 1690, "Semi Permanen": 486, "Non Permanen": 142 }),
  },
  {
    kategori: "kesehatan", judul: "Jenis Jamban Keluarga", satuan: "KK", tipe_grafik: "bar", tahun: 2025, urutan: 7,
    items: items({ "Jamban Sendiri": 1984, "Jamban Bersama": 246, "Belum Memiliki": 88 }),
  },
  {
    kategori: "kesehatan", judul: "Bahan Bakar Rumah Tangga", satuan: "KK", tipe_grafik: "bar", tahun: 2025, urutan: 8,
    items: items({ "Gas LPG": 2201, "Kayu Bakar": 102, Lainnya: 15 }),
  },
  {
    kategori: "kesehatan", judul: "Program Keluarga Berencana", satuan: "pasangan", tipe_grafik: "bar", tahun: 2025, urutan: 9,
    items: items({ "Pasangan Usia Subur (PUS)": 1512, "Peserta KB Aktif": 1047 }),
  },
  // G. Pertanian & Peternakan
  {
    kategori: "pertanian", judul: "Luas Sawah menurut Jenis Pengairan", satuan: "Ha", tipe_grafik: "donut", tahun: 2025, urutan: 1,
    items: items({ "Irigasi Teknis": 64, "Irigasi Setengah Teknis": 38, "Tadah Hujan": 40 }),
  },
  {
    kategori: "pertanian", judul: "Luas Panen", satuan: "Ha", tipe_grafik: "bar", tahun: 2025, urutan: 2,
    deskripsi: "Luas panen padi dihitung dari dua musim tanam per tahun.",
    items: items({ Padi: 264, Sayuran: 11, "Buah-buahan": 9, Jagung: 8, Ketela: 6 }),
  },
  {
    kategori: "pertanian", judul: "Produksi Pertanian", satuan: "ton", tipe_grafik: "bar", tahun: 2025, urutan: 3,
    items: items({ Padi: 1136, Sayuran: 88, Ketela: 65, "Buah-buahan": 54, Jagung: 42 }),
  },
  {
    kategori: "pertanian", judul: "Kelompok Tani dan Nelayan", satuan: "kelompok", tipe_grafik: "tabel", tahun: 2025, urutan: 4,
    items: items({ "Kelompok Tani": 9, "Kelompok Wanita Tani (KWT)": 2, "Kelompok Pembudidaya Ikan": 4, "Kelompok Nelayan": 5 }),
  },
  {
    kategori: "pertanian", judul: "Populasi Ternak Besar", satuan: "ekor", tipe_grafik: "bar", tahun: 2025, urutan: 5,
    items: items({ Kambing: 412, Domba: 265, Sapi: 46, Kerbau: 38 }),
  },
  {
    kategori: "pertanian", judul: "Populasi Unggas", satuan: "ekor", tipe_grafik: "bar", tahun: 2025, urutan: 6,
    items: items({ "Ayam Ras": 12000, "Ayam Kampung": 5820, Itik: 2340, Puyuh: 1500 }),
  },
  // H. Ekonomi
  {
    kategori: "ekonomi", judul: "Industri Menengah dan Besar", satuan: "unit", tipe_grafik: "tabel", tahun: 2025, urutan: 1,
    items: items({ "Makanan dan Minuman": 1, Tekstil: 0, Kayu: 1, Kertas: 0, Kimia: 0, "Logam": 0, "Plastik": 1 }),
  },
  {
    kategori: "ekonomi", judul: "Industri Kecil dan Kerajinan Rumah Tangga", satuan: "unit usaha", tipe_grafik: "bar", tahun: 2025, urutan: 2,
    items: items({ "Makanan Olahan": 58, Anyaman: 12, "Kain/Konveksi": 9, Kayu: 6, Kulit: 1 }),
  },
  {
    kategori: "ekonomi", judul: "Lembaga Keuangan", satuan: "unit", tipe_grafik: "tabel", tahun: 2025, urutan: 3,
    items: items({ Bank: 0, "Agen Layanan Perbankan": 7, BPR: 1, KUD: 1, Koperasi: 3, Pegadaian: 0 }),
  },
  {
    kategori: "ekonomi", judul: "Sarana Perdagangan", satuan: "unit", tipe_grafik: "bar", tahun: 2025, urutan: 4,
    items: items({ "Warung/Toko Kelontong": 142, "Pasar Modern (Minimarket)": 4, "Pasar Tanpa Bangunan": 1, "Pasar Tradisional": 0 }),
  },
  {
    kategori: "ekonomi", judul: "Penerimaan PBB", satuan: "juta rupiah", tipe_grafik: "bar", tahun: 2025, urutan: 5,
    items: items({ "Target 2024": 470, "Realisasi 2024": 431, "Target 2025": 486, "Realisasi 2025": 452 }),
  },
  {
    kategori: "ekonomi", judul: "Penggunaan Listrik Rumah Tangga", satuan: "KK", tipe_grafik: "donut", tahun: 2025, urutan: 6,
    items: items({ "Listrik PLN": 2276, "Non-PLN": 42 }),
  },
  // I. Infrastruktur
  {
    kategori: "infrastruktur", judul: "Panjang Jalan menurut Status", satuan: "km", tipe_grafik: "bar", tahun: 2025, urutan: 1,
    items: items({ "Jalan Desa": 14.6, "Jalan Antar Desa": 5.2, "Jalan Kabupaten": 3.8, "Jalan Provinsi": 0, "Jalan Negara": 0 }),
  },
  {
    kategori: "infrastruktur", judul: "Jenis Permukaan Jalan", satuan: "km", tipe_grafik: "donut", tahun: 2025, urutan: 2,
    items: items({ Aspal: 9.4, Beton: 7.6, Tanah: 2.7, Makadam: 2.1, Sirtu: 1.8 }),
  },
  {
    kategori: "infrastruktur", judul: "Kondisi Jalan", satuan: "km", tipe_grafik: "bar", tahun: 2025, urutan: 3,
    items: items({ Baik: 15.2, Sedang: 5.3, "Rusak": 3.1 }),
  },
];

export const aparat = [
  { nama: "Ahmad Suryadi", jabatan: "Kepala Desa", urutan: 1 },
  { nama: "Dedi Kurniawan", jabatan: "Sekretaris Desa", urutan: 2 },
  { nama: "Siti Rahmawati", jabatan: "Kaur Keuangan", urutan: 3 },
  { nama: "Rudi Setiawan", jabatan: "Kaur Umum dan Perencanaan", urutan: 4 },
  { nama: "Asep Saepudin", jabatan: "Kasi Pemerintahan", urutan: 5 },
  { nama: "Yusuf Maulana", jabatan: "Kasi Kesejahteraan", urutan: 6 },
  { nama: "Rina Marlina", jabatan: "Kasi Pelayanan", urutan: 7 },
  { nama: "Saepul Anwar", jabatan: "Kepala Dusun I", urutan: 8 },
  { nama: "Jaenudin", jabatan: "Kepala Dusun II", urutan: 9 },
  { nama: "Mulyadi", jabatan: "Kepala Dusun III", urutan: 10 },
];

export const berita = [
  {
    judul: "Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes) 2027",
    slug: "musrenbangdes-2027",
    kategori: "kegiatan",
    tanggal: "2026-09-15",
    gambar: "/img/musyawarah.svg",
    ringkasan: "Pemerintah Desa Marga Mulya bersama BPD, LPM, dan perwakilan RT/RW menyusun prioritas pembangunan tahun 2027.",
    konten:
      "Pemerintah Desa Marga Mulya menggelar **Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)** untuk menyusun Rencana Kerja Pemerintah Desa (RKPDes) tahun 2027 di Balai Desa.\n\nKegiatan dihadiri Badan Permusyawaratan Desa (BPD), Lembaga Pemberdayaan Masyarakat (LPM), Tim Penggerak PKK, Karang Taruna, serta perwakilan RT dan RW.\n\n## Usulan prioritas\n\n- Perbaikan jalan lingkungan di wilayah RW 03 dan RW 05\n- Normalisasi saluran irigasi persawahan\n- Penguatan posyandu dan pencegahan stunting\n- Pelatihan digital marketing untuk pelaku UMKM\n\nSeluruh usulan akan dibahas lebih lanjut bersama BPD sebelum ditetapkan dalam dokumen RKPDes.",
  },
  {
    judul: "Posyandu Serentak: 540 Balita Ditimbang dan Diukur",
    slug: "posyandu-serentak-september-2026",
    kategori: "kegiatan",
    tanggal: "2026-09-08",
    gambar: "/img/posyandu.svg",
    ringkasan: "Delapan posyandu di Desa Marga Mulya melaksanakan penimbangan dan pengukuran balita sebagai upaya pencegahan stunting.",
    konten:
      "Delapan posyandu di Desa Marga Mulya melaksanakan kegiatan **posyandu serentak** dengan pendampingan bidan desa dan kader kesehatan.\n\nSebanyak 540 balita ditimbang dan diukur tinggi badannya. Balita yang terindikasi gizi kurang akan mendapatkan pendampingan dan pemberian makanan tambahan (PMT) berbahan pangan lokal, termasuk olahan ikan hasil tambak warga.\n\nOrang tua diimbau rutin membawa anak ke posyandu setiap bulan dan melengkapi imunisasi dasar.",
  },
  {
    judul: "Panen Raya Padi Musim Gadu di Hamparan Sawah Marga Mulya",
    slug: "panen-raya-padi-musim-gadu-2026",
    kategori: "berita",
    tanggal: "2026-08-24",
    gambar: "/img/sawah.svg",
    ringkasan: "Kelompok tani Desa Marga Mulya memanen padi dengan hasil rata-rata 5,4 ton gabah kering per hektare.",
    konten:
      "Kelompok tani di Desa Marga Mulya melaksanakan **panen raya padi musim gadu**. Hasil panen rata-rata mencapai 5,4 ton gabah kering panen per hektare.\n\nPenyuluh pertanian mengingatkan pentingnya perawatan saluran irigasi dan penggunaan benih unggul agar produktivitas tetap terjaga pada musim tanam berikutnya.",
  },
  {
    judul: "Pelatihan Pemasaran Digital untuk Pelaku UMKM Olahan Ikan",
    slug: "pelatihan-pemasaran-digital-umkm",
    kategori: "kegiatan",
    tanggal: "2026-08-10",
    gambar: "/img/umkm.svg",
    ringkasan: "Tiga puluh pelaku UMKM belajar foto produk, penulisan deskripsi, dan berjualan melalui marketplace serta WhatsApp Business.",
    konten:
      "Sebanyak **30 pelaku UMKM** mengikuti pelatihan pemasaran digital yang diselenggarakan pemerintah desa bersama BUMDes.\n\nMateri meliputi:\n\n1. Teknik foto produk menggunakan ponsel\n2. Menulis deskripsi produk yang menarik\n3. Berjualan melalui marketplace dan WhatsApp Business\n4. Pencatatan keuangan sederhana\n\nProduk UMKM peserta kini juga ditampilkan di halaman **Potensi Desa** pada website ini.",
  },
  {
    judul: "Kerja Bakti Normalisasi Saluran Irigasi",
    slug: "kerja-bakti-normalisasi-saluran-irigasi",
    kategori: "berita",
    tanggal: "2026-07-19",
    gambar: "/img/gotong-royong.svg",
    ringkasan: "Warga bergotong royong membersihkan saluran irigasi sepanjang 1,2 km untuk persiapan musim tanam.",
    konten:
      "Ratusan warga dari enam RW bergotong royong membersihkan **saluran irigasi sepanjang 1,2 km** yang mengairi persawahan desa.\n\nKegiatan ini menjadi agenda rutin menjelang musim tanam untuk mencegah banjir dan memastikan air mengalir lancar ke sawah.",
  },
  {
    judul: "Jadwal Pelayanan Administrasi Kependudukan di Kantor Desa",
    slug: "jadwal-pelayanan-administrasi-kependudukan",
    kategori: "pengumuman",
    tanggal: "2026-07-01",
    gambar: "/img/kantor-desa.svg",
    ringkasan: "Informasi jam layanan dan persyaratan pengurusan surat keterangan, pengantar KTP-el, dan Kartu Keluarga.",
    konten:
      "Kantor Desa Marga Mulya melayani pengurusan administrasi kependudukan pada **Senin–Kamis pukul 08.00–15.00 WIB** dan **Jumat pukul 08.00–11.00 WIB**.\n\n## Layanan yang tersedia\n\n- Surat pengantar KTP-el dan Kartu Keluarga\n- Surat keterangan domisili\n- Surat keterangan usaha\n- Surat keterangan tidak mampu\n\nHarap membawa **KTP-el dan Kartu Keluarga asli** beserta fotokopinya. Layanan tidak dipungut biaya.",
  },
];

export const galeri = [
  { judul: "Hamparan Sawah Marga Mulya", album: "Alam & Lingkungan", gambar: "/img/sawah.svg", deskripsi: "Persawahan seluas 142 Ha menjadi tumpuan ekonomi utama warga.", tanggal: "2026-08-24", urutan: 1 },
  { judul: "Perahu Nelayan di Pesisir Mauk", album: "Alam & Lingkungan", gambar: "/img/pesisir.svg", deskripsi: "Nelayan bersiap melaut di pesisir utara Tangerang.", tanggal: "2026-07-05", urutan: 2 },
  { judul: "Tambak Bandeng Warga", album: "Potensi Desa", gambar: "/img/tambak.svg", deskripsi: "Budidaya bandeng dan udang di lahan tambak desa.", tanggal: "2026-06-18", urutan: 3 },
  { judul: "Kantor Desa Marga Mulya", album: "Pemerintahan", gambar: "/img/kantor-desa.svg", deskripsi: "Pusat pelayanan administrasi warga.", tanggal: "2026-07-01", urutan: 4 },
  { judul: "Posyandu Serentak", album: "Kegiatan Warga", gambar: "/img/posyandu.svg", deskripsi: "Penimbangan balita oleh kader posyandu.", tanggal: "2026-09-08", urutan: 5 },
  { judul: "Kerja Bakti Saluran Irigasi", album: "Kegiatan Warga", gambar: "/img/gotong-royong.svg", deskripsi: "Gotong royong warga menjelang musim tanam.", tanggal: "2026-07-19", urutan: 6 },
  { judul: "Produk UMKM Olahan Ikan", album: "Potensi Desa", gambar: "/img/umkm.svg", deskripsi: "Kerupuk ikan, bandeng presto, dan ikan asin buatan warga.", tanggal: "2026-08-10", urutan: 7 },
  { judul: "Musrenbangdes 2027", album: "Pemerintahan", gambar: "/img/musyawarah.svg", deskripsi: "Musyawarah perencanaan pembangunan desa.", tanggal: "2026-09-15", urutan: 8 },
  { judul: "Latihan Pencak Silat Remaja", album: "Budaya", gambar: "/img/silat.svg", deskripsi: "Latihan rutin pencak silat di lapangan desa.", tanggal: "2026-08-17", urutan: 9 },
];

export const potensi = [
  // K. Wisata
  { tipe: "wisata", nama: "Pantai Tanjung Kait", unggulan: true, urutan: 1, gambar: "/img/pesisir.svg", alamat: "Kawasan pesisir Tanjung Kait, Kec. Mauk (± 10 menit dari desa)", harga: "Tiket masuk terjangkau", deskripsi: "Destinasi pantai terdekat dari Desa Marga Mulya. Pengunjung dapat menikmati suasana pesisir, perahu nelayan, dan kuliner hasil laut segar." },
  { tipe: "wisata", nama: "Roemah Tjoen", unggulan: true, urutan: 2, gambar: "/img/hero-desa.svg", alamat: "Desa Marga Mulya, Kec. Mauk", deskripsi: "Tempat rekreasi dan ruang acara di Desa Marga Mulya yang dapat digunakan untuk kegiatan keluarga, komunitas, dan acara outdoor." },
  { tipe: "wisata", nama: "Eduwisata Tambak dan Mangrove", unggulan: false, urutan: 3, gambar: "/img/tambak.svg", alamat: "Kawasan tambak utara desa", harga: "Paket edukasi mulai Rp15.000/orang", deskripsi: "Belajar budidaya bandeng, udang, dan pentingnya mangrove bagi pesisir bersama kelompok pembudidaya ikan. Cocok untuk kunjungan sekolah." },
  { tipe: "wisata", nama: "Agrowisata Sawah", unggulan: false, urutan: 4, gambar: "/img/sawah.svg", alamat: "Hamparan sawah RW 04", deskripsi: "Pengalaman menanam padi, membajak sawah, dan menikmati pemandangan hamparan hijau pada musim tanam." },
  // J. Budaya & Kesenian
  { tipe: "budaya", nama: "Pencak Silat", unggulan: true, urutan: 1, gambar: "/img/silat.svg", deskripsi: "Perguruan pencak silat desa melatih anak dan remaja setiap pekan, sekaligus tampil pada acara desa dan peringatan hari besar nasional." },
  { tipe: "budaya", nama: "Karnaval dan Pesta Rakyat HUT RI", unggulan: false, urutan: 2, gambar: "/img/gotong-royong.svg", deskripsi: "Setiap Agustus warga menggelar karnaval, lomba tradisional seperti panjat pinang dan balap karung, serta pentas seni antar-RW." },
  { tipe: "budaya", nama: "Sanggar Tari Kreasi Anak", unggulan: false, urutan: 3, gambar: "/img/musyawarah.svg", deskripsi: "Sanggar seni tempat anak-anak belajar tari kreasi dan tari tradisional Nusantara untuk tampil di acara desa maupun lomba antar-kecamatan." },
  // M. UMKM & Produk Lokal
  { tipe: "umkm", nama: "Bandeng Presto Mulya", unggulan: true, urutan: 1, gambar: "/img/umkm.svg", harga: "Rp45.000 / 500 gr", kontak: "6281200000001", alamat: "RT 02/RW 01", deskripsi: "Bandeng presto duri lunak dari bandeng tambak desa, diolah higienis dan tahan hingga 3 hari tanpa pengawet." },
  { tipe: "umkm", nama: "Kerupuk Ikan Bu Enah", unggulan: true, urutan: 2, gambar: "/img/umkm.svg", harga: "Rp20.000 / 250 gr", kontak: "6281200000002", alamat: "RT 05/RW 02", deskripsi: "Kerupuk ikan renyah dengan rasa gurih alami, tersedia mentah maupun siap santap." },
  { tipe: "umkm", nama: "Ikan Asin dan Terasi Pesisir", unggulan: false, urutan: 3, gambar: "/img/pesisir.svg", harga: "Mulai Rp15.000", kontak: "6281200000003", alamat: "RT 01/RW 06", deskripsi: "Ikan asin dan terasi udang rebon hasil tangkapan nelayan setempat, dijemur alami di bawah sinar matahari." },
  { tipe: "umkm", nama: "Anyaman Bambu Marga Mulya", unggulan: false, urutan: 4, gambar: "/img/anyaman.svg", harga: "Rp25.000 – Rp150.000", kontak: "6281200000004", alamat: "RT 03/RW 04", deskripsi: "Bakul, tampah, dan hiasan dinding dari anyaman bambu buatan tangan pengrajin desa. Menerima pesanan souvenir." },
  { tipe: "umkm", nama: "Beras Sawah Mulya", unggulan: false, urutan: 5, gambar: "/img/sawah.svg", harga: "Rp68.000 / 5 kg", kontak: "6281200000005", alamat: "Gapoktan Marga Mulya", deskripsi: "Beras pulen hasil panen petani desa, dikemas oleh gabungan kelompok tani dan BUMDes." },
];

export const organisasi = [
  { nama: "Badan Permusyawaratan Desa (BPD)", ketua: "Ketua BPD", anggota: 7, urutan: 1, jadwal: "Rapat rutin setiap Senin pada minggu pertama", deskripsi: "Menampung aspirasi warga, membahas dan menyepakati peraturan desa, serta mengawasi kinerja pemerintah desa." },
  { nama: "Lembaga Pemberdayaan Masyarakat (LPM)", ketua: "Ketua LPM", anggota: 12, urutan: 2, jadwal: "Rapat koordinasi dua bulanan", deskripsi: "Mitra pemerintah desa dalam merencanakan dan melaksanakan pembangunan partisipatif." },
  { nama: "Tim Penggerak PKK", ketua: "Ketua TP PKK", anggota: 45, urutan: 3, jadwal: "Pertemuan rutin setiap Rabu minggu kedua", deskripsi: "Menggerakkan 10 program pokok PKK, termasuk pemberdayaan keluarga, kesehatan, dan ketahanan pangan." },
  { nama: "Karang Taruna Mulya Muda", ketua: "Ketua Karang Taruna", anggota: 60, urutan: 4, jadwal: "Kegiatan olahraga setiap Minggu pagi", deskripsi: "Wadah pengembangan pemuda: olahraga, seni, kewirausahaan, dan kegiatan sosial." },
  { nama: "Kader Posyandu", ketua: "Koordinator Kader", anggota: 40, urutan: 5, jadwal: "Posyandu setiap tanggal 8–12 setiap bulan", deskripsi: "Delapan posyandu melayani penimbangan balita, imunisasi, dan penyuluhan gizi." },
  { nama: "Satuan Perlindungan Masyarakat (Linmas)", ketua: "Kepala Satlinmas", anggota: 24, urutan: 6, jadwal: "Ronda malam bergilir di 12 pos kamling", deskripsi: "Membantu menjaga keamanan, ketertiban, dan penanggulangan bencana di desa." },
  { nama: "Gabungan Kelompok Tani (Gapoktan)", ketua: "Ketua Gapoktan", anggota: 180, urutan: 7, jadwal: "Pertemuan kelompok setiap awal musim tanam", deskripsi: "Menaungi 9 kelompok tani dan 2 kelompok wanita tani dalam penyediaan benih, pupuk, dan pemasaran hasil panen." },
  { nama: "Kelompok Nelayan dan Pembudidaya Ikan", ketua: "Ketua Kelompok", anggota: 95, urutan: 8, jadwal: "Pertemuan bulanan setiap Sabtu minggu ketiga", deskripsi: "Wadah nelayan dan petambak untuk berbagi informasi cuaca, akses bantuan alat tangkap, dan pemasaran hasil perikanan." },
  { nama: "BUMDes Mulya Sejahtera", ketua: "Direktur BUMDes", anggota: 6, urutan: 9, jadwal: "Layanan setiap hari kerja", deskripsi: "Badan Usaha Milik Desa yang mengelola unit pemasaran produk UMKM, simpan pinjam, dan pengelolaan sampah." },
];

export const lokasi = [
  { nama: "Kantor Desa Marga Mulya", kategori: "pemerintahan", lat: -6.0355, lng: 106.5185, deskripsi: "Pusat pelayanan administrasi desa." },
  { nama: "Balai Desa", kategori: "pemerintahan", lat: -6.0359, lng: 106.5192, deskripsi: "Tempat musyawarah dan kegiatan warga." },
  { nama: "Puskesmas Pembantu (Pustu)", kategori: "kesehatan", lat: -6.0372, lng: 106.5168, deskripsi: "Layanan kesehatan dasar untuk warga." },
  { nama: "Posyandu Melati", kategori: "kesehatan", lat: -6.0331, lng: 106.5207, deskripsi: "Posyandu balita dan lansia." },
  { nama: "SD Negeri Marga Mulya", kategori: "pendidikan", lat: -6.0342, lng: 106.5160, deskripsi: "Sekolah dasar negeri." },
  { nama: "SMP/MTs Swasta", kategori: "pendidikan", lat: -6.0388, lng: 106.5213, deskripsi: "Sekolah menengah pertama." },
  { nama: "Roemah Tjoen", kategori: "wisata", lat: -6.0318, lng: 106.5230, deskripsi: "Tempat rekreasi dan ruang acara." },
  { nama: "Kawasan Tambak Bandeng", kategori: "wisata", lat: -6.0280, lng: 106.5205, deskripsi: "Eduwisata tambak dan mangrove." },
  { nama: "Sentra UMKM Olahan Ikan", kategori: "umkm", lat: -6.0365, lng: 106.5220, deskripsi: "Bandeng presto, kerupuk ikan, ikan asin." },
  { nama: "Lapangan Desa", kategori: "umum", lat: -6.0378, lng: 106.5190, deskripsi: "Lapangan olahraga dan kegiatan warga." },
];
