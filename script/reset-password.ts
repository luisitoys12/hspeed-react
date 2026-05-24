import { pool } from "../server/db.js";
import { users } from "../shared/schema.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const db = drizzle(pool);

async function main() {
  console.log("Connecting to database to reset admin password...");
  const email = "admin@habbospeed.com";
  const password = "admin";
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    await db.update(users).set({ passwordHash }).where(eq(users.email, email));
    console.log(`Password reset for ${email} to '${password}'`);
  } else {
    await db.insert(users).values({
      email: email,
      passwordHash: passwordHash,
      displayName: "Admin",
      habboUsername: "HabboSpeed",
      role: "admin",
      approved: true,
      speedPoints: 9999
    });
    console.log(`User created for ${email} with password '${password}'`);
  }
  process.exit(0);
}

main().catch(console.error);
