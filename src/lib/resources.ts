// Konfigurasi koleksi konten CMS. Setiap koleksi dipetakan ke satu tabel database,
// sehingga halaman admin (daftar, tambah, ubah, hapus) dibuat secara generik dari konfigurasi ini.
import { BERITA_TYPES, LOKASI_TYPES, POTENSI_TYPES, STAT_CATEGORIES, type IconName } from "./categories";

export type FieldType =
  | "text" | "textarea" | "markdown" | "number" | "select" | "image" | "date" | "boolean" | "items" | "list" | "email";

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
};

export type Resource = {
  key: string;
  table: string;
  label: string;
  singular: string;
  icon: IconName;
  description: string;
  fields: Field[];
  columns: { name: string; label: string; type?: "date" | "boolean" | "image" | "select" | "datetime" }[];
  orderBy: string;
  /** Koleksi hanya-baca dari admin (mis. pesan masuk dari formulir kontak). */
  readonly?: boolean;
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
    description: "Wisata, budaya & kesenian, serta UMKM dan produk lokal.",
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
      { name: "heroGambar", label: "Gambar Latar", type: "image", wide: true },
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
