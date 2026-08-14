import {
  type User,
  type InsertUser,
  type News,
  type InsertNews,
  type Event,
  type InsertEvent,
  type Schedule,
  type InsertSchedule,
  type Comment,
  type InsertComment,
  type Poll,
  type InsertPoll,
  type Config,
  type InsertConfig,
  type Theme,
  type InsertTheme,
  type ForumCategory,
  type InsertForumCategory,
  type ForumThread,
  type InsertForumThread,
  type ForumPost,
  type InsertForumPost,
  type MarketplaceItem,
  type InsertMarketplaceItem,
  type Badge,
  type InsertBadge,
  type Request,
  type InsertRequest,
  type TeamMember,
  type InsertTeamMember,
  type Download,
  type InsertDownload,
  type BannedSong,
  type InsertBannedSong,
  type ContactMessage,
  type InsertContactMessage,
  type PanelLog,
  type InsertPanelLog,
  type ReportedMessage,
  type InsertReportedMessage,
  type ShopProduct,
  type InsertShopProduct,
  type UserInventory,
  type InsertUserInventory,
  type Notification,
  type InsertNotification,
  type UserProfile,
  type InsertUserProfile,
  type InsertProfileWall,
  type ProfileWallMessage,
  type SongHistory,
  type InsertSongHistory,
  type VipMembership,
  type InsertVipMembership,
  type VipPerkLog,
  type InsertVipPerkLog,
  type HSpeedRoom,
  type InsertHSpeedRoom,
  type SupportTicket,
  type InsertSupportTicket,
  type Alliance,
  type InsertAlliance,
  type ReactionIcon,
  type InsertReactionIcon,
  type UserReactionIcon,
  type InsertUserReactionIcon,
  type Card,
  type InsertCard,
  type UserCard,
  type InsertUserCard,
  type MiniGame,
  type InsertMiniGame,
  type UserMiniGameScore,
  type InsertUserMiniGameScore,
  type SpeedMission,
  type InsertSpeedMission,
  type UserMission,
  type InsertUserMission,
  type SeasonalStamp,
  type InsertSeasonalStamp,
  type UserStamp,
  type InsertUserStamp,
  type UserYoutubeEmbed,
  type InsertUserYoutubeEmbed,
  type CineSession,
  type InsertCineSession,
  type DjSlot,
  type InsertDjSlot,
  type DjSlotRequest,
  type InsertDjSlotRequest,
  type UserRole,
  type InsertUserRole,
  type NewsSection,
  type InsertNewsSection,
  type NewsSectionLink,
  type InsertNewsSectionLink,
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
  updateEvent(
    id: number,
    data: Partial<InsertEvent>,
  ): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Schedule
  getAllSchedule(): Promise<Schedule[]>;
  createScheduleItem(item: InsertSchedule): Promise<Schedule>;
  updateScheduleItem(
    id: number,
    data: Partial<InsertSchedule>,
  ): Promise<Schedule | undefined>;
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
  updateForumCategory(
    id: number,
    data: Partial<InsertForumCategory>,
  ): Promise<ForumCategory | undefined>;
  deleteForumCategory(id: number): Promise<boolean>;
  getThreadsByCategory(categoryId: number): Promise<ForumThread[]>;
  getThreadById(id: number): Promise<ForumThread | undefined>;
  createThread(thread: InsertForumThread): Promise<ForumThread>;
  incrementThreadViews(id: number): Promise<void>;
  getPostsByThread(threadId: number): Promise<ForumPost[]>;
  createPost(post: InsertForumPost): Promise<ForumPost>;
  deletePost(id: number): Promise<boolean>;

  // Marketplace
  getAllMarketplaceItems(): Promise<MarketplaceItem[]>;
  getMarketplaceItemByClass(
    className: string,
  ): Promise<MarketplaceItem | undefined>;
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
  updateTeamMember(
    id: number,
    data: Partial<InsertTeamMember>,
  ): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;

  // Themes
  getAllThemes(): Promise<Theme[]>;
  getThemeBySlug(slug: string): Promise<Theme | undefined>;
  getActiveTheme(): Promise<Theme | undefined>;
  createTheme(theme: InsertTheme): Promise<Theme>;
  updateTheme(
    id: number,
    data: Partial<InsertTheme>,
  ): Promise<Theme | undefined>;
  setActiveTheme(slug: string): Promise<Config | undefined>;

  // DJ Panel
  getDjPanel(): Promise<any>;
  updateDjPanel(data: any): Promise<any>;

  // Chat Messages
  getChatMessages(limit?: number): Promise<any[]>;
  createChatMessage(data: any): Promise<any>;
  deleteChatMessage(id: number): Promise<boolean>;

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

  // Downloads
  getAllDownloads(): Promise<Download[]>;
  createDownload(d: InsertDownload): Promise<Download>;
  deleteDownload(id: number): Promise<boolean>;
  incrementDownloadCount(id: number): Promise<void>;

  // Banned Songs
  getAllBannedSongs(): Promise<BannedSong[]>;
  createBannedSong(s: InsertBannedSong): Promise<BannedSong>;
  deleteBannedSong(id: number): Promise<boolean>;

  // Contact Messages
  getAllContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(msg: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessageStatus(
    id: number,
    status: string,
  ): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;

  // Panel Logs
  getPanelLogs(limit?: number): Promise<PanelLog[]>;
  createPanelLog(log: InsertPanelLog): Promise<PanelLog>;

  // Reported Messages
  getAllReportedMessages(): Promise<any[]>;
  createReport(report: InsertReportedMessage): Promise<ReportedMessage>;
  updateReportStatus(
    id: number,
    status: string,
  ): Promise<ReportedMessage | undefined>;
  deleteReport(id: number): Promise<boolean>;

  // Shop Products
  getAllShopProducts(includeInactive?: boolean): Promise<ShopProduct[]>;
  getShopProductById(id: number): Promise<ShopProduct | undefined>;
  createShopProduct(product: InsertShopProduct): Promise<ShopProduct>;
  updateShopProduct(
    id: number,
    data: Partial<InsertShopProduct>,
  ): Promise<ShopProduct | undefined>;
  deleteShopProduct(id: number): Promise<boolean>;

  // User Inventory
  getUserInventory(userId: number): Promise<UserInventory[]>;
  purchaseProduct(userId: number, productId: number): Promise<UserInventory>;
  toggleEquipItem(
    userId: number,
    itemId: number,
  ): Promise<UserInventory | undefined>;

  // Notifications
  getUserNotifications(userId: number, limit?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notif: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: number): Promise<void>;

  // User Profiles
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  upsertUserProfile(
    userId: number,
    data: Partial<InsertUserProfile>,
  ): Promise<UserProfile>;
  createUserProfile(
    userId: number,
    data: Partial<InsertUserProfile>,
  ): Promise<UserProfile>;

  // Profile Wall / Muro
  getWallMessages(profileUserId: number): Promise<ProfileWallMessage[]>;
  getWallMessageById(id: number): Promise<ProfileWallMessage | undefined>;
  createWallMessage(msg: InsertProfileWall): Promise<ProfileWallMessage>;
  deleteWallMessage(id: number): Promise<boolean>;

  // Song History
  getSongHistory(limit?: number): Promise<SongHistory[]>;
  createSongHistory(song: InsertSongHistory): Promise<SongHistory>;
  getMostPlayedSongs(limit?: number): Promise<SongHistory[]>;

  // VIP Memberships
  getVipMembership(userId: number): Promise<VipMembership | undefined>;
  createVipMembership(membership: InsertVipMembership): Promise<VipMembership>;
  updateVipMembership(
    userId: number,
    data: Partial<InsertVipMembership>,
  ): Promise<VipMembership | undefined>;
  getAllVipMemberships(): Promise<any[]>;

  // VIP Perks Log
  logVipPerkUse(userId: number, perkUsed: string): Promise<VipPerkLog>;
  getVipPerkLogs(userId: number): Promise<VipPerkLog[]>;

  // Rooms
  getAllRooms(includeInactive?: boolean): Promise<HSpeedRoom[]>;
  getFeaturedRooms(): Promise<HSpeedRoom[]>;
  createRoom(room: InsertHSpeedRoom): Promise<HSpeedRoom>;
  updateRoom(
    id: number,
    data: Partial<InsertHSpeedRoom>,
  ): Promise<HSpeedRoom | undefined>;
  deleteRoom(id: number): Promise<boolean>;

  // Support Tickets
  getTicketsByUser(userId: number): Promise<SupportTicket[]>;
  createTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateTicketStatus(
    id: number,
    status: string,
  ): Promise<SupportTicket | undefined>;
  getAllTickets(): Promise<SupportTicket[]>;

  // Alliances
  getAllAlliances(): Promise<Alliance[]>;
  createAlliance(data: InsertAlliance): Promise<Alliance>;
  updateAlliance(
    id: number,
    data: Partial<InsertAlliance>,
  ): Promise<Alliance | undefined>;
  deleteAlliance(id: number): Promise<boolean>;

  // Reaction Icons
  getAllReactionIcons(): Promise<ReactionIcon[]>;
  getReactionIconByCode(code: string): Promise<ReactionIcon | undefined>;
  createReactionIcon(data: InsertReactionIcon): Promise<ReactionIcon>;
  updateReactionIcon(
    id: number,
    data: Partial<InsertReactionIcon>,
  ): Promise<ReactionIcon | undefined>;
  deleteReactionIcon(id: number): Promise<boolean>;
  getUserReactionIcons(userId: number): Promise<UserReactionIcon[]>;
  unlockUserReactionIcon(
    userId: number,
    iconId: number,
  ): Promise<UserReactionIcon>;
  incrementReactionIconUsage(userId: number, iconId: number): Promise<void>;

  // Cards
  getAllCards(): Promise<Card[]>;
  getCardByCode(code: string): Promise<Card | undefined>;
  createCard(data: InsertCard): Promise<Card>;
  getUserCards(userId: number): Promise<UserCard[]>;
  equipUserCard(
    userId: number,
    cardId: number,
    slot: number,
  ): Promise<UserCard>;
  grantUserCard(userId: number, cardId: number, qty: number): Promise<UserCard>;

  // Mini Games
  getAllMiniGames(): Promise<MiniGame[]>;
  getMiniGameByCode(code: string): Promise<MiniGame | undefined>;
  createMiniGame(data: InsertMiniGame): Promise<MiniGame>;
  getUserMiniGameScores(userId: number): Promise<UserMiniGameScore[]>;
  submitMiniGameScore(
    userId: number,
    gameCode: string,
    score: number,
    gameData?: any,
  ): Promise<UserMiniGameScore>;
  getMiniGameLeaderboard(gameCode: string, limit: number): Promise<any[]>;

  // Speed Missions
  getActiveSpeedMissions(season?: string): Promise<SpeedMission[]>;
  getSpeedMissionByCode(code: string): Promise<SpeedMission | undefined>;
  createSpeedMission(data: InsertSpeedMission): Promise<SpeedMission>;
  getUserMissions(userId: number): Promise<UserMission[]>;
  updateMissionProgress(
    userId: number,
    missionId: number,
    action: string,
    metadata?: any,
  ): Promise<UserMission>;
  claimMissionReward(userId: number, missionId: number): Promise<UserMission>;

  // Seasonal Stamps
  getSeasonalStamps(season?: string): Promise<SeasonalStamp[]>;
  getSeasonalStampByCode(code: string): Promise<SeasonalStamp | undefined>;
  createSeasonalStamp(data: InsertSeasonalStamp): Promise<SeasonalStamp>;
  getUserStamps(userId: number): Promise<UserStamp[]>;

  // YouTube Embeds (Speed Shorts)
  getUserYoutubeEmbeds(userId: number): Promise<UserYoutubeEmbed[]>;
  createUserYoutubeEmbed(
    userId: number,
    data: InsertUserYoutubeEmbed,
  ): Promise<UserYoutubeEmbed>;
  updateUserYoutubeEmbed(
    id: number,
    userId: number,
    data: Partial<InsertUserYoutubeEmbed>,
  ): Promise<UserYoutubeEmbed | undefined>;
  deleteUserYoutubeEmbed(id: number, userId: number): Promise<boolean>;
  approveYoutubeEmbed(id: number): Promise<UserYoutubeEmbed | undefined>;

  // Cine Mode
  getCineSessions(status?: string): Promise<CineSession[]>;
  getCineSession(id: number): Promise<CineSession | undefined>;
  createCineSession(
    hostUserId: number,
    data: InsertCineSession,
  ): Promise<CineSession>;
  updateCineSession(
    id: number,
    hostUserId: number,
    data: Partial<InsertCineSession>,
  ): Promise<CineSession | undefined>;
  joinCineSession(sessionId: number, userId: number): Promise<CineSession>;
  leaveCineSession(sessionId: number, userId: number): Promise<void>;

  // DJ Slots
  getAllDjSlots(): Promise<DjSlot[]>;
  getDjSlot(id: number): Promise<DjSlot | undefined>;
  createDjSlot(data: InsertDjSlot): Promise<DjSlot>;
  updateDjSlot(
    id: number,
    data: Partial<InsertDjSlot>,
  ): Promise<DjSlot | undefined>;
  deleteDjSlot(id: number): Promise<boolean>;
  requestDjSlot(
    slotId: number,
    userId: number,
    data: InsertDjSlotRequest,
  ): Promise<DjSlotRequest>;
  getDjSlotRequests(): Promise<DjSlotRequest[]>;
  reviewDjSlotRequest(
    id: number,
    reviewedBy: number,
    data: { status: string },
  ): Promise<DjSlotRequest>;

  // User Roles
  getUserRoles(userId: number): Promise<UserRole[]>;
  grantUserRole(
    userId: number,
    grantedBy: number,
    data: InsertUserRole,
  ): Promise<UserRole>;
  revokeUserRole(userId: number, roleId: number): Promise<boolean>;

  // News Sections
  getAllNewsSections(): Promise<NewsSection[]>;
  createNewsSection(data: InsertNewsSection): Promise<NewsSection>;
  updateNewsSection(
    id: number,
    data: Partial<InsertNewsSection>,
  ): Promise<NewsSection | undefined>;
  getNewsSections(newsId: number): Promise<NewsSection[]>;
  linkNewsToSection(
    newsId: number,
    sectionId: number,
    isPrimary: boolean,
  ): Promise<void>;
  unlinkNewsFromSection(newsId: number, sectionId: number): Promise<void>;
}

// Helper to map snake_case DB rows to camelCase TypeScript objects
function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    habboUsername: row.habbo_username,
    avatarUrl: row.avatar_url,
    role: row.role,
    approved: row.approved,
    speedPoints: row.speed_points,
    createdAt: row.created_at,
    mundialStamps: row.mundial_stamps,
    mundialLogros: row.mundial_logros,
    mundialClan: row.mundial_clan,
    mundialPredictions: row.mundial_predictions,
    mundialTickets: row.mundial_tickets,
    mundialPenalties: row.mundial_penalties,
    vipTier: row.vip_tier,
    totalRequests: row.total_requests || 0,
    favoriteGenre: row.favorite_genre,
    bio: row.bio,
    socialLinks: row.social_links || {},
    badgesEarned: row.badges_earned || [],
  };
}
function mapNews(row: any): News {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    imageUrl: row.image_url,
    imageHint: row.image_hint,
    category: row.category,
    date: row.date,
    reactions: row.reactions,
    authorId: row.author_id,
    createdAt: row.created_at,
  };
}
function mapEvent(row: any): Event {
  return {
    id: row.id,
    title: row.title,
    server: row.server,
    date: row.date,
    time: row.time,
    roomName: row.room_name,
    roomOwner: row.room_owner,
    host: row.host,
    imageUrl: row.image_url,
    imageHint: row.image_hint,
    createdAt: row.created_at,
  };
}
function mapSchedule(row: any): Schedule {
  return {
    id: row.id,
    day: row.day,
    startTime: row.start_time,
    endTime: row.end_time,
    showName: row.show_name,
    djName: row.dj_name,
  };
}
function mapComment(row: any): Comment {
  return {
    id: row.id,
    articleId: row.article_id,
    authorId: row.author_id,
    authorName: row.author_name,
    content: row.content,
    createdAt: row.created_at,
  };
}
function mapPoll(row: any): Poll {
  return {
    id: row.id,
    title: row.title,
    options: row.options,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}
function mapConfig(row: any): Config {
  return {
    id: row.id,
    radioService: row.radio_service,
    apiUrl: row.api_url,
    listenUrl: row.listen_url,
    homePlayerBgUrl: row.home_player_bg_url,
    slideshow: row.slideshow,
    discordWebhooks: row.discord_webhooks,
    activeTheme: row.active_theme,
    maintenanceMode: row.maintenance_mode ?? true,
  };
}
function mapTheme(row: any): Theme {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    colors: row.colors,
    bannerUrl: row.banner_url,
    logoUrl: row.logo_url,
    decorations: row.decorations,
    isDefault: row.is_default,
  };
}
function mapForumCategory(row: any): ForumCategory {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}
function mapForumThread(row: any): ForumThread {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    authorId: row.author_id,
    authorName: row.author_name,
    isPinned: row.is_pinned,
    isLocked: row.is_locked,
    views: row.views,
    createdAt: row.created_at,
  };
}
function mapForumPost(row: any): ForumPost {
  return {
    id: row.id,
    threadId: row.thread_id,
    authorId: row.author_id,
    authorName: row.author_name,
    content: row.content,
    createdAt: row.created_at,
  };
}
function mapMarketplaceItem(row: any): MarketplaceItem {
  return {
    id: row.id,
    itemName: row.item_name,
    className: row.class_name,
    hotel: row.hotel,
    currentPrice: row.current_price,
    avgPrice: row.avg_price,
    priceHistory: row.price_history,
    imageUrl: row.image_url,
    lastUpdated: row.last_updated,
  };
}
function mapBadge(row: any): Badge {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    hotel: row.hotel,
    category: row.category,
    imageUrl: row.image_url,
    discoveredAt: row.discovered_at,
  };
}
function mapRequest(row: any): Request {
  return {
    id: row.id,
    type: row.type,
    details: row.details,
    userName: row.user_name,
    createdAt: row.created_at,
  };
}
function mapTeamMember(row: any): TeamMember {
  return {
    id: row.id,
    displayName: row.display_name,
    habboUsername: row.habbo_username,
    role: row.role,
    motto: row.motto,
    joinedAt: row.joined_at,
  };
}
function mapDownload(row: any): Download {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    fileUrl: row.file_url,
    category: row.category,
    addedBy: row.added_by,
    downloadCount: row.download_count,
    createdAt: row.created_at,
  };
}
function mapBannedSong(row: any): BannedSong {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    reason: row.reason,
    bannedBy: row.banned_by,
    createdAt: row.created_at,
  };
}
function mapContactMessage(row: any): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    ip: row.ip,
    status: row.status,
    createdAt: row.created_at,
  };
}
function mapPanelLog(row: any): PanelLog {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    action: row.action,
    details: row.details,
    ip: row.ip,
    createdAt: row.created_at,
  };
}
function mapReportedMessage(row: any): ReportedMessage {
  return {
    id: row.id,
    messageId: row.message_id,
    reportedBy: row.reported_by,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  };
}
function mapShopProduct(row: any): ShopProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    price: row.price,
    imageUrl: row.image_url,
    previewUrl: row.preview_url,
    data: row.data,
    isLimited: row.is_limited,
    stock: row.stock,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}
