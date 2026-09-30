export type KeyValue = { label: string; nilai: string | number };

export type SiteSettings = {
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  tagline: string;
  heroJudul: string;
  heroDeskripsi: string;
  heroGambar: string;
  heroKeterangan: string;
  namaKepalaDesa: string;
  fotoKepalaDesa: string;
  sambutan: string;
  sejarah: string;
  visi: string;
  misi: string[];
  luasWilayah: string;
  batasUtara: string;
  batasSelatan: string;
  batasTimur: string;
  batasBarat: string;
  angkaKunci: KeyValue[];
  alamat: string;
  telepon: string;
  email: string;
  whatsapp: string;
  jamLayanan: string;
  lat: number;
  lng: number;
  instagram: string;
  facebook: string;
  youtube: string;
  catatanData: string;
  layanan: KeyValue[];
  catatanLayanan: string;
};

export type StatItem = { label: string; nilai: number };

export type Statistik = {
  id: number;
  kategori: string;
  judul: string;
  deskripsi: string | null;
  satuan: string;
  tipe_grafik: "bar" | "donut" | "tabel";
  tahun: number | null;
  items: StatItem[];
  urutan: number;
};

export type Aparat = { id: number; nama: string; jabatan: string; foto: string | null; urutan: number };

export type Berita = {
  id: number;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan: string | null;
  konten: string | null;
  gambar: string | null;
  tanggal: Date | string;
  terbit: boolean;
};

export type Galeri = {
  id: number;
  judul: string;
  deskripsi: string | null;
  gambar: string;
  album: string;
  tanggal: Date | string | null;
  urutan: number;
};

export type Potensi = {
  id: number;
  tipe: "wisata" | "budaya" | "umkm";
  nama: string;
  deskripsi: string | null;
  gambar: string | null;
  harga: string | null;
  kontak: string | null;
  alamat: string | null;
  unggulan: boolean;
  urutan: number;
};

export type Organisasi = {
  id: number;
  nama: string;
  ketua: string | null;
  anggota: number | null;
  deskripsi: string | null;
  jadwal: string | null;
  urutan: number;
};

export type Lokasi = {
  id: number;
  nama: string;
  kategori: string;
  deskripsi: string | null;
  lat: number;
  lng: number;
};

export type Pesan = {
  id: number;
  nama: string;
  email: string | null;
  telepon: string | null;
  subjek: string | null;
  pesan: string;
  dibaca: boolean;
  created_at: Date;
};
