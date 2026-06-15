import express from "express";
import serverless from "serverless-http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";

const { Pool } = pg;

const JWT_SECRET = process.env.JWT_SECRET || "habbospeed_secret_key_2026";

// ============ Supabase PostgreSQL Pool ============
const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST || "aws-0-us-west-2.pooler.supabase.com",
  port: parseInt(process.env.SUPABASE_DB_PORT || "6543"),
  database: process.env.SUPABASE_DB_NAME || "postgres",
  user: process.env.SUPABASE_DB_USER || "postgres.vrfkhluzsqqlhvtvgyos",
  password: process.env.SUPABASE_DB_PASSWORD || "/Kv+JBz.88Rfi-A",
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// ============ Row Mappers ============
function mapUser(r: any) {
  return { 
    id: r.id, 
    email: r.email, 
    passwordHash: r.password_hash, 
    displayName: r.display_name, 
    habboUsername: r.habbo_username, 
    avatarUrl: r.avatar_url, 
    role: r.role, 
    approved: r.approved, 
    speedPoints: r.speed_points, 
    createdAt: r.created_at,
    mundialStamps: r.mundial_stamps || [],
    mundialLogros: r.mundial_logros || [],
    mundialClan: r.mundial_clan || null,
    mundialPredictions: r.mundial_predictions || {},
    mundialTickets: r.mundial_tickets || 0,
    mundialPenalties: r.mundial_penalties || { maxScore: 0, totalGames: 0 }
  };
}
function mapNews(r: any) {
  return { id: r.id, title: r.title, summary: r.summary, content: r.content, imageUrl: r.image_url, imageHint: r.image_hint, category: r.category, date: r.date, reactions: r.reactions, authorId: r.author_id, createdAt: r.created_at };
}
function mapEvent(r: any) {
  return { id: r.id, title: r.title, server: r.server, date: r.date, time: r.time, roomName: r.room_name, roomOwner: r.room_owner, host: r.host, imageUrl: r.image_url, imageHint: r.image_hint, createdAt: r.created_at };
}
function mapSchedule(r: any) {
  return { id: r.id, day: r.day, startTime: r.start_time, endTime: r.end_time, showName: r.show_name, djName: r.dj_name };
}
function mapComment(r: any) {
  return { id: r.id, articleId: r.article_id, authorId: r.author_id, authorName: r.author_name, content: r.content, createdAt: r.created_at };
}
function mapPoll(r: any) {
  return { id: r.id, title: r.title, options: r.options, isActive: r.is_active, createdAt: r.created_at };
}
function mapConfig(r: any) {
  return { id: r.id, radioService: r.radio_service, apiUrl: r.api_url, listenUrl: r.listen_url, homePlayerBgUrl: r.home_player_bg_url, slideshow: r.slideshow, discordWebhooks: r.discord_webhooks, activeTheme: r.active_theme };
}
function mapTheme(r: any) {
  return { id: r.id, slug: r.slug, name: r.name, description: r.description, colors: r.colors, bannerUrl: r.banner_url, logoUrl: r.logo_url, decorations: r.decorations, isDefault: r.is_default };
}
function mapForumCategory(r: any) {
  return { id: r.id, name: r.name, description: r.description, sortOrder: r.sort_order };
}
function mapForumThread(r: any) {
  return { id: r.id, categoryId: r.category_id, title: r.title, authorId: r.author_id, authorName: r.author_name, isPinned: r.is_pinned, isLocked: r.is_locked, views: r.views, createdAt: r.created_at };
}
function mapForumPost(r: any) {
  return { id: r.id, threadId: r.thread_id, authorId: r.author_id, authorName: r.author_name, content: r.content, createdAt: r.created_at };
}
function mapTeamMember(r: any) {
  return { id: r.id, displayName: r.display_name, habboUsername: r.habbo_username, role: r.role, motto: r.motto, joinedAt: r.joined_at };
}
function mapRequest(r: any) {
  return { id: r.id, type: r.type, details: r.details, userName: r.user_name, createdAt: r.created_at };
}

// ============ Express App ============
const app = express();
app.use(express.json());

function generateToken(id: number) { return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" }); }

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No autorizado" });
  try { const d = jwt.verify(token, JWT_SECRET) as any; req.userId = d.id; next(); }
  catch { return res.status(401).json({ message: "Token inválido" }); }
}

