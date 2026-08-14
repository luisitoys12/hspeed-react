import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
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
  mundialStamps: jsonb("mundial_stamps").default([]),
  mundialLogros: jsonb("mundial_logros").default([]),
  mundialClan: text("mundial_clan"),
  mundialPredictions: jsonb("mundial_predictions").default({}),
  mundialTickets: integer("mundial_tickets").notNull().default(0),
  mundialPenalties: jsonb("mundial_penalties").default({
    maxScore: 0,
    totalGames: 0,
  }),
  vipTier: text("vip_tier"), // silver, gold, diamond
  totalRequests: integer("total_requests").notNull().default(0),
  favoriteGenre: text("favorite_genre"),
  bio: text("bio"),
  socialLinks: jsonb("social_links").default({}),
  badgesEarned: jsonb("badges_earned").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
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

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
});
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

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});
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

export const insertScheduleSchema = createInsertSchema(schedule).omit({
  id: true,
});
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

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});
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

export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
});
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
  maintenanceMode: boolean("maintenance_mode").notNull().default(true),
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

export const insertForumCategorySchema = createInsertSchema(
  forumCategories,
).omit({ id: true });
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

export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({
  id: true,
  createdAt: true,
});
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

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
});
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

export const insertMarketplaceItemSchema = createInsertSchema(
  marketplaceItems,
).omit({ id: true, lastUpdated: true });
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

export const insertBadgeSchema = createInsertSchema(badgeCollection).omit({
  id: true,
  discoveredAt: true,
});
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

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  createdAt: true,
});
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

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// ============ DJ PANEL ============
export const djPanel = pgTable("dj_panel", {
  id: serial("id").primaryKey(),
  currentDj: text("current_dj").default("HabboSpeed"),
  nextDj: text("next_dj").default(""),
  djMessage: text("dj_message").default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDjPanelSchema = createInsertSchema(djPanel).omit({
  id: true,
  updatedAt: true,
});
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

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// ============ PRIVATE MESSAGES ============
export const privateMessages = pgTable("private_messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id")
    .references(() => users.id)
    .notNull(),
  toUserId: integer("to_user_id")
    .references(() => users.id)
    .notNull(),
  subject: text("subject").notNull().default(""),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrivateMessageSchema = createInsertSchema(
  privateMessages,
).omit({ id: true, createdAt: true });
export type InsertPrivateMessage = z.infer<typeof insertPrivateMessageSchema>;
export type PrivateMessage = typeof privateMessages.$inferSelect;

// ============ VERIFIED BADGES ============
export const verifiedBadges = pgTable("verified_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  badgeCode: text("badge_code").notNull(),
  verifiedAt: timestamp("verified_at").defaultNow(),
});

export const insertVerifiedBadgeSchema = createInsertSchema(
  verifiedBadges,
).omit({ id: true, verifiedAt: true });
export type InsertVerifiedBadge = z.infer<typeof insertVerifiedBadgeSchema>;
export type VerifiedBadge = typeof verifiedBadges.$inferSelect;

// ============ DOWNLOADS ============
export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  category: text("category").notNull().default("general"), // general, software, recurso, otro
  addedBy: text("added_by").notNull(),
  downloadCount: integer("download_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  createdAt: true,
  downloadCount: true,
});
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;

// ============ BANNED SONGS ============
export const bannedSongs = pgTable("banned_songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist"),
  reason: text("reason"),
  bannedBy: text("banned_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBannedSongSchema = createInsertSchema(bannedSongs).omit({
  id: true,
  createdAt: true,
});
export type InsertBannedSong = z.infer<typeof insertBannedSongSchema>;
export type BannedSong = typeof bannedSongs.$inferSelect;

