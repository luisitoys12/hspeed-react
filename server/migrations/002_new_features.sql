-- New tables for Shop, Notifications, User Profiles

CREATE TABLE IF NOT EXISTS shop_products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'decoracion',
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  preview_url TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  is_limited BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_inventory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  product_id INTEGER REFERENCES shop_products(id) NOT NULL,
  is_equipped BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  icon TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL UNIQUE,
  bio TEXT DEFAULT '',
  background_url TEXT,
  background_color TEXT DEFAULT '#1e293b',
  accent_color TEXT,
  about_me TEXT DEFAULT '',
  social_youtube TEXT,
  social_twitter TEXT,
  social_instagram TEXT,
  custom_css TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Neon theme seed
INSERT INTO themes (slug, name, description, colors, decorations, is_default)
SELECT 'neon', 'Neon Cyber', 'Estilo neón cibernético con colores brillantes y efectos de glow',
  '{
    "primary": "300 100% 60%",
    "primaryForeground": "0 0% 100%",
    "accent": "180 100% 50%",
    "accentForeground": "0 0% 0%",
    "background": "240 20% 8%",
    "card": "240 15% 12%",
    "border": "300 50% 30%",
    "muted": "240 15% 16%",
    "glowColor": "255, 0, 255",
    "gradientFrom": "#ff00ff",
    "gradientTo": "#00ffff",
    "secondary": "180 100% 60%"
  }'::jsonb,
  '{
    "emoji": "💜",
    "pattern": "grid",
    "particleType": "confetti",
    "accentEmojis": ["💜", "💙", "✨", "⚡", "🔮"]
  }'::jsonb,
  false
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE slug = 'neon');

-- Insert some shop products if they don't exist
INSERT INTO shop_products (name, description, category, price, data)
SELECT 'Fondo Galaxia', 'Fondo de perfil con temática galáctica', 'fondo', 500,
  '{"backgroundUrl": "https://images.habbo.com/dcr/hof_furni/57/galaxy_icon.png", "backgroundColor": "#0f0c29"}'
WHERE NOT EXISTS (SELECT 1 FROM shop_products WHERE name = 'Fondo Galaxia');

INSERT INTO shop_products (name, description, category, price, data)
SELECT 'Tema Neon', 'Tema de neón cibernético para el sitio', 'tema', 1000,
  '{"slug": "neon", "description": "Estilo neón cibernético"}'
WHERE NOT EXISTS (SELECT 1 FROM shop_products WHERE name = 'Tema Neon');

INSERT INTO shop_products (name, description, category, price, image_url, data)
SELECT 'Corona Dorada', 'Una corona brillante para tu perfil', 'decoracion', 250,
  'https://images.habbo.com/c_images/album1584/HSC01.gif',
  '{"type": "badge", "code": "HSC01"}'
WHERE NOT EXISTS (SELECT 1 FROM shop_products WHERE name = 'Corona Dorada');

INSERT INTO shop_products (name, description, category, price, image_url, data)
SELECT 'Micrófono de Oro', 'Micrófono exclusivo para DJs', 'objeto', 750,
  'https://images.habbo.com/c_images/album1584/ES992.gif',
  '{"type": "badge", "code": "ES992"}'
WHERE NOT EXISTS (SELECT 1 FROM shop_products WHERE name = 'Micrófono de Oro');

INSERT INTO shop_products (name, description, category, price, data)
SELECT 'Fondo Atardecer', 'Un hermoso fondo de atardecer para tu perfil', 'fondo', 300,
  '{"backgroundUrl": "https://images.habbo.com/dcr/hof_furni/57/sunset_icon.png", "backgroundColor": "#1a0a2e"}'
WHERE NOT EXISTS (SELECT 1 FROM shop_products WHERE name = 'Fondo Atardecer');

INSERT INTO shop_products (name, description, category, price, image_url, data)
SELECT 'Estrella Neón', 'Una estrella de neón decorativa', 'decoracion', 150,
  'https://images.habbo.com/c_images/album1584/FR185.gif',
  '{"type": "badge", "code": "FR185"}'
WHERE NOT EXISTS (SELECT 1 FROM shop_products WHERE name = 'Estrella Neón');

-- Seed DJ panel if not exists
INSERT INTO dj_panel (current_dj, next_dj, dj_message)
SELECT 'HabboSpeed', '', 'Bienvenidos a HabboSpeed Radio - La mejor música para tu aventura en Habbo'
WHERE NOT EXISTS (SELECT 1 FROM dj_panel);
