-- Migración 004: Mega Actualización HSpeed

-- 1. Tabla song_history
CREATE TABLE IF NOT EXISTS song_history (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  cover_url TEXT,
  played_at TIMESTAMP DEFAULT NOW(),
  played_by_dj TEXT,
  duration_seconds INT,
  requested_by TEXT,
  play_count INT DEFAULT 1
);

-- 2. Tabla vip_memberships
CREATE TABLE IF NOT EXISTS vip_memberships (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,             -- 'silver' | 'gold' | 'diamond'
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  payment_ref TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Tabla vip_perks_log
CREATE TABLE IF NOT EXISTS vip_perks_log (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  perk_used TEXT NOT NULL,
  used_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabla hspeed_rooms
CREATE TABLE IF NOT EXISTS hspeed_rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  room_code TEXT,
  owner_habbo TEXT,
  hotel TEXT DEFAULT 'es',
  category TEXT,                -- 'oficial' | 'vip' | 'evento' | 'musica'
  capacity INT,
  current_visitors INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  thumbnail_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabla notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,          -- 'vip_expiring' | 'request_played' | 'event_reminder' | 'mention'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Modificaciones en la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_tier TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_requests INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_genre TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS badges_earned JSONB DEFAULT '[]'::jsonb;
