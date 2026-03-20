import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage-instance";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "habbospeed_secret_key_2026";

function generateToken(id: number): string {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
}

// Middleware to verify JWT
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No autorizado" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

function adminMiddleware(req: any, res: any, next: any) {
  authMiddleware(req, res, async () => {
    const user = await storage.getUser(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    req.user = user;
    next();
  });
}

// DJ or Admin middleware
function djMiddleware(req: any, res: any, next: any) {
  authMiddleware(req, res, async () => {
    const user = await storage.getUser(req.userId);
    if (!user || (user.role !== "admin" && user.role !== "dj")) {
      return res.status(403).json({ message: "Acceso denegado - solo DJs y admins" });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(server: Server, app: Express) {
  // ============ AUTH ============
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, displayName, habboUsername } = req.body;
      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(400).json({ message: "El email ya está registrado" });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email, passwordHash, displayName,
        habboUsername: habboUsername || null,
        avatarUrl: habboUsername ? `https://www.habbo.es/habbo-imaging/avatarimage?user=${habboUsername}&size=b` : null,
        role: "pending", approved: false, speedPoints: 0,
      });

      const token = generateToken(user.id);
      res.status(201).json({ ...user, passwordHash: undefined, token });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ message: "Credenciales inválidas" });

      const token = generateToken(user.id);
      res.json({ ...user, passwordHash: undefined, token });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: any, res) => {
    const user = await storage.getUser(req.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ ...user, passwordHash: undefined });
  });

  // ============ NEWS ============
  app.get("/api/news", async (_req, res) => {
    const items = await storage.getAllNews();
    res.json(items);
  });

  app.get("/api/news/:id", async (req, res) => {
    const item = await storage.getNewsById(parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: "Noticia no encontrada" });
    res.json(item);
  });

  app.post("/api/news", adminMiddleware, async (req: any, res) => {
    const item = await storage.createNews({ ...req.body, authorId: req.user.id });
    res.status(201).json(item);
  });

  app.put("/api/news/:id", adminMiddleware, async (req, res) => {
    const item = await storage.updateNews(parseInt(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Noticia no encontrada" });
    res.json(item);
  });

  app.delete("/api/news/:id", adminMiddleware, async (req, res) => {
    await storage.deleteNews(parseInt(req.params.id));
    res.json({ message: "Eliminada" });
  });

  // ============ EVENTS ============
  app.get("/api/events", async (_req, res) => {
    res.json(await storage.getAllEvents());
  });

  app.get("/api/events/:id", async (req, res) => {
    const item = await storage.getEventById(parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: "Evento no encontrado" });
    res.json(item);
  });

  app.post("/api/events", adminMiddleware, async (req, res) => {
    res.status(201).json(await storage.createEvent(req.body));
  });

  app.put("/api/events/:id", adminMiddleware, async (req, res) => {
    const item = await storage.updateEvent(parseInt(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Evento no encontrado" });
    res.json(item);
  });

  app.delete("/api/events/:id", adminMiddleware, async (req, res) => {
    await storage.deleteEvent(parseInt(req.params.id));
    res.json({ message: "Eliminado" });
  });

  // ============ SCHEDULE ============
  app.get("/api/schedule", async (_req, res) => {
    res.json(await storage.getAllSchedule());
  });

  app.post("/api/schedule", adminMiddleware, async (req, res) => {
    res.status(201).json(await storage.createScheduleItem(req.body));
  });

  app.put("/api/schedule/:id", adminMiddleware, async (req, res) => {
    const item = await storage.updateScheduleItem(parseInt(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Horario no encontrado" });
    res.json(item);
  });

  app.delete("/api/schedule/:id", adminMiddleware, async (req, res) => {
    await storage.deleteScheduleItem(parseInt(req.params.id));
    res.json({ message: "Eliminado" });
  });

  // ============ COMMENTS ============
  app.get("/api/comments/article/:articleId", async (req, res) => {
    res.json(await storage.getCommentsByArticle(parseInt(req.params.articleId)));
  });

  app.post("/api/comments", authMiddleware, async (req: any, res) => {
    const user = await storage.getUser(req.userId);
    if (!user) return res.status(401).json({ message: "No autorizado" });
    const comment = await storage.createComment({
      ...req.body, authorId: user.id, authorName: user.displayName
    });
    // Attach habboUsername for avatar display
    res.status(201).json({ ...comment, habboUsername: user.habboUsername || null });
  });

  app.delete("/api/comments/:id", adminMiddleware, async (req, res) => {
    await storage.deleteComment(parseInt(req.params.id));
    res.json({ message: "Eliminado" });
  });

  // ============ POLLS ============
  app.get("/api/polls", async (_req, res) => {
    res.json(await storage.getAllPolls());
  });

  app.post("/api/polls", adminMiddleware, async (req, res) => {
    res.status(201).json(await storage.createPoll(req.body));
  });

  app.put("/api/polls/:id", adminMiddleware, async (req, res) => {
    const item = await storage.updatePoll(parseInt(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Encuesta no encontrada" });
    res.json(item);
  });

  // ============ CONFIG ============
  app.get("/api/config", async (_req, res) => {
    res.json(await storage.getConfig());
  });

  app.put("/api/config", adminMiddleware, async (req, res) => {
    res.json(await storage.updateConfig(req.body));
  });

  // ============ FORUM ============
  app.get("/api/forum/categories", async (_req, res) => {
    res.json(await storage.getAllForumCategories());
  });

  app.post("/api/forum/categories", adminMiddleware, async (req, res) => {
    res.status(201).json(await storage.createForumCategory(req.body));
  });

  app.get("/api/forum/categories/:id/threads", async (req, res) => {
    res.json(await storage.getThreadsByCategory(parseInt(req.params.id)));
  });

  app.get("/api/forum/threads/:id", async (req, res) => {
    const thread = await storage.getThreadById(parseInt(req.params.id));
    if (!thread) return res.status(404).json({ message: "Hilo no encontrado" });
    await storage.incrementThreadViews(thread.id);
    res.json(thread);
  });

  app.post("/api/forum/threads", authMiddleware, async (req: any, res) => {
    const user = await storage.getUser(req.userId);
    if (!user) return res.status(401).json({ message: "No autorizado" });
    const thread = await storage.createThread({
      ...req.body, authorId: user.id, authorName: user.displayName,
      isPinned: false, isLocked: false, views: 0
    });
    // Auto-create first post
    if (req.body.content) {
      await storage.createPost({
        threadId: thread.id, authorId: user.id, authorName: user.displayName, content: req.body.content
      });
    }
    res.status(201).json(thread);
  });

  app.get("/api/forum/threads/:id/posts", async (req, res) => {
    res.json(await storage.getPostsByThread(parseInt(req.params.id)));
  });

  app.post("/api/forum/posts", authMiddleware, async (req: any, res) => {
    const user = await storage.getUser(req.userId);
    if (!user) return res.status(401).json({ message: "No autorizado" });
    res.status(201).json(await storage.createPost({
      ...req.body, authorId: user.id, authorName: user.displayName
    }));
  });

  // ============ MARKETPLACE ============
  app.get("/api/marketplace", async (_req, res) => {
    res.json(await storage.getAllMarketplaceItems());
  });

  app.get("/api/marketplace/:className", async (req, res) => {
    const item = await storage.getMarketplaceItemByClass(req.params.className);
    if (!item) return res.status(404).json({ message: "Item no encontrado" });
    res.json(item);
  });

  // ============ BADGES ============
  app.get("/api/badges", async (req, res) => {
    const query = req.query.q as string;
    if (query) {
      res.json(await storage.searchBadges(query));
    } else {
      res.json(await storage.getAllBadges());
    }
  });

  // ============ HABBO API PROXY ============
  app.get("/api/habbo/user/:username", async (req, res) => {
    try {
      const r = await fetch(`https://www.habbo.es/api/public/users?name=${req.params.username}`);
      if (!r.ok) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error al consultar Habbo API" }); }
  });

  // Habbo Origins API proxy
  app.get("/api/habbo/origins/user/:username", async (req, res) => {
    try {
      const r = await fetch(`https://origins.habbo.es/api/public/users?name=${req.params.username}`);
      if (!r.ok) return res.status(404).json({ message: "Usuario no encontrado en Origins" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error al consultar Habbo Origins API" }); }
  });

  app.get("/api/habbo/badges/:hotel", async (req, res) => {
    try {
      const hotel = req.params.hotel || "es";
      const limit = req.query.limit || "20";
      const r = await fetch(`https://www.habboassets.com/api/v1/badges?hotel=${hotel}&limit=${limit}`);
      if (!r.ok) return res.status(500).json({ message: "Error al consultar badges" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error al consultar badges API" }); }
  });

  app.get("/api/habbo/marketplace/:item", async (req, res) => {
    try {
      const hotel = req.query.hotel || "es";
      const r = await fetch(`https://habboapi.site/api/market/history?classname=${req.params.item}&hotel=${hotel}`);
      if (!r.ok) return res.status(500).json({ message: "Error al consultar marketplace" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error al consultar marketplace API" }); }
  });

  // ============ HABBO FURNI (latest from furnidata) ============
  app.get("/api/habbo/furni", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 24;
      const r = await fetch("https://www.habbo.es/gamedata/furnidata_json/0", {
        headers: { "User-Agent": "HabboSpeed/1.0" },
      });
      if (!r.ok) return res.json([]);
      const data = await r.json() as any;
      const items = data?.roomitemtypes?.furnitype || [];
      // Return last N items (newest) with icon URL info
      const latest = items.slice(-limit).reverse().map((f: any) => ({
        name: (f.name || f.classname || "").replace(/_/g, " ").replace(/ name$/i, ""),
        classname: f.classname,
        revision: f.revision,
        iconUrl: `https://images.habbo.com/dcr/hof_furni/${f.revision}/${f.classname}_icon.png`,
      }));
      res.json(latest);
    } catch {
      res.json([]);
    }
  });

  // ============ REQUESTS ============
  app.get("/api/requests", async (_req, res) => {
    res.json(await storage.getAllRequests());
  });

  app.post("/api/requests", async (req, res) => {
    res.status(201).json(await storage.createRequest(req.body));
  });

  app.delete("/api/requests/:id", adminMiddleware, async (req, res) => {
    await storage.deleteRequest(parseInt(req.params.id));
    res.json({ message: "Eliminado" });
  });

  // ============ TEAM ============
  app.get("/api/team", async (_req, res) => {
    res.json(await storage.getAllTeamMembers());
  });

  app.post("/api/team", adminMiddleware, async (req, res) => {
    res.status(201).json(await storage.createTeamMember(req.body));
  });

  app.put("/api/team/:id", adminMiddleware, async (req, res) => {
    const item = await storage.updateTeamMember(parseInt(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Miembro no encontrado" });
    res.json(item);
  });

  app.delete("/api/team/:id", adminMiddleware, async (req, res) => {
    await storage.deleteTeamMember(parseInt(req.params.id));
    res.json({ message: "Eliminado" });
  });

  // ============ USERS (Admin) ============
  app.get("/api/users", adminMiddleware, async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map(u => ({ ...u, passwordHash: undefined })));
  });

  app.put("/api/users/:id", adminMiddleware, async (req, res) => {
    const item = await storage.updateUser(parseInt(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ ...item, passwordHash: undefined });
  });

  // ============ THEMES ============
  app.get("/api/themes", async (_req, res) => {
    res.json(await storage.getAllThemes());
  });

  app.get("/api/themes/active", async (_req, res) => {
    const theme = await storage.getActiveTheme();
    if (!theme) return res.status(404).json({ message: "Tema no encontrado" });
    res.json(theme);
  });

  app.get("/api/themes/:slug", async (req, res) => {
    const theme = await storage.getThemeBySlug(req.params.slug);
    if (!theme) return res.status(404).json({ message: "Tema no encontrado" });
    res.json(theme);
  });

  app.put("/api/themes/active", adminMiddleware, async (req, res) => {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ message: "Slug requerido" });
    const config = await storage.setActiveTheme(slug);
    if (!config) return res.status(404).json({ message: "Tema no encontrado" });
    res.json(config);
  });

  app.put("/api/themes/:id", adminMiddleware, async (req, res) => {
    const theme = await storage.updateTheme(parseInt(req.params.id), req.body);
    if (!theme) return res.status(404).json({ message: "Tema no encontrado" });
    res.json(theme);
  });

  app.post("/api/themes", adminMiddleware, async (req, res) => {
    res.status(201).json(await storage.createTheme(req.body));
  });

  // ============ NOW PLAYING (Radio proxy) ============
  app.get("/api/nowplaying", async (_req, res) => {
    try {
      const cfg = await storage.getConfig();
      if (!cfg || !cfg.apiUrl) return res.status(400).json({ message: "Radio no configurada" });
      const r = await fetch(cfg.apiUrl);
      if (!r.ok) return res.status(500).json({ message: "Error al consultar radio" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error al consultar radio" }); }
  });

  // ============ DJ PANEL ============
  app.get("/api/dj-panel", async (_req, res) => {
    try {
      res.json(await storage.getDjPanel());
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/dj-panel", djMiddleware, async (req, res) => {
    try {
      const panel = await storage.updateDjPanel(req.body);
      if (!panel) return res.status(404).json({ message: "Panel no encontrado" });
      res.json(panel);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ CHAT ============
  app.get("/api/chat", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      res.json(await storage.getChatMessages(limit));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/chat/:id", djMiddleware, async (req: any, res) => {
    try {
      await storage.deleteChatMessage(parseInt(req.params.id));
      res.json({ message: "Mensaje eliminado" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/chat", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) return res.status(401).json({ message: "No autorizado" });
      const msg = await storage.createChatMessage({
        userId: user.id,
        userName: user.displayName,
        habboUsername: user.habboUsername || null,
        message: req.body.content || req.body.message,
      });
      res.status(201).json(msg);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ PRIVATE MESSAGES ============
  app.get("/api/messages", authMiddleware, async (req: any, res) => {
    try {
      res.json(await storage.getMessagesByUser(req.userId));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/messages/unread", authMiddleware, async (req: any, res) => {
    try {
      const count = await storage.getUnreadCount(req.userId);
      res.json({ count });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/messages", authMiddleware, async (req: any, res) => {
    try {
      const msg = await storage.createPrivateMessage({
        ...req.body,
        fromUserId: req.userId,
      });
      res.status(201).json(msg);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/messages/:id/read", authMiddleware, async (req: any, res) => {
    try {
      const msg = await storage.markMessageRead(parseInt(req.params.id));
      if (!msg) return res.status(404).json({ message: "Mensaje no encontrado" });
      res.json(msg);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ VERIFIED BADGES ============
  app.get("/api/verified-badges/:userId", async (req, res) => {
    try {
      res.json(await storage.getVerifiedBadges(parseInt(req.params.userId)));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/verified-badges/verify", authMiddleware, async (req: any, res) => {
    try {
      const { habboUsername, badgeCode } = req.body;
      if (!habboUsername || !badgeCode) {
        return res.status(400).json({ message: "habboUsername y badgeCode son requeridos" });
      }
      // Fetch from Habbo API to verify badge in selectedBadges
      const r = await fetch(`https://www.habbo.es/api/public/users?name=${encodeURIComponent(habboUsername)}`);
      if (!r.ok) return res.status(404).json({ message: "Usuario de Habbo no encontrado" });
      const habboData = await r.json() as any;
      const selectedBadges: any[] = habboData.selectedBadges || [];
      const hasBadge = selectedBadges.some((b: any) => b.code === badgeCode || b.badgeIndex === badgeCode);
      if (!hasBadge) {
        return res.status(400).json({ message: "Badge no encontrado en el perfil de Habbo", verified: false });
      }
      const badge = await storage.createVerifiedBadge({ userId: req.userId, badgeCode });
      res.status(201).json({ verified: true, badge });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ TEAM USERS (from registered users) ============
  app.get("/api/team-users", async (_req, res) => {
    try {
      const users = await storage.getTeamUsers();
      res.json(users.map((u: any) => ({ ...u, passwordHash: undefined })));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============ SPEED POINTS (Admin) ============
  app.put("/api/users/:id/points", adminMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { points } = req.body;
      if (points === undefined || isNaN(Number(points))) {
        return res.status(400).json({ message: "Campo 'points' requerido" });
      }
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      const updated = await storage.updateUser(userId, {
        speedPoints: (user.speedPoints ?? 0) + Number(points),
      });
      if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json({ ...updated, passwordHash: undefined });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });
}