async function adminMiddleware(req: any, res: any, next: any) {
  authMiddleware(req, res, async () => {
    try {
      const r = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
      const u = r.rows[0];
      if (!u || u.role !== "admin") return res.status(403).json({ message: "Acceso denegado" });
      req.user = mapUser(u);
      next();
    } catch { return res.status(500).json({ message: "Error del servidor" }); }
  });
}

// ============ AUTH ============
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, displayName, habboUsername } = req.body;
    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: "Email ya registrado" });
    const passwordHash = await bcrypt.hash(password, 10);
    const r = await query(
      `INSERT INTO users (email, password_hash, display_name, habbo_username, avatar_url, role, approved, speed_points)
       VALUES ($1, $2, $3, $4, $5, 'pending', false, 0) RETURNING *`,
      [email, passwordHash, displayName, habboUsername || null, habboUsername ? `https://www.habbo.es/habbo-imaging/avatarimage?user=${habboUsername}&size=b` : null]
    );
    const user = mapUser(r.rows[0]);
    res.status(201).json({ ...user, passwordHash: undefined, token: generateToken(user.id) });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const r = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (r.rows.length === 0) return res.status(401).json({ message: "Credenciales inválidas" });
    const user = r.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Credenciales inválidas" });
    const mapped = mapUser(user);
    res.json({ ...mapped, passwordHash: undefined, token: generateToken(mapped.id) });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get("/api/auth/me", authMiddleware, async (req: any, res) => {
  const r = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
  if (r.rows.length === 0) return res.status(404).json({});
  const user = mapUser(r.rows[0]);
  res.json({ ...user, passwordHash: undefined });
});

// ============ NEWS ============
app.get("/api/news", async (_req, res) => {
  const r = await query("SELECT * FROM news ORDER BY created_at DESC");
  res.json(r.rows.map(mapNews));
});
app.get("/api/news/:id", async (req, res) => {
  const r = await query("SELECT * FROM news WHERE id = $1", [parseInt(req.params.id)]);
  if (r.rows.length === 0) return res.status(404).json({});
  res.json(mapNews(r.rows[0]));
});
app.post("/api/news", adminMiddleware, async (req: any, res) => {
  const { title, summary, content, imageUrl, imageHint, category, date } = req.body;
  const r = await query(
    `INSERT INTO news (title, summary, content, image_url, image_hint, category, date, reactions, author_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, '{}', $8) RETURNING *`,
    [title, summary, content, imageUrl, imageHint || "", category, date, req.user.id]
  );
  res.status(201).json(mapNews(r.rows[0]));
});
app.put("/api/news/:id", adminMiddleware, async (req, res) => {
  const { title, summary, content, imageUrl, imageHint, category, date } = req.body;
  const r = await query(
    `UPDATE news SET title=COALESCE($1,title), summary=COALESCE($2,summary), content=COALESCE($3,content),
     image_url=COALESCE($4,image_url), category=COALESCE($5,category), date=COALESCE($6,date) WHERE id=$7 RETURNING *`,
    [title, summary, content, imageUrl, category, date, parseInt(req.params.id)]
  );
  if (r.rows.length === 0) return res.status(404).json({});
  res.json(mapNews(r.rows[0]));
});
app.delete("/api/news/:id", adminMiddleware, async (req, res) => {
  await query("DELETE FROM news WHERE id = $1", [parseInt(req.params.id)]);
  res.json({ message: "Eliminada" });
});

