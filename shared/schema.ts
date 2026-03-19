import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============ USERS ============
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  habboUsername: text("habbo_username"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("pending"), // admin, dj, user, pending
  approved: boolean("approved").notNull().default(false),
  speedPoints: integer("speed_points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============ NEWS ============
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
  imageHint: text("image_hint").default(""),
  category: text("category").notNull(),
  date: text("date").notNull(),
  reactions: jsonb("reactions").default({}),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsSchema = createInsertSchema(news).omit({ id: true, createdAt: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

// ============ EVENTS ============
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  server: text("server").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  roomName: text("room_name").notNull(),
  roomOwner: text("room_owner").notNull(),
  host: text("host").notNull(),
  imageUrl: text("image_url").notNull(),
  imageHint: text("image_hint").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// ============ SCHEDULE ============
export const schedule = pgTable("schedule", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  showName: text("show_name").notNull(),
  djName: text("dj_name").notNull(),
});

export const insertScheduleSchema = createInsertSchema(schedule).omit({ id: true });
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedule.$inferSelect;

// ============ COMMENTS ============
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => news.id),
  authorId: integer("author_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// ============ POLLS ============
export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  options: jsonb("options").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPollSchema = createInsertSchema(polls).omit({ id: true, createdAt: true });
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Poll = typeof polls.$inferSelect;

// ============ CONFIG ============
export const config = pgTable("config", {
  id: serial("id").primaryKey(),
  radioService: text("radio_service").notNull().default("azuracast"),
  apiUrl: text("api_url").notNull(),
  listenUrl: text("listen_url").notNull(),
  homePlayerBgUrl: text("home_player_bg_url"),
  slideshow: jsonb("slideshow").default([]),
  discordWebhooks: jsonb("discord_webhooks").default({}),
  activeTheme: text("active_theme").notNull().default("circo"),
});

export const insertConfigSchema = createInsertSchema(config).omit({ id: true });
export type InsertConfig = z.infer<typeof insertConfigSchema>;
export type Config = typeof config.$inferSelect;

// ============ THEMES ============
export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  colors: jsonb("colors").notNull().default({}),
  bannerUrl: text("banner_url"),
  logoUrl: text("logo_url"),
  decorations: jsonb("decorations").default({}),
  isDefault: boolean("is_default").notNull().default(false),
});

export const insertThemeSchema = createInsertSchema(themes).omit({ id: true });
export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themes.$inferSelect;

// ============ FORUM ============
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({ id: true });
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type ForumCategory = typeof forumCategories.$inferSelect;

export const forumThreads = pgTable("forum_threads", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => forumCategories.id),
  title: text("title").notNull(),
  authorId: integer("author_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({ id: true, createdAt: true });
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumThread = typeof forumThreads.$inferSelect;

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => forumThreads.id),
  authorId: integer("author_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true, createdAt: true });
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

// ============ MARKETPLACE ============
export const marketplaceItems = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  itemName: text("item_name").notNull(),
  className: text("class_name").notNull(),
  hotel: text("hotel").notNull().default("es"),
  currentPrice: integer("current_price"),
  avgPrice: integer("avg_price"),
  priceHistory: jsonb("price_history").default([]),
  imageUrl: text("image_url"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({ id: true, lastUpdated: true });
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;

// ============ BADGE COLLECTION ============
export const badgeCollection = pgTable("badge_collection", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  hotel: text("hotel").notNull().default("es"),
  category: text("category"),
  imageUrl: text("image_url"),
  discoveredAt: timestamp("discovered_at").defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badgeCollection).omit({ id: true, discoveredAt: true });
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badgeCollection.$inferSelect;

// ============ REQUESTS (song/shoutout) ============
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // saludo, grito, concurso, cancion, declaracion
  details: text("details").notNull(),
  userName: text("user_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRequestSchema = createInsertSchema(requests).omit({ id: true, createdAt: true });
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requests.$inferSelect;

// ============ TEAM MEMBERS ============
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  habboUsername: text("habbo_username").notNull(),
  role: text("role").notNull(),
  motto: text("motto"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, joinedAt: true });
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// ============ DJ PANEL ============
export const djPanel = pgTable("dj_panel", {
  id: serial("id").primaryKey(),
  currentDj: text("current_dj").default("AutoDJ"),
  nextDj: text("next_dj").default(""),
  djMessage: text("dj_message").default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDjPanelSchema = createInsertSchema(djPanel).omit({ id: true, updatedAt: true });
export type InsertDjPanel = z.infer<typeof insertDjPanelSchema>;
export type DjPanel = typeof djPanel.$inferSelect;

// ============ CHAT MESSAGES ============
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  habboUsername: text("habbo_username"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// ============ PRIVATE MESSAGES ============
export const privateMessages = pgTable("private_messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull().default(""),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrivateMessageSchema = createInsertSchema(privateMessages).omit({ id: true, createdAt: true });
export type InsertPrivateMessage = z.infer<typeof insertPrivateMessageSchema>;
export type PrivateMessage = typeof privateMessages.$inferSelect;

// ============ VERIFIED BADGES ============
export const verifiedBadges = pgTable("verified_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeCode: text("badge_code").notNull(),
  verifiedAt: timestamp("verified_at").defaultNow(),
});

export const insertVerifiedBadgeSchema = createInsertSchema(verifiedBadges).omit({ id: true, verifiedAt: true });
export type InsertVerifiedBadge = z.infer<typeof insertVerifiedBadgeSchema>;
export type VerifiedBadge = typeof verifiedBadges.$inferSelect;
