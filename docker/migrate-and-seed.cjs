const { Pool } = require('pg');
try { require('dotenv').config(); } catch (_) { /* dotenv es opcional */ }

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(50) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Get applied migrations
    const { rows } = await client.query('SELECT version FROM schema_migrations ORDER BY version');
    const applied = new Set(rows.map(r => r.version));

    // Read migration files from server/migrations
    const fs = require('fs');
    const path = require('path');
    const migrationDir = path.join(__dirname, '..', 'server', 'migrations');
    const files = fs.readdirSync(migrationDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Migration ${file} already applied, skipping`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
      console.log(`Applying migration ${file}...`);
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      console.log(`Migration ${file} applied`);
    }
  } finally {
    client.release();
  }
}

async function seedAdmin() {
  const client = await pool.connect();
  try {
    // Check if admin exists
    const { rows } = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@habbospeed.com']
    );
    if (rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    // Insert admin user
    await client.query(
      `INSERT INTO users (email, password_hash, display_name, habbo_username, role, approved, speed_points)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'admin@habbospeed.com',
        passwordHash,
        'Admin',
        'HabboSpeed',
        'admin',
        true,
        9999
      ]
    );
    console.log('Admin user created (admin@habbospeed.com / admin123)');
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await runMigrations();
    await seedAdmin();
    console.log('Startup tasks completed');
    process.exit(0);
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

main();
