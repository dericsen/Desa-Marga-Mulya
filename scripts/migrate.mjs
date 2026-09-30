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

const noSsl =
  process.env.DB_SSL === "false" ||
  /sslmode=disable/.test(url) ||
  /localhost|127\.0\.0\.1|\.railway\.internal/.test(url);
const sql = postgres(url, { ssl: noSsl ? false : "require", max: 1, prepare: false, onnotice: () => {} });

const TABLES = ["pesanan", "produk", "penjual", "pesan", "lokasi", "organisasi", "potensi", "galeri", "berita", "aparat", "statistik", "settings", "users"];

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
create table if not exists penjual (
  id serial primary key,
  nama text not null,
  slug text not null unique,
  pemilik text,
  deskripsi text,
  alamat text,
  whatsapp text not null,
  foto text,
  aktif boolean not null default true,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists produk (
  id serial primary key,
  penjual_id integer not null references penjual(id) on delete restrict,
  nama text not null,
  slug text not null unique,
  kategori text not null default 'makanan',
  deskripsi text,
  harga integer not null check (harga >= 0),
  satuan text,
  stok integer check (stok is null or stok >= 0),
  tersedia boolean not null default true,
  gambar text,
  unggulan boolean not null default false,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists pesanan (
  id serial primary key,
  kode text not null unique,
  penjual_id integer references penjual(id) on delete set null,
  penjual_nama text not null,
  nama_pembeli text not null,
  telepon text not null,
  alamat text,
  pengiriman text not null default 'ambil',
  catatan text,
  items jsonb not null,
  total integer not null,
  status text not null default 'baru',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Portal penjual: akun per penjual dan tinjauan produk oleh admin
alter table users add column if not exists role text not null default 'admin';
alter table users add column if not exists penjual_id integer references penjual(id) on delete cascade;
alter table users add column if not exists aktif boolean not null default true;
alter table produk add column if not exists status_tinjau text not null default 'disetujui';
alter table produk add column if not exists catatan_tinjau text;
alter table produk add column if not exists diajukan_at timestamptz;
create index if not exists produk_tinjau_idx on produk (status_tinjau);
create index if not exists produk_penjual_idx on produk (penjual_id);
create index if not exists pesanan_created_idx on pesanan (created_at desc);
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
  } else {
    // Tambahkan kunci pengaturan baru tanpa menimpa isian yang sudah diubah admin.
    await sql`update settings set value = ${sql.json(seed.site)}::jsonb || value where key = 'site'`;
  }

  if (await isEmpty("statistik")) await insertRows("statistik", seed.statistik, ["items"]);
  if (await isEmpty("aparat")) await insertRows("aparat", seed.aparat);
  if (await isEmpty("berita")) await insertRows("berita", seed.berita);
  if (await isEmpty("galeri")) await insertRows("galeri", seed.galeri);
  if (await isEmpty("potensi")) await insertRows("potensi", seed.potensi);
  if (await isEmpty("organisasi")) await insertRows("organisasi", seed.organisasi);
  if (await isEmpty("lokasi")) await insertRows("lokasi", seed.lokasi);

  if (await isEmpty("penjual")) await insertRows("penjual", seed.penjual);
  if (await isEmpty("produk")) {
    const ids = new Map((await sql`select id, slug from penjual`).map((r) => [r.slug, r.id]));
    const rows = seed.produk
      .filter((p) => ids.has(p.penjual))
      .map(({ penjual, ...rest }) => ({ ...rest, penjual_id: ids.get(penjual) }));
    await insertRows("produk", rows);
  }

  // Akun penjual contoh (hanya bila SELLER_DEMO_PASSWORD diatur) — untuk demo dan pengujian.
  if (process.env.SELLER_DEMO_PASSWORD) {
    const [j] = await sql`select id from penjual where slug = 'bandeng-presto-mulya'`;
    const [exists] = await sql`select 1 from users where email = '6281200000001'`;
    if (j && !exists) {
      await sql`insert into users (nama, email, password_hash, role, penjual_id) values ('Ibu Sumiati', '6281200000001', ${hashPassword(process.env.SELLER_DEMO_PASSWORD)}, 'penjual', ${j.id})`;
      console.log("[migrate] Akun penjual contoh dibuat: login 081200000001 (Bandeng Presto Mulya).");
    }
  }

  if ((await sql`select 1 from users where role = 'admin' limit 1`).length === 0) {
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
