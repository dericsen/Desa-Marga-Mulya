// Migrasi skema + pengisian data awal (seed) untuk database PostgreSQL.
// Dijalankan otomatis sebelum `next build` (lihat package.json) dan aman dijalankan berulang kali:
// tabel hanya dibuat bila belum ada, dan data awal hanya diisi bila tabel masih kosong.
import postgres from "postgres";
import { randomBytes, scryptSync } from "node:crypto";
import * as seed from "./seed-data.mjs";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.warn("[migrate] DATABASE_URL tidak ditemukan — migrasi dilewati.");
  process.exit(0);
}

const isLocal = /localhost|127\.0\.0\.1/.test(url);
const sql = postgres(url, { ssl: isLocal ? false : "require", max: 1, prepare: false, onnotice: () => {} });

const TABLES = ["pesan", "lokasi", "organisasi", "potensi", "galeri", "berita", "aparat", "statistik", "settings", "users"];

const SCHEMA = `
create table if not exists users (
  id serial primary key,
  nama text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists statistik (
  id serial primary key,
  kategori text not null,
  judul text not null,
  deskripsi text,
  satuan text not null default '',
  tipe_grafik text not null default 'bar',
  tahun integer,
  items jsonb not null default '[]'::jsonb,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists aparat (
  id serial primary key,
  nama text not null,
  jabatan text not null,
  foto text,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists berita (
  id serial primary key,
  judul text not null,
  slug text not null unique,
  kategori text not null default 'berita',
  ringkasan text,
  konten text,
  gambar text,
  tanggal date not null default current_date,
  terbit boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists galeri (
  id serial primary key,
  judul text not null,
  deskripsi text,
  gambar text not null,
  album text not null default 'Umum',
  tanggal date,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists potensi (
  id serial primary key,
  tipe text not null default 'umkm',
  nama text not null,
  deskripsi text,
  gambar text,
  harga text,
  kontak text,
  alamat text,
  unggulan boolean not null default false,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists organisasi (
  id serial primary key,
  nama text not null,
  ketua text,
  anggota integer,
  deskripsi text,
  jadwal text,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists lokasi (
  id serial primary key,
  nama text not null,
  kategori text not null default 'umum',
  deskripsi text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists pesan (
  id serial primary key,
  nama text not null,
  email text,
  telepon text,
  subjek text,
  pesan text not null,
  dibaca boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists statistik_kategori_idx on statistik (kategori, urutan);
create index if not exists berita_tanggal_idx on berita (tanggal desc);
`;

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function isEmpty(table) {
  const [{ count }] = await sql`select count(*)::int as count from ${sql(table)}`;
  return count === 0;
}

async function insertRows(table, rows, jsonColumns = []) {
  for (const row of rows) {
    const data = { ...row };
    for (const col of jsonColumns) if (col in data) data[col] = sql.json(data[col]);
    await sql`insert into ${sql(table)} ${sql(data)}`;
  }
  console.log(`[migrate] ${table}: ${rows.length} baris data awal ditambahkan.`);
}

async function main() {
  if (process.argv.includes("--reset")) {
    for (const t of TABLES) await sql`drop table if exists ${sql(t)} cascade`;
    console.log("[migrate] Semua tabel dihapus (reset).");
  }

  await sql.unsafe(SCHEMA);
  console.log("[migrate] Skema siap.");

  const [{ count: siteCount }] = await sql`select count(*)::int as count from settings where key = 'site'`;
  if (siteCount === 0) {
    await sql`insert into settings (key, value) values ('site', ${sql.json(seed.site)})`;
    console.log("[migrate] settings: pengaturan situs ditambahkan.");
  }

  if (await isEmpty("statistik")) await insertRows("statistik", seed.statistik, ["items"]);
  if (await isEmpty("aparat")) await insertRows("aparat", seed.aparat);
  if (await isEmpty("berita")) await insertRows("berita", seed.berita);
  if (await isEmpty("galeri")) await insertRows("galeri", seed.galeri);
  if (await isEmpty("potensi")) await insertRows("potensi", seed.potensi);
  if (await isEmpty("organisasi")) await insertRows("organisasi", seed.organisasi);
  if (await isEmpty("lokasi")) await insertRows("lokasi", seed.lokasi);

  if (await isEmpty("users")) {
    const email = (process.env.ADMIN_EMAIL || "admin@margamulya.desa.id").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "MargaMulya2026!";
    await sql`insert into users (nama, email, password_hash) values ('Administrator Desa', ${email}, ${hashPassword(password)})`;
    console.log(`[migrate] Admin awal dibuat: ${email}${process.env.ADMIN_PASSWORD ? "" : " (password bawaan — segera ganti!)"}`);
  }
}

main()
  .then(() => sql.end())
  .catch(async (err) => {
    console.error("[migrate] Gagal:", err);
    await sql.end({ timeout: 1 });
    process.exit(1);
  });