// ============ EVENTS ============
app.get("/api/events", async (_req, res) => {
  const r = await query("SELECT * FROM events ORDER BY date DESC");
  res.json(r.rows.map(mapEvent));
});
app.get("/api/events/:id", async (req, res) => {
  const r = await query("SELECT * FROM events WHERE id = $1", [parseInt(req.params.id)]);
  if (r.rows.length === 0) return res.status(404).json({});
  res.json(mapEvent(r.rows[0]));
});
app.post("/api/events", adminMiddleware, async (req, res) => {
  const { title, server, date, time, roomName, roomOwner, host, imageUrl, imageHint } = req.body;
  const r = await query(
    `INSERT INTO events (title, server, date, time, room_name, room_owner, host, image_url, image_hint)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [title, server, date, time, roomName, roomOwner, host, imageUrl, imageHint || ""]
  );
  res.status(201).json(mapEvent(r.rows[0]));
});
app.delete("/api/events/:id", adminMiddleware, async (req, res) => {
  await query("DELETE FROM events WHERE id = $1", [parseInt(req.params.id)]);
  res.json({ message: "Eliminado" });
});

// ============ SCHEDULE ============
app.get("/api/schedule", async (_req, res) => {
  const r = await query("SELECT * FROM schedule ORDER BY id");
  res.json(r.rows.map(mapSchedule));
});
app.post("/api/schedule", adminMiddleware, async (req, res) => {
  const { day, startTime, endTime, showName, djName } = req.body;
  const r = await query("INSERT INTO schedule (day, start_time, end_time, show_name, dj_name) VALUES ($1,$2,$3,$4,$5) RETURNING *", [day, startTime, endTime, showName, djName]);
  res.status(201).json(mapSchedule(r.rows[0]));
});
app.delete("/api/schedule/:id", adminMiddleware, async (req, res) => {
  await query("DELETE FROM schedule WHERE id = $1", [parseInt(req.params.id)]);
  res.json({ message: "Eliminado" });
});

// ============ COMMENTS ============
app.get("/api/comments/article/:articleId", async (req, res) => {
  const r = await query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at ASC", [parseInt(req.params.articleId)]);
  res.json(r.rows.map(mapComment));
});
app.post("/api/comments", authMiddleware, async (req: any, res) => {
  const ur = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
  if (ur.rows.length === 0) return res.status(401).json({});
  const user = ur.rows[0];
  const r = await query("INSERT INTO comments (article_id, author_id, author_name, content) VALUES ($1,$2,$3,$4) RETURNING *",
    [req.body.articleId, user.id, user.display_name, req.body.content]);
  res.status(201).json(mapComment(r.rows[0]));
});
app.delete("/api/comments/:id", adminMiddleware, async (req, res) => {
  await query("DELETE FROM comments WHERE id = $1", [parseInt(req.params.id)]);
  res.json({ message: "Eliminado" });
});

// ============ POLLS ============
app.get("/api/polls", async (_req, res) => {
  const r = await query("SELECT * FROM polls ORDER BY created_at DESC");
  res.json(r.rows.map(mapPoll));
});
app.post("/api/polls", adminMiddleware, async (req, res) => {
  const r = await query("INSERT INTO polls (title, options, is_active) VALUES ($1,$2,$3) RETURNING *",
    [req.body.title, JSON.stringify(req.body.options || []), req.body.isActive ?? true]);
  res.status(201).json(mapPoll(r.rows[0]));
});
app.put("/api/polls/:id", adminMiddleware, async (req, res) => {
  const fields: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (req.body.title) { fields.push(`title=$${i++}`); vals.push(req.body.title); }
  if (req.body.options) { fields.push(`options=$${i++}`); vals.push(JSON.stringify(req.body.options)); }
  if (req.body.isActive !== undefined) { fields.push(`is_active=$${i++}`); vals.push(req.body.isActive); }
  if (fields.length === 0) return res.status(400).json({});
  vals.push(parseInt(req.params.id));
  const r = await query(`UPDATE polls SET ${fields.join(",")} WHERE id=$${i} RETURNING *`, vals);
  if (r.rows.length === 0) return res.status(404).json({});
  res.json(mapPoll(r.rows[0]));
});

// ============ CONFIG ============
app.get("/api/config", async (_req, res) => {
  const r = await query("SELECT * FROM config ORDER BY id LIMIT 1");
  res.json(r.rows[0] ? mapConfig(r.rows[0]) : null);
});
app.put("/api/config", adminMiddleware, async (req, res) => {
  const fields: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (req.body.radioService) { fields.push(`radio_service=$${i++}`); vals.push(req.body.radioService); }
  if (req.body.apiUrl) { fields.push(`api_url=$${i++}`); vals.push(req.body.apiUrl); }
  if (req.body.listenUrl) { fields.push(`listen_url=$${i++}`); vals.push(req.body.listenUrl); }
  if (req.body.homePlayerBgUrl !== undefined) { fields.push(`home_player_bg_url=$${i++}`); vals.push(req.body.homePlayerBgUrl); }
  if (req.body.slideshow) { fields.push(`slideshow=$${i++}`); vals.push(JSON.stringify(req.body.slideshow)); }
  if (req.body.activeTheme) { fields.push(`active_theme=$${i++}`); vals.push(req.body.activeTheme); }
  if (fields.length === 0) { const r2 = await query("SELECT * FROM config ORDER BY id LIMIT 1"); return res.json(r2.rows[0] ? mapConfig(r2.rows[0]) : null); }
  const r = await query(`UPDATE config SET ${fields.join(",")} WHERE id=(SELECT id FROM config ORDER BY id LIMIT 1) RETURNING *`, vals);
  res.json(r.rows[0] ? mapConfig(r.rows[0]) : null);
});

// ============ TEAM ============
app.get("/api/team", async (_req, res) => {
  const r = await query("SELECT * FROM team_members ORDER BY id");
  res.json(r.rows.map(mapTeamMember));
});
app.post("/api/team", adminMiddleware, async (req, res) => {
  const { displayName, habboUsername, role, motto } = req.body;
  const r = await query("INSERT INTO team_members (display_name, habbo_username, role, motto) VALUES ($1,$2,$3,$4) RETURNING *", [displayName, habboUsername, role, motto]);
  res.status(201).json(mapTeamMember(r.rows[0]));
});
app.put("/api/team/:id", adminMiddleware, async (req, res) => {
  const { displayName, habboUsername, role, motto } = req.body;
  const r = await query("UPDATE team_members SET display_name=COALESCE($1,display_name), habbo_username=COALESCE($2,habbo_username), role=COALESCE($3,role), motto=COALESCE($4,motto) WHERE id=$5 RETURNING *",
    [displayName, habboUsername, role, motto, parseInt(req.params.id)]);
  if (r.rows.length === 0) return res.status(404).json({});
  res.json(mapTeamMember(r.rows[0]));
});
app.delete("/api/team/:id", adminMiddleware, async (req, res) => {
  await query("DELETE FROM team_members WHERE id = $1", [parseInt(req.params.id)]);
  res.json({ message: "Eliminado" });
});

// ============ FORUM ============
app.get("/api/forum/categories", async (_req, res) => {
  const r = await query("SELECT * FROM forum_categories ORDER BY sort_order ASC");
  res.json(r.rows.map(mapForumCategory));
});
app.post("/api/forum/categories", adminMiddleware, async (req, res) => {
  const r = await query("INSERT INTO forum_categories (name, description, sort_order) VALUES ($1,$2,$3) RETURNING *", [req.body.name, req.body.description, req.body.sortOrder || 0]);
  res.status(201).json(mapForumCategory(r.rows[0]));
});
app.get("/api/forum/categories/:id/threads", async (req, res) => {
  const r = await query("SELECT * FROM forum_threads WHERE category_id = $1 ORDER BY is_pinned DESC, created_at DESC", [parseInt(req.params.id)]);
  res.json(r.rows.map(mapForumThread));
});
app.get("/api/forum/threads/:id", async (req, res) => {
  const r = await query("SELECT * FROM forum_threads WHERE id = $1", [parseInt(req.params.id)]);
  if (r.rows.length === 0) return res.status(404).json({});
  await query("UPDATE forum_threads SET views = views + 1 WHERE id = $1", [parseInt(req.params.id)]);
  res.json(mapForumThread(r.rows[0]));
});
app.post("/api/forum/threads", authMiddleware, async (req: any, res) => {
  const ur = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
  if (ur.rows.length === 0) return res.status(401).json({});
  const user = ur.rows[0];
  const r = await query(
    "INSERT INTO forum_threads (category_id, title, author_id, author_name, is_pinned, is_locked, views) VALUES ($1,$2,$3,$4,false,false,0) RETURNING *",
    [req.body.categoryId, req.body.title, user.id, user.display_name]
  );
  const thread = mapForumThread(r.rows[0]);
  if (req.body.content) {
    await query("INSERT INTO forum_posts (thread_id, author_id, author_name, content) VALUES ($1,$2,$3,$4)",
      [thread.id, user.id, user.display_name, req.body.content]);
  }
  res.status(201).json(thread);
});
app.get("/api/forum/threads/:id/posts", async (req, res) => {
  const r = await query("SELECT * FROM forum_posts WHERE thread_id = $1 ORDER BY created_at ASC", [parseInt(req.params.id)]);
  res.json(r.rows.map(mapForumPost));
});
app.post("/api/forum/posts", authMiddleware, async (req: any, res) => {
  const ur = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
  if (ur.rows.length === 0) return res.status(401).json({});
  const user = ur.rows[0];
  const r = await query("INSERT INTO forum_posts (thread_id, author_id, author_name, content) VALUES ($1,$2,$3,$4) RETURNING *",
    [req.body.threadId, user.id, user.display_name, req.body.content]);
  res.status(201).json(mapForumPost(r.rows[0]));
});

// ============ MARKETPLACE ============
app.get("/api/marketplace", async (_req, res) => {
  const r = await query("SELECT * FROM marketplace_items ORDER BY last_updated DESC");
  res.json(r.rows.map((r: any) => ({ id: r.id, itemName: r.item_name, className: r.class_name, hotel: r.hotel, currentPrice: r.current_price, avgPrice: r.avg_price, priceHistory: r.price_history, imageUrl: r.image_url, lastUpdated: r.last_updated })));
});

// ============ BADGES ============
app.get("/api/badges", async (req, res) => {
  const q = req.query.q as string;
  if (q) {
    const r = await query("SELECT * FROM badge_collection WHERE LOWER(name) LIKE $1 OR LOWER(code) LIKE $1", [`%${q.toLowerCase()}%`]);
    res.json(r.rows.map((r: any) => ({ id: r.id, code: r.code, name: r.name, description: r.description, hotel: r.hotel, category: r.category, imageUrl: r.image_url, discoveredAt: r.discovered_at })));
  } else {
    const r = await query("SELECT * FROM badge_collection ORDER BY discovered_at DESC");
    res.json(r.rows.map((r: any) => ({ id: r.id, code: r.code, name: r.name, description: r.description, hotel: r.hotel, category: r.category, imageUrl: r.image_url, discoveredAt: r.discovered_at })));
  }
});

// ============ REQUESTS ============
app.get("/api/requests", async (_req, res) => {
  const r = await query("SELECT * FROM requests ORDER BY created_at DESC");
  res.json(r.rows.map(mapRequest));
});
app.post("/api/requests", async (req, res) => {
  const r = await query("INSERT INTO requests (type, details, user_name) VALUES ($1,$2,$3) RETURNING *", [req.body.type, req.body.details, req.body.userName]);
  res.status(201).json(mapRequest(r.rows[0]));
});
app.delete("/api/requests/:id", adminMiddleware, async (req, res) => {
  await query("DELETE FROM requests WHERE id = $1", [parseInt(req.params.id)]);
  res.json({ message: "Eliminado" });
});

// ============ THEMES ============
app.get("/api/themes", async (_req, res) => {
  const r = await query("SELECT * FROM themes ORDER BY id");
  res.json(r.rows.map(mapTheme));
});
app.get("/api/themes/active", async (_req, res) => {
  const cfg = await query("SELECT active_theme FROM config ORDER BY id LIMIT 1");
  const slug = cfg.rows[0]?.active_theme || "circo";
  const r = await query("SELECT * FROM themes WHERE slug = $1", [slug]);
  if (r.rows.length === 0) return res.status(404).json({});
  res.json(mapTheme(r.rows[0]));
});
app.get("/api/themes/:slug", async (req, res) => {
  const r = await query("SELECT * FROM themes WHERE slug = $1", [req.params.slug]);
  if (r.rows.length === 0) return res.status(404).json({});
  res.json(mapTheme(r.rows[0]));
});
app.put("/api/themes/active", adminMiddleware, async (req, res) => {
  const { slug } = req.body;
  const theme = await query("SELECT * FROM themes WHERE slug = $1", [slug]);
  if (theme.rows.length === 0) return res.status(404).json({});
  const r = await query("UPDATE config SET active_theme = $1 WHERE id = (SELECT id FROM config ORDER BY id LIMIT 1) RETURNING *", [slug]);
  res.json(r.rows[0] ? mapConfig(r.rows[0]) : null);
});
app.put("/api/themes/:id", adminMiddleware, async (req, res) => {
  const fields: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (req.body.name) { fields.push(`name=$${i++}`); vals.push(req.body.name); }
  if (req.body.description !== undefined) { fields.push(`description=$${i++}`); vals.push(req.body.description); }
  if (req.body.colors) { fields.push(`colors=$${i++}`); vals.push(JSON.stringify(req.body.colors)); }
  if (req.body.decorations) { fields.push(`decorations=$${i++}`); vals.push(JSON.stringify(req.body.decorations)); }
  if (fields.length === 0) return res.status(400).json({});
  vals.push(parseInt(req.params.id));
  const r = await query(`UPDATE themes SET ${fields.join(",")} WHERE id=$${i} RETURNING *`, vals);
  if (r.rows.length === 0) return res.status(404).json({});
  res.json(mapTheme(r.rows[0]));
});
app.post("/api/themes", adminMiddleware, async (req, res) => {
  const r = await query(
    "INSERT INTO themes (slug, name, description, colors, banner_url, logo_url, decorations, is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
    [req.body.slug, req.body.name, req.body.description, JSON.stringify(req.body.colors || {}), null, null, JSON.stringify(req.body.decorations || {}), false]
  );
  res.status(201).json(mapTheme(r.rows[0]));
});

// ============ USERS (Admin) ============
app.get("/api/users", adminMiddleware, async (_req, res) => {
  const r = await query("SELECT * FROM users ORDER BY id");
  res.json(r.rows.map(mapUser).map(u => ({ ...u, passwordHash: undefined })));
});
app.put("/api/users/:id", adminMiddleware, async (req, res) => {
  const fields: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (req.body.role) { fields.push(`role=$${i++}`); vals.push(req.body.role); }
  if (req.body.approved !== undefined) { fields.push(`approved=$${i++}`); vals.push(req.body.approved); }
  if (req.body.speedPoints !== undefined) { fields.push(`speed_points=$${i++}`); vals.push(req.body.speedPoints); }
  if (fields.length === 0) return res.status(400).json({});
  vals.push(parseInt(req.params.id));
  const r = await query(`UPDATE users SET ${fields.join(",")} WHERE id=$${i} RETURNING *`, vals);
  if (r.rows.length === 0) return res.status(404).json({});
  const user = mapUser(r.rows[0]);
  res.json({ ...user, passwordHash: undefined });
});

// ============ HABBO API PROXIES ============
app.get("/api/habbo/user/:username", async (req, res) => {
  try {
    const r = await fetch(`https://www.habbo.es/api/public/users?name=${req.params.username}`);
    if (!r.ok) return res.status(404).json({});
    res.json(await r.json());
  } catch { res.status(500).json({}); }
});
app.get("/api/habbo/badges/:hotel", async (req, res) => {
  try {
    const hotel = req.params.hotel || "es";
    const limit = req.query.limit || "20";
    const offset = req.query.offset || "0";
    const term = req.query.term || "";
    const url = `https://www.habboassets.com/api/v1/badges?hotel=${hotel}&limit=${limit}&offset=${offset}&term=${encodeURIComponent(term as string)}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(500).json([]);
    res.json(await r.json());
  } catch { res.status(500).json([]); }
});
app.get("/api/habbo/marketplace/:item", async (req, res) => {
  try {
    const hotel = req.query.hotel || "es";
    const r = await fetch(`https://habboapi.site/api/market/history?classname=${req.params.item}&hotel=${hotel}`);
    if (!r.ok) return res.status(500).json({});
    res.json(await r.json());
  } catch { res.status(500).json({}); }
});
app.get("/api/nowplaying", async (_req, res) => {
  try {
    const cfg = await query("SELECT api_url FROM config ORDER BY id LIMIT 1");
    if (!cfg.rows[0]?.api_url) return res.status(400).json({});
    const r = await fetch(cfg.rows[0].api_url);
    if (!r.ok) return res.status(500).json({});
    res.json(await r.json());
  } catch { res.status(500).json({}); }
});

