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

  // DJ Panel
  getDjPanel(): Promise<any>;
  updateDjPanel(data: any): Promise<any>;

  // Chat Messages
  getChatMessages(limit?: number): Promise<any[]>;
  createChatMessage(data: any): Promise<any>;

  // Private Messages
  getMessagesByUser(userId: number): Promise<any[]>;
  getUnreadCount(userId: number): Promise<number>;
  createPrivateMessage(data: any): Promise<any>;
  markMessageRead(id: number): Promise<any>;

  // Verified Badges
  getVerifiedBadges(userId: number): Promise<any[]>;
  createVerifiedBadge(data: any): Promise<any>;

  // Team from Users
  getTeamUsers(): Promise<any[]>;
}

// Helper to map snake_case DB rows to camelCase TypeScript objects
function mapUser(row: any): User {
  return {
    id: row.id, email: row.email, passwordHash: row.password_hash,
    displayName: row.display_name, habboUsername: row.habbo_username,
    avatarUrl: row.avatar_url, role: row.role, approved: row.approved,
    speedPoints: row.speed_points, createdAt: row.created_at,
  };
}
function mapNews(row: any): News {
  return {
    id: row.id, title: row.title, summary: row.summary, content: row.content,
    imageUrl: row.image_url, imageHint: row.image_hint, category: row.category,
    date: row.date, reactions: row.reactions, authorId: row.author_id,
    createdAt: row.created_at,
  };
}
function mapEvent(row: any): Event {
  return {
    id: row.id, title: row.title, server: row.server, date: row.date,
    time: row.time, roomName: row.room_name, roomOwner: row.room_owner,
    host: row.host, imageUrl: row.image_url, imageHint: row.image_hint,
    createdAt: row.created_at,
  };
}
function mapSchedule(row: any): Schedule {
  return {
    id: row.id, day: row.day, startTime: row.start_time,
    endTime: row.end_time, showName: row.show_name, djName: row.dj_name,
  };
}
function mapComment(row: any): Comment {
  return {
    id: row.id, articleId: row.article_id, authorId: row.author_id,
    authorName: row.author_name, content: row.content, createdAt: row.created_at,
  };
}
function mapPoll(row: any): Poll {
  return {
    id: row.id, title: row.title, options: row.options,
    isActive: row.is_active, createdAt: row.created_at,
  };
}
function mapConfig(row: any): Config {
  return {
    id: row.id, radioService: row.radio_service, apiUrl: row.api_url,
    listenUrl: row.listen_url, homePlayerBgUrl: row.home_player_bg_url,
    slideshow: row.slideshow, discordWebhooks: row.discord_webhooks,
    activeTheme: row.active_theme,
  };
}
function mapTheme(row: any): Theme {
  return {
    id: row.id, slug: row.slug, name: row.name, description: row.description,
    colors: row.colors, bannerUrl: row.banner_url, logoUrl: row.logo_url,
    decorations: row.decorations, isDefault: row.is_default,
  };
}
function mapForumCategory(row: any): ForumCategory {
  return { id: row.id, name: row.name, description: row.description, sortOrder: row.sort_order };
}
function mapForumThread(row: any): ForumThread {
  return {
    id: row.id, categoryId: row.category_id, title: row.title,
    authorId: row.author_id, authorName: row.author_name,
    isPinned: row.is_pinned, isLocked: row.is_locked,
    views: row.views, createdAt: row.created_at,
  };
}
function mapForumPost(row: any): ForumPost {
  return {
    id: row.id, threadId: row.thread_id, authorId: row.author_id,
    authorName: row.author_name, content: row.content, createdAt: row.created_at,
  };
}
function mapMarketplaceItem(row: any): MarketplaceItem {
  return {
    id: row.id, itemName: row.item_name, className: row.class_name,
    hotel: row.hotel, currentPrice: row.current_price, avgPrice: row.avg_price,
    priceHistory: row.price_history, imageUrl: row.image_url,
    lastUpdated: row.last_updated,
  };
}
function mapBadge(row: any): Badge {
  return {
    id: row.id, code: row.code, name: row.name, description: row.description,
    hotel: row.hotel, category: row.category, imageUrl: row.image_url,
    discoveredAt: row.discovered_at,
  };
}
function mapRequest(row: any): Request {
  return {
    id: row.id, type: row.type, details: row.details,
    userName: row.user_name, createdAt: row.created_at,
  };
}
function mapTeamMember(row: any): TeamMember {
  return {
    id: row.id, displayName: row.display_name,
    habboUsername: row.habbo_username, role: row.role,
    motto: row.motto, joinedAt: row.joined_at,
  };
}

