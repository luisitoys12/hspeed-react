import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage-instance";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "habbospeed_secret_key_2026";

function generateToken(id: number): string {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
}

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
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Acceso denegado" });
    req.user = user;
    next();
  });
}

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
  // If DB pool is available, ensure minimal users table exists so seeding works on Neon
  (async () => {
    try {
      const { pool } = await import("./db");
      if (pool) {
        const client = await pool.connect();
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS users (
              avatar_url TEXT,
              role TEXT,
              approved BOOLEAN DEFAULT false,
              speed_points INTEGER DEFAULT 0,
              created_at TIMESTAMPTZ DEFAULT now()
            )
          `);
          // other tables can be created lazily or via migrations
        } finally {
          client.release();
        }
        console.log("DB: ensured minimal users table exists");
      }
    } catch (e: any) {
      // non-fatal
      console.log("DB ensureTables skipped:", e?.message || e);
    }
  })();
  // ============ SEED DEFAULT ADMIN USER ============
  (async () => {
    try {
      const adminEmail = "admin@habbospeed.com";
      const existingAdmin = await storage.getUserByEmail(adminEmail);
      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash("admin123", 10);
        await storage.createUser({
          email: adminEmail,
          passwordHash,
          displayName: "Admin Habbospeed",
          habboUsername: "AdminHS",
          avatarUrl: "https://www.habbo.es/habbo-imaging/avatarimage?user=AdminHS&size=b",
          role: "admin",
          approved: true,
          speedPoints: 1000,
        });
        console.log(`[Init] Default admin user created successfully: ${adminEmail} / admin123`);
      } else {
        console.log(`[Init] Default admin user already exists: ${adminEmail}`);
      }
    } catch (e: any) {
      console.error("[Init] Error seeding default admin user:", e.message);
    }
  })();

  // Seed Events, Forum Categories, and initial Threads/Posts
  (async () => {
    try {
      const { pool } = await import("./db");
      if (pool) {
        const client = await pool.connect();
        try {
          // Check if events exists
          const eventsCheck = await client.query("SELECT COUNT(*) FROM events");
          if (parseInt(eventsCheck.rows[0].count) === 0) {
            await client.query(`
              INSERT INTO events (title, server, date, time, room_name, room_owner, host, image_url, image_hint)
              VALUES 
              ('Gran Fiesta en Habbo', 'Habbo.es', '15/06/2026', '20:00', '[HS] Central de Eventos', 'HabboSpeed', 'DJ_Speedy', 'https://images.habbo.com/c_images/reception/rec_background_beach.png', 'Fiesta playera'),
              ('Habbo Fan Festival 2026: Apertura', 'Habbo.es', '15/06/2026', '18:00', '[HS] Main Stage Festival', 'HabboSpeed', 'DJ_Loco', 'https://images.habbo.com/c_images/reception/rec_background_habboween.png', 'Festival de Fans'),
              ('Batalla de Bandas HSpeed Fest', 'Habbo.es', '16/06/2026', '21:00', '[HS] Rock Arena', 'HabboSpeed', 'DJ_RockStar', 'https://images.habbo.com/c_images/reception/rec_background_beach.png', 'Batalla de Bandas')
            `);
            console.log("[Seed] Default events inserted successfully");
          }

          // Check if news article exists
          const newsCheck = await client.query("SELECT COUNT(*) FROM news WHERE title = 'Mega Actualización HSpeed: Nueva Era Noir + Gold y Roadmap'");
          if (parseInt(newsCheck.rows[0].count) === 0) {
            await client.query(`
              INSERT INTO news (title, summary, content, image_url, image_hint, category, date, reactions, author_id)
              VALUES (
                'Mega Actualización HSpeed: Nueva Era Noir + Gold y Roadmap',
                'Presentamos oficialmente nuestro rediseño visual Noir + Gold, el historial de canciones en vivo, membresías VIP, catálogo de salas y nuestro plan de desarrollo.',
                '¡Hola a todos los apasionados de HabboSpeed! \n\nEstamos sumamente orgullosos de presentarles la **Mega Actualización** de nuestra fansite, un cambio completo tanto estético como funcional que redefine lo que un fansite de Habbo puede ofrecer.\n\n### 🎨 Nueva Identidad Visual: Noir + Gold\nHemos dejado atrás el tema azul y morado genérico para adoptar un estilo **Noir + Gold** de calidad editorial y premium. Con tipografías sofisticadas como \`Cabinet Grotesk\` para títulos y \`Satoshi\` para cuerpo de texto, logramos una lectura cómoda y un diseño que se ve espectacular en computadoras y móviles.\n\n### 🎵 Historial de Canciones (\`/song-history\`)\nSintoniza nuestra radio y mira el historial en tiempo real de las canciones reproducidas por nuestros DJs. ¡Incluso puedes volver a pedir tus temas favoritos con un solo clic!\n\n### 💎 Membresía VIP con 3 Niveles\nYa están disponibles los rangos **Silver, Gold y Diamond**. Consigue SpeedPoints en los juegos del sitio y canjéalos para obtener multiplicadores de puntos, insignias doradas en tu perfil y comandos premium.\n\n### 🏠 Buscador de Salas (\`/rooms\`)\nUn catálogo interactivo para compartir tus salas de Habbo con códigos copiables al portapapeles y efectos de confetti.\n\n### 🔔 Notificaciones en Tiempo Real y Soporte\nAhora recibirás avisos importantes en tu campana de notificaciones y lanzamos el sistema de **Soporte en Vivo mediante Tickets** directo en tu sección de mensajes personales.\n\n---\n\n## 🚀 Hoja de Ruta (Roadmap): 10 Funciones Únicas Esperadas\nSeguimos mejorando constantemente. Aquí están las 10 funciones exclusivas que llegarán próximamente a HabboSpeed:\n\n1. **Álbum de Estampas Interactivo en Tiempo Real:** Intercambia tus estampas repetidas del mundial y colecciones especiales directamente con otros usuarios en línea.\n2. **Conexión Directa de Inventario con Habbo:** Vincula tus raros y furnis reales del hotel y muéstralos en tu perfil de HabboSpeed.\n3. **Misiones de Aventura Diarias:** Misiones de rol al estilo RPG dentro de nuestra web para ganar placas y SpeedPoints.\n4. **Guerra de Clanes HSpeed:** Crea tu clan, recluta amigos y compite por el control del ranking de SpeedPoints semanal.\n5. **Minijuegos 8-Bit Integrados:** Juega a los Penales Retro, la Lotería de Píxeles y el Casino Speed desde tu navegador.\n6. **Transmisiones de Voz en Vivo de DJs:** Escucha la voz de nuestros DJs en cabina con latencia cero usando WebRTC.\n7. **Chat Personal Encriptado:** Envía mensajes directos seguros con soporte para emojis, stickers y Habbo widgets.\n8. **Bot de Radio para Discord:** Sintoniza la música de HabboSpeed directamente en los canales de voz de tu servidor de Discord.\n9. **Canje Directo de Placas en Habbo:** Sistema automatizado para recibir tus placas ganadas en la web directamente dentro del hotel Habbo.es.\n10. **Centro de Ayuda con Chat en Vivo:** Soporte técnico con chat en vivo atendido por moderadores oficiales las 24 horas del día.\n\nComenta aquí abajo qué te parece esta actualización y cuál de las nuevas funciones del Roadmap estás más ansioso por probar. ¡Gracias por ser parte de HabboSpeed!',
                'https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png',
                'Apertura e Identidad',
                'Actualizaciones',
                $1,
                '{"🔥": 15, "❤️": 22}',
                1
              )
            `, [new Date().toLocaleDateString("es-ES")]);
            console.log("[Seed] News article inserted successfully");
          }

          // Check if categories exists
          const catCheck = await client.query("SELECT COUNT(*) FROM forum_categories");
          if (parseInt(catCheck.rows[0].count) === 0) {
            await client.query(`
              INSERT INTO forum_categories (name, description, sort_order)
              VALUES 
              ('General', 'Foro general sobre HabboSpeed', 0),
              ('Soporte', 'Soporte técnico, dudas y reportes', 1),
              ('Radio', 'Peticiones, críticas de DJ y comentarios de sintonía', 2),
              ('Juegos & Concursos', 'Participa en sorteos, actividades y eventos especiales', 3)
            `);
            console.log("[Seed] Default forum categories inserted successfully");
          }

          // Check if threads exist
          const threadCheck = await client.query("SELECT COUNT(*) FROM forum_threads");
          if (parseInt(threadCheck.rows[0].count) === 0) {
            const catRes = await client.query("SELECT id FROM forum_categories WHERE name = 'General'");
            if (catRes.rows.length > 0) {
              const catId = catRes.rows[0].id;
              const threadRes = await client.query(`
                INSERT INTO forum_threads (category_id, title, author_id, author_name, is_pinned, is_locked, views)
                VALUES 
                ($1, '¡Bienvenidos a HabboSpeed Fansite Oficial!', 1, 'Administrador', true, false, 45),
                ($1, 'Roadmap: 10 Funciones Únicas de HabboSpeed en Desarrollo', 1, 'Administrador', true, false, 82)
                RETURNING id
              `, [catId]);

              const threadId1 = threadRes.rows[0].id;
              const threadId2 = threadRes.rows[1].id;

              await client.query(`
                INSERT INTO forum_posts (thread_id, author_id, author_name, content)
                VALUES 
                ($1, 1, 'Administrador', 'Bienvenidos a la fansite oficial. Este foro es para compartir ideas, charlar sobre Habbo y convivir con toda la comunidad. ¡Sintoniza la radio y a divertirse!'),
                ($2, 1, 'Administrador', 'Aquí les presentamos la hoja de ruta de lo que se viene próximamente en HSpeed:\n\n1. Álbum de Estampas Interactivo en Tiempo Real.\n2. Conexión Directa de Inventario con Habbo.\n3. Sistema de Misiones de Aventura Diarias.\n4. Competiciones de Clanes y SpeedPoints.\n5. Minijuegos Integrados (Penales 8-Bit, Lotería, etc.).\n6. Consola de DJ y Transmisiones de Voz en Vivo.\n7. Chat de Mensajería Directa Encriptado.\n8. Canjes de Placas Exclusivas y Regalos en Habbo.\n9. Centro de Tickets de Soporte Directo.\n10. Integración Avanzada con Discord y Bot de Radio.\n\nComenta cuál es la que más esperas.')
              `, [threadId1, threadId2]);
              console.log("[Seed] Default forum threads and posts inserted successfully");
            }
          }

          // Seed default rooms
          const roomsCheck = await client.query("SELECT COUNT(*) FROM hspeed_rooms");
          if (parseInt(roomsCheck.rows[0].count) === 0) {
            await client.query(`
              INSERT INTO hspeed_rooms (name, description, room_code, owner_habbo, hotel, category, current_visitors, is_active, featured)
              VALUES
              ('[HS] Central de HabboSpeed', 'La sala oficial de HabboSpeed. Música en vivo, eventos y convivencia con la comunidad. ¡Siempre hay algo que hacer!', 'r-hs001', 'HabboSpeed', 'es', 'oficial', 24, true, true),
              ('[HS] Radio Lounge', 'Sala temática de la radio. Escucha a nuestros DJs en vivo mientras convives con fans. Decoración premium estilo club nocturno.', 'r-hs002', 'DJ_Speedy', 'es', 'musica', 15, true, true),
              ('[HS] VIP Zone', 'Sala exclusiva para miembros VIP de HabboSpeed. Acceso restringido a usuarios con membresía Gold o Diamond activa.', 'r-hs003', 'AdminHS', 'es', 'vip', 8, true, false),
              ('[HS] Fan Festival 2026', 'Sala especial del Habbo Fan Festival 2026. Eventos, concursos y transmisiones especiales durante todo el mundial.', 'r-hs004', 'HabboSpeed', 'es', 'evento', 37, true, true)
            `);
            console.log("[Seed] Default rooms inserted successfully");
          }
        } finally {
          client.release();
        }
      }
    } catch (e: any) {
      console.error("[Seed] Error during seeding:", e.message || e);
    }
  })();

  // ============ AUTH ============
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, displayName, habboUsername, verificationCode } = req.body;

      if (!habboUsername || !verificationCode) {
        return res.status(400).json({ message: "El usuario de Habbo y el código de verificación son obligatorios para evitar robos de identidad." });
      }

      // Verify the user in Habbo API
      try {
        const r = await fetch(`https://www.habbo.es/api/public/users?name=${encodeURIComponent(habboUsername)}`, {
          headers: { "User-Agent": "HabboSpeed/1.0" }
        });
        if (!r.ok) {
          return res.status(400).json({ message: `El usuario de Habbo '${habboUsername}' no fue encontrado en Habbo.es.` });
        }
        const profile = await r.json();
        
        const mottoClean = (profile.motto || "").trim().toUpperCase();
        const codeClean = verificationCode.trim().toUpperCase();
        
        if (mottoClean !== codeClean) {
          return res.status(400).json({ 
            message: `Verificación fallida. Cambia tu misión en Habbo a '${codeClean}'. Tu misión actual detectada es: '${profile.motto || "[Vacío]"}'` 
          });
        }
      } catch (err: any) {
        return res.status(400).json({ message: "Error de conexión al verificar tu cuenta con la API oficial de Habbo. Inténtalo de nuevo." });
      }

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
    } catch (e: any) { res.status(500).json({ message: e.message }); }
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
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/auth/me", authMiddleware, async (req: any, res) => {
    const user = await storage.getUser(req.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ ...user, passwordHash: undefined });
  });

  // ============ PROFILE WALL / MURO ============
  app.get("/api/wall/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    if (!Number.isFinite(userId)) return res.status(400).json({ message: "ID inválido" });

    const profileUser = await storage.getUser(userId);
    if (!profileUser || !profileUser.approved) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const messages = await storage.getWallMessages(userId);
    res.json(messages);
  });

  app.post("/api/wall/:userId", authMiddleware, async (req: any, res) => {
    const profileUserId = parseInt(req.params.userId, 10);
    if (!Number.isFinite(profileUserId)) return res.status(400).json({ message: "ID inválido" });

    const profileUser = await storage.getUser(profileUserId);
    if (!profileUser || !profileUser.approved) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { message } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Mensaje requerido" });
    }

    const author = await storage.getUser(req.userId);
    if (!author) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const wallMsg = await storage.createWallMessage({
      profileUserId,
      authorId: author.id,
      authorName: author.displayName,
      message: message.trim(),
    });

    if (wallMsg.authorId !== profileUserId) {
      await storage.createNotification({
        userId: profileUserId,
        type: "wall",
        title: "Nuevo mensaje en tu muro",
        message: `${wallMsg.authorName} te dejó un mensaje en tu muro`,
        icon: "message-circle",
      });
    }

    res.status(201).json(wallMsg);
  });

  app.delete("/api/wall/:id", authMiddleware, async (req: any, res) => {
    const messageId = parseInt(req.params.id, 10);
    if (!Number.isFinite(messageId)) return res.status(400).json({ message: "ID inválido" });

    const user = await storage.getUser(req.userId);
    if (!user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const wallMsg = await storage.getWallMessageById(messageId);
    if (!wallMsg) {
      return res.status(404).json({ message: "Mensaje no encontrado" });
    }

    if (wallMsg.authorId !== user.id && wallMsg.profileUserId !== user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await storage.deleteWallMessage(wallMsg.id);
    res.json({ message: "Eliminado" });
  });

  // ============ NEWS ============
  app.get("/api/news", async (_req, res) => { res.json(await storage.getAllNews()); });
  app.get("/api/news/:id", async (req, res) => {
    const item = await storage.getNewsById(parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: "Noticia no encontrada" });
    res.json(item);
  });
  app.post("/api/news", adminMiddleware, async (req: any, res) => {
    res.status(201).json(await storage.createNews({ ...req.body, authorId: req.user.id }));
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
  app.get("/api/events", async (_req, res) => { res.json(await storage.getAllEvents()); });
  app.get("/api/events/:id", async (req, res) => {
    const item = await storage.getEventById(parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: "Evento no encontrado" });
    res.json(item);
  });
  app.post("/api/events", adminMiddleware, async (req, res) => { res.status(201).json(await storage.createEvent(req.body)); });
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
  app.get("/api/schedule", async (_req, res) => { res.json(await storage.getAllSchedule()); });
  app.post("/api/schedule", adminMiddleware, async (req, res) => { res.status(201).json(await storage.createScheduleItem(req.body)); });
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
    const comment = await storage.createComment({ ...req.body, authorId: user.id, authorName: user.displayName });
    res.status(201).json({ ...comment, habboUsername: user.habboUsername || null });
  });
  app.delete("/api/comments/:id", adminMiddleware, async (req, res) => {
    await storage.deleteComment(parseInt(req.params.id));
    res.json({ message: "Eliminado" });
  });

  // ============ POLLS ============
  app.get("/api/polls", async (_req, res) => { res.json(await storage.getAllPolls()); });
  app.post("/api/polls", adminMiddleware, async (req, res) => { res.status(201).json(await storage.createPoll(req.body)); });
  app.put("/api/polls/:id", adminMiddleware, async (req, res) => {
    const item = await storage.updatePoll(parseInt(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Encuesta no encontrada" });
    res.json(item);
  });

  // ============ CONFIG ============
  app.get("/api/config", async (_req, res) => { res.json(await storage.getConfig()); });
  app.put("/api/config", adminMiddleware, async (req, res) => { res.json(await storage.updateConfig(req.body)); });

  // ============ FORUM ============
  app.get("/api/forum/categories", async (_req, res) => { res.json(await storage.getAllForumCategories()); });
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
    const thread = await storage.createThread({ ...req.body, authorId: user.id, authorName: user.displayName, isPinned: false, isLocked: false, views: 0 });
    if (req.body.content) await storage.createPost({ threadId: thread.id, authorId: user.id, authorName: user.displayName, content: req.body.content });
    res.status(201).json(thread);
  });
  app.get("/api/forum/threads/:id/posts", async (req, res) => {
    res.json(await storage.getPostsByThread(parseInt(req.params.id)));
  });
  app.post("/api/forum/posts", authMiddleware, async (req: any, res) => {
    const user = await storage.getUser(req.userId);
    if (!user) return res.status(401).json({ message: "No autorizado" });
    res.status(201).json(await storage.createPost({ ...req.body, authorId: user.id, authorName: user.displayName }));
  });

  // ============ MARKETPLACE ============
  app.get("/api/marketplace", async (_req, res) => { res.json(await storage.getAllMarketplaceItems()); });
  app.get("/api/marketplace/:className", async (req, res) => {
    const item = await storage.getMarketplaceItemByClass(req.params.className);
    if (!item) return res.status(404).json({ message: "Item no encontrado" });
    res.json(item);
  });

  // ============ BADGES ============
  app.get("/api/badges", async (req, res) => {
    const query = req.query.q as string;
    res.json(query ? await storage.searchBadges(query) : await storage.getAllBadges());
  });

  // ============ HABBO API PROXY ============
  const HABBO_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  };

  function getHabboHost(hotel: string) {
    const safeHotel = (hotel || "es").trim().toLowerCase();
    return `https://www.habbo.${safeHotel}`;
  }

  async function resolveHabboUserId(username: string, hotel: string = "es"): Promise<string | null> {
    try {
      const host = getHabboHost(hotel);
      const r = await fetch(`${host}/api/public/users?name=${encodeURIComponent(username)}`, { headers: HABBO_HEADERS });
      if (!r.ok) return null;
      const data = await r.json() as any;
      return data.uniqueId || null;
    } catch { return null; }
  }

  // User by name (básico: online, motto, level, etc.)
  app.get("/api/habbo/user/:username", async (req, res) => {
    const hotel = (req.query.hotel as string) || "es";
    try {
      const host = getHabboHost(hotel);
      const r = await fetch(`${host}/api/public/users?name=${encodeURIComponent(req.params.username)}`, { headers: HABBO_HEADERS });
      if (!r.ok) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error al consultar Habbo API" }); }
  });

  // Rooms del usuario (para ProfilePage)
  app.get("/api/habbo/rooms/:username", async (req, res) => {
    const hotel = (req.query.hotel as string) || "es";
    try {
      const uniqueId = await resolveHabboUserId(req.params.username, hotel);
      if (!uniqueId) return res.json([]);
      const host = getHabboHost(hotel);
      const r = await fetch(`${host}/api/public/users/${encodeURIComponent(uniqueId)}/rooms`, { headers: HABBO_HEADERS });
      if (!r.ok) return res.json([]);
      res.json(await r.json());
    } catch { res.json([]); }
  });

  // Grupos del usuario (para ProfilePage)
  app.get("/api/habbo/groups/:username", async (req, res) => {
    const hotel = (req.query.hotel as string) || "es";
    try {
      const uniqueId = await resolveHabboUserId(req.params.username, hotel);
      if (!uniqueId) return res.json([]);
      const host = getHabboHost(hotel);
      const r = await fetch(`${host}/api/public/users/${encodeURIComponent(uniqueId)}/groups`, { headers: HABBO_HEADERS });
      if (!r.ok) return res.json([]);
      res.json(await r.json());
    } catch { res.json([]); }
  });

  // Origins
  app.get("/api/habbo/origins/user/:username", async (req, res) => {
    const hotel = (req.query.hotel as string) || "es";
    try {
      const host = `https://origins.habbo.${hotel}`;
      const r = await fetch(`${host}/api/public/users?name=${encodeURIComponent(req.params.username)}`, { headers: HABBO_HEADERS });
      if (!r.ok) return res.status(404).json({ message: "Usuario no encontrado en Origins" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error al consultar Habbo Origins API" }); }
  });

  app.get("/api/habbo/badges/:hotel", async (req, res) => {
    const hotel = req.params.hotel || "es";
    const FALLBACK_BADGES = [
      { code: "ADM", name: "Administrador", description: "Placa exclusiva de administrador", url_habbo: "https://images.habbo.com/c_images/album1584/ADM.gif" },
      { code: "COM", name: "Staff HabboSpeed", description: "Staff de HabboSpeed", url_habbo: "https://images.habbo.com/c_images/album1584/COM.gif" },
      { code: "Z53", name: "Placa de Oro", description: "Placa de oro brillante", url_habbo: "https://images.habbo.com/c_images/album1584/Z53.gif" },
      { code: "ES992", name: "Micrófono de Oro", description: "DJs y Locutores estrella", url_habbo: "https://images.habbo.com/c_images/album1584/ES992.gif" },
      { code: "UK084", name: "Radio Activa", description: "Oyente súper activo de la radio", url_habbo: "https://images.habbo.com/c_images/album1584/UK084.gif" },
      { code: "IT128", name: "Trofeo de Platino", description: "Ganador de torneos y concursos", url_habbo: "https://images.habbo.com/c_images/album1584/IT128.gif" },
      { code: "FI145", name: "Placa Aqua", description: "Edición especial de Placa Aqua", url_habbo: "https://images.habbo.com/c_images/album1584/FI145.gif" },
      { code: "FR185", name: "Estrella Neón", description: "Tema Premium Nubis de HabboSpeed", url_habbo: "https://images.habbo.com/c_images/album1584/FR185.gif" },
      { code: "NL453", name: "Habbo Speed Fan", description: "Miembro verificado de la Fansite", url_habbo: "https://images.habbo.com/c_images/album1584/NL453.gif" },
      { code: "DE636", name: "Corona de Laureles", description: "Mención honorífica", url_habbo: "https://images.habbo.com/c_images/album1584/DE636.gif" },
      { code: "HSC01", name: "Copa de Campeones", description: "Speed Cup Winner", url_habbo: "https://images.habbo.com/c_images/album1584/HSC01.gif" },
      { code: "ES49C", name: "SpeedPoints Collector", description: "Coleccionista de SpeedPoints", url_habbo: "https://images.habbo.com/c_images/album1584/ES49C.gif" }
    ];

    try {
      const limit = req.query.limit || "20";
      const offset = req.query.offset || "0";
      const term = req.query.term || "";
      const url = `https://www.habboassets.com/api/v1/badges?hotel=${hotel}&limit=${limit}&offset=${offset}&term=${encodeURIComponent(term as string)}`;
      const r = await fetch(url, { headers: HABBO_HEADERS });
      if (!r.ok) return res.json(FALLBACK_BADGES);
      res.json(await r.json());
    } catch {
      res.json(FALLBACK_BADGES);
    }
  });

  // Helper for deterministic hashing
  function getDeterministicHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // Deterministic Marketplace Data generator
  function enrichFurniWithMarketData(classname: string, name: string) {
    const cleanClass = (classname || "").toLowerCase();
    const cleanName = (name || "").toLowerCase();
    let basePrice = 0;
    
    if (cleanClass.includes("throne") || cleanName.includes("throne") || cleanClass.includes("trono")) {
      basePrice = 4500;
    } else if (cleanClass.includes("dragon") || cleanName.includes("dragon") || cleanClass.includes("dragón")) {
      basePrice = 1800;
    } else if (cleanClass.includes("egg") || cleanName.includes("huevo")) {
      basePrice = 3000;
    } else if (cleanClass.includes("crown") || cleanClass.includes("corona") || cleanClass.includes("tiara")) {
      basePrice = 6500;
    } else if (cleanClass.includes("pillar") || cleanClass.includes("pilar")) {
      basePrice = 950;
    } else if (cleanClass.includes("laser") || cleanClass.includes("láser")) {
      basePrice = 320;
    } else if (cleanClass.includes("fountain") || cleanClass.includes("fuente")) {
      basePrice = 750;
    } else if (cleanClass.includes("gold_bar") || cleanClass.includes("barradeoro") || cleanClass.includes("lingote")) {
      basePrice = 500;
    } else if (cleanClass.includes("ltd")) {
      basePrice = 1200;
    } else if (cleanClass.includes("rare") || cleanClass.includes("raro")) {
      basePrice = 280;
    } else if (cleanClass.includes("sofa") || cleanClass.includes("sillón") || cleanClass.includes("club")) {
      basePrice = 25;
    } else if (cleanClass.includes("pillow") || cleanClass.includes("almohada")) {
      basePrice = 18;
    } else {
      const hash = getDeterministicHash(cleanClass || "default");
      basePrice = 3 + (hash % 93);
    }

    const hashSeed = getDeterministicHash(cleanClass || "default");
    const history: any[] = [];
    const days = 15;
    let currentPrice = basePrice;
    for (let i = days; i >= 0; i--) {
      const daySeed = hashSeed + i;
      const pct = ((daySeed % 17) - 8) / 100; 
      currentPrice = Math.max(1, Math.round(currentPrice * (1 + pct)));
      
      const quantity = basePrice > 1000 
        ? 1 + (daySeed % 3)
        : basePrice > 100
        ? 2 + (daySeed % 8)
        : 10 + (daySeed % 40);
        
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      history.push({
        price: currentPrice,
        amount: quantity,
        date: dateStr
      });
    }

    const averagePrice = Math.round(history.reduce((sum, item) => sum + item.price, 0) / history.length);

    return {
      averagePrice,
      history
    };
  }

  const CLASSIC_RARES = [
    { name: "Trono de Habbo", classname: "throne", revision: 231, iconUrl: "https://images.habbo.com/dcr/hof_furni/231/throne_icon.png" },
    { name: "Lámpara Dragón Negro", classname: "rare_dragonlamp", revision: 141, iconUrl: "https://images.habbo.com/dcr/hof_furni/141/rare_dragonlamp_icon.png" },
    { name: "Huevo de Dinosaurio", classname: "dino_egg", revision: 251, iconUrl: "https://images.habbo.com/dcr/hof_furni/251/dino_egg_icon.png" },
    { name: "Sofá Club Habbo (Sillón HC)", classname: "club_sofa", revision: 12, iconUrl: "https://images.habbo.com/dcr/hof_furni/12/club_sofa_icon.png" },
    { name: "Ventilador Láser Amarillo", classname: "laser_light", revision: 18, iconUrl: "https://images.habbo.com/dcr/hof_furni/18/laser_light_icon.png" },
    { name: "Lingote de Oro (50c)", classname: "gold_bar", revision: 45, iconUrl: "https://images.habbo.com/dcr/hof_furni/45/gold_bar_icon.png" },
    { name: "Heladera Roja", classname: "rare_icecream", revision: 5, iconUrl: "https://images.habbo.com/dcr/hof_furni/5/rare_icecream_icon.png" },
    { name: "Pilar Dórico Azul", classname: "pillar", revision: 8, iconUrl: "https://images.habbo.com/dcr/hof_furni/8/pillar_icon.png" },
    { name: "Corona Imperial de Diamantes", classname: "crown", revision: 99, iconUrl: "https://images.habbo.com/dcr/hof_furni/99/crown_icon.png" },
    { name: "Huevo de Oro", classname: "gold_egg", revision: 251, iconUrl: "https://images.habbo.com/dcr/hof_furni/251/gold_egg_icon.png" },
    { name: "Fontana de Oro", classname: "fountain", revision: 15, iconUrl: "https://images.habbo.com/dcr/hof_furni/15/fountain_icon.png" },
    { name: "Almohada Celeste", classname: "pillow", revision: 22, iconUrl: "https://images.habbo.com/dcr/hof_furni/22/pillow_icon.png" },
    { name: "Mamut de Oro", classname: "mammoth", revision: 40, iconUrl: "https://images.habbo.com/dcr/hof_furni/40/mammoth_icon.png" },
    { name: "Lámpara Dragón Verde", classname: "rare_dragonlamp_green", revision: 141, iconUrl: "https://images.habbo.com/dcr/hof_furni/141/rare_dragonlamp_green_icon.png" },
    { name: "Lámpara Dragón Celeste", classname: "rare_dragonlamp_blue", revision: 141, iconUrl: "https://images.habbo.com/dcr/hof_furni/141/rare_dragonlamp_blue_icon.png" },
    { name: "Puerta Espacial", classname: "scifi_port", revision: 35, iconUrl: "https://images.habbo.com/dcr/hof_furni/35/scifi_port_icon.png" },
    { name: "Holo Pod Azul", classname: "holo_pod", revision: 28, iconUrl: "https://images.habbo.com/dcr/hof_furni/28/holo_pod_icon.png" },
    { name: "Máquina de Humo Roja", classname: "smoke_machine", revision: 12, iconUrl: "https://images.habbo.com/dcr/hof_furni/12/smoke_machine_icon.png" },
    { name: "Estatua de Frank", classname: "frank_statue", revision: 50, iconUrl: "https://images.habbo.com/dcr/hof_furni/50/frank_statue_icon.png" },
    { name: "Lámpara de Lava", classname: "lava_lamp", revision: 19, iconUrl: "https://images.habbo.com/dcr/hof_furni/19/lava_lamp_icon.png" },
    { name: "Trofeo Copa de Oro", classname: "trophy_gold", revision: 8, iconUrl: "https://images.habbo.com/dcr/hof_furni/8/trophy_gold_icon.png" },
    { name: "Sofá Plasto Azul", classname: "plasto_sofa", revision: 5, iconUrl: "https://images.habbo.com/dcr/hof_furni/5/plasto_sofa_icon.png" },
    { name: "Heladera Verde", classname: "rare_icecream_green", revision: 5, iconUrl: "https://images.habbo.com/dcr/hof_furni/5/rare_icecream_green_icon.png" },
    { name: "Pilar de Fuego", classname: "pillar_fire", revision: 8, iconUrl: "https://images.habbo.com/dcr/hof_furni/8/pillar_fire_icon.png" },
    { name: "Puerta Láser Roja", classname: "laser_gate_red", revision: 18, iconUrl: "https://images.habbo.com/dcr/hof_furni/18/laser_gate_red_icon.png" },
    { name: "Puerta Láser Azul", classname: "laser_gate_blue", revision: 18, iconUrl: "https://images.habbo.com/dcr/hof_furni/18/laser_gate_blue_icon.png" },
    { name: "Silla Plasto Roja", classname: "plasto_chair", revision: 5, iconUrl: "https://images.habbo.com/dcr/hof_furni/5/plasto_chair_icon.png" },
    { name: "Planta Yucca", classname: "yucca", revision: 6, iconUrl: "https://images.habbo.com/dcr/hof_furni/6/yucca_icon.png" },
    { name: "Cactus Gigante", classname: "cactus", revision: 7, iconUrl: "https://images.habbo.com/dcr/hof_furni/7/cactus_icon.png" },
    { name: "Alfombra Roja", classname: "red_rug", revision: 4, iconUrl: "https://images.habbo.com/dcr/hof_furni/4/red_rug_icon.png" },
    { name: "Espejo Barroco", classname: "baroque_mirror", revision: 11, iconUrl: "https://images.habbo.com/dcr/hof_furni/11/baroque_mirror_icon.png" },
    { name: "Ventana de Catedral", classname: "cathedral_window", revision: 25, iconUrl: "https://images.habbo.com/dcr/hof_furni/25/cathedral_window_icon.png" },
    { name: "Estatua de León", classname: "lion_statue", revision: 14, iconUrl: "https://images.habbo.com/dcr/hof_furni/14/lion_statue_icon.png" }
  ];

  app.get("/api/habbo/marketplace/:item", async (req, res) => {
    const itemQuery = req.params.item;
    const hotel = (req.query.hotel || "es") as string;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1800); // 1.8s timeout
      
      const r = await fetch(`https://habboapi.site/api/market/history?classname=${encodeURIComponent(itemQuery)}&hotel=${hotel}`, {
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (r.ok) {
        const data = await r.json() as any;
        if (data && (data.averagePrice || data.history)) {
          const normalized = {
            ...data,
            name: data.name || itemQuery,
            classname: data.classname || itemQuery,
            ClassName: data.classname || data.ClassName || itemQuery,
            className: data.classname || data.className || itemQuery,
            FurniName: data.name || data.FurniName || itemQuery,
            itemName: data.name || data.itemName || itemQuery,
            Revision: data.revision || data.Revision || 0,
            revision: data.revision || 0,
            marketData: data.marketData || {
              averagePrice: data.averagePrice || data.avgPrice || 0,
              history: data.history || []
            }
          };
          return res.json(normalized);
        }
      }
    } catch (err) {
      console.log(`[Marketplace Proxy] External API offline or timed out, generating deterministic fallback for ${itemQuery}`);
    }

    const cleanClassname = itemQuery.toLowerCase().replace(/_icon$/i, "");
    const displayName = cleanClassname.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const mData = enrichFurniWithMarketData(cleanClassname, displayName);
    
    const classic = CLASSIC_RARES.find(c => c.classname === cleanClassname);
    const revision = classic ? classic.revision : 0;
    
    const enrichedItem = {
      name: displayName,
      classname: cleanClassname,
      revision: revision,
      iconUrl: `https://images.habbo.com/dcr/hof_furni/${revision}/${cleanClassname}_icon.png`,
      FurniName: displayName,
      itemName: displayName,
      ClassName: cleanClassname,
      className: cleanClassname,
      Revision: revision,
      avgPrice: mData.averagePrice,
      avg_price: mData.averagePrice,
      marketData: mData
    };
    
    res.json(enrichedItem);
  });

  app.get("/api/habbo/furni", async (req, res) => {
    try {
      const limitValue = parseInt(req.query.limit as string, 10);
      const limit = Number.isFinite(limitValue) ? limitValue : 0;
      const hotel = (req.query.hotel as string) || "es";
      
      let items: any[] = [];
      try {
        const r = await fetch(`${getHabboHost(hotel)}/gamedata/furnidata_json/0`, { headers: HABBO_HEADERS });
        if (r.ok) {
          const data = await r.json() as any;
          items = data?.roomitemtypes?.furnitype || [];
        }
      } catch (err) {
        console.error("[Furni API] Error fetching furnidata from Habbo, using classic rares only.");
      }

      const mappedOfficial = items.map((f: any) => {
        const cleanName = (f.name || f.classname || "").replace(/_/g, " ").replace(/ name$/i, "");
        const mData = enrichFurniWithMarketData(f.classname, cleanName);
        return {
          name: cleanName,
          classname: f.classname,
          revision: f.revision,
          iconUrl: `https://images.habbo.com/dcr/hof_furni/${f.revision}/${f.classname}_icon.png`,
          FurniName: cleanName,
          itemName: cleanName,
          ClassName: f.classname,
          className: f.classname,
          Revision: f.revision,
          avgPrice: mData.averagePrice,
          avg_price: mData.averagePrice,
          marketData: mData
        };
      });

      const mappedClassic = CLASSIC_RARES.map((r: any) => {
        const mData = enrichFurniWithMarketData(r.classname, r.name);
        return {
          name: r.name,
          classname: r.classname,
          revision: r.revision,
          iconUrl: r.iconUrl,
          FurniName: r.name,
          itemName: r.name,
          ClassName: r.classname,
          className: r.classname,
          Revision: r.revision,
          avgPrice: mData.averagePrice,
          avg_price: mData.averagePrice,
          marketData: mData
        };
      });

      const classicClassnames = new Set(mappedClassic.map(c => c.classname));
      const filteredOfficial = mappedOfficial.filter(o => !classicClassnames.has(o.classname));

      const officialToReturn = limit > 0 ? filteredOfficial.slice(-limit).reverse() : [...filteredOfficial].reverse();
      const combined = [...mappedClassic, ...officialToReturn];
      
      res.json(combined);
    } catch { 
      const fallbackList = CLASSIC_RARES.map((r: any) => {
        const mData = enrichFurniWithMarketData(r.classname, r.name);
        return {
          name: r.name,
          classname: r.classname,
          revision: r.revision,
          iconUrl: r.iconUrl,
          FurniName: r.name,
          itemName: r.name,
          ClassName: r.classname,
          className: r.classname,
          Revision: r.revision,
          avgPrice: mData.averagePrice,
          avg_price: mData.averagePrice,
          marketData: mData
        };
      });
      res.json(fallbackList); 
    }
  });

  // Figure parts / clothing catalog (local fallback)
  app.get("/api/habbo/figureparts", async (req, res) => {
    try {
      const fp = await import("./figureparts.json");
      res.json((fp as any).default || fp);
    } catch (e) {
      res.status(500).json({ message: "No se pudo cargar el catálogo de prendas" });
    }
  });

  // Proxy image endpoint to avoid CORS/ORB blocking for external images
  app.get("/api/habbo/proxy-image", async (req, res) => {
    try {
      const urlParam = req.query.u as string | undefined;
      const figure = req.query.figure as string | undefined;
      const hotel = (req.query.hotel as string) || "es";
      const size = (req.query.size as string) || "b";

      // Build source URL: either provided 'u' or constructed from figure
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

      // allowlist hosts for user-provided urls
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

      // Cache settings
      let useCache = true;
      let cacheDir = "";
      let indexFile = "";
      let maxBytes = 209715200;
      let ttlSeconds = 60 * 60 * 24;
      let index: Record<string, { file: string; size: number; atimeMs: number; mtimeMs: number }> = {};
      let hash = "";
      let cacheFile = "";

      try {
        cacheDir = path.join(process.cwd(), "server", ".cache", "images");
        await fsp.mkdir(cacheDir, { recursive: true });
        indexFile = path.join(cacheDir, "index.json");
        maxBytes = parseInt(process.env.PROXY_CACHE_MAX_BYTES || "209715200", 10);
        ttlSeconds = parseInt(process.env.PROXY_CACHE_TTL_SECONDS || `${60 * 60 * 24}`, 10);

        const raw = await fsp.readFile(indexFile, "utf-8").catch(() => "{}");
        index = JSON.parse(raw || "{}");
        const keySource = `src:${sourceUrl}`;
        hash = crypto.createHash("sha1").update(keySource).digest("hex");
        cacheFile = path.join(cacheDir, hash);
      } catch (e) {
        useCache = false;
        ttlSeconds = 60 * 60 * 24;
      }

      const saveIndex = async () => {
        if (!useCache) return;
        try { await fsp.writeFile(indexFile, JSON.stringify(index), "utf-8"); } catch { /* ignore */ }
      };

      const totalCacheBytes = async () => {
        if (!useCache) return 0;
        return Object.values(index).reduce((s, v) => s + (v.size || 0), 0);
      };

      const evictIfNeeded = async () => {
        if (!useCache) return;
        try {
          let total = await totalCacheBytes();
          if (total <= maxBytes) return;
          const entries = Object.entries(index).sort((a, b) => (a[1].atimeMs || 0) - (b[1].atimeMs || 0));
          for (const [k, v] of entries) {
            try { await fsp.unlink(path.join(cacheDir, v.file)).catch(() => null); } catch {}
            total -= v.size || 0;
            delete index[k];
            if (total <= maxBytes) break;
          }
          await saveIndex();
        } catch (e) {}
      };

      // Serve from cache if valid
      if (useCache) {
        const meta = index[hash];
        if (meta) {
          const now = Date.now();
          if ((now - (meta.mtimeMs || 0)) / 1000 < ttlSeconds) {
            try {
              const buf = await fsp.readFile(path.join(cacheDir, meta.file));
              meta.atimeMs = Date.now();
              await saveIndex();
              res.setHeader("Content-Type", "image/png");
              res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}`);
              return res.send(buf);
            } catch (e) {
              // fallthrough to fetch
            }
          }
        }
      }

      // Fetch upstream using standard Chrome User-Agent to bypass Cloudflare
      const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      const upstream = await fetch(sourceUrl, { headers: { "User-Agent": userAgent } });
      if (!upstream.ok) return res.status(502).send("bad upstream");
      const contentType = upstream.headers.get("content-type") || "image/png";
      const buffer = Buffer.from(await upstream.arrayBuffer());

      // Write to cache file and update index
      if (useCache) {
        try {
          await fsp.writeFile(cacheFile, buffer).catch(() => null);
          const stat = await fsp.stat(cacheFile).catch(() => null);
          const size = stat?.size || buffer.length || 0;
          index[hash] = { file: path.basename(cacheFile), size, atimeMs: Date.now(), mtimeMs: stat?.mtimeMs || Date.now() };
          await saveIndex();
          await evictIfNeeded();
        } catch (e) {}
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}`);
      res.send(buffer);
    } catch (e) {
      console.error("/api/habbo/proxy-image error:", e);
      res.status(500).send("proxy error");
    }
  });

  // Extended Habbo API routes
  app.get("/api/habbo/room/:roomId", async (req, res) => {
    try {
      const r = await fetch(`https://www.habbo.es/api/public/rooms/${encodeURIComponent(req.params.roomId)}`, { headers: HABBO_HEADERS });
      if (!r.ok) return res.status(r.status).json({ message: "Error" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error" }); }
  });

  app.get("/api/habbo/user/:username/profile", async (req, res) => {
    try {
      const uid = await resolveHabboUserId(req.params.username);
      if (!uid) return res.status(404).json({ message: "Error" });
      const r = await fetch(`https://www.habbo.es/api/public/users/${encodeURIComponent(uid)}/profile`, { headers: HABBO_HEADERS });
      if (!r.ok) return res.status(r.status).json({ message: "Error" });
      res.json({ uniqueId: uid, ...(await r.json() as any) });
    } catch { res.status(500).json({ message: "Error" }); }
  });

  app.get("/api/habbo/user/:username/friends", async (req, res) => {
    try {
      const uid = await resolveHabboUserId(req.params.username);
      if (!uid) return res.status(404).json({ message: "Error" });
      const r = await fetch(`https://www.habbo.es/api/public/users/${encodeURIComponent(uid)}/friends`, { headers: HABBO_HEADERS });
      res.json(r.ok ? await r.json() : []);
    } catch { res.json([]); }
  });

  app.get("/api/habbo/user/:username/rooms", async (req, res) => {
    try {
      const uid = await resolveHabboUserId(req.params.username);
      if (!uid) return res.json([]);
      const r = await fetch(`https://www.habbo.es/api/public/users/${encodeURIComponent(uid)}/rooms`, { headers: HABBO_HEADERS });
      res.json(r.ok ? await r.json() : []);
    } catch { res.json([]); }
  });

  app.get("/api/habbo/user/:username/badges", async (req, res) => {
    try {
      const uid = await resolveHabboUserId(req.params.username);
      if (!uid) return res.json([]);
      const r = await fetch(`https://www.habbo.es/api/public/users/${encodeURIComponent(uid)}/badges`, { headers: HABBO_HEADERS });
      res.json(r.ok ? await r.json() : []);
    } catch { res.json([]); }
  });

  app.get("/api/habbo/user/:username/groups", async (req, res) => {
    try {
      const uid = await resolveHabboUserId(req.params.username);
      if (!uid) return res.json([]);
      const r = await fetch(`https://www.habbo.es/api/public/users/${encodeURIComponent(uid)}/groups`, { headers: HABBO_HEADERS });
      res.json(r.ok ? await r.json() : []);
    } catch { res.json([]); }
  });

  app.get("/api/habbo/group/:id", async (req, res) => {
    try {
      const r = await fetch(`https://www.habbo.es/api/public/groups/${encodeURIComponent(req.params.id)}`, { headers: HABBO_HEADERS });
      if (!r.ok) return res.status(r.status).json({ message: "Error" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error" }); }
  });

  app.get("/api/habbo/group/:id/members", async (req, res) => {
    try {
      const r = await fetch(`https://www.habbo.es/api/public/groups/${encodeURIComponent(req.params.id)}/members`, { headers: HABBO_HEADERS });
      if (!r.ok) return res.status(r.status).json({ message: "Error" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error" }); }
  });

  app.get("/api/habbo/hotlooks", async (_req, res) => {
    const fallbackHotLooks = [
      { name: "Neon Rider", gender: "M", figure: "hd-180-1.hr-828-61.ch-3030-110.lg-270-82.sh-290-80.ha-1014-0" },
      { name: "Aqua Queen", gender: "F", figure: "hd-600-1.hr-890-61.ch-232-92.lg-275-92.sh-295-80.ha-1012-110" },
      { name: "Chrome DJ", gender: "M", figure: "hd-180-1.hr-170-61.ch-220-110.lg-285-82.sh-3089-80.ha-1001-0" },
      { name: "Pixel Nomad", gender: "M", figure: "hd-180-1.hr-185-61.ch-230-82.lg-281-110.sh-300-80" },
      { name: "Ruby Star", gender: "F", figure: "hd-600-1.hr-175-61.ch-225-66.lg-270-92.sh-295-62.ha-1012-62" },
      { name: "Night Wave", gender: "M", figure: "hd-180-1.hr-680-61.ch-804-1341.lg-285-82.sh-3089-110" },
      { name: "Golden Crown", gender: "F", figure: "hd-600-1.hr-165-61.ch-232-82.lg-275-110.sh-305-62.ha-1014-0" },
      { name: "Street Funk", gender: "M", figure: "hd-180-1.hr-177-61.ch-255-92.lg-290-82.sh-290-80.ha-1002-0" }
    ];

    try {
      const r = await fetch("https://www.habbo.es/api/public/lists/hotlooks", { headers: HABBO_HEADERS });
      if (!r.ok) return res.json(fallbackHotLooks);
      const data = await r.json();
      const list = Array.isArray(data) ? data : (data?.hotLooks || data?.hotlooks || []);
      res.json(list.length ? list : fallbackHotLooks);
    } catch {
      res.json(fallbackHotLooks);
    }
  });

  app.get("/api/habbo/badge-owners/:badgeCode", async (req, res) => {
    try {
      const r = await fetch(`https://www.habbo.es/api/public/badge/owners/${encodeURIComponent(req.params.badgeCode)}`, { headers: HABBO_HEADERS });
      if (!r.ok) return res.status(r.status).json({ message: "Error" });
      res.json(await r.json());
    } catch { res.status(500).json({ message: "Error" }); }
  });

  app.get("/api/habbo/achievements", async (_req, res) => {
    try {
      const r = await fetch("https://www.habbo.es/api/public/achievements", { headers: HABBO_HEADERS });
      res.json(r.ok ? await r.json() : []);
    } catch { res.json([]); }
  });

  // ============ REQUESTS ============
  app.get("/api/requests", async (_req, res) => { res.json(await storage.getAllRequests()); });
  app.post("/api/requests", async (req, res) => { res.status(201).json(await storage.createRequest(req.body)); });
  app.delete("/api/requests/:id", adminMiddleware, async (req, res) => {
    await storage.deleteRequest(parseInt(req.params.id));
    res.json({ message: "Eliminado" });
  });

  // ============ TEAM ============
  app.get("/api/team", async (_req, res) => { res.json(await storage.getAllTeamMembers()); });
  app.post("/api/team", adminMiddleware, async (req, res) => { res.status(201).json(await storage.createTeamMember(req.body)); });
  app.put("/api/team/:id", adminMiddleware, async (req, res) => {
    const item = await storage.updateTeamMember(parseInt(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Miembro no encontrado" });
    res.json(item);
  });
  app.delete("/api/team/:id", adminMiddleware, async (req, res) => {
    await storage.deleteTeamMember(parseInt(req.params.id));
    res.json({ message: "Eliminado" });
  });

  // ============ USERS (Admin + self-update) ============
  app.get("/api/users", adminMiddleware, async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map((u: any) => ({ ...u, passwordHash: undefined })));
  });

  // ============ ADMIN: Cache management endpoints ============
  app.post('/api/admin/cache/clear', adminMiddleware, async (_req, res) => {
    try {
      const cacheDir = path.join(process.cwd(), 'server', '.cache', 'images');
      const indexFile = path.join(cacheDir, 'index.json');
      // remove files and index
      const idxRaw = await fsp.readFile(indexFile, 'utf-8').catch(() => '{}');
      const index = JSON.parse(idxRaw || '{}');
      for (const k of Object.keys(index)) {
        try { await fsp.unlink(path.join(cacheDir, index[k].file)).catch(() => null); } catch {}
      }
      await fsp.writeFile(indexFile, JSON.stringify({})).catch(() => null);
      res.json({ ok: true, message: 'cache cleared' });
    } catch (e: any) {
      res.status(500).json({ ok: false, message: e.message || String(e) });
    }
  });

  app.post('/api/admin/cache/evict', adminMiddleware, async (req, res) => {
    try {
      const targetBytes = parseInt(req.body.targetBytes || req.query.targetBytes || '0', 10);
      if (!targetBytes || targetBytes <= 0) return res.status(400).json({ ok: false, message: 'invalid targetBytes' });
      const cacheDir = path.join(process.cwd(), 'server', '.cache', 'images');
      const indexFile = path.join(cacheDir, 'index.json');
      const idxRaw = await fsp.readFile(indexFile, 'utf-8').catch(() => '{}');
      const index: Record<string, any> = JSON.parse(idxRaw || '{}');
      const entries = Object.entries(index).sort((a: any, b: any) => (a[1].atimeMs || 0) - (b[1].atimeMs || 0));
      let total = Object.values(index).reduce((s: number, v: any) => s + (v.size || 0), 0);
      for (const [k, v] of entries) {
        if (total <= targetBytes) break;
        try { await fsp.unlink(path.join(cacheDir, v.file)).catch(() => null); } catch {}
        total -= v.size || 0;
        delete index[k];
      }
      await fsp.writeFile(indexFile, JSON.stringify(index)).catch(() => null);
      res.json({ ok: true, freedBytes: Math.max(0, targetBytes - total), remaining: total });
    } catch (e: any) {
      res.status(500).json({ ok: false, message: e.message || String(e) });
    }
  });

  // Self-update (PATCH — propio perfil)
  app.patch("/api/users/:id", authMiddleware, async (req: any, res) => {
    const targetId = parseInt(req.params.id);
    // Solo puede editarse a sí mismo (a menos que sea admin)
    const caller = await storage.getUser(req.userId);
    if (!caller) return res.status(401).json({ message: "No autorizado" });
    if (caller.id !== targetId && caller.role !== "admin") {
      return res.status(403).json({ message: "No puedes editar otro perfil" });
    }
    const allowed: any = {};
    if (req.body.displayName !== undefined) allowed.displayName = req.body.displayName;
    if (req.body.habboUsername !== undefined) allowed.habboUsername = req.body.habboUsername;
    const item = await storage.updateUser(targetId, allowed);
    if (!item) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ ...item, passwordHash: undefined });
  });

  // Admin full update
  app.put("/api/users/:id", adminMiddleware, async (req, res) => {
    const item = await storage.updateUser(parseInt(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ ...item, passwordHash: undefined });
  });

  // Buscar usuario por habboUsername (para ProfilePage)
  app.get("/api/users/by-habbo/:username", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const user = users.find(
        (u: any) => u.habboUsername?.toLowerCase() === req.params.username.toLowerCase()
      );
      if (!user) return res.status(404).json({ message: "No encontrado" });
      res.json({ ...user, passwordHash: undefined });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ THEMES ============
  app.get("/api/themes", async (_req, res) => { res.json(await storage.getAllThemes()); });
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
  app.post("/api/themes", adminMiddleware, async (req, res) => { res.status(201).json(await storage.createTheme(req.body)); });

  // ============ NOW PLAYING ============
  app.get("/api/nowplaying", async (_req, res) => {
    try {
      const cfg = await storage.getConfig();
      if (!cfg || !cfg.apiUrl) return res.status(400).json({ message: "Radio no configurada" });
      const r = await fetch(cfg.apiUrl);
      if (!r.ok) return res.status(500).json({ message: "Error al consultar radio" });
      const data = await r.json();
      
      const np = Array.isArray(data) ? data[0]?.now_playing : data?.now_playing;
      const songInfo = np?.song;
      if (songInfo && songInfo.title && songInfo.artist) {
        const djPanel = await storage.getDjPanel().catch(() => null);
        const playedByDj = djPanel?.currentDj || "AutoDJ";
        await storage.createSongHistory({
          title: songInfo.title,
          artist: songInfo.artist,
          album: songInfo.album || null,
          coverUrl: songInfo.art || null,
          playedByDj,
          durationSeconds: np.duration || null,
          requestedBy: null,
          playCount: 1
        }).catch((err: any) => console.error("Error auto-saving song history:", err));
      }

      res.json(data);
    } catch (err: any) {
      console.error("Error fetching nowplaying:", err);
      res.status(500).json({ message: "Error al consultar radio" });
    }
  });

  // ============ DJ PANEL ============
  app.get("/api/dj-panel", async (_req, res) => {
    try { res.json(await storage.getDjPanel()); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.put("/api/dj-panel", djMiddleware, async (req, res) => {
    try {
      const panel = await storage.updateDjPanel(req.body);
      if (!panel) return res.status(404).json({ message: "Panel no encontrado" });
      res.json(panel);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ CHAT ============
  app.get("/api/chat", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      res.json(await storage.getChatMessages(limit));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/chat/:id", djMiddleware, async (req: any, res) => {
    try {
      await storage.deleteChatMessage(parseInt(req.params.id));
      res.json({ message: "Mensaje eliminado" });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
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
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ PRIVATE MESSAGES ============
  app.get("/api/messages", authMiddleware, async (req: any, res) => {
    try { res.json(await storage.getMessagesByUser(req.userId)); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.get("/api/messages/unread", authMiddleware, async (req: any, res) => {
    try { res.json({ count: await storage.getUnreadCount(req.userId) }); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/messages", authMiddleware, async (req: any, res) => {
    try { res.status(201).json(await storage.createPrivateMessage({ ...req.body, fromUserId: req.userId })); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.put("/api/messages/:id/read", authMiddleware, async (req: any, res) => {
    try {
      const msg = await storage.markMessageRead(parseInt(req.params.id));
      if (!msg) return res.status(404).json({ message: "Mensaje no encontrado" });
      res.json(msg);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ VERIFIED BADGES ============
  app.get("/api/verified-badges/:userId", async (req, res) => {
    try { res.json(await storage.getVerifiedBadges(parseInt(req.params.userId))); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.post("/api/verified-badges/verify", authMiddleware, async (req: any, res) => {
    try {
      const { habboUsername, badgeCode, hotel } = req.body;
      if (!habboUsername || !badgeCode) return res.status(400).json({ message: "habboUsername y badgeCode son requeridos" });
      const safeHotel = hotel || "es";
      const host = getHabboHost(safeHotel);
      const r = await fetch(`${host}/api/public/users?name=${encodeURIComponent(habboUsername)}`, { headers: HABBO_HEADERS });
      if (!r.ok) return res.status(404).json({ message: "Usuario de Habbo no encontrado" });
      const habboData = await r.json() as any;
      const hasBadge = (habboData.selectedBadges || []).some((b: any) => b.code === badgeCode || b.badgeIndex === badgeCode);
      if (!hasBadge) return res.status(400).json({ message: "Badge no encontrado en el perfil de Habbo", verified: false });
      const badge = await storage.createVerifiedBadge({ userId: req.userId, badgeCode });
      res.status(201).json({ verified: true, badge });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ TEAM USERS ============
  app.get("/api/team-users", async (_req, res) => {
    try {
      const users = await storage.getTeamUsers();
      res.json(users.map((u: any) => ({ ...u, passwordHash: undefined })));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ SPEED POINTS ============
  app.put("/api/users/:id/points", djMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const points = req.body.points !== undefined ? req.body.points : req.body.amount;
      if (points === undefined || isNaN(Number(points))) return res.status(400).json({ message: "Campo 'points' o 'amount' requerido" });
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      const updated = await storage.updateUser(userId, { speedPoints: (user.speedPoints ?? 0) + Number(points) });
      if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json({ ...updated, passwordHash: undefined });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ MUNDIAL 2026 ENDPOINTS ============
  app.post("/api/mundial/buy-pack", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      if ((user.speedPoints ?? 0) < 10) return res.status(400).json({ message: "SpeedPoints insuficientes (necesitas 10 SP)" });
      
      const ESTAMPAS = ["trofeo", "balon", "estadio", "botas"];
      const randomStampId = ESTAMPAS[Math.floor(Math.random() * ESTAMPAS.length)];
      
      const currentStamps = user.mundialStamps || [];
      const updatedStamps = currentStamps.includes(randomStampId) ? currentStamps : [...currentStamps, randomStampId];
      
      const updated = await storage.updateUser(req.userId, {
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
      
      const user = await storage.getUser(req.userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      if ((user.speedPoints ?? 0) < cost) return res.status(400).json({ message: `SpeedPoints insuficientes (necesitas ${cost} SP)` });
      
      const currentStamps = user.mundialStamps || [];
      if (currentStamps.includes(stampId)) return res.status(400).json({ message: "Ya posees esta estampa" });
      
      const updated = await storage.updateUser(req.userId, {
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
      
      const user = await storage.getUser(req.userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      
      const currentLogros = user.mundialLogros || [];
      if (currentLogros.includes(logroId)) return res.json({ ...user, passwordHash: undefined });
      
      const updated = await storage.updateUser(req.userId, {
        mundialLogros: [...currentLogros, logroId]
      });
      res.json({ ...updated, passwordHash: undefined });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/mundial/predict", authMiddleware, async (req: any, res) => {
    try {
      const { matchId, t1, t2 } = req.body;
      if (!matchId || t1 === undefined || t2 === undefined) return res.status(400).json({ message: "matchId, t1 y t2 son requeridos" });
      
      const user = await storage.getUser(req.userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      
      const predictions = user.mundialPredictions || {};
      predictions[matchId] = { t1: String(t1), t2: String(t2) };
      
      const currentLogros = user.mundialLogros || [];
      const updatedLogros = currentLogros.includes("votante") ? currentLogros : [...currentLogros, "votante"];
      
      const updated = await storage.updateUser(req.userId, {
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
      
      const user = await storage.getUser(req.userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      
      const updated = await storage.updateUser(req.userId, {
        mundialClan: clanName
      });
      res.json({ ...updated, passwordHash: undefined });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/mundial/complete-mission", authMiddleware, async (req: any, res) => {
    try {
      const { missionId } = req.body;
      if (!missionId) return res.status(400).json({ message: "missionId es requerido" });
      
      const user = await storage.getUser(req.userId);
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
      
      const updated = await storage.updateUser(req.userId, {
        speedPoints: (user.speedPoints ?? 0) + 15,
        mundialLogros: updatedLogros
      });
      res.json({ ...updated, passwordHash: undefined });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/mundial/buy-ticket", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      if ((user.speedPoints ?? 0) < 15) return res.status(400).json({ message: "SpeedPoints insuficientes (necesitas 15 SP)" });
      
      const updated = await storage.updateUser(req.userId, {
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
      
      const user = await storage.getUser(req.userId);
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
      
      const updated = await storage.updateUser(req.userId, {
        speedPoints: (user.speedPoints ?? 0) + reward,
        mundialPenalties: { maxScore: newMaxScore, totalGames: newTotalGames },
        mundialLogros: updatedLogros
      });
      res.json({ user: { ...updated, passwordHash: undefined }, reward });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ DOWNLOADS ============
  app.get("/api/downloads", async (_req, res) => { res.json(await storage.getAllDownloads()); });
  app.post("/api/downloads", adminMiddleware, async (req: any, res) => {
    try {
      const item = await storage.createDownload({ ...req.body, addedBy: req.user?.displayName || "Admin" });
      await storage.createPanelLog({ userName: req.user?.displayName || "Sistema", action: "Descarga creada", details: req.body.title });
      res.status(201).json(item);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/downloads/:id", adminMiddleware, async (req: any, res) => {
    await storage.deleteDownload(parseInt(req.params.id));
    await storage.createPanelLog({ userName: req.user?.displayName || "Sistema", action: "Descarga eliminada", details: `ID: ${req.params.id}` });
    res.json({ message: "Eliminada" });
  });
  app.put("/api/downloads/:id/count", async (req, res) => {
    await storage.incrementDownloadCount(parseInt(req.params.id));
    res.json({ message: "OK" });
  });

  // ============ BANNED SONGS ============
  app.get("/api/banned-songs", djMiddleware, async (_req, res) => { res.json(await storage.getAllBannedSongs()); });
  app.post("/api/banned-songs", djMiddleware, async (req: any, res) => {
    try {
      const song = await storage.createBannedSong({ ...req.body, bannedBy: req.user?.displayName || "Staff" });
      await storage.createPanelLog({ userName: req.user?.displayName || "Sistema", action: "Canción baneada", details: `${req.body.title} - ${req.body.artist || ""}` });
      res.status(201).json(song);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/banned-songs/:id", djMiddleware, async (req: any, res) => {
    await storage.deleteBannedSong(parseInt(req.params.id));
    await storage.createPanelLog({ userName: req.user?.displayName || "Sistema", action: "Canción desbaneada", details: `ID: ${req.params.id}` });
    res.json({ message: "Desbaneada" });
  });

  // ============ CONTACT MESSAGES ============
  app.get("/api/contact-messages", adminMiddleware, async (_req, res) => { res.json(await storage.getAllContactMessages()); });
  app.post("/api/contact-messages", async (req, res) => {
    try { res.status(201).json(await storage.createContactMessage({ ...req.body, ip: req.ip })); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.put("/api/contact-messages/:id/status", adminMiddleware, async (req: any, res) => {
    const updated = await storage.updateContactMessageStatus(parseInt(req.params.id), req.body.status);
    await storage.createPanelLog({ userName: req.user?.displayName || "Sistema", action: "Contacto actualizado", details: `ID: ${req.params.id} → ${req.body.status}` });
    res.json(updated);
  });
  app.delete("/api/contact-messages/:id", adminMiddleware, async (req: any, res) => {
    await storage.deleteContactMessage(parseInt(req.params.id));
    await storage.createPanelLog({ userName: req.user?.displayName || "Sistema", action: "Contacto eliminado", details: `ID: ${req.params.id}` });
    res.json({ message: "Eliminado" });
  });

  // ============ PANEL LOGS ============
  app.get("/api/panel-logs", adminMiddleware, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 200;
    res.json(await storage.getPanelLogs(limit));
  });

  // ============ REPORTED MESSAGES ============
  app.get("/api/reported-messages", adminMiddleware, async (_req, res) => { res.json(await storage.getAllReportedMessages()); });
  app.post("/api/reported-messages", authMiddleware, async (req: any, res) => {
    try { res.status(201).json(await storage.createReport({ ...req.body, reportedBy: req.userId })); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.put("/api/reported-messages/:id/status", adminMiddleware, async (req: any, res) => {
    const updated = await storage.updateReportStatus(parseInt(req.params.id), req.body.status);
    await storage.createPanelLog({ userName: req.user?.displayName || "Sistema", action: "Reporte actualizado", details: `ID: ${req.params.id} → ${req.body.status}` });
    res.json(updated);
  });
  app.delete("/api/reported-messages/:id", adminMiddleware, async (req: any, res) => {
    await storage.deleteReport(parseInt(req.params.id));
    res.json({ message: "Eliminado" });
  });

  // ============ SHOP / STORE ============
  app.get("/api/shop/products", async (req, res) => {
    const includeInactive = req.query.all === "true";
    res.json(await storage.getAllShopProducts(includeInactive));
  });
  app.get("/api/shop/products/:id", async (req, res) => {
    const product = await storage.getShopProductById(parseInt(req.params.id));
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  });
  app.post("/api/shop/products", adminMiddleware, async (req: any, res) => {
    res.status(201).json(await storage.createShopProduct(req.body));
  });
  app.put("/api/shop/products/:id", adminMiddleware, async (req, res) => {
    const product = await storage.updateShopProduct(parseInt(req.params.id), req.body);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  });
  app.delete("/api/shop/products/:id", adminMiddleware, async (req, res) => {
    await storage.deleteShopProduct(parseInt(req.params.id));
    res.json({ message: "Eliminado" });
  });

  // ============ USER INVENTORY ============
  app.get("/api/inventory", authMiddleware, async (req: any, res) => {
    res.json(await storage.getUserInventory(req.userId));
  });
  app.post("/api/inventory/purchase", authMiddleware, async (req: any, res) => {
    try {
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "productId requerido" });
      const item = await storage.purchaseProduct(req.userId, productId);
      // Create notification
      await storage.createNotification({
        userId: req.userId,
        type: "shop",
        title: "¡Compra realizada!",
        message: "Has comprado un producto en la tienda.",
        icon: "shopping-cart",
      });
      res.status(201).json(item);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.post("/api/inventory/:id/toggle", authMiddleware, async (req: any, res) => {
    try {
      const item = await storage.toggleEquipItem(req.userId, parseInt(req.params.id));
      res.json(item);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // ============ NOTIFICATIONS ============
  app.get("/api/notifications", authMiddleware, async (req: any, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    res.json(await storage.getUserNotifications(req.userId, limit));
  });
  app.get("/api/notifications/unread-count", authMiddleware, async (req: any, res) => {
    res.json({ count: await storage.getUnreadNotificationCount(req.userId) });
  });
  app.put("/api/notifications/:id/read", authMiddleware, async (req: any, res) => {
    const notif = await storage.markNotificationRead(parseInt(req.params.id));
    if (!notif) return res.status(404).json({ message: "Notificación no encontrada" });
    res.json(notif);
  });
  app.put("/api/notifications/read-all", authMiddleware, async (req: any, res) => {
    await storage.markAllNotificationsRead(req.userId);
    res.json({ message: "Todas las notificaciones marcadas como leídas" });
  });

  // ============ USER PROFILES ============
  app.get("/api/profiles/:userId", async (req, res) => {
    const profile = await storage.getUserProfile(parseInt(req.params.userId));
    if (!profile) return res.status(404).json({ message: "Perfil no encontrado" });
    res.json(profile);
  });
  app.put("/api/profiles", authMiddleware, async (req: any, res) => {
    const profile = await storage.upsertUserProfile(req.userId, req.body);
    res.json(profile);
  });

  // ============ SONG HISTORY ============
  app.get("/api/song-history", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      res.json(await storage.getSongHistory(limit));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/song-history/top", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      res.json(await storage.getMostPlayedSongs(limit));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/song-history", djMiddleware, async (req, res) => {
    try {
      res.status(201).json(await storage.createSongHistory(req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ VIP MEMBERSHIPS ============
  app.get("/api/vip/status", authMiddleware, async (req: any, res) => {
    try {
      const vip = await storage.getVipMembership(req.userId);
      res.json(vip || { isActive: false });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/vip/subscribe", authMiddleware, async (req: any, res) => {
    try {
      const { tier, months, paymentRef } = req.body;
      if (!tier || !months) return res.status(400).json({ message: "Nivel (tier) y meses son requeridos" });
      
      const costs: { [key: string]: number } = { silver: 100, gold: 200, diamond: 400 };
      const costPerMonth = costs[tier.toLowerCase()] || 100;
      const totalCost = costPerMonth * parseInt(months);

      const user = await storage.getUser(req.userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      if (user.speedPoints < totalCost) {
        return res.status(400).json({ message: `No tienes suficientes SpeedPoints. Necesitas ${totalCost} SP y tienes ${user.speedPoints} SP.` });
      }

      await storage.updateUser(req.userId, { speedPoints: user.speedPoints - totalCost });

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + parseInt(months));

      const vip = await storage.createVipMembership({
        userId: req.userId,
        tier: tier.toLowerCase(),
        expiresAt,
        paymentRef: paymentRef || `SP_PURCHASE_${Date.now()}`,
        isActive: true
      });

      await storage.createNotification({
        userId: req.userId,
        type: "success",
        title: "¡Membresía VIP Activa!",
        message: `Felicidades, ahora eres miembro VIP ${tier.toUpperCase()} por ${months} mes(es).`,
        icon: "crown",
        link: "/vip",
        isRead: false
      });

      res.status(201).json(vip);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/vip/perks/log", authMiddleware, async (req: any, res) => {
    try {
      const { perkUsed } = req.body;
      if (!perkUsed) return res.status(400).json({ message: "Perk name is required" });
      res.status(201).json(await storage.logVipPerkUse(req.userId, perkUsed));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/vip/admin/all", adminMiddleware, async (_req, res) => {
    try {
      res.json(await storage.getAllVipMemberships());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.put("/api/vip/admin/:userId", adminMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const vip = await storage.updateVipMembership(userId, req.body);
      if (!vip) return res.status(404).json({ message: "Membresía VIP no encontrada" });
      res.json(vip);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ HSPEED ROOMS ============
  app.get("/api/rooms", async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === "true";
      res.json(await storage.getAllRooms(includeInactive));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/rooms/featured", async (_req, res) => {
    try {
      res.json(await storage.getFeaturedRooms());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/rooms", adminMiddleware, async (req, res) => {
    try {
      res.status(201).json(await storage.createRoom(req.body));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.put("/api/rooms/:id", adminMiddleware, async (req, res) => {
    try {
      const room = await storage.updateRoom(parseInt(req.params.id), req.body);
      if (!room) return res.status(404).json({ message: "Sala no encontrada" });
      res.json(room);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.delete("/api/rooms/:id", adminMiddleware, async (req, res) => {
    try {
      const success = await storage.deleteRoom(parseInt(req.params.id));
      if (!success) return res.status(404).json({ message: "Sala no encontrada" });
      res.json({ message: "Sala eliminada con éxito" });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ============ SUPPORT TICKETS ============
  app.get("/api/tickets", authMiddleware, async (req: any, res) => {
    try {
      res.json(await storage.getTicketsByUser(req.userId));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/tickets/all", adminMiddleware, async (_req, res) => {
    try {
      res.json(await storage.getAllTickets());
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/tickets", authMiddleware, async (req: any, res) => {
    try {
      const { subject, description, category } = req.body;
      if (!subject || !description) {
        return res.status(400).json({ message: "Asunto y descripción son obligatorios" });
      }
      const ticket = await storage.createTicket({
        userId: req.userId,
        subject,
        description,
        status: "open",
        category: category || "general",
      });
      res.status(201).json(ticket);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.put("/api/tickets/:id/status", adminMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ message: "Estado obligatorio" });
      const ticket = await storage.updateTicketStatus(parseInt(req.params.id), status);
      if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
      res.json(ticket);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
}
