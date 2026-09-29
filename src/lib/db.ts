import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __sql: postgres.Sql | undefined;
}

function createClient(): postgres.Sql {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("DATABASE_URL belum diatur. Tambahkan koneksi database PostgreSQL pada environment variable.");
  }
  // SSL dimatikan untuk database lokal, jaringan privat Railway (*.railway.internal),
  // atau bila diminta lewat DB_SSL=false / sslmode=disable.
  const noSsl =
    process.env.DB_SSL === "false" ||
    /sslmode=disable/.test(url) ||
    /localhost|127\.0\.0\.1|\.railway\.internal/.test(url);
  return postgres(url, {
    ssl: noSsl ? false : "require",
    max: 3,
    prepare: false,
    idle_timeout: 20,
    onnotice: () => {},
  });
}

/** Klien PostgreSQL tunggal (dipakai ulang antar-permintaan). */
export function db(): postgres.Sql {
  if (!globalThis.__sql) globalThis.__sql = createClient();
  return globalThis.__sql;
}