function mapUserInventory(row: any): UserInventory {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    isEquipped: row.is_equipped,
    purchasedAt: row.purchased_at,
  };
}
function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    icon: row.icon,
    link: row.link,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}
function mapUserProfile(row: any): UserProfile {
  return {
    id: row.id,
    userId: row.user_id,
    bio: row.bio,
    backgroundUrl: row.background_url,
    backgroundColor: row.background_color,
    accentColor: row.accent_color,
    aboutMe: row.about_me,
    socialYoutube: row.social_youtube,
    socialTwitter: row.social_twitter,
    socialInstagram: row.social_instagram,
    customCss: row.custom_css,
    updatedAt: row.updated_at,
  };
}

function mapProfileWall(row: any): ProfileWallMessage {
  return {
    id: row.id,
    profileUserId: row.profile_user_id,
    authorId: row.author_id,
    authorName: row.author_name,
    message: row.message,
    createdAt: row.created_at,
  };
}

function mapSongHistory(row: any): SongHistory {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album,
    coverUrl: row.cover_url,
    playedAt: row.played_at,
    playedByDj: row.played_by_dj,
    durationSeconds: row.duration_seconds,
    requestedBy: row.requested_by,
    playCount: row.play_count,
  };
}

function mapVipMembership(row: any): VipMembership {
  return {
    id: row.id,
    userId: row.user_id,
    tier: row.tier,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    paymentRef: row.payment_ref,
    isActive: row.is_active,
  };
}

function mapVipPerkLog(row: any): VipPerkLog {
  return {
    id: row.id,
    userId: row.user_id,
    perkUsed: row.perk_used,
    usedAt: row.used_at,
  };
}

function mapHSpeedRoom(row: any): HSpeedRoom {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    roomCode: row.room_code,
    ownerHabbo: row.owner_habbo,
    hotel: row.hotel,
    category: row.category,
    capacity: row.capacity,
    currentVisitors: row.current_visitors,
    isActive: row.is_active,
    thumbnailUrl: row.thumbnail_url,
    featured: row.featured,
    createdAt: row.created_at,
  };
}

function mapSupportTicket(row: any): SupportTicket {
  return {
    id: row.id,
    userId: row.user_id,
    subject: row.subject,
    description: row.description,
    status: row.status,
    category: row.category,
    createdAt: row.created_at,
  };
}

