import { pool } from "../server/db.js";
import { users } from "../shared/schema.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const db = drizzle(pool);

async function main() {
  console.log("Connecting to database to create admin user...");
  
  const email = "admin@habbospeed.com";
  const password = "admin";
  const username = "Admin";
  
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    console.log("Admin user already exists!");
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await db.insert(users).values({
    email: email,
    passwordHash: passwordHash,
    displayName: username,
    habboUsername: "HabboSpeed",
    role: "admin",
    approved: true,
    speedPoints: 9999
  });

  console.log(`Admin user created! Email: ${email} / Password: ${password}`);
  process.exit(0);
}

main().catch(err => {
  console.error("Error creating admin user:", err);
  process.exit(1);
});
