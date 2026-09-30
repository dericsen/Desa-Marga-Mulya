export type IconName =
  | "map" | "landmark" | "users" | "school" | "heart" | "sprout" | "store" | "road"
  | "camera" | "phone" | "mail" | "clock" | "pin" | "search" | "chat" | "home" | "news"
  | "star" | "wave" | "palette" | "chart" | "user" | "logout" | "settings" | "image"
  | "plus" | "edit" | "trash" | "inbox" | "menu" | "close" | "send" | "download" | "arrow" | "whatsapp" | "sparkles";

export const STAT_CATEGORIES: { key: string; label: string; icon: IconName; description: string }[] = [
  { key: "geografi", label: "Geografis", icon: "map", description: "Luas dan penggunaan lahan desa" },
  { key: "pemerintahan", label: "Pemerintahan", icon: "landmark", description: "Aparat, wilayah administratif, keamanan, dan fasilitas" },
  { key: "kependudukan", label: "Kependudukan", icon: "users", description: "Penduduk, angkatan kerja, dan mata pencaharian" },
  { key: "pendidikan", label: "Pendidikan", icon: "school", description: "Sekolah, murid, guru, dan pendidikan non-formal" },
  { key: "kesehatan", label: "Kesehatan", icon: "heart", description: "Fasilitas, tenaga kesehatan, gizi, dan sanitasi" },
  { key: "pertanian", label: "Pertanian & Peternakan", icon: "sprout", description: "Sawah, produksi panen, kelompok tani, dan ternak" },
  { key: "ekonomi", label: "Ekonomi", icon: "store", description: "Industri, lembaga keuangan, perdagangan, PBB, dan listrik" },
  { key: "infrastruktur", label: "Infrastruktur", icon: "road", description: "Panjang, jenis, dan kondisi jalan" },
];

export const categoryLabel = (key: string) => STAT_CATEGORIES.find((c) => c.key === key)?.label ?? key;

export const POTENSI_TYPES = [
  { key: "wisata", label: "Wisata", icon: "wave" as IconName },
  { key: "budaya", label: "Budaya & Kesenian", icon: "palette" as IconName },
  { key: "umkm", label: "UMKM & Produk Lokal", icon: "store" as IconName },
];

export const BERITA_TYPES = [
  { key: "berita", label: "Berita" },
  { key: "kegiatan", label: "Kegiatan" },
  { key: "pengumuman", label: "Pengumuman" },
];

export const LOKASI_TYPES = [
  { key: "pemerintahan", label: "Pemerintahan", color: "#152d23" },
  { key: "kesehatan", label: "Kesehatan", color: "#b23b2e" },
  { key: "pendidikan", label: "Pendidikan", color: "#3b5f8a" },
  { key: "wisata", label: "Wisata", color: "#3b7055" },
  { key: "umkm", label: "UMKM", color: "#b27a22" },
  { key: "umum", label: "Fasilitas umum", color: "#6f746f" },
];