function mapAlliance(row: any): Alliance {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    description: row.description,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
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
      [
        user.email,
        user.passwordHash,
        user.displayName,
        user.habboUsername || null,
        user.avatarUrl || null,
        user.role || "pending",
        user.approved ?? false,
        user.speedPoints ?? 0,
      ],
    );
    return mapUser(r.rows[0]);
  }
  async updateUser(id: number, data: Partial<InsertUser>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.email !== undefined) {
      fields.push(`email = $${i++}`);
      values.push(data.email);
    }
    if (data.displayName !== undefined) {
      fields.push(`display_name = $${i++}`);
      values.push(data.displayName);
    }
    if (data.habboUsername !== undefined) {
      fields.push(`habbo_username = $${i++}`);
      values.push(data.habboUsername);
    }
    if (data.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${i++}`);
      values.push(data.avatarUrl);
    }
    if (data.role !== undefined) {
      fields.push(`role = $${i++}`);
      values.push(data.role);
    }
    if (data.approved !== undefined) {
      fields.push(`approved = $${i++}`);
      values.push(data.approved);
    }
    if (data.speedPoints !== undefined) {
      fields.push(`speed_points = $${i++}`);
      values.push(data.speedPoints);
    }
    if (data.passwordHash !== undefined) {
      fields.push(`password_hash = $${i++}`);
      values.push(data.passwordHash);
    }
    if (data.mundialStamps !== undefined) {
      fields.push(`mundial_stamps = $${i++}`);
      values.push(JSON.stringify(data.mundialStamps));
    }
    if (data.mundialLogros !== undefined) {
      fields.push(`mundial_logros = $${i++}`);
      values.push(JSON.stringify(data.mundialLogros));
    }
    if (data.mundialClan !== undefined) {
      fields.push(`mundial_clan = $${i++}`);
      values.push(data.mundialClan);
    }
    if (data.mundialPredictions !== undefined) {
      fields.push(`mundial_predictions = $${i++}`);
      values.push(JSON.stringify(data.mundialPredictions));
    }
    if (data.mundialTickets !== undefined) {
      fields.push(`mundial_tickets = $${i++}`);
      values.push(data.mundialTickets);
    }
    if (data.mundialPenalties !== undefined) {
      fields.push(`mundial_penalties = $${i++}`);
      values.push(JSON.stringify(data.mundialPenalties));
    }
    if (data.vipTier !== undefined) {
      fields.push(`vip_tier = $${i++}`);
      values.push(data.vipTier);
    }
    if (data.totalRequests !== undefined) {
      fields.push(`total_requests = $${i++}`);
      values.push(data.totalRequests);
    }
    if (data.favoriteGenre !== undefined) {
      fields.push(`favorite_genre = $${i++}`);
      values.push(data.favoriteGenre);
    }
    if (data.bio !== undefined) {
      fields.push(`bio = $${i++}`);
      values.push(data.bio);
    }
    if (data.socialLinks !== undefined) {
      fields.push(`social_links = $${i++}`);
      values.push(JSON.stringify(data.socialLinks));
    }
    if (data.badgesEarned !== undefined) {
      fields.push(`badges_earned = $${i++}`);
      values.push(JSON.stringify(data.badgesEarned));
    }
    if (fields.length === 0) return this.getUser(id);
    values.push(id);
    const r = await this.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
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
      [
        article.title,
        article.summary,
        article.content,
        article.imageUrl,
        article.imageHint || "",
        article.category,
        article.date,
        JSON.stringify(article.reactions || {}),
        article.authorId || null,
      ],
    );
    return mapNews(r.rows[0]);
  }
  async updateNews(id: number, data: Partial<InsertNews>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.title !== undefined) {
      fields.push(`title = $${i++}`);
      values.push(data.title);
    }
    if (data.summary !== undefined) {
      fields.push(`summary = $${i++}`);
      values.push(data.summary);
    }
    if (data.content !== undefined) {
      fields.push(`content = $${i++}`);
      values.push(data.content);
    }
    if (data.imageUrl !== undefined) {
      fields.push(`image_url = $${i++}`);
      values.push(data.imageUrl);
    }
    if (data.imageHint !== undefined) {
      fields.push(`image_hint = $${i++}`);
      values.push(data.imageHint);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${i++}`);
      values.push(data.category);
    }
    if (data.date !== undefined) {
      fields.push(`date = $${i++}`);
      values.push(data.date);
    }
    if (data.reactions !== undefined) {
      fields.push(`reactions = $${i++}`);
      values.push(JSON.stringify(data.reactions));
    }
    if (fields.length === 0) return this.getNewsById(id);
    values.push(id);
    const r = await this.query(
      `UPDATE news SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ? mapNews(r.rows[0]) : undefined;
  }
  async deleteNews(id: number) {
    const r = await this.query("DELETE FROM news WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Events
  async getAllEvents() {
    const r = await this.query(
      "SELECT * FROM events ORDER BY date DESC, time DESC",
    );
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
      [
        event.title,
        event.server,
        event.date,
        event.time,
        event.roomName,
        event.roomOwner,
        event.host,
        event.imageUrl,
        event.imageHint || "",
      ],
    );
    return mapEvent(r.rows[0]);
  }
  async updateEvent(id: number, data: Partial<InsertEvent>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.title !== undefined) {
      fields.push(`title = $${i++}`);
      values.push(data.title);
    }
    if (data.server !== undefined) {
      fields.push(`server = $${i++}`);
      values.push(data.server);
    }
    if (data.date !== undefined) {
      fields.push(`date = $${i++}`);
      values.push(data.date);
    }
    if (data.time !== undefined) {
      fields.push(`time = $${i++}`);
      values.push(data.time);
    }
    if (data.roomName !== undefined) {
      fields.push(`room_name = $${i++}`);
      values.push(data.roomName);
    }
    if (data.roomOwner !== undefined) {
      fields.push(`room_owner = $${i++}`);
      values.push(data.roomOwner);
    }
    if (data.host !== undefined) {
      fields.push(`host = $${i++}`);
      values.push(data.host);
    }
    if (data.imageUrl !== undefined) {
      fields.push(`image_url = $${i++}`);
      values.push(data.imageUrl);
    }
    if (fields.length === 0) return this.getEventById(id);
    values.push(id);
    const r = await this.query(
      `UPDATE events SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
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
      [item.day, item.startTime, item.endTime, item.showName, item.djName],
    );
    return mapSchedule(r.rows[0]);
  }
  async updateScheduleItem(id: number, data: Partial<InsertSchedule>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.day !== undefined) {
      fields.push(`day = $${i++}`);
      values.push(data.day);
    }
    if (data.startTime !== undefined) {
      fields.push(`start_time = $${i++}`);
      values.push(data.startTime);
    }
    if (data.endTime !== undefined) {
      fields.push(`end_time = $${i++}`);
      values.push(data.endTime);
    }
    if (data.showName !== undefined) {
      fields.push(`show_name = $${i++}`);
      values.push(data.showName);
    }
    if (data.djName !== undefined) {
      fields.push(`dj_name = $${i++}`);
      values.push(data.djName);
    }
    if (fields.length === 0) return undefined;
    values.push(id);
    const r = await this.query(
      `UPDATE schedule SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ? mapSchedule(r.rows[0]) : undefined;
  }
  async deleteScheduleItem(id: number) {
    const r = await this.query("DELETE FROM schedule WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Comments
  async getCommentsByArticle(articleId: number) {
    const r = await this.query(
      `SELECT c.*, u.habbo_username FROM comments c 
       LEFT JOIN users u ON c.author_id = u.id 
       WHERE c.article_id = $1 ORDER BY c.created_at ASC`,
      [articleId],
    );
    return r.rows.map((row: any) => ({
      ...mapComment(row),
      habboUsername: row.habbo_username || null,
    }));
  }
  async createComment(comment: InsertComment) {
    const r = await this.query(
      `INSERT INTO comments (article_id, author_id, author_name, content) VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        comment.articleId || null,
        comment.authorId || null,
        comment.authorName,
        comment.content,
      ],
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
      [poll.title, JSON.stringify(poll.options || []), poll.isActive ?? true],
    );
    return mapPoll(r.rows[0]);
  }
  async updatePoll(id: number, data: Partial<InsertPoll>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.title !== undefined) {
      fields.push(`title = $${i++}`);
      values.push(data.title);
    }
    if (data.options !== undefined) {
      fields.push(`options = $${i++}`);
      values.push(JSON.stringify(data.options));
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${i++}`);
      values.push(data.isActive);
    }
    if (fields.length === 0) return undefined;
    values.push(id);
    const r = await this.query(
      `UPDATE polls SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
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
    if (data.radioService !== undefined) {
      fields.push(`radio_service = $${i++}`);
      values.push(data.radioService);
    }
    if (data.apiUrl !== undefined) {
      fields.push(`api_url = $${i++}`);
      values.push(data.apiUrl);
    }
    if (data.listenUrl !== undefined) {
      fields.push(`listen_url = $${i++}`);
      values.push(data.listenUrl);
    }
    if (data.homePlayerBgUrl !== undefined) {
      fields.push(`home_player_bg_url = $${i++}`);
      values.push(data.homePlayerBgUrl);
    }
    if (data.slideshow !== undefined) {
      fields.push(`slideshow = $${i++}`);
      values.push(JSON.stringify(data.slideshow));
    }
    if (data.discordWebhooks !== undefined) {
      fields.push(`discord_webhooks = $${i++}`);
      values.push(JSON.stringify(data.discordWebhooks));
    }
    if (data.activeTheme !== undefined) {
      fields.push(`active_theme = $${i++}`);
      values.push(data.activeTheme);
    }
    if (data.maintenanceMode !== undefined) {
      fields.push(`maintenance_mode = $${i++}`);
      values.push(data.maintenanceMode);
    }
    if (fields.length === 0) return this.getConfig();
    const r = await this.query(
      `UPDATE config SET ${fields.join(", ")} WHERE id = (SELECT id FROM config ORDER BY id LIMIT 1) RETURNING *`,
      values,
    );
    return r.rows[0] ? mapConfig(r.rows[0]) : undefined;
  }

  // Forum
  async getAllForumCategories() {
    const r = await this.query(
      "SELECT * FROM forum_categories ORDER BY sort_order ASC",
    );
    return r.rows.map(mapForumCategory);
  }
  async createForumCategory(cat: InsertForumCategory) {
    const r = await this.query(
      `INSERT INTO forum_categories (name, description, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      [cat.name, cat.description || null, cat.sortOrder ?? 0],
    );
    return mapForumCategory(r.rows[0]);
  }
  async updateForumCategory(id: number, data: Partial<InsertForumCategory>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.name !== undefined) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${i++}`);
      values.push(data.description);
    }
    if (data.sortOrder !== undefined) {
      fields.push(`sort_order = $${i++}`);
      values.push(data.sortOrder);
    }
    if (fields.length === 0)
      return this.getAllForumCategories().then((cats: any[]) =>
        cats.find((c: any) => c.id === id),
      );
    values.push(id);
    const r = await this.query(
      `UPDATE forum_categories SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ? mapForumCategory(r.rows[0]) : undefined;
  }
  async deleteForumCategory(id: number) {
    const r = await this.query(
      "DELETE FROM forum_categories WHERE id = $1 RETURNING id",
      [id],
    );
    return (r.rowCount || 0) > 0;
  }
  async getThreadsByCategory(categoryId: number) {
    const r = await this.query(
      "SELECT * FROM forum_threads WHERE category_id = $1 ORDER BY is_pinned DESC, created_at DESC",
      [categoryId],
    );
    return r.rows.map(mapForumThread);
  }
  async getThreadById(id: number) {
    const r = await this.query("SELECT * FROM forum_threads WHERE id = $1", [
      id,
    ]);
    return r.rows[0] ? mapForumThread(r.rows[0]) : undefined;
  }
  async createThread(thread: InsertForumThread) {
    const r = await this.query(
      `INSERT INTO forum_threads (category_id, title, author_id, author_name, is_pinned, is_locked, views)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        thread.categoryId || null,
        thread.title,
        thread.authorId || null,
        thread.authorName,
        thread.isPinned ?? false,
        thread.isLocked ?? false,
        thread.views ?? 0,
      ],
    );
    return mapForumThread(r.rows[0]);
  }
  async incrementThreadViews(id: number) {
    await this.query(
      "UPDATE forum_threads SET views = views + 1 WHERE id = $1",
      [id],
    );
  }
  async getPostsByThread(threadId: number) {
    const r = await this.query(
      "SELECT * FROM forum_posts WHERE thread_id = $1 ORDER BY created_at ASC",
      [threadId],
    );
    return r.rows.map(mapForumPost);
  }
  async createPost(post: InsertForumPost) {
    const r = await this.query(
      `INSERT INTO forum_posts (thread_id, author_id, author_name, content) VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        post.threadId || null,
        post.authorId || null,
        post.authorName,
        post.content,
      ],
    );
    return mapForumPost(r.rows[0]);
  }
  async deletePost(id: number) {
    const r = await this.query("DELETE FROM forum_posts WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Marketplace
  async getAllMarketplaceItems() {
    const r = await this.query(
      "SELECT * FROM marketplace_items ORDER BY last_updated DESC",
    );
    return r.rows.map(mapMarketplaceItem);
  }
  async getMarketplaceItemByClass(className: string) {
    const r = await this.query(
      "SELECT * FROM marketplace_items WHERE class_name = $1",
      [className],
    );
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
      [
        item.itemName,
        item.className,
        item.hotel || "es",
        item.currentPrice ?? null,
        item.avgPrice ?? null,
        JSON.stringify(item.priceHistory || []),
        item.imageUrl || null,
      ],
    );
    return mapMarketplaceItem(r.rows[0]);
  }

  // Badges
  async getAllBadges() {
    const r = await this.query(
      "SELECT * FROM badge_collection ORDER BY discovered_at DESC",
    );
    return r.rows.map(mapBadge);
  }
  async searchBadges(query: string) {
    const r = await this.query(
      "SELECT * FROM badge_collection WHERE LOWER(name) LIKE $1 OR LOWER(code) LIKE $1 ORDER BY name",
      [`%${query.toLowerCase()}%`],
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
      [
        badge.code,
        badge.name,
        badge.description || null,
        badge.hotel || "es",
        badge.category || null,
        badge.imageUrl || null,
      ],
    );
    return mapBadge(r.rows[0]);
  }

  // Requests
  async getAllRequests() {
    const r = await this.query(
      "SELECT * FROM requests ORDER BY created_at DESC",
    );
    return r.rows.map(mapRequest);
  }
  async createRequest(req: InsertRequest) {
    const r = await this.query(
      `INSERT INTO requests (type, details, user_name) VALUES ($1, $2, $3) RETURNING *`,
      [req.type, req.details, req.userName],
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
      [
        member.displayName,
        member.habboUsername,
        member.role,
        member.motto || null,
      ],
    );
    return mapTeamMember(r.rows[0]);
  }
  async updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.displayName !== undefined) {
      fields.push(`display_name = $${i++}`);
      values.push(data.displayName);
    }
    if (data.habboUsername !== undefined) {
      fields.push(`habbo_username = $${i++}`);
      values.push(data.habboUsername);
    }
    if (data.role !== undefined) {
      fields.push(`role = $${i++}`);
      values.push(data.role);
    }
    if (data.motto !== undefined) {
      fields.push(`motto = $${i++}`);
      values.push(data.motto);
    }
    if (fields.length === 0) return undefined;
    values.push(id);
    const r = await this.query(
      `UPDATE team_members SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
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
      [
        theme.slug,
        theme.name,
        theme.description || null,
        JSON.stringify(theme.colors || {}),
        theme.bannerUrl || null,
        theme.logoUrl || null,
        JSON.stringify(theme.decorations || {}),
        theme.isDefault ?? false,
      ],
    );
    return mapTheme(r.rows[0]);
  }
  async updateTheme(id: number, data: Partial<InsertTheme>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.slug !== undefined) {
      fields.push(`slug = $${i++}`);
      values.push(data.slug);
    }
    if (data.name !== undefined) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${i++}`);
      values.push(data.description);
    }
    if (data.colors !== undefined) {
      fields.push(`colors = $${i++}`);
      values.push(JSON.stringify(data.colors));
    }
    if (data.bannerUrl !== undefined) {
      fields.push(`banner_url = $${i++}`);
      values.push(data.bannerUrl);
    }
    if (data.logoUrl !== undefined) {
      fields.push(`logo_url = $${i++}`);
      values.push(data.logoUrl);
    }
    if (data.decorations !== undefined) {
      fields.push(`decorations = $${i++}`);
      values.push(JSON.stringify(data.decorations));
    }
    if (data.isDefault !== undefined) {
      fields.push(`is_default = $${i++}`);
      values.push(data.isDefault);
    }
    if (fields.length === 0) return undefined;
    values.push(id);
    const r = await this.query(
      `UPDATE themes SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ? mapTheme(r.rows[0]) : undefined;
  }
  async setActiveTheme(slug: string) {
    const theme = await this.getThemeBySlug(slug);
    if (!theme) return undefined;
    return this.updateConfig({ activeTheme: slug });
  }

  // DJ Panel
  async getDjPanel() {
    const r = await this.query("SELECT * FROM dj_panel ORDER BY id LIMIT 1");
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
    if (data.currentDj !== undefined) {
      fields.push(`current_dj = $${i++}`);
      values.push(data.currentDj);
    }
    if (data.nextDj !== undefined) {
      fields.push(`next_dj = $${i++}`);
      values.push(data.nextDj);
    }
    if (data.djMessage !== undefined) {
      fields.push(`dj_message = $${i++}`);
      values.push(data.djMessage);
    }
    fields.push(`updated_at = NOW()`);
    if (values.length === 0) return this.getDjPanel();
    const r = await this.query(
      `UPDATE dj_panel SET ${fields.join(", ")} WHERE id = (SELECT id FROM dj_panel ORDER BY id LIMIT 1) RETURNING *`,
      values,
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
      "SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT $1",
      [limit],
    );
    return r.rows
      .map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name,
        habboUsername: row.habbo_username,
        message: row.message,
        createdAt: row.created_at,
      }))
      .reverse();
  }
  async createChatMessage(data: any) {
    const r = await this.query(
      `INSERT INTO chat_messages (user_id, user_name, habbo_username, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        data.userId || null,
        data.userName,
        data.habboUsername || null,
        data.message,
      ],
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
  async deleteChatMessage(id: number) {
    await this.query("DELETE FROM chat_messages WHERE id = $1", [id]);
    return true;
  }

  // Private Messages
  async getMessagesByUser(userId: number) {
    const r = await this.query(
      "SELECT * FROM private_messages WHERE to_user_id = $1 OR from_user_id = $1 ORDER BY created_at DESC",
      [userId],
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
      "SELECT COUNT(*) AS count FROM private_messages WHERE to_user_id = $1 AND is_read = false",
      [userId],
    );
    return parseInt(r.rows[0]?.count ?? "0", 10);
  }
  async createPrivateMessage(data: any) {
    const r = await this.query(
      `INSERT INTO private_messages (from_user_id, to_user_id, subject, content, is_read)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.fromUserId, data.toUserId, data.subject || "", data.content, false],
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
      "UPDATE private_messages SET is_read = true WHERE id = $1 RETURNING *",
      [id],
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
      "SELECT * FROM verified_badges WHERE user_id = $1 ORDER BY verified_at DESC",
      [userId],
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
      [data.userId, data.badgeCode],
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
      "SELECT * FROM users WHERE role IN ('admin', 'dj') AND approved = true ORDER BY role, display_name",
    );
    return r.rows.map(mapUser);
  }

  // Downloads
  async getAllDownloads() {
    const r = await this.query(
      "SELECT * FROM downloads ORDER BY created_at DESC",
    );
    return r.rows.map(mapDownload);
  }
  async createDownload(d: InsertDownload) {
    const r = await this.query(
      "INSERT INTO downloads (title, description, file_url, category, added_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        d.title,
        d.description || null,
        d.fileUrl,
        d.category || "general",
        d.addedBy,
      ],
    );
    return mapDownload(r.rows[0]);
  }
  async deleteDownload(id: number) {
    const r = await this.query("DELETE FROM downloads WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }
  async incrementDownloadCount(id: number) {
    await this.query(
      "UPDATE downloads SET download_count = download_count + 1 WHERE id = $1",
      [id],
    );
  }

  // Banned Songs
  async getAllBannedSongs() {
    const r = await this.query(
      "SELECT * FROM banned_songs ORDER BY created_at DESC",
    );
    return r.rows.map(mapBannedSong);
  }
  async createBannedSong(s: InsertBannedSong) {
    const r = await this.query(
      "INSERT INTO banned_songs (title, artist, reason, banned_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [s.title, s.artist || null, s.reason || null, s.bannedBy],
    );
    return mapBannedSong(r.rows[0]);
  }
  async deleteBannedSong(id: number) {
    const r = await this.query("DELETE FROM banned_songs WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Contact Messages
  async getAllContactMessages() {
    const r = await this.query(
      "SELECT * FROM contact_messages ORDER BY created_at DESC",
    );
    return r.rows.map(mapContactMessage);
  }
  async createContactMessage(msg: InsertContactMessage) {
    const r = await this.query(
      "INSERT INTO contact_messages (name, email, subject, message, ip, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        msg.name,
        msg.email,
        msg.subject,
        msg.message,
        msg.ip || null,
        msg.status || "pending",
      ],
    );
    return mapContactMessage(r.rows[0]);
  }
  async updateContactMessageStatus(id: number, status: string) {
    const r = await this.query(
      "UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );
    return r.rows[0] ? mapContactMessage(r.rows[0]) : undefined;
  }
  async deleteContactMessage(id: number) {
    const r = await this.query("DELETE FROM contact_messages WHERE id = $1", [
      id,
    ]);
    return (r.rowCount ?? 0) > 0;
  }

  // Panel Logs
  async getPanelLogs(limit = 200) {
    const r = await this.query(
      "SELECT * FROM panel_logs ORDER BY created_at DESC LIMIT $1",
      [limit],
    );
    return r.rows.map(mapPanelLog);
  }
  async createPanelLog(log: InsertPanelLog) {
    const r = await this.query(
      "INSERT INTO panel_logs (user_id, user_name, action, details, ip) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        log.userId || null,
        log.userName,
        log.action,
        log.details || null,
        log.ip || null,
      ],
    );
    return mapPanelLog(r.rows[0]);
  }

  // Reported Messages
  async getAllReportedMessages() {
    const r = await this.query(`
      SELECT rm.*, pm.content as message_content, pm.subject as message_subject,
             sender.display_name as sender_name, sender.habbo_username as sender_habbo,
             reporter.display_name as reporter_name
      FROM reported_messages rm
      LEFT JOIN private_messages pm ON rm.message_id = pm.id
      LEFT JOIN users sender ON pm.from_user_id = sender.id
      LEFT JOIN users reporter ON rm.reported_by = reporter.id
      ORDER BY rm.created_at DESC
    `);
    return r.rows.map((row: any) => ({
      ...mapReportedMessage(row),
      messageContent: row.message_content,
      messageSubject: row.message_subject,
      senderName: row.sender_name,
      senderHabbo: row.sender_habbo,
      reporterName: row.reporter_name,
    }));
  }
  async createReport(report: InsertReportedMessage) {
    const r = await this.query(
      "INSERT INTO reported_messages (message_id, reported_by, reason, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        report.messageId,
        report.reportedBy,
        report.reason,
        report.status || "pending",
      ],
    );
    return mapReportedMessage(r.rows[0]);
  }
  async updateReportStatus(id: number, status: string) {
    const r = await this.query(
      "UPDATE reported_messages SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );
    return r.rows[0] ? mapReportedMessage(r.rows[0]) : undefined;
  }
  async deleteReport(id: number) {
    const r = await this.query("DELETE FROM reported_messages WHERE id = $1", [
      id,
    ]);
    return (r.rowCount ?? 0) > 0;
  }

  // Shop Products
  async getAllShopProducts(includeInactive?: boolean) {
    const r = await this.query(
      includeInactive
        ? "SELECT * FROM shop_products ORDER BY category, price ASC"
        : "SELECT * FROM shop_products WHERE is_active = true ORDER BY category, price ASC",
    );
    return r.rows.map(mapShopProduct);
  }
  async getShopProductById(id: number) {
    const r = await this.query("SELECT * FROM shop_products WHERE id = $1", [
      id,
    ]);
    return r.rows[0] ? mapShopProduct(r.rows[0]) : undefined;
  }
  async createShopProduct(product: InsertShopProduct) {
    const r = await this.query(
      `INSERT INTO shop_products (name, description, category, price, image_url, preview_url, data, is_limited, stock, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        product.name,
        product.description || null,
        product.category,
        product.price,
        product.imageUrl || null,
        product.previewUrl || null,
        JSON.stringify(product.data || {}),
        product.isLimited ?? false,
        product.stock ?? 0,
        product.isActive ?? true,
      ],
    );
    return mapShopProduct(r.rows[0]);
  }
  async updateShopProduct(id: number, data: Partial<InsertShopProduct>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.name !== undefined) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${i++}`);
      values.push(data.description);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${i++}`);
      values.push(data.category);
    }
    if (data.price !== undefined) {
      fields.push(`price = $${i++}`);
      values.push(data.price);
    }
    if (data.imageUrl !== undefined) {
      fields.push(`image_url = $${i++}`);
      values.push(data.imageUrl);
    }
    if (data.previewUrl !== undefined) {
      fields.push(`preview_url = $${i++}`);
      values.push(data.previewUrl);
    }
    if (data.data !== undefined) {
      fields.push(`data = $${i++}`);
      values.push(JSON.stringify(data.data));
    }
    if (data.isLimited !== undefined) {
      fields.push(`is_limited = $${i++}`);
      values.push(data.isLimited);
    }
    if (data.stock !== undefined) {
      fields.push(`stock = $${i++}`);
      values.push(data.stock);
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${i++}`);
      values.push(data.isActive);
    }
    if (fields.length === 0) return this.getShopProductById(id);
    values.push(id);
    const r = await this.query(
      `UPDATE shop_products SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ? mapShopProduct(r.rows[0]) : undefined;
  }
  async deleteShopProduct(id: number) {
    const r = await this.query("DELETE FROM shop_products WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // User Inventory
  async getUserInventory(userId: number) {
    const r = await this.query(
      `SELECT ui.*, sp.name as product_name, sp.category, sp.image_url, sp.preview_url, sp.price, sp.data
       FROM user_inventory ui
       LEFT JOIN shop_products sp ON ui.product_id = sp.id
       WHERE ui.user_id = $1 ORDER BY ui.purchased_at DESC`,
      [userId],
    );
    return r.rows.map((row: any) => ({
      ...mapUserInventory(row),
      productName: row.product_name,
      category: row.category,
      imageUrl: row.image_url,
      previewUrl: row.preview_url,
      price: row.price,
      productData: row.data,
    }));
  }
  async purchaseProduct(userId: number, productId: number) {
    const product = await this.getShopProductById(productId);
    if (!product) throw new Error("Producto no encontrado");
    const user = await this.getUser(userId);
    if (!user) throw new Error("Usuario no encontrado");
    if ((user.speedPoints ?? 0) < product.price)
      throw new Error("SpeedPoints insuficientes");
    // Deduct points
    await this.updateUser(userId, {
      speedPoints: (user.speedPoints ?? 0) - product.price,
    });
    // Create inventory item
    const r = await this.query(
      `INSERT INTO user_inventory (user_id, product_id) VALUES ($1, $2) RETURNING *`,
      [userId, productId],
    );
    return mapUserInventory(r.rows[0]);
  }
  async toggleEquipItem(userId: number, itemId: number) {
    const item = await this.query(
      "SELECT * FROM user_inventory WHERE id = $1 AND user_id = $2",
      [itemId, userId],
    );
    if (!item.rows[0]) throw new Error("Item no encontrado");
    const currentEquipped = item.rows[0].is_equipped;
    const newEquipped = !currentEquipped;
    const r = await this.query(
      "UPDATE user_inventory SET is_equipped = $1 WHERE id = $2 RETURNING *",
      [newEquipped, itemId],
    );
    return r.rows[0] ? mapUserInventory(r.rows[0]) : undefined;
  }

  // Notifications
  async getUserNotifications(userId: number, limit = 50) {
    const r = await this.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
      [userId, limit],
    );
    return r.rows.map(mapNotification);
  }
  async getUnreadNotificationCount(userId: number) {
    const r = await this.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = false",
      [userId],
    );
    return parseInt(r.rows[0]?.count ?? "0", 10);
  }
  async createNotification(notif: InsertNotification) {
    const r = await this.query(
      `INSERT INTO notifications (user_id, type, title, message, icon, link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        notif.userId,
        notif.type || "info",
        notif.title,
        notif.message || null,
        notif.icon || null,
        notif.link || null,
      ],
    );
    return mapNotification(r.rows[0]);
  }
  async markNotificationRead(id: number) {
    const r = await this.query(
      "UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *",
      [id],
    );
    return r.rows[0] ? mapNotification(r.rows[0]) : undefined;
  }
  async markAllNotificationsRead(userId: number) {
    await this.query(
      "UPDATE notifications SET is_read = true WHERE user_id = $1",
      [userId],
    );
  }

  // User Profiles
  async getUserProfile(userId: number) {
    const r = await this.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId],
    );
    return r.rows[0] ? mapUserProfile(r.rows[0]) : undefined;
  }
  async upsertUserProfile(userId: number, data: Partial<InsertUserProfile>) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.bio !== undefined) {
      fields.push(`bio = $${i++}`);
      values.push(data.bio);
    }
    if (data.backgroundUrl !== undefined) {
      fields.push(`background_url = $${i++}`);
      values.push(data.backgroundUrl);
    }
    if (data.backgroundColor !== undefined) {
      fields.push(`background_color = $${i++}`);
      values.push(data.backgroundColor);
    }
    if (data.accentColor !== undefined) {
      fields.push(`accent_color = $${i++}`);
      values.push(data.accentColor);
    }
    if (data.aboutMe !== undefined) {
      fields.push(`about_me = $${i++}`);
      values.push(data.aboutMe);
    }
    if (data.socialYoutube !== undefined) {
      fields.push(`social_youtube = $${i++}`);
      values.push(data.socialYoutube);
    }
    if (data.socialTwitter !== undefined) {
      fields.push(`social_twitter = $${i++}`);
      values.push(data.socialTwitter);
    }
    if (data.socialInstagram !== undefined) {
      fields.push(`social_instagram = $${i++}`);
      values.push(data.socialInstagram);
    }
    if (data.customCss !== undefined) {
      fields.push(`custom_css = $${i++}`);
      values.push(data.customCss);
    }
    fields.push(`updated_at = NOW()`);
    const existing = await this.getUserProfile(userId);
    if (existing) {
      values.push(userId);
      const r = await this.query(
        `UPDATE user_profiles SET ${fields.join(", ")} WHERE user_id = $${i} RETURNING *`,
        values,
      );
      return mapUserProfile(r.rows[0]);
    } else {
      return this.createUserProfile(userId, data);
    }
  }
  async createUserProfile(userId: number, data: Partial<InsertUserProfile>) {
    const r = await this.query(
      `INSERT INTO user_profiles (user_id, bio, background_url, background_color, accent_color, about_me, social_youtube, social_twitter, social_instagram, custom_css)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        userId,
        data.bio || "",
        data.backgroundUrl || null,
        data.backgroundColor || "#1e293b",
        data.accentColor || null,
        data.aboutMe || "",
        data.socialYoutube || null,
        data.socialTwitter || null,
        data.socialInstagram || null,
        data.customCss || null,
      ],
    );
    return mapUserProfile(r.rows[0]);
  }

  // Profile Wall / Muro
  async getWallMessages(profileUserId: number) {
    const r = await this.query(
      "SELECT pw.*, u.display_name as author_name FROM profile_wall pw " +
        "JOIN users u ON pw.author_id = u.id " +
        "WHERE pw.profile_user_id = $1 ORDER BY pw.created_at DESC",
      [profileUserId],
    );
    return r.rows.map(mapProfileWall);
  }

  async getWallMessageById(id: number) {
    const r = await this.query(
      "SELECT pw.*, u.display_name as author_name FROM profile_wall pw " +
        "JOIN users u ON pw.author_id = u.id " +
        "WHERE pw.id = $1",
      [id],
    );
    return r.rows[0] ? mapProfileWall(r.rows[0]) : undefined;
  }

  async createWallMessage(msg: InsertProfileWall) {
    const r = await this.query(
      `INSERT INTO profile_wall (profile_user_id, author_id, author_name, message) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [msg.profileUserId, msg.authorId, msg.authorName, msg.message],
    );
    return mapProfileWall(r.rows[0]);
  }

  async deleteWallMessage(id: number) {
    const r = await this.query("DELETE FROM profile_wall WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Song History
  async getSongHistory(limit: number = 20): Promise<SongHistory[]> {
    const r = await this.query(
      "SELECT * FROM song_history ORDER BY played_at DESC LIMIT $1",
      [limit],
    );
    return r.rows.map(mapSongHistory);
  }

  async createSongHistory(song: InsertSongHistory): Promise<SongHistory> {
    const check = await this.query(
      "SELECT * FROM song_history WHERE title = $1 AND artist = $2 AND played_at > NOW() - INTERVAL '2 minutes' LIMIT 1",
      [song.title, song.artist],
    );
    if (check.rows.length > 0) {
      const existing = check.rows[0];
      const r = await this.query(
        "UPDATE song_history SET play_count = play_count + 1, played_at = NOW() WHERE id = $1 RETURNING *",
        [existing.id],
      );
      return mapSongHistory(r.rows[0]);
    }

    const r = await this.query(
      `INSERT INTO song_history (title, artist, album, cover_url, played_by_dj, duration_seconds, requested_by, play_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        song.title,
        song.artist,
        song.album || null,
        song.coverUrl || null,
        song.playedByDj || null,
        song.durationSeconds || null,
        song.requestedBy || null,
        song.playCount || 1,
      ],
    );
    return mapSongHistory(r.rows[0]);
  }

  async getMostPlayedSongs(limit: number = 10): Promise<SongHistory[]> {
    const r = await this.query(
      "SELECT title, artist, album, cover_url, SUM(play_count) as play_count FROM song_history GROUP BY title, artist, album, cover_url ORDER BY play_count DESC LIMIT $1",
      [limit],
    );
    return r.rows.map((row: any, idx: number) => ({
      id: idx + 1,
      title: row.title,
      artist: row.artist,
      album: row.album,
      coverUrl: row.cover_url,
      playCount: parseInt(row.play_count) || 1,
      playedAt: new Date(),
      playedByDj: null,
      durationSeconds: null,
      requestedBy: null,
    }));
  }

  // VIP Memberships
  async getVipMembership(userId: number): Promise<VipMembership | undefined> {
    const r = await this.query(
      "SELECT * FROM vip_memberships WHERE user_id = $1 AND is_active = true ORDER BY expires_at DESC LIMIT 1",
      [userId],
    );
    return r.rows[0] ? mapVipMembership(r.rows[0]) : undefined;
  }

  async createVipMembership(
    membership: InsertVipMembership,
  ): Promise<VipMembership> {
    const r = await this.query(
      `INSERT INTO vip_memberships (user_id, tier, expires_at, payment_ref, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        membership.userId,
        membership.tier,
        membership.expiresAt || null,
        membership.paymentRef || null,
        membership.isActive ?? true,
      ],
    );
    await this.query("UPDATE users SET vip_tier = $1 WHERE id = $2", [
      membership.tier,
      membership.userId,
    ]);
    return mapVipMembership(r.rows[0]);
  }

  async updateVipMembership(
    userId: number,
    data: Partial<InsertVipMembership>,
  ): Promise<VipMembership | undefined> {
    const active = await this.getVipMembership(userId);
    if (!active) return undefined;

    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.tier !== undefined) {
      fields.push(`tier = $${i++}`);
      values.push(data.tier);
    }
    if (data.expiresAt !== undefined) {
      fields.push(`expires_at = $${i++}`);
      values.push(data.expiresAt);
    }
    if (data.paymentRef !== undefined) {
      fields.push(`payment_ref = $${i++}`);
      values.push(data.paymentRef);
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${i++}`);
      values.push(data.isActive);
    }

    if (fields.length === 0) return active;

    values.push(active.id);
    const r = await this.query(
      `UPDATE vip_memberships SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );

    if (data.tier !== undefined || data.isActive === false) {
      const newTier = data.isActive === false ? null : data.tier || active.tier;
      await this.query("UPDATE users SET vip_tier = $1 WHERE id = $2", [
        newTier,
        userId,
      ]);
    }

    return mapVipMembership(r.rows[0]);
  }

  async getAllVipMemberships(): Promise<any[]> {
    const r = await this.query(
      `SELECT vm.*, u.display_name, u.email, u.habbo_username 
       FROM vip_memberships vm 
       JOIN users u ON vm.user_id = u.id 
       ORDER BY vm.started_at DESC`,
    );
    return r.rows.map((row: any) => ({
      ...mapVipMembership(row),
      displayName: row.display_name,
      email: row.email,
      habboUsername: row.habbo_username,
    }));
  }

  // VIP Perks Log
  async logVipPerkUse(userId: number, perkUsed: string): Promise<VipPerkLog> {
    const r = await this.query(
      "INSERT INTO vip_perks_log (user_id, perk_used) VALUES ($1, $2) RETURNING *",
      [userId, perkUsed],
    );
    return mapVipPerkLog(r.rows[0]);
  }

  async getVipPerkLogs(userId: number): Promise<VipPerkLog[]> {
    const r = await this.query(
      "SELECT * FROM vip_perks_log WHERE user_id = $1 ORDER BY used_at DESC",
      [userId],
    );
    return r.rows.map(mapVipPerkLog);
  }

  // Rooms
  async getAllRooms(includeInactive: boolean = false): Promise<HSpeedRoom[]> {
    const queryStr = includeInactive
      ? "SELECT * FROM hspeed_rooms ORDER BY featured DESC, created_at DESC"
      : "SELECT * FROM hspeed_rooms WHERE is_active = true ORDER BY featured DESC, created_at DESC";
    const r = await this.query(queryStr);
    return r.rows.map(mapHSpeedRoom);
  }

  async getFeaturedRooms(): Promise<HSpeedRoom[]> {
    const r = await this.query(
      "SELECT * FROM hspeed_rooms WHERE is_active = true AND featured = true ORDER BY created_at DESC",
    );
    return r.rows.map(mapHSpeedRoom);
  }

  async createRoom(room: InsertHSpeedRoom): Promise<HSpeedRoom> {
    const r = await this.query(
      `INSERT INTO hspeed_rooms (name, description, room_code, owner_habbo, hotel, category, capacity, current_visitors, is_active, thumbnailUrl, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        room.name,
        room.description || null,
        room.roomCode || null,
        room.ownerHabbo || null,
        room.hotel || "es",
        room.category || null,
        room.capacity || null,
        room.currentVisitors || 0,
        room.isActive ?? true,
        room.thumbnailUrl || null,
        room.featured ?? false,
      ],
    );
    return mapHSpeedRoom(r.rows[0]);
  }

  async updateRoom(
    id: number,
    data: Partial<InsertHSpeedRoom>,
  ): Promise<HSpeedRoom | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.name !== undefined) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${i++}`);
      values.push(data.description);
    }
    if (data.roomCode !== undefined) {
      fields.push(`room_code = $${i++}`);
      values.push(data.roomCode);
    }
    if (data.ownerHabbo !== undefined) {
      fields.push(`owner_habbo = $${i++}`);
      values.push(data.ownerHabbo);
    }
    if (data.hotel !== undefined) {
      fields.push(`hotel = $${i++}`);
      values.push(data.hotel);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${i++}`);
      values.push(data.category);
    }
    if (data.capacity !== undefined) {
      fields.push(`capacity = $${i++}`);
      values.push(data.capacity);
    }
    if (data.currentVisitors !== undefined) {
      fields.push(`current_visitors = $${i++}`);
      values.push(data.currentVisitors);
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${i++}`);
      values.push(data.isActive);
    }
    if (data.thumbnailUrl !== undefined) {
      fields.push(`thumbnailUrl = $${i++}`);
      values.push(data.thumbnailUrl);
    }
    if (data.featured !== undefined) {
      fields.push(`featured = $${i++}`);
      values.push(data.featured);
    }

    if (fields.length === 0) {
      const r = await this.query("SELECT * FROM hspeed_rooms WHERE id = $1", [
        id,
      ]);
      return r.rows[0] ? mapHSpeedRoom(r.rows[0]) : undefined;
    }

    values.push(id);
    const r = await this.query(
      `UPDATE hspeed_rooms SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ? mapHSpeedRoom(r.rows[0]) : undefined;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const r = await this.query("DELETE FROM hspeed_rooms WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Support Tickets
  async getTicketsByUser(userId: number): Promise<SupportTicket[]> {
    const r = await this.query(
      "SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return r.rows.map(mapSupportTicket);
  }

  async createTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const r = await this.query(
      `INSERT INTO support_tickets (user_id, subject, description, status, category)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        ticket.userId,
        ticket.subject,
        ticket.description,
        ticket.status ?? "open",
        ticket.category ?? "general",
      ],
    );
    return mapSupportTicket(r.rows[0]);
  }

  async updateTicketStatus(
    id: number,
    status: string,
  ): Promise<SupportTicket | undefined> {
    const r = await this.query(
      "UPDATE support_tickets SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );
    return r.rows[0] ? mapSupportTicket(r.rows[0]) : undefined;
  }

  async getAllTickets(): Promise<SupportTicket[]> {
    const r = await this.query(
      "SELECT * FROM support_tickets ORDER BY created_at DESC",
    );
    return r.rows.map(mapSupportTicket);
  }

  // Alliances
  async getAllAlliances(): Promise<Alliance[]> {
    const r = await this.query(
      "SELECT * FROM alliances WHERE is_active = true ORDER BY sort_order ASC",
    );
    return r.rows.map(mapAlliance);
  }

  async createAlliance(alliance: InsertAlliance): Promise<Alliance> {
    const r = await this.query(
      `INSERT INTO alliances (name, logo_url, website_url, description, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        alliance.name,
        alliance.logoUrl,
        alliance.websiteUrl || null,
        alliance.description || null,
        alliance.isActive ?? true,
        alliance.sortOrder ?? 0,
      ],
    );
    return mapAlliance(r.rows[0]);
  }

  async updateAlliance(
    id: number,
    data: Partial<InsertAlliance>,
  ): Promise<Alliance | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.name !== undefined) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.logoUrl !== undefined) {
      fields.push(`logo_url = $${i++}`);
      values.push(data.logoUrl);
    }
    if (data.websiteUrl !== undefined) {
      fields.push(`website_url = $${i++}`);
      values.push(data.websiteUrl);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${i++}`);
      values.push(data.description);
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${i++}`);
      values.push(data.isActive);
    }
    if (data.sortOrder !== undefined) {
      fields.push(`sort_order = $${i++}`);
      values.push(data.sortOrder);
    }

    if (fields.length === 0) {
      const r = await this.query("SELECT * FROM alliances WHERE id = $1", [id]);
      return r.rows[0] ? mapAlliance(r.rows[0]) : undefined;
    }

    values.push(id);
    const r = await this.query(
      `UPDATE alliances SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ? mapAlliance(r.rows[0]) : undefined;
  }

  async deleteAlliance(id: number): Promise<boolean> {
    const r = await this.query("DELETE FROM alliances WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  // Reaction Icons
  async getAllReactionIcons(): Promise<ReactionIcon[]> {
    const r = await this.query(
      "SELECT * FROM reaction_icons WHERE is_active = true ORDER BY sort_order ASC",
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      label: row.label,
      iconUrl: row.icon_url,
      animatedIconUrl: row.animated_icon_url,
      category: row.category,
      rarity: row.rarity,
      speedPointsCost: row.speed_points_cost,
      unlockCondition: row.unlock_condition,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }));
  }

  async getReactionIconByCode(code: string): Promise<ReactionIcon | undefined> {
    const r = await this.query("SELECT * FROM reaction_icons WHERE code = $1", [
      code,
    ]);
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async createReactionIcon(data: InsertReactionIcon): Promise<ReactionIcon> {
    const r = await this.query(
      `INSERT INTO reaction_icons (code, name, label, icon_url, animated_icon_url, category, rarity, speed_points_cost, unlock_condition, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        data.code,
        data.name,
        data.label,
        data.iconUrl,
        data.animatedIconUrl || null,
        data.category || "general",
        data.rarity || "common",
        data.speedPointsCost || 0,
        data.unlockCondition || {},
        data.isActive ?? true,
        data.sortOrder || 0,
      ],
    );
    return r.rows[0];
  }

  async updateReactionIcon(
    id: number,
    data: Partial<InsertReactionIcon>,
  ): Promise<ReactionIcon | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.name !== undefined) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.label !== undefined) {
      fields.push(`label = $${i++}`);
      values.push(data.label);
    }
    if (data.iconUrl !== undefined) {
      fields.push(`icon_url = $${i++}`);
      values.push(data.iconUrl);
    }
    if (data.animatedIconUrl !== undefined) {
      fields.push(`animated_icon_url = $${i++}`);
      values.push(data.animatedIconUrl);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${i++}`);
      values.push(data.category);
    }
    if (data.rarity !== undefined) {
      fields.push(`rarity = $${i++}`);
      values.push(data.rarity);
    }
    if (data.speedPointsCost !== undefined) {
      fields.push(`speed_points_cost = $${i++}`);
      values.push(data.speedPointsCost);
    }
    if (data.unlockCondition !== undefined) {
      fields.push(`unlock_condition = $${i++}`);
      values.push(data.unlockCondition);
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${i++}`);
      values.push(data.isActive);
    }
    if (data.sortOrder !== undefined) {
      fields.push(`sort_order = $${i++}`);
      values.push(data.sortOrder);
    }
    if (fields.length === 0) return this.getReactionIconByCode("");
    values.push(id);
    const r = await this.query(
      `UPDATE reaction_icons SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async deleteReactionIcon(id: number): Promise<boolean> {
    const r = await this.query("DELETE FROM reaction_icons WHERE id = $1", [
      id,
    ]);
    return (r.rowCount ?? 0) > 0;
  }

  async getUserReactionIcons(userId: number): Promise<UserReactionIcon[]> {
    const r = await this.query(
      "SELECT * FROM user_reaction_icons WHERE user_id = $1",
      [userId],
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      reactionIconId: row.reaction_icon_id,
      unlockedAt: row.unlocked_at,
      usageCount: row.usage_count,
    }));
  }

  async unlockUserReactionIcon(
    userId: number,
    iconId: number,
  ): Promise<UserReactionIcon> {
    const r = await this.query(
      `INSERT INTO user_reaction_icons (user_id, reaction_icon_id) VALUES ($1, $2) 
       ON CONFLICT (user_id, reaction_icon_id) DO NOTHING RETURNING *`,
      [userId, iconId],
    );
    if (r.rows[0]) return r.rows[0];
    const existing = await this.query(
      "SELECT * FROM user_reaction_icons WHERE user_id = $1 AND reaction_icon_id = $2",
      [userId, iconId],
    );
    return existing.rows[0];
  }

  async incrementReactionIconUsage(
    userId: number,
    iconId: number,
  ): Promise<void> {
    await this.query(
      "UPDATE user_reaction_icons SET usage_count = usage_count + 1 WHERE user_id = $1 AND reaction_icon_id = $2",
      [userId, iconId],
    );
  }

  // Cards
  async getAllCards(): Promise<Card[]> {
    const r = await this.query(
      "SELECT * FROM cards WHERE is_active = true ORDER BY sort_order ASC",
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      animatedImageUrl: row.animated_image_url,
      category: row.category,
      rarity: row.rarity,
      series: row.series,
      earnCondition: row.earn_condition,
      speedPointsValue: row.speed_points_value,
      stats: row.stats,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }));
  }

  async getCardByCode(code: string): Promise<Card | undefined> {
    const r = await this.query("SELECT * FROM cards WHERE code = $1", [code]);
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async createCard(data: InsertCard): Promise<Card> {
    const r = await this.query(
      `INSERT INTO cards (code, name, description, image_url, animated_image_url, category, rarity, series, earn_condition, speed_points_value, stats, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        data.code,
        data.name,
        data.description || null,
        data.imageUrl,
        data.animatedImageUrl || null,
        data.category,
        data.rarity || "common",
        data.series || "base",
        data.earnCondition || {},
        data.speedPointsValue || 0,
        data.stats || {},
        data.isActive ?? true,
        data.sortOrder || 0,
      ],
    );
    return r.rows[0];
  }

  async getUserCards(userId: number): Promise<UserCard[]> {
    const r = await this.query("SELECT * FROM user_cards WHERE user_id = $1", [
      userId,
    ]);
    return r.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      cardId: row.card_id,
      quantity: row.quantity,
      obtainedAt: row.obtained_at,
      isFavorite: row.is_favorite,
      equippedSlot: row.equipped_slot,
    }));
  }

  async equipUserCard(
    userId: number,
    cardId: number,
    slot: number,
  ): Promise<UserCard> {
    await this.query(
      "UPDATE user_cards SET equipped_slot = NULL WHERE user_id = $1 AND equipped_slot = $2",
      [userId, slot],
    );
    const r = await this.query(
      `UPDATE user_cards SET equipped_slot = $3 WHERE user_id = $1 AND card_id = $2 RETURNING *`,
      [userId, cardId, slot],
    );
    return r.rows[0];
  }

  async grantUserCard(
    userId: number,
    cardId: number,
    qty: number,
  ): Promise<UserCard> {
    const r = await this.query(
      `INSERT INTO user_cards (user_id, card_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, card_id) DO UPDATE SET quantity = user_cards.quantity + EXCLUDED.quantity RETURNING *`,
      [userId, cardId, qty],
    );
    return r.rows[0];
  }

  // Mini Games
  async getAllMiniGames(): Promise<MiniGame[]> {
    const r = await this.query(
      "SELECT * FROM mini_games WHERE is_active = true ORDER BY id ASC",
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      thumbnailUrl: row.thumbnail_url,
      category: row.category,
      maxScore: row.max_score,
      rewardConfig: row.reward_config,
      isActive: row.is_active,
      config: row.config,
      createdAt: row.created_at,
    }));
  }

  async getMiniGameByCode(code: string): Promise<MiniGame | undefined> {
    const r = await this.query("SELECT * FROM mini_games WHERE code = $1", [
      code,
    ]);
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async createMiniGame(data: InsertMiniGame): Promise<MiniGame> {
    const r = await this.query(
      `INSERT INTO mini_games (code, name, description, thumbnail_url, category, max_score, reward_config, is_active, config)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        data.code,
        data.name,
        data.description || null,
        data.thumbnailUrl || null,
        data.category,
        data.maxScore || 0,
        data.rewardConfig || {},
        data.isActive ?? true,
        data.config || {},
      ],
    );
    return r.rows[0];
  }

  async getUserMiniGameScores(userId: number): Promise<UserMiniGameScore[]> {
    const r = await this.query(
      "SELECT * FROM user_mini_game_scores WHERE user_id = $1",
      [userId],
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      miniGameId: row.mini_game_id,
      score: row.score,
      maxScore: row.max_score,
      playsCount: row.plays_count,
      lastPlayedAt: row.last_played_at,
      bestRunData: row.best_run_data,
    }));
  }

  async submitMiniGameScore(
    userId: number,
    gameCode: string,
    score: number,
    gameData?: any,
  ): Promise<UserMiniGameScore> {
    const game = await this.getMiniGameByCode(gameCode);
    if (!game) throw new Error("Juego no encontrado");
    const r = await this.query(
      `INSERT INTO user_mini_game_scores (user_id, mini_game_id, score, max_score, plays_count, best_run_data)
       VALUES ($1, $2, $3, GREATEST($3, COALESCE((SELECT max_score FROM user_mini_game_scores WHERE user_id = $1 AND mini_game_id = $2), 0)), 1, $4)
       ON CONFLICT (user_id, mini_game_id) DO UPDATE SET
         score = GREATEST(EXCLUDED.score, user_mini_game_scores.score),
         max_score = GREATEST(EXCLUDED.max_score, user_mini_game_scores.max_score),
         plays_count = user_mini_game_scores.plays_count + 1,
         last_played_at = NOW(),
         best_run_data = CASE WHEN EXCLUDED.score > user_mini_game_scores.score THEN EXCLUDED.best_run_data ELSE user_mini_game_scores.best_run_data END
       RETURNING *`,
      [userId, game.id, score, gameData || {}],
    );
    return r.rows[0];
  }

  async getMiniGameLeaderboard(
    gameCode: string,
    limit: number,
  ): Promise<any[]> {
    const game = await this.getMiniGameByCode(gameCode);
    if (!game) return [];
    const r = await this.query(
      `SELECT ums.*, u.display_name, u.habbo_username, u.avatar_url
       FROM user_mini_game_scores ums
       JOIN users u ON u.id = ums.user_id
       WHERE ums.mini_game_id = $1
       ORDER BY ums.max_score DESC, ums.plays_count ASC
       LIMIT $2`,
      [game.id, limit],
    );
    return r.rows;
  }

  // Speed Missions
  async getActiveSpeedMissions(season?: string): Promise<SpeedMission[]> {
    const now = new Date();
    let query =
      "SELECT * FROM speed_missions WHERE is_active = true AND (starts_at IS NULL OR starts_at <= $1) AND (ends_at IS NULL OR ends_at >= $1)";
    const params: any[] = [now];
    if (season) {
      query += " AND season = $2";
      params.push(season);
    }
    query += " ORDER BY sort_order ASC";
    const r = await this.query(query, params);
    return r.rows.map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      category: row.category,
      season: row.season,
      type: row.type,
      target: row.target,
      rewardConfig: row.reward_config,
      iconUrl: row.icon_url,
      isRepeatable: row.is_repeatable,
      cooldownHours: row.cooldown_hours,
      isActive: row.is_active,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }));
  }

  async getSpeedMissionByCode(code: string): Promise<SpeedMission | undefined> {
    const r = await this.query("SELECT * FROM speed_missions WHERE code = $1", [
      code,
    ]);
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async createSpeedMission(data: InsertSpeedMission): Promise<SpeedMission> {
    const r = await this.query(
      `INSERT INTO speed_missions (code, name, description, category, season, type, target, reward_config, icon_url, is_repeatable, cooldown_hours, is_active, starts_at, ends_at, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        data.code,
        data.name,
        data.description || null,
        data.category,
        data.season || null,
        data.type,
        data.target || {},
        data.rewardConfig || {},
        data.iconUrl || null,
        data.isRepeatable ?? false,
        data.cooldownHours || 24,
        data.isActive ?? true,
        data.startsAt || null,
        data.endsAt || null,
        data.sortOrder || 0,
      ],
    );
    return r.rows[0];
  }

  async getUserMissions(userId: number): Promise<UserMission[]> {
    const r = await this.query(
      "SELECT * FROM user_missions WHERE user_id = $1",
      [userId],
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      missionId: row.mission_id,
      progress: row.progress,
      status: row.status,
      completedAt: row.completed_at,
      claimedAt: row.claimed_at,
      createdAt: row.created_at,
    }));
  }

  async updateMissionProgress(
    userId: number,
    missionId: number,
    action: string,
    metadata?: any,
  ): Promise<UserMission> {
    const r = await this.query(
      `INSERT INTO user_missions (user_id, mission_id, progress, status) VALUES ($1, $2, $3, 'active')
       ON CONFLICT (user_id, mission_id) DO UPDATE SET progress = EXCLUDED.progress, status = CASE WHEN user_missions.status = 'active' THEN 'active' ELSE user_missions.status END
       RETURNING *`,
      [userId, missionId, { action, metadata, updatedAt: new Date() }],
    );
    return r.rows[0];
  }

  async claimMissionReward(
    userId: number,
    missionId: number,
  ): Promise<UserMission> {
    const r = await this.query(
      `UPDATE user_missions SET status = 'claimed', claimed_at = NOW() WHERE user_id = $1 AND mission_id = $2 RETURNING *`,
      [userId, missionId],
    );
    return r.rows[0];
  }

  // Seasonal Stamps
  async getSeasonalStamps(season?: string): Promise<SeasonalStamp[]> {
    let query = "SELECT * FROM seasonal_stamps WHERE is_active = true";
    const params: any[] = [];
    if (season) {
      query += " AND season = $1";
      params.push(season);
    }
    query += " ORDER BY sort_order ASC";
    const r = await this.query(query, params);
    return r.rows.map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      season: row.season,
      rarity: row.rarity,
      obtainMethod: row.obtain_method,
      rewardConfig: row.reward_config,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }));
  }

  async getSeasonalStampByCode(
    code: string,
  ): Promise<SeasonalStamp | undefined> {
    const r = await this.query(
      "SELECT * FROM seasonal_stamps WHERE code = $1",
      [code],
    );
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async createSeasonalStamp(data: InsertSeasonalStamp): Promise<SeasonalStamp> {
    const r = await this.query(
      `INSERT INTO seasonal_stamps (code, name, description, image_url, season, rarity, obtain_method, reward_config, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        data.code,
        data.name,
        data.description || null,
        data.imageUrl,
        data.season,
        data.rarity || "common",
        data.obtainMethod || {},
        data.rewardConfig || {},
        data.isActive ?? true,
        data.sortOrder || 0,
      ],
    );
    return r.rows[0];
  }

  async getUserStamps(userId: number): Promise<UserStamp[]> {
    const r = await this.query("SELECT * FROM user_stamps WHERE user_id = $1", [
      userId,
    ]);
    return r.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      stampId: row.stamp_id,
      quantity: row.quantity,
      obtainedAt: row.obtained_at,
      isRepeated: row.is_repeated,
    }));
  }

  // YouTube Embeds (Speed Shorts)
  async getUserYoutubeEmbeds(userId: number): Promise<UserYoutubeEmbed[]> {
    const r = await this.query(
      "SELECT * FROM user_youtube_embeds WHERE user_id = $1 AND is_approved = true ORDER BY created_at DESC",
      [userId],
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      videoId: row.video_id,
      title: row.title,
      thumbnailUrl: row.thumbnail_url,
      description: row.description,
      isFeatured: row.is_featured,
      isApproved: row.is_approved,
      views: row.views,
      likes: row.likes,
      createdAt: row.created_at,
    }));
  }

  async createUserYoutubeEmbed(
    userId: number,
    data: InsertUserYoutubeEmbed,
  ): Promise<UserYoutubeEmbed> {
    const r = await this.query(
      `INSERT INTO user_youtube_embeds (user_id, video_id, title, thumbnail_url, description, is_approved)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        userId,
        data.videoId,
        data.title,
        data.thumbnailUrl || null,
        data.description || null,
        false,
      ],
    );
    return r.rows[0];
  }

  async updateUserYoutubeEmbed(
    id: number,
    userId: number,
    data: Partial<InsertUserYoutubeEmbed>,
  ): Promise<UserYoutubeEmbed | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.title !== undefined) {
      fields.push(`title = $${i++}`);
      values.push(data.title);
    }
    if (data.thumbnailUrl !== undefined) {
      fields.push(`thumbnail_url = $${i++}`);
      values.push(data.thumbnailUrl);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${i++}`);
      values.push(data.description);
    }
    if (data.isFeatured !== undefined) {
      fields.push(`is_featured = $${i++}`);
      values.push(data.isFeatured);
    }
    if (fields.length === 0) return undefined;
    values.push(id, userId);
    const r = await this.query(
      `UPDATE user_youtube_embeds SET ${fields.join(", ")} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`,
      values,
    );
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async deleteUserYoutubeEmbed(id: number, userId: number): Promise<boolean> {
    const r = await this.query(
      "DELETE FROM user_youtube_embeds WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    return (r.rowCount ?? 0) > 0;
  }

  async approveYoutubeEmbed(id: number): Promise<UserYoutubeEmbed | undefined> {
    const r = await this.query(
      "UPDATE user_youtube_embeds SET is_approved = true WHERE id = $1 RETURNING *",
      [id],
    );
    return r.rows[0] ? r.rows[0] : undefined;
  }

  // Cine Mode
  async getCineSessions(status?: string): Promise<CineSession[]> {
    let query = "SELECT * FROM cine_sessions";
    const params: any[] = [];
    if (status) {
      query += " WHERE status = $1";
      params.push(status);
    }
    query += " ORDER BY created_at DESC";
    const r = await this.query(query, params);
    return r.rows.map((row: any) => ({
      id: row.id,
      hostUserId: row.host_user_id,
      videoId: row.video_id,
      title: row.title,
      thumbnailUrl: row.thumbnail_url,
      status: row.status,
      currentTime: row.current_time,
      participants: row.participants,
      isPublic: row.is_public,
      password: row.password,
      createdAt: row.created_at,
      startedAt: row.started_at,
      endedAt: row.ended_at,
    }));
  }

  async getCineSession(id: number): Promise<CineSession | undefined> {
    const r = await this.query("SELECT * FROM cine_sessions WHERE id = $1", [
      id,
    ]);
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async createCineSession(
    hostUserId: number,
    data: InsertCineSession,
  ): Promise<CineSession> {
    const r = await this.query(
      `INSERT INTO cine_sessions (host_user_id, video_id, title, thumbnail_url, status, current_time, participants, is_public, password)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        hostUserId,
        data.videoId,
        data.title,
        data.thumbnailUrl || null,
        data.status || "waiting",
        data.currentTime || 0,
        data.participants || [],
        data.isPublic ?? true,
        data.password || null,
      ],
    );
    return r.rows[0];
  }

  async updateCineSession(
    id: number,
    hostUserId: number,
    data: Partial<InsertCineSession>,
  ): Promise<CineSession | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.videoId !== undefined) {
      fields.push(`video_id = $${i++}`);
      values.push(data.videoId);
    }
    if (data.title !== undefined) {
      fields.push(`title = $${i++}`);
      values.push(data.title);
    }
    if (data.thumbnailUrl !== undefined) {
      fields.push(`thumbnail_url = $${i++}`);
      values.push(data.thumbnailUrl);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${i++}`);
      values.push(data.status);
    }
    if (data.currentTime !== undefined) {
      fields.push(`current_time = $${i++}`);
      values.push(data.currentTime);
    }
    if (data.participants !== undefined) {
      fields.push(`participants = $${i++}`);
      values.push(data.participants);
    }
    if (data.isPublic !== undefined) {
      fields.push(`is_public = $${i++}`);
      values.push(data.isPublic);
    }
    if (data.password !== undefined) {
      fields.push(`password = $${i++}`);
      values.push(data.password);
    }
    if (fields.length === 0) return undefined;
    values.push(id, hostUserId);
    const r = await this.query(
      `UPDATE cine_sessions SET ${fields.join(", ")} WHERE id = $${i} AND host_user_id = $${i + 1} RETURNING *`,
      values,
    );
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async joinCineSession(
    sessionId: number,
    userId: number,
  ): Promise<CineSession> {
    const r = await this.query(
      `UPDATE cine_sessions SET participants = jsonb_set(
         COALESCE(participants, '[]'::jsonb),
         '{0}', 
         (SELECT jsonb_agg(elem) FROM jsonb_array_elements(
           COALESCE(participants, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('userId', $1, 'joinedAt', NOW()))
         ) elem)
       ) WHERE id = $2 RETURNING *`,
      [userId, sessionId],
    );
    return r.rows[0];
  }

  async leaveCineSession(sessionId: number, userId: number): Promise<void> {
    await this.query(
      `UPDATE cine_sessions SET participants = (
         SELECT jsonb_agg(elem) FROM jsonb_array_elements(participants) elem WHERE (elem->>'userId')::int != $1
       ) WHERE id = $2`,
      [userId, sessionId],
    );
  }

  // DJ Slots
  async getAllDjSlots(): Promise<DjSlot[]> {
    const r = await this.query(
      "SELECT * FROM dj_slots ORDER BY day_of_week ASC, start_time ASC",
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      djUserId: row.dj_user_id,
      djName: row.dj_name,
      showName: row.show_name,
      description: row.description,
      status: row.status,
      recurring: row.recurring,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async getDjSlot(id: number): Promise<DjSlot | undefined> {
    const r = await this.query("SELECT * FROM dj_slots WHERE id = $1", [id]);
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async createDjSlot(data: InsertDjSlot): Promise<DjSlot> {
    const r = await this.query(
      `INSERT INTO dj_slots (day_of_week, start_time, end_time, dj_user_id, dj_name, show_name, description, status, recurring, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        data.dayOfWeek,
        data.startTime,
        data.endTime,
        data.djUserId || null,
        data.djName || null,
        data.showName || null,
        data.description || null,
        data.status || "available",
        data.recurring ?? true,
        data.notes || null,
      ],
    );
    return r.rows[0];
  }

  async updateDjSlot(
    id: number,
    data: Partial<InsertDjSlot>,
  ): Promise<DjSlot | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.dayOfWeek !== undefined) {
      fields.push(`day_of_week = $${i++}`);
      values.push(data.dayOfWeek);
    }
    if (data.startTime !== undefined) {
      fields.push(`start_time = $${i++}`);
      values.push(data.startTime);
    }
    if (data.endTime !== undefined) {
      fields.push(`end_time = $${i++}`);
      values.push(data.endTime);
    }
    if (data.djUserId !== undefined) {
      fields.push(`dj_user_id = $${i++}`);
      values.push(data.djUserId);
    }
    if (data.djName !== undefined) {
      fields.push(`dj_name = $${i++}`);
      values.push(data.djName);
    }
    if (data.showName !== undefined) {
      fields.push(`show_name = $${i++}`);
      values.push(data.showName);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${i++}`);
      values.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${i++}`);
      values.push(data.status);
    }
    if (data.recurring !== undefined) {
      fields.push(`recurring = $${i++}`);
      values.push(data.recurring);
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${i++}`);
      values.push(data.notes);
    }
    if (fields.length === 0) return this.getDjSlot(id);
    values.push(id);
    const r = await this.query(
      `UPDATE dj_slots SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async deleteDjSlot(id: number): Promise<boolean> {
    const r = await this.query("DELETE FROM dj_slots WHERE id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  }

  async requestDjSlot(
    slotId: number,
    userId: number,
    data: InsertDjSlotRequest,
  ): Promise<DjSlotRequest> {
    const r = await this.query(
      `INSERT INTO dj_slot_requests (slot_id, user_id, show_name, description, status)
       VALUES ($1,$2,$3,$4,'pending') RETURNING *`,
      [slotId, userId, data.showName, data.description || null],
    );
    return r.rows[0];
  }

  async getDjSlotRequests(): Promise<DjSlotRequest[]> {
    const r = await this.query(
      "SELECT * FROM dj_slot_requests ORDER BY created_at DESC",
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      slotId: row.slot_id,
      userId: row.user_id,
      showName: row.show_name,
      description: row.description,
      status: row.status,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      createdAt: row.created_at,
    }));
  }

  async reviewDjSlotRequest(
    id: number,
    reviewedBy: number,
    data: { status: string },
  ): Promise<DjSlotRequest> {
    const r = await this.query(
      `UPDATE dj_slot_requests SET status = $1, reviewed_by = $2, reviewed_at = NOW() WHERE id = $3 RETURNING *`,
      [data.status, reviewedBy, id],
    );
    return r.rows[0];
  }

  // User Roles
  async getUserRoles(userId: number): Promise<UserRole[]> {
    const r = await this.query(
      "SELECT * FROM user_roles WHERE user_id = $1 AND is_active = true",
      [userId],
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      role: row.role,
      grantedBy: row.granted_by,
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
      isActive: row.is_active,
      metadata: row.metadata,
    }));
  }

  async grantUserRole(
    userId: number,
    grantedBy: number,
    data: InsertUserRole,
  ): Promise<UserRole> {
    const r = await this.query(
      `INSERT INTO user_roles (user_id, role, granted_by, expires_at, is_active, metadata)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        userId,
        data.role,
        grantedBy,
        data.expiresAt || null,
        data.isActive ?? true,
        data.metadata || {},
      ],
    );
    return r.rows[0];
  }

  async revokeUserRole(userId: number, roleId: number): Promise<boolean> {
    const r = await this.query(
      "UPDATE user_roles SET is_active = false WHERE user_id = $1 AND id = $2",
      [userId, roleId],
    );
    return (r.rowCount ?? 0) > 0;
  }

  // News Sections
  async getAllNewsSections(): Promise<NewsSection[]> {
    const r = await this.query(
      "SELECT * FROM news_sections WHERE is_active = true ORDER BY sort_order ASC",
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      parentSectionId: row.parent_section_id,
      sortOrder: row.sort_order,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  async createNewsSection(data: InsertNewsSection): Promise<NewsSection> {
    const r = await this.query(
      `INSERT INTO news_sections (code, name, description, icon, color, parent_section_id, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        data.code,
        data.name,
        data.description || null,
        data.icon || null,
        data.color || null,
        data.parentSectionId || null,
        data.sortOrder || 0,
        data.isActive ?? true,
      ],
    );
    return r.rows[0];
  }

  async updateNewsSection(
    id: number,
    data: Partial<InsertNewsSection>,
  ): Promise<NewsSection | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (data.name !== undefined) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${i++}`);
      values.push(data.description);
    }
    if (data.icon !== undefined) {
      fields.push(`icon = $${i++}`);
      values.push(data.icon);
    }
    if (data.color !== undefined) {
      fields.push(`color = $${i++}`);
      values.push(data.color);
    }
    if (data.parentSectionId !== undefined) {
      fields.push(`parent_section_id = $${i++}`);
      values.push(data.parentSectionId);
    }
    if (data.sortOrder !== undefined) {
      fields.push(`sort_order = $${i++}`);
      values.push(data.sortOrder);
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${i++}`);
      values.push(data.isActive);
    }
    if (fields.length === 0) return undefined;
    values.push(id);
    const r = await this.query(
      `UPDATE news_sections SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values,
    );
    return r.rows[0] ? r.rows[0] : undefined;
  }

  async getNewsSections(newsId: number): Promise<NewsSection[]> {
    const r = await this.query(
      `SELECT ns.* FROM news_sections ns
       JOIN news_section_links nsl ON nsl.section_id = ns.id
       WHERE nsl.news_id = $1 AND ns.is_active = true`,
      [newsId],
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      parentSectionId: row.parent_section_id,
      sortOrder: row.sort_order,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  async linkNewsToSection(
    newsId: number,
    sectionId: number,
    isPrimary: boolean,
  ): Promise<void> {
    await this.query(
      `INSERT INTO news_section_links (news_id, section_id, is_primary) VALUES ($1,$2,$3)
       ON CONFLICT (news_id, section_id) DO UPDATE SET is_primary = EXCLUDED.is_primary`,
      [newsId, sectionId, isPrimary],
    );
  }

  async unlinkNewsFromSection(
    newsId: number,
    sectionId: number,
  ): Promise<void> {
    await this.query(
      "DELETE FROM news_section_links WHERE news_id = $1 AND section_id = $2",
      [newsId, sectionId],
    );
  }
}
