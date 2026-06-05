-- Minimal schema for SupabaseStorage / Supabase-like Postgres usage

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  display_name TEXT,
  habbo_username TEXT,
  avatar_url TEXT,
  role TEXT,
  approved BOOLEAN DEFAULT false,
  speed_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  image_hint TEXT,
  category TEXT,
  date DATE,
  reactions JSONB DEFAULT '{}'::jsonb,
  author_id INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT,
  server TEXT,
  date DATE,
  time TEXT,
  room_name TEXT,
  room_owner TEXT,
  host TEXT,
  image_url TEXT,
  image_hint TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedule (
  id SERIAL PRIMARY KEY,
  day TEXT,
  start_time TEXT,
  end_time TEXT,
  show_name TEXT,
  dj_name TEXT
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  article_id INTEGER,
  author_id INTEGER REFERENCES users(id),
  author_name TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  title TEXT,
  options JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config (
  id SERIAL PRIMARY KEY,
  radio_service TEXT,
  api_url TEXT,
  listen_url TEXT,
  home_player_bg_url TEXT,
  slideshow JSONB DEFAULT '[]'::jsonb,
  discord_webhooks JSONB DEFAULT '[]'::jsonb,
  active_theme TEXT,
  maintenance_mode BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS themes (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT,
  description TEXT,
  colors JSONB DEFAULT '{}'::jsonb,
  banner_url TEXT,
  logo_url TEXT,
  decorations JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS forum_categories (
  id SERIAL PRIMARY KEY,
  name TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS forum_threads (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES forum_categories(id),
  title TEXT,
  author_id INTEGER REFERENCES users(id),
  author_name TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES forum_threads(id),
  author_id INTEGER REFERENCES users(id),
  author_name TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_items (
  id SERIAL PRIMARY KEY,
  item_name TEXT,
  class_name TEXT,
  hotel TEXT,
  current_price INTEGER DEFAULT 0,
  avg_price INTEGER DEFAULT 0,
  price_history JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  code TEXT,
  name TEXT,
  description TEXT,
  hotel TEXT,
  category TEXT,
  image_url TEXT,
  discovered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  type TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  display_name TEXT,
  habbo_username TEXT,
  role TEXT,
  motto TEXT,
  joined_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  file_url TEXT,
  category TEXT,
  added_by INTEGER REFERENCES users(id),
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banned_songs (
  id SERIAL PRIMARY KEY,
  title TEXT,
  artist TEXT,
  reason TEXT,
  banned_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  ip TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS panel_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  user_name TEXT,
  action TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reported_messages (
  id SERIAL PRIMARY KEY,
  message_id INTEGER,
  reported_by INTEGER REFERENCES users(id),
  reason TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Simple chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- private messages / inbox
CREATE TABLE IF NOT EXISTS private_messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verified_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  badge_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DJ panel storage
CREATE TABLE IF NOT EXISTS dj_panel (
  id SERIAL PRIMARY KEY,
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- end of migrations