export class SupabaseStorage implements IStorage {
  private pool: any;

  constructor(pool: any) {
    this.pool = pool;
  }

  private async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  // Users
  async getUser(id: number) {
    const r = await this.query("SELECT * FROM users WHERE id = $1", [id]);
    return r.rows[0] ? mapUser(r.rows[0]) : undefined;
  }
  async getUserByEmail(email: string) {
    const r = await this.query("SELECT * FROM users WHERE email = $1", [email]);
    return r.rows[0] ? mapUser(r.rows[0]) : undefined;
  }
  async createUser(user: InsertUser) {
    const r = await this.query(
      `INSERT INTO users (email, password_hash, display_name, habbo_username, avatar_url, role, approved, speed_points)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user.email, user.passwordHash, user.displayName, user.habboUsername || null, user.avatarUrl || null, user.role || "pending", user.approved ?? false, user.speedPoints ?? 0]
    );
    return mapUser(r.rows[0]);
  }
  async updateUser(id: number, data: Partial<InsertUser>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.email !== undefined) { fields.push(`email = $${i++}`); values.push(data.email); }
    if (data.displayName !== undefined) { fields.push(`display_name = $${i++}`); values.push(data.displayName); }
    if (data.habboUsername !== undefined) { fields.push(`habbo_username = $${i++}`); values.push(data.habboUsername); }
    if (data.avatarUrl !== undefined) { fields.push(`avatar_url = $${i++}`); values.push(data.avatarUrl); }
    if (data.role !== undefined) { fields.push(`role = $${i++}`); values.push(data.role); }
    if (data.approved !== undefined) { fields.push(`approved = $${i++}`); values.push(data.approved); }
    if (data.speedPoints !== undefined) { fields.push(`speed_points = $${i++}`); values.push(data.speedPoints); }
    if (data.passwordHash !== undefined) { fields.push(`password_hash = $${i++}`); values.push(data.passwordHash); }
    if (fields.length === 0) return this.getUser(id);
    values.push(id);
    const r = await this.query(`UPDATE users SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`, values);
    return r.rows[0] ? mapUser(r.rows[0]) : undefined;
  }
  async getAllUsers() {
    const r = await this.query("SELECT * FROM users ORDER BY id");
    return r.rows.map(mapUser);
  }

  // News
  async getAllNews() {
    const r = await this.query("SELECT * FROM news ORDER BY created_at DESC");
    return r.rows.map(mapNews);
  }
  async getNewsById(id: number) {
    const r = await this.query("SELECT * FROM news WHERE id = $1", [id]);
    return r.rows[0] ? mapNews(r.rows[0]) : undefined;
  }
  async createNews(article: InsertNews) {
    const r = await this.query(
      `INSERT INTO news (title, summary, content, image_url, image_hint, category, date, reactions, author_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [article.title, article.summary, article.content, article.imageUrl, article.imageHint || "", article.category, article.date, JSON.stringify(article.reactions || {}), article.authorId || null]
    );
    return mapNews(r.rows[0]);
  }
  async updateNews(id: number, data: Partial<InsertNews>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.title !== undefined) { fields.push(`title = $${i++}`); values.push(data.title); }
    if (data.summary !== undefined) { fields.push(`summary = $${i++}`); values.push(data.summary); }
    if (data.content !== undefined) { fields.push(`content = $${i++}`); values.push(data.content); }
    if (data.imageUrl !== undefined) { fields.push(`image_url = $${i++}`); values.push(data.imageUrl); }
    if (data.imageHint !== undefined) { fields.push(`image_hint = $${i++}`); values.push(data.imageHint); }
    if (data.category !== undefined) { fields.push(`category = $${i++}`); values.push(data.category); }
    if (data.date !== undefined) { fields.push(`date = $${i++}`); values.push(data.date); }
    if (data.reactions !== undefined) { fields.push(`reactions = $${i++}`); values.push(JSON.stringify(data.reactions)); }
    if (fields.length === 0) return this.getNewsById(id);
    values.push(id);
    const r = await this.query(`UPDATE news SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`, values);
    return r.rows[0] ? mapNews(r.rows[0]) : undefined;
  }
  async deleteNews(id: number) {
    const r = await this.query("DELETE FROM news WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Events
  async getAllEvents() {
    const r = await this.query("SELECT * FROM events ORDER BY date DESC, time DESC");
    return r.rows.map(mapEvent);
  }
  async getEventById(id: number) {
    const r = await this.query("SELECT * FROM events WHERE id = $1", [id]);
    return r.rows[0] ? mapEvent(r.rows[0]) : undefined;
  }
  async createEvent(event: InsertEvent) {
    const r = await this.query(
      `INSERT INTO events (title, server, date, time, room_name, room_owner, host, image_url, image_hint)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [event.title, event.server, event.date, event.time, event.roomName, event.roomOwner, event.host, event.imageUrl, event.imageHint || ""]
    );
    return mapEvent(r.rows[0]);
  }
  async updateEvent(id: number, data: Partial<InsertEvent>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.title !== undefined) { fields.push(`title = $${i++}`); values.push(data.title); }
    if (data.server !== undefined) { fields.push(`server = $${i++}`); values.push(data.server); }
    if (data.date !== undefined) { fields.push(`date = $${i++}`); values.push(data.date); }
    if (data.time !== undefined) { fields.push(`time = $${i++}`); values.push(data.time); }
    if (data.roomName !== undefined) { fields.push(`room_name = $${i++}`); values.push(data.roomName); }
    if (data.roomOwner !== undefined) { fields.push(`room_owner = $${i++}`); values.push(data.roomOwner); }
    if (data.host !== undefined) { fields.push(`host = $${i++}`); values.push(data.host); }
    if (data.imageUrl !== undefined) { fields.push(`image_url = $${i++}`); values.push(data.imageUrl); }
    if (fields.length === 0) return this.getEventById(id);
    values.push(id);
    const r = await this.query(`UPDATE events SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`, values);
    return r.rows[0] ? mapEvent(r.rows[0]) : undefined;
  }
  async deleteEvent(id: number) {
    const r = await this.query("DELETE FROM events WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Schedule
  async getAllSchedule() {
    const r = await this.query("SELECT * FROM schedule ORDER BY id");
    return r.rows.map(mapSchedule);
  }
  async createScheduleItem(item: InsertSchedule) {
    const r = await this.query(
      `INSERT INTO schedule (day, start_time, end_time, show_name, dj_name) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [item.day, item.startTime, item.endTime, item.showName, item.djName]
    );
    return mapSchedule(r.rows[0]);
  }
  async updateScheduleItem(id: number, data: Partial<InsertSchedule>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.day !== undefined) { fields.push(`day = $${i++}`); values.push(data.day); }
    if (data.startTime !== undefined) { fields.push(`start_time = $${i++}`); values.push(data.startTime); }
    if (data.endTime !== undefined) { fields.push(`end_time = $${i++}`); values.push(data.endTime); }
    if (data.showName !== undefined) { fields.push(`show_name = $${i++}`); values.push(data.showName); }
    if (data.djName !== undefined) { fields.push(`dj_name = $${i++}`); values.push(data.djName); }
    if (fields.length === 0) return undefined;
    values.push(id);
    const r = await this.query(`UPDATE schedule SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`, values);
    return r.rows[0] ? mapSchedule(r.rows[0]) : undefined;
  }
  async deleteScheduleItem(id: number) {
    const r = await this.query("DELETE FROM schedule WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Comments
  async getCommentsByArticle(articleId: number) {
    const r = await this.query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at ASC", [articleId]);
    return r.rows.map(mapComment);
  }
  async createComment(comment: InsertComment) {
    const r = await this.query(
      `INSERT INTO comments (article_id, author_id, author_name, content) VALUES ($1, $2, $3, $4) RETURNING *`,
      [comment.articleId || null, comment.authorId || null, comment.authorName, comment.content]
    );
    return mapComment(r.rows[0]);
  }
  async deleteComment(id: number) {
    const r = await this.query("DELETE FROM comments WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Polls
  async getAllPolls() {
    const r = await this.query("SELECT * FROM polls ORDER BY created_at DESC");
    return r.rows.map(mapPoll);
  }
  async createPoll(poll: InsertPoll) {
    const r = await this.query(
      `INSERT INTO polls (title, options, is_active) VALUES ($1, $2, $3) RETURNING *`,
      [poll.title, JSON.stringify(poll.options || []), poll.isActive ?? true]
    );
    return mapPoll(r.rows[0]);
  }
  async updatePoll(id: number, data: Partial<InsertPoll>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.title !== undefined) { fields.push(`title = $${i++}`); values.push(data.title); }
    if (data.options !== undefined) { fields.push(`options = $${i++}`); values.push(JSON.stringify(data.options)); }
    if (data.isActive !== undefined) { fields.push(`is_active = $${i++}`); values.push(data.isActive); }
    if (fields.length === 0) return undefined;
    values.push(id);
    const r = await this.query(`UPDATE polls SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`, values);
    return r.rows[0] ? mapPoll(r.rows[0]) : undefined;
  }

  // Config
  async getConfig() {
    const r = await this.query("SELECT * FROM config ORDER BY id LIMIT 1");
    return r.rows[0] ? mapConfig(r.rows[0]) : undefined;
  }
  async updateConfig(data: Partial<InsertConfig>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.radioService !== undefined) { fields.push(`radio_service = $${i++}`); values.push(data.radioService); }
    if (data.apiUrl !== undefined) { fields.push(`api_url = $${i++}`); values.push(data.apiUrl); }
    if (data.listenUrl !== undefined) { fields.push(`listen_url = $${i++}`); values.push(data.listenUrl); }
    if (data.homePlayerBgUrl !== undefined) { fields.push(`home_player_bg_url = $${i++}`); values.push(data.homePlayerBgUrl); }
    if (data.slideshow !== undefined) { fields.push(`slideshow = $${i++}`); values.push(JSON.stringify(data.slideshow)); }
    if (data.discordWebhooks !== undefined) { fields.push(`discord_webhooks = $${i++}`); values.push(JSON.stringify(data.discordWebhooks)); }
    if (data.activeTheme !== undefined) { fields.push(`active_theme = $${i++}`); values.push(data.activeTheme); }
    if (fields.length === 0) return this.getConfig();
    const r = await this.query(`UPDATE config SET ${fields.join(", ")} WHERE id = (SELECT id FROM config ORDER BY id LIMIT 1) RETURNING *`, values);
    return r.rows[0] ? mapConfig(r.rows[0]) : undefined;
  }

  // Forum
  async getAllForumCategories() {
    const r = await this.query("SELECT * FROM forum_categories ORDER BY sort_order ASC");
    return r.rows.map(mapForumCategory);
  }
  async createForumCategory(cat: InsertForumCategory) {
    const r = await this.query(
      `INSERT INTO forum_categories (name, description, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      [cat.name, cat.description || null, cat.sortOrder ?? 0]
    );
    return mapForumCategory(r.rows[0]);
  }
  async getThreadsByCategory(categoryId: number) {
    const r = await this.query(
      "SELECT * FROM forum_threads WHERE category_id = $1 ORDER BY is_pinned DESC, created_at DESC", [categoryId]
    );
    return r.rows.map(mapForumThread);
  }
  async getThreadById(id: number) {
    const r = await this.query("SELECT * FROM forum_threads WHERE id = $1", [id]);
    return r.rows[0] ? mapForumThread(r.rows[0]) : undefined;
  }
  async createThread(thread: InsertForumThread) {
    const r = await this.query(
      `INSERT INTO forum_threads (category_id, title, author_id, author_name, is_pinned, is_locked, views)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [thread.categoryId || null, thread.title, thread.authorId || null, thread.authorName, thread.isPinned ?? false, thread.isLocked ?? false, thread.views ?? 0]
    );
    return mapForumThread(r.rows[0]);
  }
  async incrementThreadViews(id: number) {
    await this.query("UPDATE forum_threads SET views = views + 1 WHERE id = $1", [id]);
  }
  async getPostsByThread(threadId: number) {
    const r = await this.query("SELECT * FROM forum_posts WHERE thread_id = $1 ORDER BY created_at ASC", [threadId]);
    return r.rows.map(mapForumPost);
  }
  async createPost(post: InsertForumPost) {
    const r = await this.query(
      `INSERT INTO forum_posts (thread_id, author_id, author_name, content) VALUES ($1, $2, $3, $4) RETURNING *`,
      [post.threadId || null, post.authorId || null, post.authorName, post.content]
    );
    return mapForumPost(r.rows[0]);
  }
  async deletePost(id: number) {
    const r = await this.query("DELETE FROM forum_posts WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Marketplace
  async getAllMarketplaceItems() {
    const r = await this.query("SELECT * FROM marketplace_items ORDER BY last_updated DESC");
    return r.rows.map(mapMarketplaceItem);
  }
  async getMarketplaceItemByClass(className: string) {
    const r = await this.query("SELECT * FROM marketplace_items WHERE class_name = $1", [className]);
    return r.rows[0] ? mapMarketplaceItem(r.rows[0]) : undefined;
  }
  async upsertMarketplaceItem(item: InsertMarketplaceItem) {
    const r = await this.query(
      `INSERT INTO marketplace_items (item_name, class_name, hotel, current_price, avg_price, price_history, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (class_name) DO UPDATE SET
         item_name = EXCLUDED.item_name, current_price = EXCLUDED.current_price,
         avg_price = EXCLUDED.avg_price, price_history = EXCLUDED.price_history,
         image_url = EXCLUDED.image_url, last_updated = NOW()
       RETURNING *`,
      [item.itemName, item.className, item.hotel || "es", item.currentPrice ?? null, item.avgPrice ?? null, JSON.stringify(item.priceHistory || []), item.imageUrl || null]
    );
    return mapMarketplaceItem(r.rows[0]);
  }

  // Badges
  async getAllBadges() {
    const r = await this.query("SELECT * FROM badge_collection ORDER BY discovered_at DESC");
    return r.rows.map(mapBadge);
  }
  async searchBadges(query: string) {
    const r = await this.query(
      "SELECT * FROM badge_collection WHERE LOWER(name) LIKE $1 OR LOWER(code) LIKE $1 ORDER BY name",
      [`%${query.toLowerCase()}%`]
    );
    return r.rows.map(mapBadge);
  }
  async upsertBadge(badge: InsertBadge) {
    const r = await this.query(
      `INSERT INTO badge_collection (code, name, description, hotel, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (code) DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description,
         category = EXCLUDED.category, image_url = EXCLUDED.image_url
       RETURNING *`,
      [badge.code, badge.name, badge.description || null, badge.hotel || "es", badge.category || null, badge.imageUrl || null]
    );
    return mapBadge(r.rows[0]);
  }

  // Requests
  async getAllRequests() {
    const r = await this.query("SELECT * FROM requests ORDER BY created_at DESC");
    return r.rows.map(mapRequest);
  }
  async createRequest(req: InsertRequest) {
    const r = await this.query(
      `INSERT INTO requests (type, details, user_name) VALUES ($1, $2, $3) RETURNING *`,
      [req.type, req.details, req.userName]
    );
    return mapRequest(r.rows[0]);
  }
  async deleteRequest(id: number) {
    const r = await this.query("DELETE FROM requests WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Team
  async getAllTeamMembers() {
    const r = await this.query("SELECT * FROM team_members ORDER BY id");
    return r.rows.map(mapTeamMember);
  }
  async createTeamMember(member: InsertTeamMember) {
    const r = await this.query(
      `INSERT INTO team_members (display_name, habbo_username, role, motto) VALUES ($1, $2, $3, $4) RETURNING *`,
      [member.displayName, member.habboUsername, member.role, member.motto || null]
    );
    return mapTeamMember(r.rows[0]);
  }
  async updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.displayName !== undefined) { fields.push(`display_name = $${i++}`); values.push(data.displayName); }
    if (data.habboUsername !== undefined) { fields.push(`habbo_username = $${i++}`); values.push(data.habboUsername); }
    if (data.role !== undefined) { fields.push(`role = $${i++}`); values.push(data.role); }
    if (data.motto !== undefined) { fields.push(`motto = $${i++}`); values.push(data.motto); }
    if (fields.length === 0) return undefined;
    values.push(id);
    const r = await this.query(`UPDATE team_members SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`, values);
    return r.rows[0] ? mapTeamMember(r.rows[0]) : undefined;
  }
  async deleteTeamMember(id: number) {
    const r = await this.query("DELETE FROM team_members WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Themes
  async getAllThemes() {
    const r = await this.query("SELECT * FROM themes ORDER BY id");
    return r.rows.map(mapTheme);
  }
  async getThemeBySlug(slug: string) {
    const r = await this.query("SELECT * FROM themes WHERE slug = $1", [slug]);
    return r.rows[0] ? mapTheme(r.rows[0]) : undefined;
  }
  async getActiveTheme() {
    const cfg = await this.getConfig();
    const slug = cfg?.activeTheme || "circo";
    return this.getThemeBySlug(slug);
  }
  async createTheme(theme: InsertTheme) {
    const r = await this.query(
      `INSERT INTO themes (slug, name, description, colors, banner_url, logo_url, decorations, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [theme.slug, theme.name, theme.description || null, JSON.stringify(theme.colors || {}), theme.bannerUrl || null, theme.logoUrl || null, JSON.stringify(theme.decorations || {}), theme.isDefault ?? false]
    );
    return mapTheme(r.rows[0]);
  }
  async updateTheme(id: number, data: Partial<InsertTheme>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.slug !== undefined) { fields.push(`slug = $${i++}`); values.push(data.slug); }
    if (data.name !== undefined) { fields.push(`name = $${i++}`); values.push(data.name); }
    if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description); }
    if (data.colors !== undefined) { fields.push(`colors = $${i++}`); values.push(JSON.stringify(data.colors)); }
    if (data.bannerUrl !== undefined) { fields.push(`banner_url = $${i++}`); values.push(data.bannerUrl); }
    if (data.logoUrl !== undefined) { fields.push(`logo_url = $${i++}`); values.push(data.logoUrl); }
    if (data.decorations !== undefined) { fields.push(`decorations = $${i++}`); values.push(JSON.stringify(data.decorations)); }
    if (data.isDefault !== undefined) { fields.push(`is_default = $${i++}`); values.push(data.isDefault); }
    if (fields.length === 0) return undefined;
    values.push(id);
    const r = await this.query(`UPDATE themes SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`, values);
    return r.rows[0] ? mapTheme(r.rows[0]) : undefined;
  }
  async setActiveTheme(slug: string) {
    const theme = await this.getThemeBySlug(slug);
    if (!theme) return undefined;
    return this.updateConfig({ activeTheme: slug });
  }

  // DJ Panel
  async getDjPanel() {
    const r = await this.query('SELECT * FROM dj_panel ORDER BY id LIMIT 1');
    if (!r.rows[0]) return null;
    const row = r.rows[0];
    return {
      id: row.id,
      currentDj: row.current_dj,
      nextDj: row.next_dj,
      djMessage: row.dj_message,
      updatedAt: row.updated_at,
    };
  }
  async updateDjPanel(data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.currentDj !== undefined) { fields.push(`current_dj = $${i++}`); values.push(data.currentDj); }
    if (data.nextDj !== undefined) { fields.push(`next_dj = $${i++}`); values.push(data.nextDj); }
    if (data.djMessage !== undefined) { fields.push(`dj_message = $${i++}`); values.push(data.djMessage); }
    fields.push(`updated_at = NOW()`);
    if (values.length === 0) return this.getDjPanel();
    const r = await this.query(
      `UPDATE dj_panel SET ${fields.join(', ')} WHERE id = (SELECT id FROM dj_panel ORDER BY id LIMIT 1) RETURNING *`,
      values
    );
    if (!r.rows[0]) return null;
    const row = r.rows[0];
    return {
      id: row.id,
      currentDj: row.current_dj,
      nextDj: row.next_dj,
      djMessage: row.dj_message,
      updatedAt: row.updated_at,
    };
  }

  // Chat Messages
  async getChatMessages(limit: number = 50) {
    const r = await this.query(
      'SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      habboUsername: row.habbo_username,
      message: row.message,
      createdAt: row.created_at,
    })).reverse();
  }
  async createChatMessage(data: any) {
    const r = await this.query(
      `INSERT INTO chat_messages (user_id, user_name, habbo_username, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.userId || null, data.userName, data.habboUsername || null, data.message]
    );
    const row = r.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      habboUsername: row.habbo_username,
      message: row.message,
      createdAt: row.created_at,
    };
  }

  // Private Messages
  async getMessagesByUser(userId: number) {
    const r = await this.query(
      'SELECT * FROM private_messages WHERE to_user_id = $1 OR from_user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      subject: row.subject,
      content: row.content,
      isRead: row.is_read,
      createdAt: row.created_at,
    }));
  }
  async getUnreadCount(userId: number) {
    const r = await this.query(
      'SELECT COUNT(*) AS count FROM private_messages WHERE to_user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(r.rows[0]?.count ?? '0', 10);
  }
  async createPrivateMessage(data: any) {
    const r = await this.query(
      `INSERT INTO private_messages (from_user_id, to_user_id, subject, content, is_read)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.fromUserId, data.toUserId, data.subject || '', data.content, false]
    );
    const row = r.rows[0];
    return {
      id: row.id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      subject: row.subject,
      content: row.content,
      isRead: row.is_read,
      createdAt: row.created_at,
    };
  }
  async markMessageRead(id: number) {
    const r = await this.query(
      'UPDATE private_messages SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );
    if (!r.rows[0]) return null;
    const row = r.rows[0];
    return {
      id: row.id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      subject: row.subject,
      content: row.content,
      isRead: row.is_read,
      createdAt: row.created_at,
    };
  }

  // Verified Badges
  async getVerifiedBadges(userId: number) {
    const r = await this.query(
      'SELECT * FROM verified_badges WHERE user_id = $1 ORDER BY verified_at DESC',
      [userId]
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      badgeCode: row.badge_code,
      verifiedAt: row.verified_at,
    }));
  }
  async createVerifiedBadge(data: any) {
    const r = await this.query(
      `INSERT INTO verified_badges (user_id, badge_code)
       VALUES ($1, $2) RETURNING *`,
      [data.userId, data.badgeCode]
    );
    const row = r.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      badgeCode: row.badge_code,
      verifiedAt: row.verified_at,
    };
  }

  // Team from Users
  async getTeamUsers() {
    const r = await this.query(
      "SELECT * FROM users WHERE role IN ('admin', 'dj') AND approved = true ORDER BY role, display_name"
    );
    return r.rows.map(mapUser);
  }
}
