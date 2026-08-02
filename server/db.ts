import pg from "pg";
const { Pool } = pg;

// Natively load .env variables if available (Node 20.12.0+)
try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile();
  }
} catch (e) {
  // Ignored if .env file is not found
}

let pool: any = null;

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL is not set. Database integration will be disabled.");
} else {
  // Conexión a PostgreSQL. Los proveedores gestionados (Neon, Supabase) requieren SSL,
  // pero el Postgres local de docker-compose no lo soporta. Se puede desactivar
  // explícitamente con PGSSL=false (usado en docker-compose.yml para el servicio local).
  const sslDisabled = process.env.PGSSL === "false";
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslDisabled ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on("error", (err: any) => {
    console.error("Unexpected pool error:", err.message);
  });
}

export { pool };
