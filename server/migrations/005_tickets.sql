-- Migración 005: Sistema de Tickets de Soporte

CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW()
);
