import { pool } from "./db";
import { SupabaseStorage } from "./storage";

export const storage = new SupabaseStorage(pool);