// ============ CONTACT MESSAGES ============
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  ip: text("ip"),
  status: text("status").notNull().default("pending"), // pending, read, replied, archived
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(
  contactMessages,
).omit({ id: true, createdAt: true });
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// ============ PANEL LOGS ============
export const panelLogs = pgTable("panel_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  ip: text("ip"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPanelLogSchema = createInsertSchema(panelLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertPanelLog = z.infer<typeof insertPanelLogSchema>;
export type PanelLog = typeof panelLogs.$inferSelect;

// ============ REPORTED MESSAGES ============
export const reportedMessages = pgTable("reported_messages", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => privateMessages.id),
  reportedBy: integer("reported_by").references(() => users.id),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, warned, banned, dismissed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportedMessageSchema = createInsertSchema(
  reportedMessages,
).omit({ id: true, createdAt: true });
export type InsertReportedMessage = z.infer<typeof insertReportedMessageSchema>;
export type ReportedMessage = typeof reportedMessages.$inferSelect;

// ============ SHOP / STORE (gamification) ============
export const shopProducts = pgTable("shop_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("decoracion"), // decoracion, objeto, tema, fondo, efecto
  price: integer("price").notNull().default(0),
  imageUrl: text("image_url"),
  previewUrl: text("preview_url"),
  data: jsonb("data").default({}), // extra config (css vars, animation, etc)
  isLimited: boolean("is_limited").notNull().default(false),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShopProductSchema = createInsertSchema(shopProducts).omit({
  id: true,
  createdAt: true,
});
export type InsertShopProduct = z.infer<typeof insertShopProductSchema>;
export type ShopProduct = typeof shopProducts.$inferSelect;

// ============ USER INVENTORY ============
export const userInventory = pgTable("user_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => shopProducts.id)
    .notNull(),
  isEquipped: boolean("is_equipped").notNull().default(false),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const insertUserInventorySchema = createInsertSchema(userInventory).omit(
  { id: true, purchasedAt: true },
);
export type InsertUserInventory = z.infer<typeof insertUserInventorySchema>;
export type UserInventory = typeof userInventory.$inferSelect;

// ============ NOTIFICATIONS ============
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, achievement, points, message, shop
  title: text("title").notNull(),
  message: text("message"),
  icon: text("icon"),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// ============ USER PROFILE EXTENDED ============
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  bio: text("bio").default(""),
  backgroundUrl: text("background_url"),
  backgroundColor: text("background_color").default("#1e293b"),
  accentColor: text("accent_color"),
  aboutMe: text("about_me").default(""),
  socialYoutube: text("social_youtube"),
  socialTwitter: text("social_twitter"),
  socialInstagram: text("social_instagram"),
  customCss: text("custom_css"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  updatedAt: true,
});
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// ============ PROFILE WALL / MURO ============
export const profileWall = pgTable("profile_wall", {
  id: serial("id").primaryKey(),
  profileUserId: integer("profile_user_id")
    .references(() => users.id)
    .notNull(),
  authorId: integer("author_id")
    .references(() => users.id)
    .notNull(),
  authorName: text("author_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfileWallSchema = createInsertSchema(profileWall).omit({
  id: true,
  createdAt: true,
});
export type InsertProfileWall = z.infer<typeof insertProfileWallSchema>;
export type ProfileWallMessage = typeof profileWall.$inferSelect;

// ============ SONG HISTORY ============
export const songHistory = pgTable("song_history", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  coverUrl: text("cover_url"),
  playedAt: timestamp("played_at").defaultNow(),
  playedByDj: text("played_by_dj"),
  durationSeconds: integer("duration_seconds"),
  requestedBy: text("requested_by"),
  playCount: integer("play_count").notNull().default(1),
});

export const insertSongHistorySchema = createInsertSchema(songHistory).omit({
  id: true,
  playedAt: true,
});
export type InsertSongHistory = z.infer<typeof insertSongHistorySchema>;
export type SongHistory = typeof songHistory.$inferSelect;

// ============ VIP MEMBERSHIPS ============
export const vipMemberships = pgTable("vip_memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  tier: text("tier").notNull(), // silver, gold, diamond
  startedAt: timestamp("started_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  paymentRef: text("payment_ref"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertVipMembershipSchema = createInsertSchema(
  vipMemberships,
).omit({ id: true, startedAt: true });
export type InsertVipMembership = z.infer<typeof insertVipMembershipSchema>;
export type VipMembership = typeof vipMemberships.$inferSelect;

// ============ VIP PERKS LOG ============
export const vipPerksLog = pgTable("vip_perks_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  perkUsed: text("perk_used").notNull(),
  usedAt: timestamp("used_at").defaultNow(),
});

export const insertVipPerkLogSchema = createInsertSchema(vipPerksLog).omit({
  id: true,
  usedAt: true,
});
export type InsertVipPerkLog = z.infer<typeof insertVipPerkLogSchema>;
export type VipPerkLog = typeof vipPerksLog.$inferSelect;

// ============ HSPEED ROOMS ============
export const hspeedRooms = pgTable("hspeed_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  roomCode: text("room_code"),
  ownerHabbo: text("owner_habbo"),
  hotel: text("hotel").default("es"),
  category: text("category"), // oficial, vip, evento, musica
  capacity: integer("capacity"),
  currentVisitors: integer("current_visitors").default(0),
  isActive: boolean("is_active").notNull().default(true),
  thumbnailUrl: text("thumbnail_url"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHSpeedRoomSchema = createInsertSchema(hspeedRooms).omit({
  id: true,
  createdAt: true,
});
export type InsertHSpeedRoom = z.infer<typeof insertHSpeedRoomSchema>;
export type HSpeedRoom = typeof hspeedRooms.$inferSelect;

// ============ SUPPORT TICKETS ============
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  category: text("category").notNull().default("general"), // bug, suggestion, radio, vip, other
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupportTicketSchema = createInsertSchema(
  supportTickets,
).omit({ id: true, createdAt: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// ============ ALLIANCES ============
export const alliances = pgTable("alliances", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull(),
  websiteUrl: text("website_url"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAllianceSchema = createInsertSchema(alliances).omit({
  id: true,
  createdAt: true,
});
export type InsertAlliance = z.infer<typeof insertAllianceSchema>;
export type Alliance = typeof alliances.$inferSelect;

// ============ REACTION ICONS (Speed Icons collectibles) ============
export const reactionIcons = pgTable("reaction_icons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g., "like", "love", "fire", "sparkles", "trophy"
  name: text("name").notNull(),
  label: text("label").notNull(), // short label for UI
  iconUrl: text("icon_url").notNull(),
  animatedIconUrl: text("animated_icon_url"),
  category: text("category").notNull().default("general"), // general, seasonal, event, vip
  rarity: text("rarity").notNull().default("common"), // common, rare, epic, legendary
  speedPointsCost: integer("speed_points_cost").default(0),
  unlockCondition: jsonb("unlock_condition").default({}), // { type: "news_reactions", count: 100 }
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReactionIconSchema = createInsertSchema(reactionIcons).omit({
  id: true,
  createdAt: true,
});
export type InsertReactionIcon = z.infer<typeof insertReactionIconSchema>;
export type ReactionIcon = typeof reactionIcons.$inferSelect;

// User collected reaction icons
export const userReactionIcons = pgTable("user_reaction_icons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  reactionIconId: integer("reaction_icon_id")
    .references(() => reactionIcons.id)
    .notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  usageCount: integer("usage_count").default(0),
});

export const insertUserReactionIconSchema = createInsertSchema(
  userReactionIcons,
).omit({ id: true, unlockedAt: true });
export type InsertUserReactionIcon = z.infer<
  typeof insertUserReactionIconSchema
>;
export type UserReactionIcon = typeof userReactionIcons.$inferSelect;

// ============ CARD COLLECTION SYSTEM (no RNG, earned via activity) ============
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  animatedImageUrl: text("animated_image_url"),
  category: text("category").notNull(), // habbo, radio, event, game, seasonal, staff, special
  rarity: text("rarity").notNull().default("common"), // common, rare, epic, legendary, mythic
  series: text("series").default("base"), // base, temporada-1, navidad-2026, etc.
  earnCondition: jsonb("earn_condition").notNull().default({}), // { type: "daily_login", days: 7 }
  speedPointsValue: integer("speed_points_value").default(0),
  stats: jsonb("stats").default({}), // { attack: 10, defense: 5, special: "radio_boost" }
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCardSchema = createInsertSchema(cards).omit({
  id: true,
  createdAt: true,
});
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export const userCards = pgTable("user_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  cardId: integer("card_id")
    .references(() => cards.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  obtainedAt: timestamp("obtained_at").defaultNow(),
  isFavorite: boolean("is_favorite").default(false),
  equippedSlot: integer("equipped_slot"), // 0-4 for active deck
});

export const insertUserCardSchema = createInsertSchema(userCards).omit({
  id: true,
  obtainedAt: true,
});
export type InsertUserCard = z.infer<typeof insertUserCardSchema>;
export type UserCard = typeof userCards.$inferSelect;

// ============ MINI GAMES ============
export const miniGames = pgTable("mini_games", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // penalty, trivia, memory, clicker
  name: text("name").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category").notNull(), // arcade, sports, quiz, puzzle
  maxScore: integer("max_score").default(0),
  rewardConfig: jsonb("reward_config").default({}), // { speedPoints: 50, cards: ["code1"], badge: "code" }
  isActive: boolean("is_active").notNull().default(true),
  config: jsonb("config").default({}), // game-specific config
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMiniGameSchema = createInsertSchema(miniGames).omit({
  id: true,
  createdAt: true,
});
export type InsertMiniGame = z.infer<typeof insertMiniGameSchema>;
export type MiniGame = typeof miniGames.$inferSelect;

export const userMiniGameScores = pgTable("user_mini_game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  miniGameId: integer("mini_game_id")
    .references(() => miniGames.id)
    .notNull(),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(0),
  playsCount: integer("plays_count").notNull().default(0),
  lastPlayedAt: timestamp("last_played_at").defaultNow(),
  bestRunData: jsonb("best_run_data").default({}),
});

export const insertUserMiniGameScoreSchema = createInsertSchema(
  userMiniGameScores,
).omit({ id: true, lastPlayedAt: true });
export type InsertUserMiniGameScore = z.infer<
  typeof insertUserMiniGameScoreSchema
>;
export type UserMiniGameScore = typeof userMiniGameScores.$inferSelect;

// ============ SPEED MISSIONS / SEASONAL STAMP ALBUM ============
export const speedMissions = pgTable("speed_missions", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // daily, weekly, seasonal, special, achievement
  season: text("season"), // "2026-Q3", "navidad-2026", "verano-2026"
  type: text("type").notNull(), // login, news_read, radio_listen, game_play, comment, reaction, share, visit_room
  target: jsonb("target").notNull().default({}), // { count: 7, streak: true }
  rewardConfig: jsonb("reward_config").notNull().default({}), // { speedPoints: 100, cards: [], badge: "code", stamp: "code" }
  iconUrl: text("icon_url"),
  isRepeatable: boolean("is_repeatable").default(false),
  cooldownHours: integer("cooldown_hours").default(24),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpeedMissionSchema = createInsertSchema(speedMissions).omit({
  id: true,
  createdAt: true,
});
export type InsertSpeedMission = z.infer<typeof insertSpeedMissionSchema>;
export type SpeedMission = typeof speedMissions.$inferSelect;

export const userMissions = pgTable("user_missions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  missionId: integer("mission_id")
    .references(() => speedMissions.id)
    .notNull(),
  progress: jsonb("progress").default({}), // { current: 3, streak: 2, lastActionAt: "2026-08-13" }
  status: text("status").notNull().default("active"), // active, completed, claimed, expired
  completedAt: timestamp("completed_at"),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserMissionSchema = createInsertSchema(userMissions).omit({
  id: true,
  createdAt: true,
});
export type InsertUserMission = z.infer<typeof insertUserMissionSchema>;
export type UserMission = typeof userMissions.$inferSelect;

// Seasonal Stamp Album
export const seasonalStamps = pgTable("seasonal_stamps", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  season: text("season").notNull(), // "navidad-2026", "verano-2026", "halloween-2026"
  rarity: text("rarity").notNull().default("common"),
  obtainMethod: jsonb("obtain_method").notNull().default({}), // { type: "mission", missionCode: "daily_login_7" }
  rewardConfig: jsonb("reward_config").default({}),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSeasonalStampSchema = createInsertSchema(
  seasonalStamps,
).omit({ id: true, createdAt: true });
export type InsertSeasonalStamp = z.infer<typeof insertSeasonalStampSchema>;
export type SeasonalStamp = typeof seasonalStamps.$inferSelect;

export const userStamps = pgTable("user_stamps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  stampId: integer("stamp_id")
    .references(() => seasonalStamps.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  obtainedAt: timestamp("obtained_at").defaultNow(),
  isRepeated: boolean("is_repeated").default(false),
});

export const insertUserStampSchema = createInsertSchema(userStamps).omit({
  id: true,
  obtainedAt: true,
});
export type InsertUserStamp = z.infer<typeof insertUserStampSchema>;
export type UserStamp = typeof userStamps.$inferSelect;

// ============ SPEED SHORTS: USER YOUTUBE EMBEDS IN PROFILE ============
export const userYoutubeEmbeds = pgTable("user_youtube_embeds", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  videoId: text("video_id").notNull(),
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  description: text("description"),
  isFeatured: boolean("is_featured").default(false),
  isApproved: boolean("is_approved").default(false), // moderation
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserYoutubeEmbedSchema = createInsertSchema(
  userYoutubeEmbeds,
).omit({ id: true, createdAt: true });
export type InsertUserYoutubeEmbed = z.infer<
  typeof insertUserYoutubeEmbedSchema
>;
export type UserYoutubeEmbed = typeof userYoutubeEmbeds.$inferSelect;

// ============ CINE MODE: YOUTUBE EMBED SHARING ============
export const cineSessions = pgTable("cine_sessions", {
  id: serial("id").primaryKey(),
  hostUserId: integer("host_user_id")
    .references(() => users.id)
    .notNull(),
  videoId: text("video_id").notNull(),
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  status: text("status").notNull().default("waiting"), // waiting, playing, paused, ended
  currentTime: integer("current_time").default(0),
  participants: jsonb("participants").default([]), // [{ userId, joinedAt }]
  isPublic: boolean("is_public").default(true),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

export const insertCineSessionSchema = createInsertSchema(cineSessions).omit({
  id: true,
  createdAt: true,
});
export type InsertCineSession = z.infer<typeof insertCineSessionSchema>;
export type CineSession = typeof cineSessions.$inferSelect;

// ============ DJ PANEL: SIMPLIFIED SLOT BOOKING ============
export const djSlots = pgTable("dj_slots", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sun-Sat)
  startTime: text("start_time").notNull(), // "20:00"
  endTime: text("end_time").notNull(), // "22:00"
  djUserId: integer("dj_user_id").references(() => users.id),
  djName: text("dj_name"),
  showName: text("show_name"),
  description: text("description"),
  status: text("status").notNull().default("available"), // available, booked, live, completed
  recurring: boolean("recurring").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDjSlotSchema = createInsertSchema(djSlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDjSlot = z.infer<typeof insertDjSlotSchema>;
export type DjSlot = typeof djSlots.$inferSelect;

export const djSlotRequests = pgTable("dj_slot_requests", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id")
    .references(() => djSlots.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  showName: text("show_name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, cancelled
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDjSlotRequestSchema = createInsertSchema(
  djSlotRequests,
).omit({ id: true, createdAt: true });
export type InsertDjSlotRequest = z.infer<typeof insertDjSlotRequestSchema>;
export type DjSlotRequest = typeof djSlotRequests.$inferSelect;

// ============ NEW ROLES ============
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  role: text("role").notNull(), // reporter, event_creator, room_creator, moderator
  grantedBy: integer("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata").default({}), // permissions, limits, etc.
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  grantedAt: true,
});
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

// ============ NEWS SECTIONS ============
export const newsSections = pgTable("news_sections", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // guias, placas, eventos, trucos, comunidad
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"), // lucide icon name
  color: text("color"), // hex or tailwind class
  parentSectionId: integer("parent_section_id").references(
    (): AnyPgColumn => newsSections.id,
  ),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsSectionSchema = createInsertSchema(newsSections).omit({
  id: true,
  createdAt: true,
});
export type InsertNewsSection = z.infer<typeof insertNewsSectionSchema>;
export type NewsSection = typeof newsSections.$inferSelect;

// News can belong to multiple sections
export const newsSectionLinks = pgTable("news_section_links", {
  id: serial("id").primaryKey(),
  newsId: integer("news_id")
    .references(() => news.id)
    .notNull(),
  sectionId: integer("section_id")
    .references(() => newsSections.id)
    .notNull(),
  isPrimary: boolean("is_primary").default(false),
});

export const insertNewsSectionLinkSchema = createInsertSchema(
  newsSectionLinks,
).omit({ id: true });
export type InsertNewsSectionLink = z.infer<typeof insertNewsSectionLinkSchema>;
export type NewsSectionLink = typeof newsSectionLinks.$inferSelect;
