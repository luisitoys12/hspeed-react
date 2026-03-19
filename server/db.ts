import pg from "pg";
const { Pool } = pg;

// Supabase PostgreSQL connection via Supavisor pooler (IPv4 compatible)
const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST || "aws-0-us-west-2.pooler.supabase.com",
  port: parseInt(process.env.SUPABASE_DB_PORT || "6543"),
  database: process.env.SUPABASE_DB_NAME || "postgres",
  user: process.env.SUPABASE_DB_USER || "postgres.vrfkhluzsqqlhvtvgyos",
  password: process.env.SUPABASE_DB_PASSWORD || "/Kv+JBz.88Rfi-A",
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err.message);
});

export { pool };
