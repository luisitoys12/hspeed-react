import { pool } from "./db";
import { SupabaseStorage } from "./storage";
import { MemStorage } from "./mem-storage";

export let storage: any;

if (process.env.DATABASE_URL && process.env.USE_MEMSTORAGE !== "true") {
  console.log("Connecting to Supabase PostgreSQL database...");
  storage = new SupabaseStorage(pool);
} else {
  console.log("Starting in MemStorage mode!");
  storage = new MemStorage();
}
