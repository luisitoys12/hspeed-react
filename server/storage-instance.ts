import { pool } from "./db";
import { SupabaseStorage } from "./storage";
import { MemStorage } from "./mem-storage";

export let storage: any;

if (process.env.DATABASE_URL) {
  console.log("Connecting to Supabase PostgreSQL database...");
  storage = new SupabaseStorage(pool);
} else {
  console.log("DATABASE_URL not found. Starting in MemStorage mode!");
  storage = new MemStorage();
}
