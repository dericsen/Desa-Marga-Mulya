// Konfigurasi koleksi konten CMS. Setiap koleksi dipetakan ke satu tabel database,
// sehingga halaman admin (daftar, tambah, ubah, hapus) dibuat secara generik dari konfigurasi ini.
import { BERITA_TYPES, LOKASI_TYPES, PESANAN_STATUS, POTENSI_TYPES, PRODUK_KATEGORI, PRODUK_TINJAU, STAT_CATEGORIES, type IconName } from "./categories";

export type FieldType =
  | "text" | "textarea" | "markdown" | "number" | "rupiah" | "select" | "image" | "date" | "boolean" | "items" | "list" | "email" | "relation";

/** Relasi ke tabel lain; pilihan diisi dari database saat form dibuka. */
export type Relation = { table: string; labelColumn: string };

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  help?: string;
  placeholder?: string;
  step?: string;
  /** Kolom lebar penuh pada form. */
  wide?: boolean;
  relation?: Relation;
};

export type Column = {
  name: string;
  label: string;
  type?: "date" | "boolean" | "image" | "select" | "datetime" | "rupiah" | "relation" | "number";
  relation?: Relation;
};

export type Resource = {
  key: string;
  table: string;
  label: string;
  singular: string;
  icon: IconName;
  description: string;
  fields: Field[];
  columns: Column[];
  orderBy: string;
  /** Koleksi hanya-baca dari admin (mis. pesan masuk dari formulir kontak). */
  readonly?: boolean;
  /** Kolom yang dipakai untuk pencarian di daftar CMS. */
  searchColumn?: string;
  /** Kolom yang dibuat otomatis menjadi slug bila field slug kosong. */
  slugFrom?: string;
  /** Tautan filter cepat di daftar CMS, mis. hanya produk yang menunggu tinjauan. */
  quickFilter?: { column: string; value: string; label: string };
  publicPath?: string;
};

const opt = (arr: { key: string; label: string }[]) => arr.map((a) => ({ value: a.key, label: a.label }));