// ============ MUNDIAL 2026 ENDPOINTS ============
async function dbUpdateUser(userId: number, data: any) {
  const fields: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (data.speedPoints !== undefined) { fields.push(`speed_points=$${i++}`); vals.push(data.speedPoints); }
  if (data.mundialStamps !== undefined) { fields.push(`mundial_stamps=$${i++}`); vals.push(JSON.stringify(data.mundialStamps)); }
  if (data.mundialLogros !== undefined) { fields.push(`mundial_logros=$${i++}`); vals.push(JSON.stringify(data.mundialLogros)); }
  if (data.mundialClan !== undefined) { fields.push(`mundial_clan=$${i++}`); vals.push(data.mundialClan); }
  if (data.mundialPredictions !== undefined) { fields.push(`mundial_predictions=$${i++}`); vals.push(JSON.stringify(data.mundialPredictions)); }
  if (data.mundialTickets !== undefined) { fields.push(`mundial_tickets=$${i++}`); vals.push(data.mundialTickets); }
  if (data.mundialPenalties !== undefined) { fields.push(`mundial_penalties=$${i++}`); vals.push(JSON.stringify(data.mundialPenalties)); }
  
  if (fields.length === 0) return null;
  vals.push(userId);
  const r = await query(`UPDATE users SET ${fields.join(",")} WHERE id=$${i} RETURNING *`, vals);
  return r.rows[0] ? mapUser(r.rows[0]) : null;
}

