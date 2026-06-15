-- Migración 003: Campos de Mundial y Persistencia en Usuario

ALTER TABLE users ADD COLUMN IF NOT EXISTS mundial_stamps JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mundial_logros JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mundial_clan TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mundial_predictions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mundial_tickets INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mundial_penalties JSONB DEFAULT '{"maxScore":0,"totalGames":0}'::jsonb;