export const RESOURCES: Resource[] = [
  {
    key: "berita",
    table: "berita",
    label: "Berita & Kegiatan",
    singular: "Berita",
    icon: "news",
    description: "Berita, kegiatan warga, dan pengumuman desa.",
    publicPath: "/berita",
    orderBy: "tanggal desc, id desc",
    slugFrom: "judul",
    columns: [
      { name: "gambar", label: "", type: "image" },
      { name: "judul", label: "Judul" },
      { name: "kategori", label: "Kategori", type: "select" },
      { name: "tanggal", label: "Tanggal", type: "date" },
      { name: "terbit", label: "Terbit", type: "boolean" },
    ],
    fields: [
      { name: "judul", label: "Judul", type: "text", required: true, wide: true },
      { name: "slug", label: "Slug URL", type: "text", help: "Kosongkan untuk dibuat otomatis dari judul." },
      { name: "kategori", label: "Kategori", type: "select", options: opt(BERITA_TYPES), required: true },
      { name: "tanggal", label: "Tanggal", type: "date", required: true },
      { name: "terbit", label: "Terbitkan di website", type: "boolean" },
      { name: "gambar", label: "Gambar Utama", type: "image", wide: true },
      { name: "ringkasan", label: "Ringkasan", type: "textarea", wide: true },
      { name: "konten", label: "Isi Berita", type: "markdown", wide: true, help: "Mendukung format sederhana: **tebal**, *miring*, ## Subjudul, - daftar, 1. daftar bernomor, [tautan](https://...)." },
    ],
  },
  {
    key: "produk",
    table: "produk",
    label: "Produk Pasar Desa",
    singular: "Produk",
    icon: "store",
    description: "Produk UMKM yang dijual di Pasar Desa. Harga ditulis dalam rupiah tanpa titik.",
    publicPath: "/pasar",
    orderBy: "(status_tinjau = 'menunggu') desc, penjual_id, urutan, id",
    searchColumn: "nama",
    slugFrom: "nama",
    quickFilter: { column: "status_tinjau", value: "menunggu", label: "Menunggu tinjauan" },
    columns: [
      { name: "gambar", label: "", type: "image" },
      { name: "nama", label: "Produk" },
      { name: "penjual_id", label: "Penjual", type: "relation", relation: { table: "penjual", labelColumn: "nama" } },
      { name: "harga", label: "Harga", type: "rupiah" },
      { name: "stok", label: "Stok", type: "number" },
      { name: "status_tinjau", label: "Tinjauan", type: "select" },
      { name: "tersedia", label: "Dijual", type: "boolean" },
    ],
    fields: [
      { name: "nama", label: "Nama Produk", type: "text", required: true, wide: true },
      { name: "penjual_id", label: "Penjual", type: "relation", relation: { table: "penjual", labelColumn: "nama" }, required: true },
      { name: "kategori", label: "Kategori", type: "select", options: opt(PRODUK_KATEGORI), required: true },
      { name: "harga", label: "Harga", type: "rupiah", required: true, help: "Ketik angkanya saja — titik ribuan muncul otomatis." },
      { name: "satuan", label: "Satuan / Kemasan", type: "text", placeholder: "mis. 500 gr, per ikat, isi 10" },
      { name: "stok", label: "Stok", type: "number", help: "Kosongkan bila selalu tersedia. Stok berkurang otomatis saat ada pesanan." },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "tersedia", label: "Tampilkan dan jual di Pasar Desa", type: "boolean" },
      { name: "unggulan", label: "Tampilkan di Beranda", type: "boolean" },
      { name: "slug", label: "Slug URL", type: "text", help: "Kosongkan untuk dibuat otomatis dari nama." },
      { name: "gambar", label: "Foto Produk", type: "image", wide: true },
      { name: "deskripsi", label: "Deskripsi", type: "textarea", wide: true, help: "Tulis bahan, ukuran, daya tahan, dan cara penyimpanan." },
      { name: "status_tinjau", label: "Status tinjauan", type: "select", options: opt(PRODUK_TINJAU), required: true, help: "Hanya produk berstatus Disetujui yang tampil di Pasar Desa." },
      { name: "catatan_tinjau", label: "Catatan untuk penjual", type: "textarea", wide: true, placeholder: "mis. Foto kurang jelas, mohon unggah foto kemasan." },
    ],
  },
  {
    key: "penjual",
    table: "penjual",
    label: "Pelaku Usaha",
    singular: "Pelaku Usaha",
    icon: "users",
    description: "Penjual di Pasar Desa. Pesanan dikirim ke nomor WhatsApp penjual.",
    publicPath: "/pasar",
    orderBy: "urutan, id",
    searchColumn: "nama",
    slugFrom: "nama",
    columns: [
      { name: "foto", label: "", type: "image" },
      { name: "nama", label: "Nama Usaha" },
      { name: "pemilik", label: "Pemilik" },
      { name: "whatsapp", label: "WhatsApp" },
      { name: "aktif", label: "Aktif", type: "boolean" },
    ],
    fields: [
      { name: "nama", label: "Nama Usaha", type: "text", required: true, wide: true },
      { name: "pemilik", label: "Nama Pemilik", type: "text" },
      { name: "whatsapp", label: "Nomor WhatsApp", type: "text", required: true, placeholder: "62812xxxxxxx", help: "Pesanan pembeli dikirim ke nomor ini." },
      { name: "alamat", label: "Alamat (RT/RW)", type: "text" },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "aktif", label: "Aktif berjualan", type: "boolean" },
      { name: "slug", label: "Slug URL", type: "text", help: "Kosongkan untuk dibuat otomatis." },
      { name: "foto", label: "Foto Usaha", type: "image", wide: true },
      { name: "deskripsi", label: "Tentang Usaha", type: "textarea", wide: true },
    ],
  },
  {
    key: "pesanan",
    table: "pesanan",
    label: "Pesanan",
    singular: "Pesanan",
    icon: "inbox",
    description: "Pesanan dari Pasar Desa. Pembayaran dilakukan langsung ke penjual.",
    readonly: true,
    orderBy: "created_at desc, id desc",
    searchColumn: "kode",
    columns: [
      { name: "kode", label: "Kode" },
      { name: "nama_pembeli", label: "Pembeli" },
      { name: "penjual_nama", label: "Penjual" },
      { name: "total", label: "Total", type: "rupiah" },
      { name: "status", label: "Status", type: "select" },
      { name: "created_at", label: "Masuk", type: "datetime" },
    ],
    fields: [
      { name: "status", label: "Status", type: "select", options: opt(PESANAN_STATUS) },
    ],
  },
  {
    key: "statistik",
    table: "statistik",
    label: "Data Statistik",
    singular: "Data Statistik",
    icon: "chart",
    description: "Data desa yang ditampilkan sebagai grafik/tabel di halaman Informasi Desa.",
    publicPath: "/informasi",
    orderBy: "kategori, urutan, id",
    columns: [
      { name: "judul", label: "Judul" },
      { name: "kategori", label: "Kategori", type: "select" },
      { name: "tipe_grafik", label: "Tampilan", type: "select" },
      { name: "tahun", label: "Tahun" },
    ],
    fields: [
      { name: "judul", label: "Judul Data", type: "text", required: true, wide: true },
      { name: "kategori", label: "Kategori", type: "select", options: STAT_CATEGORIES.map((c) => ({ value: c.key, label: c.label })), required: true },
      {
        name: "tipe_grafik", label: "Jenis Tampilan", type: "select", required: true,
        options: [
          { value: "bar", label: "Grafik Batang" },
          { value: "donut", label: "Grafik Donat" },
          { value: "tabel", label: "Tabel" },
        ],
      },
      { name: "satuan", label: "Satuan", type: "text", placeholder: "mis. jiwa, Ha, unit" },
      { name: "tahun", label: "Tahun Data", type: "number" },
      { name: "urutan", label: "Urutan Tampil", type: "number" },
      { name: "deskripsi", label: "Keterangan", type: "textarea", wide: true },
      { name: "items", label: "Isi Data (label dan nilai)", type: "items", wide: true, help: "Nilai harus berupa angka. Gunakan titik untuk desimal, mis. 24.5" },
    ],
  },
  {
    key: "potensi",
    table: "potensi",
    label: "Potensi Desa",
    singular: "Potensi",
    icon: "star",
    description: "Wisata serta budaya & kesenian. Produk UMKM kini dikelola di menu Produk Pasar Desa.",
    publicPath: "/potensi",
    orderBy: "tipe, urutan, id",
    columns: [
      { name: "gambar", label: "", type: "image" },
      { name: "nama", label: "Nama" },
      { name: "tipe", label: "Jenis", type: "select" },
      { name: "unggulan", label: "Unggulan", type: "boolean" },
    ],
    fields: [
      { name: "nama", label: "Nama", type: "text", required: true, wide: true },
      { name: "tipe", label: "Jenis", type: "select", options: opt(POTENSI_TYPES), required: true },
      { name: "unggulan", label: "Tampilkan sebagai unggulan di Beranda", type: "boolean" },
      { name: "harga", label: "Harga / Tiket", type: "text", placeholder: "mis. Rp20.000 / 250 gr" },
      { name: "kontak", label: "Nomor WhatsApp", type: "text", placeholder: "62812xxxxxxx" },
      { name: "alamat", label: "Alamat / Lokasi", type: "text", wide: true },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "gambar", label: "Gambar", type: "image", wide: true },
      { name: "deskripsi", label: "Deskripsi", type: "textarea", wide: true },
    ],
  },
  {
    key: "galeri",
    table: "galeri",
    label: "Galeri",
    singular: "Foto Galeri",
    icon: "camera",
    description: "Foto dokumentasi desa yang dikelompokkan per album.",
    publicPath: "/galeri",
    orderBy: "urutan, id desc",
    columns: [
      { name: "gambar", label: "", type: "image" },
      { name: "judul", label: "Judul" },
      { name: "album", label: "Album" },
      { name: "tanggal", label: "Tanggal", type: "date" },
    ],
    fields: [
      { name: "judul", label: "Judul Foto", type: "text", required: true, wide: true },
      { name: "album", label: "Album", type: "text", required: true, placeholder: "mis. Kegiatan Warga" },
      { name: "tanggal", label: "Tanggal", type: "date" },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "gambar", label: "Foto", type: "image", required: true, wide: true },
      { name: "deskripsi", label: "Keterangan", type: "textarea", wide: true },
    ],
  },
  {
    key: "aparat",
    table: "aparat",
    label: "Aparat Desa",
    singular: "Aparat",
    icon: "users",
    description: "Struktur perangkat desa yang tampil di halaman Profil Desa.",
    publicPath: "/profil",
    orderBy: "urutan, id",
    columns: [
      { name: "foto", label: "", type: "image" },
      { name: "nama", label: "Nama" },
      { name: "jabatan", label: "Jabatan" },
      { name: "urutan", label: "Urutan" },
    ],
    fields: [
      { name: "nama", label: "Nama Lengkap", type: "text", required: true },
      { name: "jabatan", label: "Jabatan", type: "text", required: true },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "foto", label: "Foto", type: "image", wide: true },
    ],
  },
  {
    key: "organisasi",
    table: "organisasi",
    label: "Organisasi & Kegiatan Rutin",
    singular: "Organisasi",
    icon: "users",
    description: "Lembaga kemasyarakatan desa beserta jadwal kegiatan rutinnya.",
    publicPath: "/berita",
    orderBy: "urutan, id",
    columns: [
      { name: "nama", label: "Nama" },
      { name: "ketua", label: "Ketua" },
      { name: "jadwal", label: "Kegiatan Rutin" },
    ],
    fields: [
      { name: "nama", label: "Nama Organisasi", type: "text", required: true, wide: true },
      { name: "ketua", label: "Ketua", type: "text" },
      { name: "anggota", label: "Jumlah Anggota", type: "number" },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "jadwal", label: "Jadwal Kegiatan Rutin", type: "text", wide: true },
      { name: "deskripsi", label: "Deskripsi", type: "textarea", wide: true },
    ],
  },
  {
    key: "lokasi",
    table: "lokasi",
    label: "Titik Peta",
    singular: "Titik Peta",
    icon: "pin",
    description: "Lokasi penting yang tampil di peta interaktif desa.",
    publicPath: "/profil",
    orderBy: "kategori, id",
    columns: [
      { name: "nama", label: "Nama" },
      { name: "kategori", label: "Kategori", type: "select" },
      { name: "lat", label: "Lintang" },
      { name: "lng", label: "Bujur" },
    ],
    fields: [
      { name: "nama", label: "Nama Lokasi", type: "text", required: true, wide: true },
      { name: "kategori", label: "Kategori", type: "select", options: opt(LOKASI_TYPES), required: true },
      { name: "lat", label: "Lintang (latitude)", type: "number", step: "any", required: true, help: "Salin dari Google Maps: klik kanan titik → angka pertama." },
      { name: "lng", label: "Bujur (longitude)", type: "number", step: "any", required: true, help: "Angka kedua dari Google Maps." },
      { name: "deskripsi", label: "Keterangan", type: "textarea", wide: true },
    ],
  },
  {
    key: "pesan",
    table: "pesan",
    label: "Pesan Masuk",
    singular: "Pesan",
    icon: "inbox",
    description: "Pesan dan aspirasi warga dari formulir Kontak.",
    readonly: true,
    orderBy: "created_at desc",
    columns: [
      { name: "nama", label: "Pengirim" },
      { name: "subjek", label: "Subjek" },
      { name: "created_at", label: "Diterima", type: "datetime" },
      { name: "dibaca", label: "Dibaca", type: "boolean" },
    ],
    fields: [
      { name: "nama", label: "Nama", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "telepon", label: "Telepon", type: "text" },
      { name: "subjek", label: "Subjek", type: "text" },
      { name: "pesan", label: "Pesan", type: "textarea", wide: true },
    ],
  },
];