app.post("/api/mundial/buy-pack", authMiddleware, async (req: any, res) => {
  try {
    const userResult = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = userResult.rows[0] ? mapUser(userResult.rows[0]) : null;
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    if ((user.speedPoints ?? 0) < 10) return res.status(400).json({ message: "SpeedPoints insuficientes (necesitas 10 SP)" });
    
    const ESTAMPAS = ["trofeo", "balon", "estadio", "botas"];
    const randomStampId = ESTAMPAS[Math.floor(Math.random() * ESTAMPAS.length)];
    
    const currentStamps = user.mundialStamps || [];
    const updatedStamps = currentStamps.includes(randomStampId) ? currentStamps : [...currentStamps, randomStampId];
    
    const updated = await dbUpdateUser(req.userId, {
      speedPoints: (user.speedPoints ?? 0) - 10,
      mundialStamps: updatedStamps
    });
    res.json({ user: { ...updated, passwordHash: undefined }, stampId: randomStampId });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post("/api/mundial/buy-stamp", authMiddleware, async (req: any, res) => {
  try {
    const { stampId, cost } = req.body;
    if (!stampId || cost === undefined) return res.status(400).json({ message: "stampId y cost son requeridos" });
    
    const userResult = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = userResult.rows[0] ? mapUser(userResult.rows[0]) : null;
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    if ((user.speedPoints ?? 0) < cost) return res.status(400).json({ message: `SpeedPoints insuficientes (necesitas ${cost} SP)` });
    
    const currentStamps = user.mundialStamps || [];
    if (currentStamps.includes(stampId)) return res.status(400).json({ message: "Ya posees esta estampa" });
    
    const updated = await dbUpdateUser(req.userId, {
      speedPoints: (user.speedPoints ?? 0) - cost,
      mundialStamps: [...currentStamps, stampId]
    });
    res.json({ ...updated, passwordHash: undefined });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post("/api/mundial/claim-logro", authMiddleware, async (req: any, res) => {
  try {
    const { logroId } = req.body;
    if (!logroId) return res.status(400).json({ message: "logroId es requerido" });
    
    const userResult = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = userResult.rows[0] ? mapUser(userResult.rows[0]) : null;
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    
    const currentLogros = user.mundialLogros || [];
    if (currentLogros.includes(logroId)) return res.json({ ...user, passwordHash: undefined });
    
    const updated = await dbUpdateUser(req.userId, {
      mundialLogros: [...currentLogros, logroId]
    });
    res.json({ ...updated, passwordHash: undefined });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post("/api/mundial/predict", authMiddleware, async (req: any, res) => {
  try {
    const { matchId, t1, t2 } = req.body;
    if (!matchId || t1 === undefined || t2 === undefined) return res.status(400).json({ message: "matchId, t1 y t2 son requeridos" });
    
    const userResult = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = userResult.rows[0] ? mapUser(userResult.rows[0]) : null;
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    
    const predictions = user.mundialPredictions || {};
    predictions[matchId] = { t1: String(t1), t2: String(t2) };
    
    const currentLogros = user.mundialLogros || [];
    const updatedLogros = currentLogros.includes("votante") ? currentLogros : [...currentLogros, "votante"];
    
    const updated = await dbUpdateUser(req.userId, {
      mundialPredictions: predictions,
      mundialLogros: updatedLogros
    });
    res.json({ ...updated, passwordHash: undefined });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post("/api/mundial/join-clan", authMiddleware, async (req: any, res) => {
  try {
    const { clanName } = req.body;
    if (!clanName) return res.status(400).json({ message: "clanName es requerido" });
    
    const userResult = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = userResult.rows[0] ? mapUser(userResult.rows[0]) : null;
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    
    const updated = await dbUpdateUser(req.userId, {
      mundialClan: clanName
    });
    res.json({ ...updated, passwordHash: undefined });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post("/api/mundial/complete-mission", authMiddleware, async (req: any, res) => {
  try {
    const { missionId } = req.body;
    if (!missionId) return res.status(400).json({ message: "missionId es requerido" });
    
    const userResult = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = userResult.rows[0] ? mapUser(userResult.rows[0]) : null;
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    
    const currentLogros = user.mundialLogros || [];
    const missionLogroId = `mision_${missionId}`;
    if (currentLogros.includes(missionLogroId)) {
      return res.status(400).json({ message: "Misión ya completada anteriormente" });
    }
    
    const updatedLogros = [...currentLogros, missionLogroId];
    if (!updatedLogros.includes("hincha")) {
      updatedLogros.push("hincha");
    }
    
    const updated = await dbUpdateUser(req.userId, {
      speedPoints: (user.speedPoints ?? 0) + 15,
      mundialLogros: updatedLogros
    });
    res.json({ ...updated, passwordHash: undefined });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post("/api/mundial/buy-ticket", authMiddleware, async (req: any, res) => {
  try {
    const userResult = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = userResult.rows[0] ? mapUser(userResult.rows[0]) : null;
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    if ((user.speedPoints ?? 0) < 15) return res.status(400).json({ message: "SpeedPoints insuficientes (necesitas 15 SP)" });
    
    const updated = await dbUpdateUser(req.userId, {
      speedPoints: (user.speedPoints ?? 0) - 15,
      mundialTickets: (user.mundialTickets ?? 0) + 1
    });
    res.json({ ...updated, passwordHash: undefined });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post("/api/mundial/penalty-result", authMiddleware, async (req: any, res) => {
  try {
    const { score } = req.body;
    if (score === undefined || isNaN(Number(score))) return res.status(400).json({ message: "score es requerido" });
    
    const userResult = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = userResult.rows[0] ? mapUser(userResult.rows[0]) : null;
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    
    const penalties = user.mundialPenalties || { maxScore: 0, totalGames: 0 };
    const newMaxScore = Math.max(penalties.maxScore || 0, score);
    const newTotalGames = (penalties.totalGames || 0) + 1;
    
    const currentLogros = user.mundialLogros || [];
    const updatedLogros = [...currentLogros];
    if (score >= 5 && !updatedLogros.includes("penales")) {
      updatedLogros.push("penales");
    }
    
    let reward = score * 2;
    if (score >= 5) {
      reward += 10;
    }
    
    const updated = await dbUpdateUser(req.userId, {
      speedPoints: (user.speedPoints ?? 0) + reward,
      mundialPenalties: { maxScore: newMaxScore, totalGames: newTotalGames },
      mundialLogros: updatedLogros
    });
    res.json({ ...updated, passwordHash: undefined });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get("/api/habbo/proxy-image", async (req, res) => {
  try {
    const urlParam = req.query.u as string | undefined;
    const figure = req.query.figure as string | undefined;
    const hotel = (req.query.hotel as string) || "es";
    const size = (req.query.size as string) || "b";

    let sourceUrl: string | null = null;
    if (figure) {
      const safeHotel = (hotel || "es").trim().toLowerCase();
      const host = `https://www.habbo.${safeHotel}`;
      sourceUrl = `${host}/habbo-imaging/avatarimage?figure=${encodeURIComponent(figure)}&size=${encodeURIComponent(size)}`;
    } else if (urlParam) {
      sourceUrl = urlParam;
    } else {
      return res.status(400).send("missing url or figure");
    }

    const allowed = ["images.habbo.com", "habbo.es", "habbo.com", "habbo.com.br", "habbo.de", "habbo.fi", "habbo.fr", "habbo.it", "habbo.nl"];
    try {
      const parsed = new URL(sourceUrl);
      const host = parsed.hostname.toLowerCase();
      const isAllowed = allowed.some((h) => host === h || host.endsWith("." + h));
      if (!isAllowed) {
        return res.status(403).send("forbidden host");
      }
    } catch (err) {
      return res.status(400).send("invalid url");
    }

    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const upstream = await fetch(sourceUrl, { headers: { "User-Agent": userAgent } });
    if (!upstream.ok) return res.status(502).send("bad upstream");
    const contentType = upstream.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (e) {
    res.status(500).send("proxy error");
  }
});

export const handler = serverless(app);
