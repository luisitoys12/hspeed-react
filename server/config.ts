import { Pool } from "pg";

interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string | undefined;
  jwtSecret: string;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  habboApiBase: string;
  habboAssetsBase: string;
  radioListenUrl: string | undefined;
  discordGuildId: string | undefined;
  maintenanceMode: boolean;
  cacheTtl: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "habbospeed_secret_key_2026",
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
  habboApiBase: process.env.HABBO_API_BASE || "https://www.habbo.es/api",
  habboAssetsBase: process.env.HABBO_ASSETS_BASE || "https://www.habboassets.com/api/v1",
  radioListenUrl: process.env.RADIO_LISTEN_URL,
  discordGuildId: process.env.DISCORD_GUILD_ID,
  maintenanceMode: process.env.MAINTENANCE_MODE !== "false",
  cacheTtl: parseInt(process.env.CACHE_TTL || "300", 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
};

export function getConfig(): AppConfig {
  return config;
}

export function isProduction(): boolean {
  return config.nodeEnv === "production";
}

export function isDevelopment(): boolean {
  return config.nodeEnv === "development";
}

// Database pool with optimized settings
let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (pool) return pool;
  if (!config.databaseUrl) return null;

  const sslDisabled = process.env.PGSSL === "false";
  pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: sslDisabled ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
    query_timeout: 30000,
  });

  pool.on("error", (err) => {
    console.error("Unexpected pool error:", err.message);
  });

  pool.on("connect", () => {
    console.log("[DB] Connection acquired from pool");
  });

  return pool;
}