/** Field produk yang boleh diisi penjual sendiri (tanpa pilihan penjual, unggulan, urutan, slug). */
export const PRODUK_PENJUAL_FIELDS: Field[] = [
  { name: "nama", label: "Nama produk", type: "text", required: true, wide: true, placeholder: "mis. Bandeng Presto Duri Lunak" },
  { name: "kategori", label: "Kategori", type: "select", options: opt(PRODUK_KATEGORI), required: true },
  { name: "harga", label: "Harga", type: "rupiah", required: true, help: "Ketik angkanya saja — titik ribuan muncul otomatis." },
  { name: "satuan", label: "Kemasan / satuan", type: "text", placeholder: "mis. 500 gr, isi 10, per ikat" },
  { name: "stok", label: "Stok", type: "number", help: "Kosongkan bila selalu tersedia." },
  { name: "gambar", label: "Foto produk", type: "image", wide: true, help: "Foto dari HP sudah cukup. Gunakan cahaya terang dan latar polos." },
  { name: "deskripsi", label: "Deskripsi", type: "textarea", wide: true, placeholder: "Bahan, ukuran, daya tahan, cara penyimpanan." },
  { name: "tersedia", label: "Tampilkan dan jual di Pasar Desa", type: "boolean", wide: true },
];

/** Field profil toko yang boleh diubah penjual. */
export const PROFIL_TOKO_FIELDS: Field[] = [
  { name: "pemilik", label: "Nama pemilik", type: "text" },
  { name: "alamat", label: "Alamat (RT/RW)", type: "text" },
  { name: "foto", label: "Foto toko atau produk andalan", type: "image", wide: true },
  { name: "deskripsi", label: "Tentang usaha", type: "textarea", wide: true, placeholder: "Sejak kapan berjualan, hari produksi, menerima pesanan hajatan, dll." },
];

