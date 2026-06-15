import {
  type User, type InsertUser,
  type News, type InsertNews,
  type Event, type InsertEvent,
  type Schedule, type InsertSchedule,
  type Comment, type InsertComment,
  type Poll, type InsertPoll,
  type Config, type InsertConfig,
  type Theme, type InsertTheme,
  type ForumCategory, type InsertForumCategory,
  type ForumThread, type InsertForumThread,
  type ForumPost, type InsertForumPost,
  type MarketplaceItem, type InsertMarketplaceItem,
  type Badge, type InsertBadge,
  type Request, type InsertRequest,
  type TeamMember, type InsertTeamMember,
  type Download, type InsertDownload,
  type BannedSong, type InsertBannedSong,
  type ContactMessage, type InsertContactMessage,
  type PanelLog, type InsertPanelLog,
  type ReportedMessage, type InsertReportedMessage,
  type InsertProfileWall, type ProfileWallMessage,
  type SongHistory, type InsertSongHistory,
  type VipMembership, type InsertVipMembership,
  type VipPerkLog, type InsertVipPerkLog,
  type HSpeedRoom, type InsertHSpeedRoom,
} from "@shared/schema";
import { type IStorage } from "./storage";
import bcrypt from "bcryptjs";

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private news: Map<number, News> = new Map();
  private events: Map<number, Event> = new Map();
  private schedule: Map<number, Schedule> = new Map();
  private comments: Map<number, Comment> = new Map();
  private polls: Map<number, Poll> = new Map();
  private themes: Map<string, Theme> = new Map();
  private forumCategories: Map<number, ForumCategory> = new Map();
  private forumThreads: Map<number, ForumThread> = new Map();
  private forumPosts: Map<number, ForumPost> = new Map();
  private marketplaceItems: Map<string, MarketplaceItem> = new Map();
  private badges: Map<string, Badge> = new Map();
  private requests: Map<number, Request> = new Map();
  private teamMembers: Map<number, TeamMember> = new Map();
  private downloads: Map<number, Download> = new Map();
  private bannedSongs: Map<number, BannedSong> = new Map();
  private contactMessages: Map<number, ContactMessage> = new Map();
  private panelLogs: Map<number, PanelLog> = new Map();
  private reportedMessages: Map<number, ReportedMessage> = new Map();
  
  private songHistoryList: Map<number, SongHistory> = new Map();
  private vipMembershipsList: Map<number, VipMembership> = new Map();
  private vipPerkLogsList: Map<number, VipPerkLog> = new Map();
  private hspeedRoomsList: Map<number, HSpeedRoom> = new Map();
  private _songHistoryId = 0;
  private _vipMembershipId = 0;
  private _vipPerkLogId = 0;
  private _hspeedRoomId = 0;

  private configItem!: Config;
  private djPanelState: any;
  private chatMessagesList: any[] = [];
  private privateMessagesList: any[] = [];
  private verifiedBadgesList: any[] = [];

  private currentId = 1;

  constructor() {
    this.initMocks();
  }

  private async initMocks() {
    // Configuración por defecto
    this.configItem = {
      id: 1,
      radioService: "azuracast",
      apiUrl: "https://radio.kusmedios.lat/api/nowplaying/runa-fm",
      listenUrl: "https://radio.kusmedios.lat/listen/runa-fm/radio.mp3",
      homePlayerBgUrl: "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png",
      slideshow: [
        { image: "https://images.habbo.com/c_images/reception/rec_background_beach.png", title: "¡Bienvenidos a HabboSpeed!", link: "#" },
        { image: "https://images.habbo.com/c_images/reception/rec_background_habboween.png", title: "¡Sintoniza nuestra Radio 24/7!", link: "#" }
      ],
      discordWebhooks: {},
      activeTheme: "nubis",
      maintenanceMode: false
    };

    // DJ Panel por defecto
    this.djPanelState = {
      id: 1,
      currentDj: "AutoDJ",
      nextDj: "Dj_Invitado",
      djMessage: "Sintoniza la mejor música en HabboSpeed!",
      updatedAt: new Date()
    };

    // Crear usuario admin de prueba (password: admin123)
    const adminPassHash = await bcrypt.hash("admin123", 10);
    this.users.set(1, {
      id: 1,
      email: "admin@habbospeed.com",
      passwordHash: adminPassHash,
      displayName: "Administrador",
      habboUsername: "HabboSpeed",
      avatarUrl: "https://www.habbo.es/habbo-imaging/avatarimage?user=HabboSpeed&size=b",
      role: "admin",
      approved: true,
      speedPoints: 500,
      mundialStamps: [],
      mundialLogros: [],
      mundialClan: null,
      mundialPredictions: {},
      mundialTickets: 0,
      mundialPenalties: { maxScore: 0, totalGames: 0 },
      vipTier: null,
      totalRequests: 0,
      favoriteGenre: null,
      bio: null,
      socialLinks: {},
      badgesEarned: [],
      createdAt: new Date()
    });
    this.currentId = 2;

    // Crear categorías del foro por defecto
    const catNames = ["General", "Soporte", "Radio", "Juegos & Concursos"];
    catNames.forEach((name, i) => {
      const id = i + 1;
      this.forumCategories.set(id, { id, name, description: `Foro sobre ${name}`, sortOrder: i });
    });

    // Mocks de noticias
    this.news.set(1, {
      id: 1,
      title: "¡Gran Apertura de HabboSpeed!",
      summary: "Iniciamos el rebranding y lanzamiento del nuevo sitio web.",
      content: "Bienvenidos a HabboSpeed. Disfruta de la mejor radio, noticias al instante, guías actualizadas, foros interactivos y eventos diarios. ¡Regístrate ya y gana SpeedPoints para canjear en nuestro catálogo!",
      imageUrl: "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png",
      imageHint: "Apertura oficial",
      category: "Noticias",
      date: new Date().toLocaleDateString("es-ES"),
      reactions: { "❤️": 5, "🔥": 8 },
      authorId: 1,
      createdAt: new Date()
    });

    this.news.set(2, {
      id: 2,
      title: "Mega Fix: mejoras y correcciones en todo el sitio",
      summary: "Aplicamos un paquete completo de mejoras para estabilidad, radio, Habbo API y experiencia de usuario.",
      content: "Resumen de cambios recientes:\n\n- Radio actualizada: stream AzuraCast y Now Playing configurados.\n- Habbo API reforzada: proxy de imagenes para evitar bloqueos y carga correcta de avatares.\n- Hot Looks: fallback con looks curados si la API falla.\n- Armario: busqueda y previsualizacion de avatares mas estables.\n- Barra DJ: mensaje mas creativo y consistente.\n- Emojis utiles: ahora funcionan como accesos rapidos.\n- Menu superior simplificado: queda solo el menu del boton de tres rayitas.\n- Popups estaticos: se corrigio el movimiento para poder usarlos sin problemas.\n\nSeguimos optimizando velocidad y detalles visuales para que la fansite se vea como las top de Habbo.es.",
      imageUrl: "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png",
      imageHint: "Actualizacion del sitio",
      category: "Actualizaciones",
      date: new Date().toLocaleDateString("es-ES"),
      reactions: { "🔥": 12, "✅": 9 },
      authorId: 1,
      createdAt: new Date()
    });

    // Mocks de eventos
    this.events.set(1, {
      id: 1,
      title: "Gran Fiesta en Habbo",
      server: "Habbo.es",
      date: new Date().toLocaleDateString("es-ES"),
      time: "20:00",
      roomName: "[HS] Central de Eventos",
      roomOwner: "HabboSpeed",
      host: "DJ_Speedy",
      imageUrl: "https://images.habbo.com/c_images/reception/rec_background_beach.png",
      imageHint: "Fiesta playera",
      createdAt: new Date()
    });

    // Mock de badges
    this.badges.set("HS1", { id: 1, code: "HS1", name: "Fundador HabboSpeed", description: "Otorgado a los miembros fundadores.", hotel: "es", category: "Especial", imageUrl: "https://images.habbo.com/c_images/album1584/ADM.gif", discoveredAt: new Date() });
    this.badges.set("HS2", { id: 2, code: "HS2", name: "Fiel Sintonizador", description: "Por escuchar la radio frecuentemente.", hotel: "es", category: "Radio", imageUrl: "https://images.habbo.com/c_images/album1584/ACH_VipClub1.gif", discoveredAt: new Date() });

    // Mock de Marketplace
    this.marketplaceItems.set("throne", { id: 1, itemName: "Trono", className: "throne", hotel: "es", currentPrice: 1500, avgPrice: 1480, priceHistory: [1450, 1470, 1500], imageUrl: "https://images.habbo.com/dcr/hof_furni/123/throne_icon.png", lastUpdated: new Date() });

    // Seed Themes
    this.themes.set("circo", {
      id: 1,
      slug: "circo",
      name: "Circo Clásico",
      description: "Tema circense tradicional con colores rojo y amarillo.",
      colors: {
        primary: "355 70% 55%",
        primaryForeground: "0 0% 100%",
        accent: "42 80% 60%",
        accentForeground: "0 0% 10%",
        background: "0 10% 12%",
        card: "0 12% 16%",
        border: "0 15% 22%",
        muted: "0 10% 14%",
        glowColor: "225, 29, 72",
        gradientFrom: "#e11d48",
        gradientTo: "#f59e0b",
        secondary: "42 80% 60%"
      },
      bannerUrl: "https://images.habbo.com/c_images/reception/rec_background_beach.png",
      logoUrl: null,
      decorations: {
        emoji: "🎪",
        pattern: "stripes",
        particleType: "confetti"
      },
      isDefault: true
    });

    this.themes.set("nubis", {
      id: 2,
      slug: "nubis",
      name: "HabNubis Premium",
      description: "Estilo elegante y moderno inspirado en HabNubis.es con degradados neón y transparencias premium.",
      colors: {
        primary: "260 70% 68%",
        primaryForeground: "0 0% 100%",
        accent: "197 85% 62%",
        accentForeground: "0 0% 10%",
        background: "222 35% 15%",
        card: "222 35% 20%",
        border: "222 25% 28%",
        muted: "222 30% 18%",
        glowColor: "167, 139, 250",
        gradientFrom: "#a78bfa",
        gradientTo: "#67e8f9"
      },
      bannerUrl: "https://images.habbo.com/c_images/reception/rec_background_habboween.png",
      logoUrl: null,
      decorations: {
        emoji: "🔮",
        pattern: "grid",
        particleType: "float"
      },
      isDefault: false
    });

    this.themes.set("lapis", {
      id: 3,
      slug: "lapis",
      name: "Obsidiana Lapis",
      description: "Un tema oscuro relajante y suave con tonos azul slate, lavanda y turquesa. Protege tu vista con contrastes balanceados.",
      colors: {
        primary: "245 80% 70%",
        primaryForeground: "0 0% 100%",
        accent: "174 75% 45%",
        accentForeground: "0 0% 100%",
        background: "215 28% 17%",
        card: "215 28% 22%",
        border: "215 20% 30%",
        muted: "215 25% 20%",
        glowColor: "99, 102, 241",
        gradientFrom: "#6366f1",
        gradientTo: "#06b6d4",
        secondary: "174 75% 45%"
      },
      bannerUrl: "https://images.habbo.com/c_images/reception/rec_background_beach.png",
      logoUrl: null,
      decorations: {
        emoji: "💎",
        pattern: "grid",
        particleType: "float"
      },
      isDefault: false
    });

    this.themes.set("bosque", {
      id: 4,
      slug: "bosque",
      name: "Bosque de Jade",
      description: "Un tema premium cálido y relajante con tonos verdes esmeralda, musgo y salvia. Diseñado para eliminar la fatiga visual.",
      colors: {
        primary: "150 60% 55%",
        primaryForeground: "160 80% 5%",
        accent: "45 85% 65%",
        accentForeground: "160 80% 5%",
        background: "160 25% 12%",
        card: "160 20% 17%",
        border: "160 15% 25%",
        muted: "160 20% 15%",
        glowColor: "52, 211, 153",
        gradientFrom: "#10b981",
        gradientTo: "#059669",
        secondary: "45 85% 65%"
      },
      bannerUrl: "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png",
      logoUrl: null,
      decorations: {
        emoji: "🌿",
        pattern: "waves",
        particleType: "float"
      },
      isDefault: false
    });
  }

  // Users
  async getUser(id: number) { return this.users.get(id); }
  async getUserByEmail(email: string) {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  async createUser(user: InsertUser) {
    const id = this.currentId++;
    const newUser: User = {
      id,
      email: user.email,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      habboUsername: user.habboUsername || null,
      avatarUrl: user.avatarUrl || null,
      role: user.role || "pending",
      approved: user.approved ?? false,
      speedPoints: user.speedPoints ?? 0,
      mundialStamps: [],
      mundialLogros: [],
      mundialClan: null,
      mundialPredictions: {},
      mundialTickets: 0,
      mundialPenalties: { maxScore: 0, totalGames: 0 },
      vipTier: user.vipTier || null,
      totalRequests: user.totalRequests || 0,
      favoriteGenre: user.favoriteGenre || null,
      bio: user.bio || null,
      socialLinks: user.socialLinks || {},
      badgesEarned: user.badgesEarned || [],
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }
  async updateUser(id: number, data: Partial<InsertUser>) {
    const u = this.users.get(id);
    if (!u) return undefined;
    const updated = { ...u, ...data } as User;
    this.users.set(id, updated);
    return updated;
  }
  async getAllUsers() { return Array.from(this.users.values()); }

  // News
  async getAllNews() { return Array.from(this.news.values()).sort((a, b) => b.id - a.id); }
  async getNewsById(id: number) { return this.news.get(id); }
  async createNews(article: InsertNews) {
    const id = this.currentId++;
    const item: News = {
      id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      imageUrl: article.imageUrl,
      imageHint: article.imageHint || "",
      category: article.category,
      date: article.date,
      reactions: article.reactions || {},
      authorId: article.authorId || null,
      createdAt: new Date()
    };
    this.news.set(id, item);
    return item;
  }
  async updateNews(id: number, data: Partial<InsertNews>) {
    const item = this.news.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data } as News;
    this.news.set(id, updated);
    return updated;
  }
  async deleteNews(id: number) { return this.news.delete(id); }

  // Events
  async getAllEvents() { return Array.from(this.events.values()).sort((a, b) => b.id - a.id); }
  async getEventById(id: number) { return this.events.get(id); }
  async createEvent(event: InsertEvent) {
    const id = this.currentId++;
    const item: Event = {
      id,
      title: event.title,
      server: event.server,
      date: event.date,
      time: event.time,
      roomName: event.roomName,
      roomOwner: event.roomOwner,
      host: event.host,
      imageUrl: event.imageUrl,
      imageHint: event.imageHint || "",
      createdAt: new Date()
    };
    this.events.set(id, item);
    return item;
  }
  async updateEvent(id: number, data: Partial<InsertEvent>) {
    const item = this.events.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data } as Event;
    this.events.set(id, updated);
    return updated;
  }
  async deleteEvent(id: number) { return this.events.delete(id); }

  // Schedule
  async getAllSchedule() { return Array.from(this.schedule.values()); }
  async createScheduleItem(item: InsertSchedule) {
    const id = this.currentId++;
    const newItem: Schedule = { id, ...item };
    this.schedule.set(id, newItem);
    return newItem;
  }
  async updateScheduleItem(id: number, data: Partial<InsertSchedule>) {
    const item = this.schedule.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data } as Schedule;
    this.schedule.set(id, updated);
    return updated;
  }
  async deleteScheduleItem(id: number) { return this.schedule.delete(id); }

  // Comments
  async getCommentsByArticle(articleId: number) {
    return Array.from(this.comments.values()).filter(c => c.articleId === articleId);
  }
  async createComment(comment: InsertComment) {
    const id = this.currentId++;
    const item: Comment = {
      id,
      articleId: comment.articleId || null,
      authorId: comment.authorId || null,
      authorName: comment.authorName,
      content: comment.content,
      createdAt: new Date()
    };
    this.comments.set(id, item);
    return item;
  }
  async deleteComment(id: number) { return this.comments.delete(id); }

  // Polls
  async getAllPolls() { return Array.from(this.polls.values()); }
  async createPoll(poll: InsertPoll) {
    const id = this.currentId++;
    const item: Poll = {
      id,
      title: poll.title,
      options: poll.options || [],
      isActive: poll.isActive ?? true,
      createdAt: new Date()
    };
    this.polls.set(id, item);
    return item;
  }
  async updatePoll(id: number, data: Partial<InsertPoll>) {
    const item = this.polls.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data } as Poll;
    this.polls.set(id, updated);
    return updated;
  }

  // Config
  async getConfig() { return this.configItem; }
  async updateConfig(data: Partial<InsertConfig>) {
    this.configItem = { ...this.configItem, ...data } as Config;
    return this.configItem;
  }

  // Forum
  async getAllForumCategories() { return Array.from(this.forumCategories.values()).sort((a, b) => a.sortOrder - b.sortOrder); }
  async createForumCategory(cat: InsertForumCategory) {
    const id = this.currentId++;
    const item: ForumCategory = { id, name: cat.name, description: cat.description || null, sortOrder: cat.sortOrder ?? 0 };
    this.forumCategories.set(id, item);
    return item;
  }
  async getThreadsByCategory(categoryId: number) {
    return Array.from(this.forumThreads.values()).filter(t => t.categoryId === categoryId);
  }
  async getThreadById(id: number) { return this.forumThreads.get(id); }
  async createThread(thread: InsertForumThread) {
    const id = this.currentId++;
    const item: ForumThread = {
      id,
      categoryId: thread.categoryId || null,
      title: thread.title,
      authorId: thread.authorId || null,
      authorName: thread.authorName,
      isPinned: thread.isPinned ?? false,
      isLocked: thread.isLocked ?? false,
      views: thread.views ?? 0,
      createdAt: new Date()
    };
    this.forumThreads.set(id, item);
    return item;
  }
  async incrementThreadViews(id: number) {
    const t = this.forumThreads.get(id);
    if (t) {
      t.views++;
      this.forumThreads.set(id, t);
    }
  }
  async getPostsByThread(threadId: number) {
    return Array.from(this.forumPosts.values()).filter(p => p.threadId === threadId);
  }
  async createPost(post: InsertForumPost) {
    const id = this.currentId++;
    const item: ForumPost = {
      id,
      threadId: post.threadId || null,
      authorId: post.authorId || null,
      authorName: post.authorName,
      content: post.content,
      createdAt: new Date()
    };
    this.forumPosts.set(id, item);
    return item;
  }
  async deletePost(id: number) { return this.forumPosts.delete(id); }

  // Marketplace
  async getAllMarketplaceItems() { return Array.from(this.marketplaceItems.values()); }
  async getMarketplaceItemByClass(className: string) { return this.marketplaceItems.get(className); }
  async upsertMarketplaceItem(item: InsertMarketplaceItem) {
    const existing = this.marketplaceItems.get(item.className);
    const id = existing ? existing.id : this.currentId++;
    const newItem: MarketplaceItem = {
      id,
      itemName: item.itemName,
      className: item.className,
      hotel: item.hotel || "es",
      currentPrice: item.currentPrice ?? null,
      avgPrice: item.avgPrice ?? null,
      priceHistory: item.priceHistory || [],
      imageUrl: item.imageUrl || null,
      lastUpdated: new Date()
    };
    this.marketplaceItems.set(item.className, newItem);
    return newItem;
  }

  // Badges
  async getAllBadges() { return Array.from(this.badges.values()); }
  async searchBadges(query: string) {
    const q = query.toLowerCase();
    return Array.from(this.badges.values()).filter(b => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q));
  }
  async upsertBadge(badge: InsertBadge) {
    const existing = this.badges.get(badge.code);
    const id = existing ? existing.id : this.currentId++;
    const newItem: Badge = {
      id,
      code: badge.code,
      name: badge.name,
      description: badge.description || null,
      hotel: badge.hotel || "es",
      category: badge.category || null,
      imageUrl: badge.imageUrl || null,
      discoveredAt: new Date()
    };
    this.badges.set(badge.code, newItem);
    return newItem;
  }

  // Requests
  async getAllRequests() { return Array.from(this.requests.values()).sort((a, b) => b.id - a.id); }
  async createRequest(req: InsertRequest) {
    const id = this.currentId++;
    const item: Request = { id, type: req.type, details: req.details, userName: req.userName, createdAt: new Date() };
    this.requests.set(id, item);
    return item;
  }
  async deleteRequest(id: number) { return this.requests.delete(id); }

  // Team
  async getAllTeamMembers() { return Array.from(this.teamMembers.values()); }
  async createTeamMember(member: InsertTeamMember) {
    const id = this.currentId++;
    const item: TeamMember = { id, displayName: member.displayName, habboUsername: member.habboUsername, role: member.role, motto: member.motto || null, joinedAt: new Date() };
    this.teamMembers.set(id, item);
    return item;
  }
  async updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
    const item = this.teamMembers.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data } as TeamMember;
    this.teamMembers.set(id, updated);
    return updated;
  }
  async deleteTeamMember(id: number) { return this.teamMembers.delete(id); }

  // Themes
  async getAllThemes() { return Array.from(this.themes.values()); }
  async getThemeBySlug(slug: string) { return this.themes.get(slug); }
  async getActiveTheme() { return this.themes.get(this.configItem.activeTheme) || Array.from(this.themes.values())[0]; }
  async createTheme(theme: InsertTheme) {
    const item: Theme = {
      id: this.currentId++,
      slug: theme.slug,
      name: theme.name,
      description: theme.description || null,
      colors: theme.colors || {},
      bannerUrl: theme.bannerUrl || null,
      logoUrl: theme.logoUrl || null,
      decorations: theme.decorations || {},
      isDefault: theme.isDefault ?? false
    };
    this.themes.set(theme.slug, item);
    return item;
  }
  async updateTheme(id: number, data: Partial<InsertTheme>) {
    const t = Array.from(this.themes.values()).find(x => x.id === id);
    if (!t) return undefined;
    const updated = { ...t, ...data } as Theme;
    this.themes.set(t.slug, updated);
    return updated;
  }
  async setActiveTheme(slug: string) {
    this.configItem.activeTheme = slug;
    return this.configItem;
  }

  // DJ Panel
  async getDjPanel() { return this.djPanelState; }
  async updateDjPanel(data: any) {
    this.djPanelState = { ...this.djPanelState, ...data, updatedAt: new Date() };
    return this.djPanelState;
  }

  // Chat Messages
  async getChatMessages(limit = 50) {
    return this.chatMessagesList.slice(-limit);
  }
  async createChatMessage(data: any) {
    const msg = {
      id: this.currentId++,
      userId: data.userId || null,
      userName: data.userName,
      habboUsername: data.habboUsername || null,
      message: data.message,
      createdAt: new Date()
    };
    this.chatMessagesList.push(msg);
    return msg;
  }
  async deleteChatMessage(id: number) {
    this.chatMessagesList = this.chatMessagesList.filter(m => m.id !== id);
    return true;
  }

  // Private Messages
  async getMessagesByUser(userId: number) {
    return this.privateMessagesList.filter(m => m.toUserId === userId || m.fromUserId === userId);
  }
  async getUnreadCount(userId: number) {
    return this.privateMessagesList.filter(m => m.toUserId === userId && !m.isRead).length;
  }
  async createPrivateMessage(data: any) {
    const msg = {
      id: this.currentId++,
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      subject: data.subject || '',
      content: data.content,
      isRead: false,
      createdAt: new Date()
    };
    this.privateMessagesList.push(msg);
    return msg;
  }
  async markMessageRead(id: number) {
    const msg = this.privateMessagesList.find(m => m.id === id);
    if (msg) msg.isRead = true;
    return msg;
  }

  // Verified Badges
  async getVerifiedBadges(userId: number) {
    return this.verifiedBadgesList.filter(b => b.userId === userId);
  }
  async createVerifiedBadge(data: any) {
    const b = {
      id: this.currentId++,
      userId: data.userId,
      badgeCode: data.badgeCode,
      verifiedAt: new Date()
    };
    this.verifiedBadgesList.push(b);
    return b;
  }

  // Team from Users
  async getTeamUsers() {
    return Array.from(this.users.values()).filter(u => u.approved && (u.role === "admin" || u.role === "dj"));
  }

  // Downloads
  async getAllDownloads() { return Array.from(this.downloads.values()); }
  async createDownload(d: InsertDownload) {
    const id = this.currentId++;
    const item: Download = {
      id,
      title: d.title,
      description: d.description ?? null,
      fileUrl: d.fileUrl,
      category: d.category ?? "general",
      addedBy: d.addedBy ?? "",
      downloadCount: 0,
      createdAt: new Date(),
    };
    this.downloads.set(id, item);
    return item;
  }
  async deleteDownload(id: number) { return this.downloads.delete(id); }
  async incrementDownloadCount(id: number) {
    const d = this.downloads.get(id);
    if (d) {
      d.downloadCount++;
      this.downloads.set(id, d);
    }
  }

  // Banned Songs
  async getAllBannedSongs() { return Array.from(this.bannedSongs.values()); }
  async createBannedSong(s: InsertBannedSong) {
    const id = this.currentId++;
    const item: BannedSong = {
      id,
      title: s.title,
      artist: s.artist ?? null,
      reason: s.reason ?? null,
      bannedBy: s.bannedBy ?? "",
      createdAt: new Date(),
    };
    this.bannedSongs.set(id, item);
    return item;
  }
  async deleteBannedSong(id: number) { return this.bannedSongs.delete(id); }

  // Contact Messages
  async getAllContactMessages() { return Array.from(this.contactMessages.values()); }
  async createContactMessage(msg: InsertContactMessage) {
    const id = this.currentId++;
    const item: ContactMessage = {
      id,
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
      ip: msg.ip ?? null,
      status: msg.status || "pending",
      createdAt: new Date(),
    };
    this.contactMessages.set(id, item);
    return item;
  }
  async updateContactMessageStatus(id: number, status: string) {
    const m = this.contactMessages.get(id);
    if (!m) return undefined;
    m.status = status;
    this.contactMessages.set(id, m);
    return m;
  }
  async deleteContactMessage(id: number) { return this.contactMessages.delete(id); }

  // Panel Logs
  async getPanelLogs(limit = 200) {
    return Array.from(this.panelLogs.values()).sort((a, b) => b.id - a.id).slice(0, limit);
  }
  async createPanelLog(log: InsertPanelLog) {
    const id = this.currentId++;
    const item: PanelLog = {
      id,
      userId: log.userId ?? null,
      userName: log.userName,
      action: log.action,
      details: log.details ?? null,
      ip: log.ip ?? null,
      createdAt: new Date(),
    };
    this.panelLogs.set(id, item);
    return item;
  }

  // Reported Messages
  async getAllReportedMessages() {
    return Array.from(this.reportedMessages.values()).map(r => {
      const pm = this.privateMessagesList.find(x => x.id === r.messageId);
      const sender = pm ? this.users.get(pm.fromUserId) : null;
      const reporter = this.users.get(r.reportedBy || 0);
      return {
        ...r,
        messageContent: pm ? pm.content : "",
        messageSubject: pm ? pm.subject : "",
        senderName: sender ? sender.displayName : "",
        senderHabbo: sender ? sender.habboUsername : "",
        reporterName: reporter ? reporter.displayName : ""
      };
    });
  }
  async createReport(report: InsertReportedMessage) {
    const id = this.currentId++;
    const item: ReportedMessage = {
      id,
      messageId: report.messageId ?? null,
      reportedBy: report.reportedBy ?? null,
      reason: report.reason,
      status: report.status || "pending",
      createdAt: new Date(),
    };
    this.reportedMessages.set(id, item);
    return item;
  }
  async updateReportStatus(id: number, status: string) {
    const r = this.reportedMessages.get(id);
    if (!r) return undefined;
    r.status = status;
    this.reportedMessages.set(id, r);
    return r;
  }
  async deleteReport(id: number) { return this.reportedMessages.delete(id); }

  // Shop Products (MemStorage stubs)
  private shopProducts: Map<number, any> = new Map();
  private _shopId = 0;
  async getAllShopProducts(includeInactive?: boolean) { return Array.from(this.shopProducts.values()).filter((p: any) => includeInactive || p.isActive); }
  async getShopProductById(id: number) { return this.shopProducts.get(id); }
  async createShopProduct(product: any) {
    const id = ++this._shopId;
    const item = { id, ...product, createdAt: new Date() };
    this.shopProducts.set(id, item);
    return item;
  }
  async updateShopProduct(id: number, data: any) {
    const item = this.shopProducts.get(id);
    if (!item) return undefined;
    Object.assign(item, data);
    this.shopProducts.set(id, item);
    return item;
  }
  async deleteShopProduct(id: number) { return this.shopProducts.delete(id); }

  // User Inventory (MemStorage stubs)
  private userInventory: Map<number, any> = new Map();
  private _invId = 0;
  async getUserInventory(userId: number) {
    return Array.from(this.userInventory.values()).filter((i: any) => i.userId === userId);
  }
  async purchaseProduct(userId: number, productId: number) {
    const product = this.shopProducts.get(productId);
    if (!product) throw new Error("Producto no encontrado");
    const id = ++this._invId;
    const item = { id, userId, productId, isEquipped: false, purchasedAt: new Date() };
    this.userInventory.set(id, item);
    return item;
  }
  async toggleEquipItem(userId: number, itemId: number) {
    const item = this.userInventory.get(itemId);
    if (!item || item.userId !== userId) throw new Error("Item no encontrado");
    item.isEquipped = !item.isEquipped;
    this.userInventory.set(itemId, item);
    return item;
  }

  // Notifications (MemStorage stubs)
  private notifs: Map<number, any> = new Map();
  private _notifId = 0;
  async getUserNotifications(userId: number, limit = 50) {
    const arr: any[] = [];
    this.notifs.forEach((n) => { if (n.userId === userId) arr.push(n); });
    arr.sort((a: any, b: any) => b.createdAt - a.createdAt);
    return arr.slice(0, limit);
  }
  async getUnreadNotificationCount(userId: number) {
    return Array.from(this.notifs.values()).filter((n: any) => n.userId === userId && !n.isRead).length;
  }
  async createNotification(notif: any) {
    const id = ++this._notifId;
    const item = { id, ...notif, isRead: false, createdAt: new Date() };
    this.notifs.set(id, item);
    return item;
  }
  async markNotificationRead(id: number) {
    const n = this.notifs.get(id);
    if (!n) return undefined;
    n.isRead = true;
    return n;
  }
  async markAllNotificationsRead(userId: number) {
    this.notifs.forEach((n) => { if (n.userId === userId) n.isRead = true; });
  }

  // Profile Wall (MemStorage stubs)
  private profileWall: Map<number, any> = new Map();
  private _wallId = 0;

  // User Profiles (MemStorage stubs)
  private userProfiles: Map<number, any> = new Map();
  async getUserProfile(userId: number) {
    return Array.from(this.userProfiles.values()).find((p: any) => p.userId === userId);
  }
  async upsertUserProfile(userId: number, data: any) {
    const existing = await this.getUserProfile(userId);
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date() });
      return existing;
    }
    return this.createUserProfile(userId, data);
  }
  async createUserProfile(userId: number, data: any) {
    const item = { id: this.userProfiles.size + 1, userId, ...data, updatedAt: new Date() };
    this.userProfiles.set(item.id, item);
    return item;
  }

  // Profile Wall / Muro (MemStorage stubs)
  async getWallMessages(profileUserId: number) {
    return Array.from(this.profileWall.values())
      .filter((msg: any) => msg.profileUserId === profileUserId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createWallMessage(msg: InsertProfileWall) {
    const id = ++this._wallId;
    const item = { id, ...msg, createdAt: new Date() };
    this.profileWall.set(id, item);
    return item;
  }

  async deleteWallMessage(id: number) {
    return this.profileWall.delete(id);
  }

  async getWallMessageById(id: number) {
    return this.profileWall.get(id);
  }

  // Song History
  async getSongHistory(limit: number = 20): Promise<SongHistory[]> {
    return Array.from(this.songHistoryList.values())
      .sort((a, b) => (b.playedAt ? new Date(b.playedAt).getTime() : 0) - (a.playedAt ? new Date(a.playedAt).getTime() : 0))
      .slice(0, limit);
  }

  async createSongHistory(song: InsertSongHistory): Promise<SongHistory> {
    const id = ++this._songHistoryId;
    const item: SongHistory = {
      id,
      title: song.title,
      artist: song.artist,
      album: song.album || null,
      coverUrl: song.coverUrl || null,
      playedAt: new Date(),
      playedByDj: song.playedByDj || null,
      durationSeconds: song.durationSeconds || null,
      requestedBy: song.requestedBy || null,
      playCount: song.playCount || 1,
    };
    this.songHistoryList.set(id, item);
    return item;
  }

  async getMostPlayedSongs(limit: number = 10): Promise<SongHistory[]> {
    const counts: { [key: string]: { song: SongHistory, count: number } } = {};
    this.songHistoryList.forEach(item => {
      const key = `${item.title} - ${item.artist}`;
      if (counts[key]) {
        counts[key].count += item.playCount;
      } else {
        counts[key] = { song: item, count: item.playCount };
      }
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((entry, idx) => ({
        ...entry.song,
        id: idx + 1,
        playCount: entry.count,
      }));
  }

  // VIP Memberships
  async getVipMembership(userId: number): Promise<VipMembership | undefined> {
    return Array.from(this.vipMembershipsList.values())
      .find(m => m.userId === userId && m.isActive);
  }

  async createVipMembership(membership: InsertVipMembership): Promise<VipMembership> {
    const id = ++this._vipMembershipId;
    const item: VipMembership = {
      id,
      userId: membership.userId,
      tier: membership.tier,
      startedAt: new Date(),
      expiresAt: membership.expiresAt ? new Date(membership.expiresAt) : null,
      paymentRef: membership.paymentRef || null,
      isActive: membership.isActive ?? true,
    };
    this.vipMembershipsList.set(id, item);
    
    // Update user in users map
    const user = this.users.get(membership.userId);
    if (user) {
      user.vipTier = membership.tier;
    }

    return item;
  }

  async updateVipMembership(userId: number, data: Partial<InsertVipMembership>): Promise<VipMembership | undefined> {
    const active = await this.getVipMembership(userId);
    if (!active) return undefined;

    Object.assign(active, data);
    
    if (data.tier !== undefined || data.isActive === false) {
      const user = this.users.get(userId);
      if (user) {
        user.vipTier = active.isActive ? active.tier : null;
      }
    }

    return active;
  }

  async getAllVipMemberships(): Promise<any[]> {
    return Array.from(this.vipMembershipsList.values()).map(m => {
      const user = this.users.get(m.userId);
      return {
        ...m,
        displayName: user?.displayName || "Desconocido",
        email: user?.email || "",
        habboUsername: user?.habboUsername || ""
      };
    });
  }

  // VIP Perks Log
  async logVipPerkUse(userId: number, perkUsed: string): Promise<VipPerkLog> {
    const id = ++this._vipPerkLogId;
    const item: VipPerkLog = {
      id,
      userId,
      perkUsed,
      usedAt: new Date(),
    };
    this.vipPerkLogsList.set(id, item);
    return item;
  }

  async getVipPerkLogs(userId: number): Promise<VipPerkLog[]> {
    return Array.from(this.vipPerkLogsList.values())
      .filter(l => l.userId === userId)
      .sort((a, b) => (b.usedAt ? new Date(b.usedAt).getTime() : 0) - (a.usedAt ? new Date(a.usedAt).getTime() : 0));
  }

  // Rooms
  async getAllRooms(includeInactive: boolean = false): Promise<HSpeedRoom[]> {
    return Array.from(this.hspeedRoomsList.values())
      .filter(r => includeInactive || r.isActive)
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      });
  }

  async getFeaturedRooms(): Promise<HSpeedRoom[]> {
    return Array.from(this.hspeedRoomsList.values())
      .filter(r => r.isActive && r.featured)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  async createRoom(room: InsertHSpeedRoom): Promise<HSpeedRoom> {
    const id = ++this._hspeedRoomId;
    const item: HSpeedRoom = {
      id,
      name: room.name,
      description: room.description || null,
      roomCode: room.roomCode || null,
      ownerHabbo: room.ownerHabbo || null,
      hotel: room.hotel || "es",
      category: room.category || null,
      capacity: room.capacity || null,
      currentVisitors: room.currentVisitors || 0,
      isActive: room.isActive ?? true,
      thumbnailUrl: room.thumbnailUrl || null,
      featured: room.featured ?? false,
      createdAt: new Date(),
    };
    this.hspeedRoomsList.set(id, item);
    return item;
  }

  async updateRoom(id: number, data: Partial<InsertHSpeedRoom>): Promise<HSpeedRoom | undefined> {
    const item = this.hspeedRoomsList.get(id);
    if (!item) return undefined;
    Object.assign(item, data);
    return item;
  }

  async deleteRoom(id: number): Promise<boolean> {
    return this.hspeedRoomsList.delete(id);
  }
}
