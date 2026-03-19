import {
  users, news, events, schedule, comments, polls, config, themes,
  forumCategories, forumThreads, forumPosts, marketplaceItems, 
  badgeCollection, requests, teamMembers,
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
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // News
  getAllNews(): Promise<News[]>;
  getNewsById(id: number): Promise<News | undefined>;
  createNews(article: InsertNews): Promise<News>;
  updateNews(id: number, data: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: number): Promise<boolean>;
  
  // Events
  getAllEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Schedule
  getAllSchedule(): Promise<Schedule[]>;
  createScheduleItem(item: InsertSchedule): Promise<Schedule>;
  updateScheduleItem(id: number, data: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteScheduleItem(id: number): Promise<boolean>;
  
  // Comments
  getCommentsByArticle(articleId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Polls
  getAllPolls(): Promise<Poll[]>;
  createPoll(poll: InsertPoll): Promise<Poll>;
  updatePoll(id: number, data: Partial<InsertPoll>): Promise<Poll | undefined>;
  
  // Config
  getConfig(): Promise<Config | undefined>;
  updateConfig(data: Partial<InsertConfig>): Promise<Config | undefined>;
  
  // Forum
  getAllForumCategories(): Promise<ForumCategory[]>;
  createForumCategory(cat: InsertForumCategory): Promise<ForumCategory>;
  getThreadsByCategory(categoryId: number): Promise<ForumThread[]>;
  getThreadById(id: number): Promise<ForumThread | undefined>;
  createThread(thread: InsertForumThread): Promise<ForumThread>;
  incrementThreadViews(id: number): Promise<void>;
  getPostsByThread(threadId: number): Promise<ForumPost[]>;
  createPost(post: InsertForumPost): Promise<ForumPost>;
  deletePost(id: number): Promise<boolean>;
  
  // Marketplace
  getAllMarketplaceItems(): Promise<MarketplaceItem[]>;
  getMarketplaceItemByClass(className: string): Promise<MarketplaceItem | undefined>;
  upsertMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem>;
  
  // Badges
  getAllBadges(): Promise<Badge[]>;
  searchBadges(query: string): Promise<Badge[]>;
  upsertBadge(badge: InsertBadge): Promise<Badge>;
  
  // Requests
  getAllRequests(): Promise<Request[]>;
  createRequest(req: InsertRequest): Promise<Request>;
  deleteRequest(id: number): Promise<boolean>;
  
  // Team
  getAllTeamMembers(): Promise<TeamMember[]>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;
  
  // Themes
  getAllThemes(): Promise<Theme[]>;
  getThemeBySlug(slug: string): Promise<Theme | undefined>;
  getActiveTheme(): Promise<Theme | undefined>;
  createTheme(theme: InsertTheme): Promise<Theme>;
  updateTheme(id: number, data: Partial<InsertTheme>): Promise<Theme | undefined>;
  setActiveTheme(slug: string): Promise<Config | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private newsItems: Map<number, News> = new Map();
  private eventItems: Map<number, Event> = new Map();
  private scheduleItems: Map<number, Schedule> = new Map();
  private commentItems: Map<number, Comment> = new Map();
  private pollItems: Map<number, Poll> = new Map();
  private configItem: Config | undefined;
  private forumCats: Map<number, ForumCategory> = new Map();
  private threads: Map<number, ForumThread> = new Map();
  private posts: Map<number, ForumPost> = new Map();
  private marketItems: Map<number, MarketplaceItem> = new Map();
  private badges: Map<number, Badge> = new Map();
  private requestItems: Map<number, Request> = new Map();
  private teamItems: Map<number, TeamMember> = new Map();
  private themeItems: Map<number, Theme> = new Map();
  private nextId = 1;

  private getId() { return this.nextId++; }

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed admin user
    const adminId = this.getId();
    this.users.set(adminId, {
      id: adminId, email: "admin@habbospeed.com", passwordHash: "$2b$10$demo",
      displayName: "HabboSpeed", habboUsername: "HabboSpeed", avatarUrl: null,
      role: "admin", approved: true, speedPoints: 1000, createdAt: new Date()
    });

    // Seed config
    const configId = this.getId();
    this.configItem = {
      id: configId, radioService: "azuracast",
      apiUrl: "https://radio.example.com/api/nowplaying/1",
      listenUrl: "https://radio.example.com/listen/habbospeed/radio.mp3",
      homePlayerBgUrl: null,
      activeTheme: "circo",
      slideshow: [
        { title: "Bienvenido a HabboSpeed", subtitle: "Tu fansite de Habbo favorita", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_hween24_bg.png", cta: { text: "Explorar", href: "/community" } },
        { title: "Nuevos Eventos", subtitle: "No te pierdas los eventos de la semana", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_snowstorm24.png", cta: { text: "Ver Eventos", href: "/events" } },
        { title: "Radio en Vivo", subtitle: "Escucha a nuestros DJs las 24/7", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_xmas24_bg.png", cta: { text: "Escuchar", href: "/" } },
      ],
      discordWebhooks: {}
    };

    // Seed news
    const newsData = [
      { title: "Habboween 2025: The Last of the Pixels", summary: "El evento de Halloween más grande llega a Habbo con nuevas misiones y premios.", content: "Este año, Habbo nos sorprende con un evento de Halloween temático inspirado en los clásicos de supervivencia. Completa misiones, consigue placas exclusivas y decora tu sala con los nuevos muebles de temporada.", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_hween24_bg.png", imageHint: "Halloween Habbo event", category: "Eventos", date: "2025-10-15" },
      { title: "Nuevos muebles de Navidad disponibles", summary: "La colección navideña 2025 ya está en el catálogo con sorpresas.", content: "La temporada navideña trae consigo una nueva línea de muebles exclusivos. Desde chimeneas con animaciones hasta un árbol de navidad interactivo.", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_xmas24_bg.png", imageHint: "Christmas furniture", category: "Catálogo", date: "2025-12-01" },
      { title: "Habbo cumple 25 años", summary: "Celebramos un cuarto de siglo de la comunidad más icónica de internet.", content: "Habbo Hotel celebra su 25 aniversario con eventos especiales, placas conmemorativas y un vistazo al futuro del hotel.", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_snowstorm24.png", imageHint: "Habbo 25th anniversary", category: "Comunidad", date: "2025-08-05" },
    ];
    newsData.forEach(n => {
      const id = this.getId();
      this.newsItems.set(id, { id, ...n, reactions: {}, authorId: adminId, createdAt: new Date() });
    });

    // Seed events
    const eventData = [
      { title: "Noche de Trivia Habbo", server: "Habbo.es", date: "2026-03-25", time: "20:00", roomName: "HabboSpeed Arena", roomOwner: "HabboSpeed", host: "DJ_Luna", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_hween24_bg.png", imageHint: "Trivia night" },
      { title: "Concurso de Salas", server: "Habbo.es", date: "2026-03-28", time: "18:00", roomName: "Speed Design Contest", roomOwner: "HabboSpeed", host: "Pixelarte", imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_snowstorm24.png", imageHint: "Room contest" },
    ];
    eventData.forEach(e => {
      const id = this.getId();
      this.eventItems.set(id, { id, ...e, createdAt: new Date() });
    });

    // Seed schedule
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    days.forEach(day => {
      const id1 = this.getId();
      this.scheduleItems.set(id1, { id: id1, day, startTime: "10:00", endTime: "14:00", showName: "Morning Vibes", djName: "AutoDJ" });
      const id2 = this.getId();
      this.scheduleItems.set(id2, { id: id2, day, startTime: "18:00", endTime: "22:00", showName: "Speed Mix", djName: day === "Sábado" ? "DJ_Luna" : "AutoDJ" });
    });

    // Seed team
    const teamData = [
      { displayName: "HabboSpeed", habboUsername: "HabboSpeed", role: "Fundador", motto: "Velocidad y diversión" },
      { displayName: "DJ Luna", habboUsername: "DJ_Luna", role: "DJ Principal", motto: "La música nos une" },
      { displayName: "Pixelarte", habboUsername: "Pixelarte", role: "Diseñador", motto: "Cada pixel cuenta" },
      { displayName: "Eventera", habboUsername: "Eventera", role: "Eventos", motto: "Creando momentos" },
    ];
    teamData.forEach(t => {
      const id = this.getId();
      this.teamItems.set(id, { id, ...t, joinedAt: new Date() });
    });

    // Seed forum categories
    const catData = [
      { name: "General", description: "Discusiones generales sobre Habbo y la comunidad", sortOrder: 1 },
      { name: "Eventos", description: "Propuestas y discusiones sobre eventos", sortOrder: 2 },
      { name: "Guías y Tutoriales", description: "Comparte tus guías con la comunidad", sortOrder: 3 },
      { name: "Trading", description: "Intercambios y valores de muebles", sortOrder: 4 },
      { name: "Off-Topic", description: "Todo lo que no encaje en otras categorías", sortOrder: 5 },
    ];
    catData.forEach(c => {
      const id = this.getId();
      this.forumCats.set(id, { id, ...c });
    });

    // Seed themes
    const themeData: Array<Omit<Theme, 'id'>> = [
      {
        slug: "default", name: "HabboSpeed Classic", description: "Tema clásico púrpura de HabboSpeed",
        isDefault: true, bannerUrl: null, logoUrl: null,
        colors: {
          primary: "262 84% 58%", primaryForeground: "0 0% 100%",
          accent: "262 40% 18%", accentForeground: "262 84% 78%",
          background: "224 71% 4%", card: "222 47% 8%",
          border: "215 28% 16%", muted: "215 28% 14%",
          glowColor: "139, 92, 246", gradientFrom: "#7c3aed", gradientTo: "#3b82f6"
        },
        decorations: { emoji: "⚡", pattern: "grid", particleType: "none" }
      },
      {
        slug: "circo", name: "HabboSpeed Circo", description: "Bienvenidos al circo más loco de Habbo",
        isDefault: false, bannerUrl: null, logoUrl: null,
        colors: {
          primary: "0 85% 50%", primaryForeground: "0 0% 100%",
          accent: "45 100% 50%", accentForeground: "0 0% 10%",
          background: "0 0% 6%", card: "0 20% 10%",
          border: "0 30% 18%", muted: "0 15% 14%",
          glowColor: "220, 38, 38", gradientFrom: "#dc2626", gradientTo: "#eab308",
          secondary: "45 100% 50%"
        },
        decorations: { emoji: "🎪", pattern: "stripes", particleType: "confetti", accentEmojis: ["🤡", "🎭", "🎪", "🎨", "🎫"] }
      },
      {
        slug: "habboween", name: "Habboween", description: "Noche de terror en el hotel",
        isDefault: false, bannerUrl: null, logoUrl: null,
        colors: {
          primary: "25 95% 53%", primaryForeground: "0 0% 100%",
          accent: "270 60% 40%", accentForeground: "270 80% 80%",
          background: "270 30% 5%", card: "270 25% 9%",
          border: "270 25% 16%", muted: "270 20% 13%",
          glowColor: "249, 115, 22", gradientFrom: "#f97316", gradientTo: "#7c3aed"
        },
        decorations: { emoji: "🎃", pattern: "bats", particleType: "ghosts", accentEmojis: ["👻", "🦇", "💀", "🕷️", "🎃"] }
      },
      {
        slug: "navidad", name: "Navidad Habbo", description: "Felices fiestas en el hotel",
        isDefault: false, bannerUrl: null, logoUrl: null,
        colors: {
          primary: "0 72% 45%", primaryForeground: "0 0% 100%",
          accent: "142 70% 35%", accentForeground: "0 0% 100%",
          background: "210 30% 5%", card: "210 25% 9%",
          border: "210 20% 16%", muted: "210 20% 13%",
          glowColor: "185, 28, 28", gradientFrom: "#b91c1c", gradientTo: "#15803d"
        },
        decorations: { emoji: "🎄", pattern: "snowflakes", particleType: "snow", accentEmojis: ["⛄", "🎅", "🎁", "❄️", "🎄"] }
      },
      {
        slug: "playa", name: "Playa Habbo", description: "Verano y sol en el hotel",
        isDefault: false, bannerUrl: null, logoUrl: null,
        colors: {
          primary: "187 85% 43%", primaryForeground: "0 0% 100%",
          accent: "45 100% 50%", accentForeground: "0 0% 10%",
          background: "200 40% 6%", card: "200 30% 10%",
          border: "200 25% 17%", muted: "200 20% 14%",
          glowColor: "6, 182, 212", gradientFrom: "#06b6d4", gradientTo: "#eab308"
        },
        decorations: { emoji: "🏖️", pattern: "waves", particleType: "bubbles", accentEmojis: ["🌊", "🐚", "☀️", "🏄", "🏖️"] }
      }
    ];
    themeData.forEach(t => {
      const id = this.getId();
      this.themeItems.set(id, { id, ...t } as Theme);
    });

    // Seed polls
    const pollId = this.getId();
    this.pollItems.set(pollId, {
      id: pollId, title: "¿Cuál es tu evento favorito de Habbo?",
      options: [
        { name: "Habboween", votes: 45 },
        { name: "Navidad", votes: 38 },
        { name: "San Valentín", votes: 22 },
        { name: "Aniversario", votes: 31 },
      ],
      isActive: true, createdAt: new Date()
    });
  }

  // Users
  async getUser(id: number) { return this.users.get(id); }
  async getUserByEmail(email: string) { return [...this.users.values()].find(u => u.email === email); }
  async createUser(user: InsertUser) {
    const id = this.getId();
    const newUser: User = { id, ...user, createdAt: new Date() } as User;
    this.users.set(id, newUser);
    return newUser;
  }
  async updateUser(id: number, data: Partial<InsertUser>) {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }
  async getAllUsers() { return [...this.users.values()]; }

  // News
  async getAllNews() { return [...this.newsItems.values()].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)); }
  async getNewsById(id: number) { return this.newsItems.get(id); }
  async createNews(article: InsertNews) {
    const id = this.getId();
    const item: News = { id, ...article, createdAt: new Date() } as News;
    this.newsItems.set(id, item);
    return item;
  }
  async updateNews(id: number, data: Partial<InsertNews>) {
    const item = this.newsItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data };
    this.newsItems.set(id, updated);
    return updated;
  }
  async deleteNews(id: number) { return this.newsItems.delete(id); }

  // Events
  async getAllEvents() { return [...this.eventItems.values()]; }
  async getEventById(id: number) { return this.eventItems.get(id); }
  async createEvent(event: InsertEvent) {
    const id = this.getId();
    const item: Event = { id, ...event, createdAt: new Date() } as Event;
    this.eventItems.set(id, item);
    return item;
  }
  async updateEvent(id: number, data: Partial<InsertEvent>) {
    const item = this.eventItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data };
    this.eventItems.set(id, updated);
    return updated;
  }
  async deleteEvent(id: number) { return this.eventItems.delete(id); }

  // Schedule
  async getAllSchedule() { return [...this.scheduleItems.values()]; }
  async createScheduleItem(item: InsertSchedule) {
    const id = this.getId();
    const sched: Schedule = { id, ...item } as Schedule;
    this.scheduleItems.set(id, sched);
    return sched;
  }
  async updateScheduleItem(id: number, data: Partial<InsertSchedule>) {
    const item = this.scheduleItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data };
    this.scheduleItems.set(id, updated);
    return updated;
  }
  async deleteScheduleItem(id: number) { return this.scheduleItems.delete(id); }

  // Comments
  async getCommentsByArticle(articleId: number) {
    return [...this.commentItems.values()].filter(c => c.articleId === articleId);
  }
  async createComment(comment: InsertComment) {
    const id = this.getId();
    const item: Comment = { id, ...comment, createdAt: new Date() } as Comment;
    this.commentItems.set(id, item);
    return item;
  }
  async deleteComment(id: number) { return this.commentItems.delete(id); }

  // Polls
  async getAllPolls() { return [...this.pollItems.values()]; }
  async createPoll(poll: InsertPoll) {
    const id = this.getId();
    const item: Poll = { id, ...poll, createdAt: new Date() } as Poll;
    this.pollItems.set(id, item);
    return item;
  }
  async updatePoll(id: number, data: Partial<InsertPoll>) {
    const item = this.pollItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data };
    this.pollItems.set(id, updated);
    return updated;
  }

  // Config
  async getConfig() { return this.configItem; }
  async updateConfig(data: Partial<InsertConfig>) {
    if (this.configItem) {
      this.configItem = { ...this.configItem, ...data };
    }
    return this.configItem;
  }

  // Forum
  async getAllForumCategories() { return [...this.forumCats.values()].sort((a, b) => a.sortOrder - b.sortOrder); }
  async createForumCategory(cat: InsertForumCategory) {
    const id = this.getId();
    const item: ForumCategory = { id, ...cat } as ForumCategory;
    this.forumCats.set(id, item);
    return item;
  }
  async getThreadsByCategory(categoryId: number) {
    return [...this.threads.values()].filter(t => t.categoryId === categoryId).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
  }
  async getThreadById(id: number) { return this.threads.get(id); }
  async createThread(thread: InsertForumThread) {
    const id = this.getId();
    const item: ForumThread = { id, ...thread, createdAt: new Date() } as ForumThread;
    this.threads.set(id, item);
    return item;
  }
  async incrementThreadViews(id: number) {
    const t = this.threads.get(id);
    if (t) this.threads.set(id, { ...t, views: t.views + 1 });
  }
  async getPostsByThread(threadId: number) {
    return [...this.posts.values()].filter(p => p.threadId === threadId).sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }
  async createPost(post: InsertForumPost) {
    const id = this.getId();
    const item: ForumPost = { id, ...post, createdAt: new Date() } as ForumPost;
    this.posts.set(id, item);
    return item;
  }
  async deletePost(id: number) { return this.posts.delete(id); }

  // Marketplace
  async getAllMarketplaceItems() { return [...this.marketItems.values()]; }
  async getMarketplaceItemByClass(className: string) { return [...this.marketItems.values()].find(i => i.className === className); }
  async upsertMarketplaceItem(item: InsertMarketplaceItem) {
    const existing = [...this.marketItems.values()].find(i => i.className === item.className);
    if (existing) {
      const updated = { ...existing, ...item, lastUpdated: new Date() };
      this.marketItems.set(existing.id, updated);
      return updated;
    }
    const id = this.getId();
    const newItem: MarketplaceItem = { id, ...item, lastUpdated: new Date() } as MarketplaceItem;
    this.marketItems.set(id, newItem);
    return newItem;
  }

  // Badges
  async getAllBadges() { return [...this.badges.values()]; }
  async searchBadges(query: string) {
    const q = query.toLowerCase();
    return [...this.badges.values()].filter(b => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q));
  }
  async upsertBadge(badge: InsertBadge) {
    const existing = [...this.badges.values()].find(b => b.code === badge.code);
    if (existing) {
      const updated = { ...existing, ...badge };
      this.badges.set(existing.id, updated);
      return updated;
    }
    const id = this.getId();
    const newBadge: Badge = { id, ...badge, discoveredAt: new Date() } as Badge;
    this.badges.set(id, newBadge);
    return newBadge;
  }

  // Requests
  async getAllRequests() { return [...this.requestItems.values()]; }
  async createRequest(req: InsertRequest) {
    const id = this.getId();
    const item: Request = { id, ...req, createdAt: new Date() } as Request;
    this.requestItems.set(id, item);
    return item;
  }
  async deleteRequest(id: number) { return this.requestItems.delete(id); }

  // Team
  async getAllTeamMembers() { return [...this.teamItems.values()]; }
  async createTeamMember(member: InsertTeamMember) {
    const id = this.getId();
    const item: TeamMember = { id, ...member, joinedAt: new Date() } as TeamMember;
    this.teamItems.set(id, item);
    return item;
  }
  async updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
    const item = this.teamItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data };
    this.teamItems.set(id, updated);
    return updated;
  }
  async deleteTeamMember(id: number) { return this.teamItems.delete(id); }

  // Themes
  async getAllThemes() { return [...this.themeItems.values()]; }
  async getThemeBySlug(slug: string) { return [...this.themeItems.values()].find(t => t.slug === slug); }
  async getActiveTheme() {
    const cfg = await this.getConfig();
    const slug = cfg?.activeTheme || "circo";
    return this.getThemeBySlug(slug);
  }
  async createTheme(theme: InsertTheme) {
    const id = this.getId();
    const item: Theme = { id, ...theme } as Theme;
    this.themeItems.set(id, item);
    return item;
  }
  async updateTheme(id: number, data: Partial<InsertTheme>) {
    const item = this.themeItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data };
    this.themeItems.set(id, updated);
    return updated;
  }
  async setActiveTheme(slug: string) {
    const theme = await this.getThemeBySlug(slug);
    if (!theme) return undefined;
    if (this.configItem) {
      this.configItem = { ...this.configItem, activeTheme: slug };
    }
    return this.configItem;
  }
}

export const storage = new MemStorage();