export function getResource(key: string): Resource | undefined {
  return RESOURCES.find((r) => r.key === key);
}

export function optionLabel(resource: Resource, field: string, value: unknown): string {
  const f = resource.fields.find((x) => x.name === field);
  return f?.options?.find((o) => o.value === value)?.label ?? String(value ?? "");
}

/** Field pengaturan situs (disimpan sebagai satu dokumen JSON di tabel settings). */
export const SETTINGS_GROUPS: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "Identitas Desa",
    description: "Nama dan wilayah administratif desa.",
    fields: [
      { name: "namaDesa", label: "Nama Desa", type: "text", required: true },
      { name: "kecamatan", label: "Kecamatan", type: "text" },
      { name: "kabupaten", label: "Kabupaten", type: "text" },
      { name: "provinsi", label: "Provinsi", type: "text" },
      { name: "kodePos", label: "Kode Pos", type: "text" },
      { name: "tagline", label: "Slogan / Tagline", type: "text" },
    ],
  },
  {
    title: "Beranda",
    description: "Tampilan utama halaman depan.",
    fields: [
      { name: "heroJudul", label: "Judul Utama", type: "text", wide: true },
      { name: "heroDeskripsi", label: "Deskripsi Singkat", type: "textarea", wide: true },
      { name: "heroGambar", label: "Foto Utama", type: "image", wide: true },
      { name: "heroKeterangan", label: "Keterangan Foto Utama", type: "text", wide: true, placeholder: "mis. Persawahan RW 04 menjelang panen" },
      { name: "angkaKunci", label: "Angka Kunci (tampil di Beranda)", type: "items", wide: true, help: "Contoh: label \"Jumlah Penduduk\", nilai \"7.842 jiwa\"." },
    ],
  },
  {
    title: "Kepala Desa",
    description: "Sambutan kepala desa di Beranda dan Profil.",
    fields: [
      { name: "namaKepalaDesa", label: "Nama Kepala Desa", type: "text" },
      { name: "fotoKepalaDesa", label: "Foto Kepala Desa", type: "image" },
      { name: "sambutan", label: "Kata Sambutan", type: "textarea", wide: true },
    ],
  },
  {
    title: "Profil Desa",
    description: "Sejarah, visi-misi, dan kondisi geografis.",
    fields: [
      { name: "sejarah", label: "Sejarah Desa", type: "markdown", wide: true },
      { name: "visi", label: "Visi", type: "textarea", wide: true },
      { name: "misi", label: "Misi (satu baris untuk satu misi)", type: "list", wide: true },
      { name: "luasWilayah", label: "Luas Wilayah", type: "text" },
      { name: "batasUtara", label: "Batas Utara", type: "text" },
      { name: "batasSelatan", label: "Batas Selatan", type: "text" },
      { name: "batasTimur", label: "Batas Timur", type: "text" },
      { name: "batasBarat", label: "Batas Barat", type: "text" },
    ],
  },
  {
    title: "Layanan Administrasi",
    description: "Daftar layanan kantor desa beserta persyaratannya. Tampil di Beranda dan dipakai asisten Tanya Desa.",
    fields: [
      { name: "layanan", label: "Layanan", type: "items", wide: true, help: "Kolom label: nama layanan. Kolom nilai: persyaratan yang perlu dibawa." },
      { name: "catatanLayanan", label: "Catatan Umum Layanan", type: "textarea", wide: true, placeholder: "mis. Semua layanan tidak dipungut biaya." },
    ],
  },
  {
    title: "Kontak & Lokasi",
    description: "Informasi kontak kantor desa dan titik pusat peta.",
    fields: [
      { name: "alamat", label: "Alamat Kantor Desa", type: "textarea", wide: true },
      { name: "telepon", label: "Telepon", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "whatsapp", label: "WhatsApp (format 62...)", type: "text" },
      { name: "jamLayanan", label: "Jam Layanan", type: "textarea" },
      { name: "lat", label: "Lintang Pusat Peta", type: "number", step: "any" },
      { name: "lng", label: "Bujur Pusat Peta", type: "number", step: "any" },
      { name: "instagram", label: "URL Instagram", type: "text" },
      { name: "facebook", label: "URL Facebook", type: "text" },
      { name: "youtube", label: "URL YouTube", type: "text" },
    ],
  },
  {
    title: "Catatan Data",
    description: "Keterangan sumber data di halaman Informasi Desa.",
    fields: [{ name: "catatanData", label: "Catatan Sumber Data", type: "textarea", wide: true }],
  },
];
