import type { Context } from "@netlify/functions";
import express from "express";
import serverless from "serverless-http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "habbospeed_secret_key_2026";

const app = express();
app.use(express.json());

// ============ In-Memory Storage (same as server/storage.ts) ============
let nextId = 1;
const getId = () => nextId++;

// Seed data
const adminId = getId();
const usersMap = new Map<number, any>();
usersMap.set(adminId, {
  id: adminId, email: "admin@habbospeed.com", passwordHash: "$2b$10$demo",
  displayName: "HabboSpeed", habboUsername: "HabboSpeed", avatarUrl: null,
  role: "admin", approved: true, speedPoints: 1000, createdAt: new Date()
});

const configItem: any = {
  id: getId(), radioService: "azuracast",
  apiUrl: "https://radio.example.com/api/nowplaying/1",
  listenUrl: "https://radio.example.com/listen/habbospeed/radio.mp3",
  homePlayerBgUrl: null, activeTheme: "circo",
  slideshow: [
    { title: "Bienvenido a HabboSpeed", subtitle: "Tu fansite de Habbo favorita", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_hween24_bg.png", cta: { text: "Explorar", href: "/news" } },
    { title: "Nuevos Eventos", subtitle: "No te pierdas los eventos de la semana", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_snowstorm24.png", cta: { text: "Ver Eventos", href: "/events" } },
  ],
  discordWebhooks: {}
};

const newsMap = new Map<number, any>();
[
  { title: "Habboween 2025: The Last of the Pixels", summary: "El evento de Halloween más grande llega a Habbo.", content: "Este año Habbo nos sorprende con un evento temático de Halloween.", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_hween24_bg.png", category: "Eventos", date: "2025-10-15" },
  { title: "Nuevos muebles de Navidad disponibles", summary: "La colección navideña 2025 ya está en el catálogo.", content: "Nuevos muebles exclusivos navideños.", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_xmas24_bg.png", category: "Catálogo", date: "2025-12-01" },
  { title: "Habbo cumple 25 años", summary: "Celebramos un cuarto de siglo de Habbo.", content: "Habbo Hotel celebra su 25 aniversario.", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_snowstorm24.png", category: "Comunidad", date: "2025-08-05" },
].forEach(n => { const id = getId(); newsMap.set(id, { id, ...n, reactions: {}, authorId: adminId, createdAt: new Date() }); });

const eventsMap = new Map<number, any>();
[
  { title: "Noche de Trivia Habbo", server: "Habbo.es", date: "2026-03-25", time: "20:00", roomName: "HabboSpeed Arena", roomOwner: "HabboSpeed", host: "DJ_Luna", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_hween24_bg.png" },
  { title: "Concurso de Salas", server: "Habbo.es", date: "2026-03-28", time: "18:00", roomName: "Speed Design Contest", roomOwner: "HabboSpeed", host: "Pixelarte", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_snowstorm24.png" },
].forEach(e => { const id = getId(); eventsMap.set(id, { id, ...e, createdAt: new Date() }); });

const pollsMap = new Map<number, any>();
const pollId = getId();
pollsMap.set(pollId, {
  id: pollId, title: "¿Cuál es tu evento favorito de Habbo?",
  options: [{ name: "Habboween", votes: 45 }, { name: "Navidad", votes: 38 }, { name: "San Valentín", votes: 22 }, { name: "Aniversario", votes: 31 }],
  isActive: true, createdAt: new Date()
});

const teamMap = new Map<number, any>();
[
  { displayName: "HabboSpeed", habboUsername: "HabboSpeed", role: "Fundador", motto: "Velocidad y diversión" },
  { displayName: "DJ Luna", habboUsername: "DJ_Luna", role: "DJ Principal", motto: "La música nos une" },
  { displayName: "Pixelarte", habboUsername: "Pixelarte", role: "Diseñador", motto: "Cada pixel cuenta" },
].forEach(t => { const id = getId(); teamMap.set(id, { id, ...t, joinedAt: new Date() }); });

const scheduleMap = new Map<number, any>();
["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].forEach(day => {
  const id1 = getId(); scheduleMap.set(id1, { id: id1, day, startTime: "10:00", endTime: "14:00", showName: "Morning Vibes", djName: "AutoDJ" });
  const id2 = getId(); scheduleMap.set(id2, { id: id2, day, startTime: "18:00", endTime: "22:00", showName: "Speed Mix", djName: day === "Sábado" ? "DJ_Luna" : "AutoDJ" });
});

const forumCatsMap = new Map<number, any>();
[
  { name: "General", description: "Discusiones generales", sortOrder: 1 },
  { name: "Eventos", description: "Propuestas de eventos", sortOrder: 2 },
  { name: "Guías", description: "Guías y tutoriales", sortOrder: 3 },
  { name: "Trading", description: "Intercambios", sortOrder: 4 },
  { name: "Off-Topic", description: "Otros temas", sortOrder: 5 },
].forEach(c => { const id = getId(); forumCatsMap.set(id, { id, ...c }); });

const threadsMap = new Map<number, any>();
const postsMap = new Map<number, any>();
const requestsMap = new Map<number, any>();

// Themes
const themesMap = new Map<number, any>();
[
  { slug: "default", name: "HabboSpeed Classic", description: "Tema clásico púrpura", isDefault: true, bannerUrl: null, logoUrl: null,
    colors: { primary: "262 84% 58%", primaryForeground: "0 0% 100%", accent: "262 40% 18%", accentForeground: "262 84% 78%", background: "224 71% 4%", card: "222 47% 8%", border: "215 28% 16%", muted: "215 28% 14%", glowColor: "139, 92, 246", gradientFrom: "#7c3aed", gradientTo: "#3b82f6" },
    decorations: { emoji: "⚡", pattern: "grid", particleType: "none" } },
  { slug: "circo", name: "HabboSpeed Circo", description: "Bienvenidos al circo más loco de Habbo", isDefault: false, bannerUrl: null, logoUrl: null,
    colors: { primary: "0 85% 50%", primaryForeground: "0 0% 100%", accent: "45 100% 50%", accentForeground: "0 0% 10%", background: "0 0% 6%", card: "0 20% 10%", border: "0 30% 18%", muted: "0 15% 14%", glowColor: "220, 38, 38", gradientFrom: "#dc2626", gradientTo: "#eab308", secondary: "45 100% 50%" },
    decorations: { emoji: "🎪", pattern: "stripes", particleType: "confetti", accentEmojis: ["🤡","🎭","🎪","🎨","🎫"] } },
  { slug: "habboween", name: "Habboween", description: "Noche de terror en el hotel", isDefault: false, bannerUrl: null, logoUrl: null,
    colors: { primary: "25 95% 53%", primaryForeground: "0 0% 100%", accent: "270 60% 40%", accentForeground: "270 80% 80%", background: "270 30% 5%", card: "270 25% 9%", border: "270 25% 16%", muted: "270 20% 13%", glowColor: "249, 115, 22", gradientFrom: "#f97316", gradientTo: "#7c3aed" },
    decorations: { emoji: "🎃", pattern: "bats", particleType: "ghosts", accentEmojis: ["👻","🦇","💀","🕷️","🎃"] } },
  { slug: "navidad", name: "Navidad Habbo", description: "Felices fiestas en el hotel", isDefault: false, bannerUrl: null, logoUrl: null,
    colors: { primary: "0 72% 45%", primaryForeground: "0 0% 100%", accent: "142 70% 35%", accentForeground: "0 0% 100%", background: "210 30% 5%", card: "210 25% 9%", border: "210 20% 16%", muted: "210 20% 13%", glowColor: "185, 28, 28", gradientFrom: "#b91c1c", gradientTo: "#15803d" },
    decorations: { emoji: "🎄", pattern: "snowflakes", particleType: "snow", accentEmojis: ["⛄","🎅","🎁","❄️","🎄"] } },
  { slug: "playa", name: "Playa Habbo", description: "Verano y sol en el hotel", isDefault: false, bannerUrl: null, logoUrl: null,
    colors: { primary: "187 85% 43%", primaryForeground: "0 0% 100%", accent: "45 100% 50%", accentForeground: "0 0% 10%", background: "200 40% 6%", card: "200 30% 10%", border: "200 25% 17%", muted: "200 20% 14%", glowColor: "6, 182, 212", gradientFrom: "#06b6d4", gradientTo: "#eab308" },
    decorations: { emoji: "🏖️", pattern: "waves", particleType: "bubbles", accentEmojis: ["🌊","🐚","☀️","🏄","🏖️"] } },
].forEach(t => { const id = getId(); themesMap.set(id, { id, ...t }); });

// ============ Middleware ============
function generateToken(id: number) { return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" }); }
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No autorizado" });
  try { const d = jwt.verify(token, JWT_SECRET) as any; req.userId = d.id; next(); } catch { return res.status(401).json({ message: "Token inválido" }); }
}
function adminMiddleware(req: any, res: any, next: any) {
  authMiddleware(req, res, () => { const u = usersMap.get(req.userId); if (!u || u.role !== "admin") return res.status(403).json({ message: "Acceso denegado" }); req.user = u; next(); });
}

// ============ ROUTES ============
app.post("/api/auth/register", async (req, res) => {
  const { email, password, displayName, habboUsername } = req.body;
  const existing = [...usersMap.values()].find(u => u.email === email);
  if (existing) return res.status(400).json({ message: "Email ya registrado" });
  const passwordHash = await bcrypt.hash(password, 10);
  const id = getId();
  const user = { id, email, passwordHash, displayName, habboUsername: habboUsername || null, avatarUrl: habboUsername ? `https://www.habbo.es/habbo-imaging/avatarimage?user=${habboUsername}&size=b` : null, role: "pending", approved: false, speedPoints: 0, createdAt: new Date() };
  usersMap.set(id, user);
  res.status(201).json({ ...user, passwordHash: undefined, token: generateToken(id) });
});
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = [...usersMap.values()].find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Credenciales inválidas" });
  res.json({ ...user, passwordHash: undefined, token: generateToken(user.id) });
});
app.get("/api/auth/me", authMiddleware, (req: any, res) => { const u = usersMap.get(req.userId); if (!u) return res.status(404).json({}); res.json({ ...u, passwordHash: undefined }); });

app.get("/api/news", (_req, res) => res.json([...newsMap.values()].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))));
app.get("/api/news/:id", (req, res) => { const i = newsMap.get(parseInt(req.params.id)); if (!i) return res.status(404).json({}); res.json(i); });
app.post("/api/news", adminMiddleware, (req: any, res) => { const id = getId(); const item = { id, ...req.body, authorId: req.user.id, createdAt: new Date() }; newsMap.set(id, item); res.status(201).json(item); });
app.delete("/api/news/:id", adminMiddleware, (req, res) => { newsMap.delete(parseInt(req.params.id)); res.json({ message: "Eliminada" }); });

app.get("/api/events", (_req, res) => res.json([...eventsMap.values()]));
app.get("/api/events/:id", (req, res) => { const i = eventsMap.get(parseInt(req.params.id)); if (!i) return res.status(404).json({}); res.json(i); });
app.post("/api/events", adminMiddleware, (req, res) => { const id = getId(); eventsMap.set(id, { id, ...req.body, createdAt: new Date() }); res.status(201).json(eventsMap.get(id)); });
app.delete("/api/events/:id", adminMiddleware, (req, res) => { eventsMap.delete(parseInt(req.params.id)); res.json({ message: "Eliminado" }); });

app.get("/api/schedule", (_req, res) => res.json([...scheduleMap.values()]));
app.get("/api/polls", (_req, res) => res.json([...pollsMap.values()]));
app.put("/api/polls/:id", adminMiddleware, (req, res) => { const p = pollsMap.get(parseInt(req.params.id)); if (!p) return res.status(404).json({}); const updated = { ...p, ...req.body }; pollsMap.set(p.id, updated); res.json(updated); });

app.get("/api/config", (_req, res) => res.json(configItem));
app.put("/api/config", adminMiddleware, (req, res) => { Object.assign(configItem, req.body); res.json(configItem); });

app.get("/api/team", (_req, res) => res.json([...teamMap.values()]));
app.get("/api/forum/categories", (_req, res) => res.json([...forumCatsMap.values()].sort((a, b) => a.sortOrder - b.sortOrder)));
app.get("/api/forum/categories/:id/threads", (req, res) => res.json([...threadsMap.values()].filter(t => t.categoryId === parseInt(req.params.id))));
app.get("/api/forum/threads/:id", (req, res) => { const t = threadsMap.get(parseInt(req.params.id)); if (!t) return res.status(404).json({}); res.json(t); });
app.get("/api/forum/threads/:id/posts", (req, res) => res.json([...postsMap.values()].filter(p => p.threadId === parseInt(req.params.id))));
app.get("/api/marketplace", (_req, res) => res.json([]));
app.get("/api/badges", (_req, res) => res.json([]));
app.get("/api/requests", (_req, res) => res.json([...requestsMap.values()]));
app.post("/api/requests", (req, res) => { const id = getId(); requestsMap.set(id, { id, ...req.body, createdAt: new Date() }); res.status(201).json(requestsMap.get(id)); });

// Themes
app.get("/api/themes", (_req, res) => res.json([...themesMap.values()]));
app.get("/api/themes/active", (_req, res) => {
  const slug = configItem.activeTheme || "circo";
  const theme = [...themesMap.values()].find(t => t.slug === slug);
  if (!theme) return res.status(404).json({});
  res.json(theme);
});
app.get("/api/themes/:slug", (req, res) => {
  const theme = [...themesMap.values()].find(t => t.slug === req.params.slug);
  if (!theme) return res.status(404).json({});
  res.json(theme);
});
app.put("/api/themes/active", adminMiddleware, (req, res) => {
  const { slug } = req.body;
  const theme = [...themesMap.values()].find(t => t.slug === slug);
  if (!theme) return res.status(404).json({});
  configItem.activeTheme = slug;
  res.json(configItem);
});

// Habbo API proxies
app.get("/api/habbo/user/:username", async (req, res) => {
  try { const r = await fetch(`https://www.habbo.es/api/public/users?name=${req.params.username}`); if (!r.ok) return res.status(404).json({}); res.json(await r.json()); } catch { res.status(500).json({}); }
});
app.get("/api/habbo/badges/:hotel", async (req, res) => {
  try { const r = await fetch(`https://www.habboassets.com/api/v1/badges?hotel=${req.params.hotel}&limit=${req.query.limit || "20"}`); if (!r.ok) return res.status(500).json([]); res.json(await r.json()); } catch { res.status(500).json([]); }
});
app.get("/api/nowplaying", async (_req, res) => {
  try { if (!configItem.apiUrl) return res.status(400).json({}); const r = await fetch(configItem.apiUrl); if (!r.ok) return res.status(500).json({}); res.json(await r.json()); } catch { res.status(500).json({}); }
});
app.get("/api/users", adminMiddleware, (_req, res) => res.json([...usersMap.values()].map(u => ({ ...u, passwordHash: undefined }))));

export const handler = serverless(app);
