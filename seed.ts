import { pool } from "./server/db";
import {
  reactionIcons,
  cards,
  miniGames,
  speedMissions,
  seasonalStamps,
  newsSections,
  djSlots,
  userRoles,
} from "./shared/schema";

async function seed() {
  console.log("���� Seeding initial data...");

  // Reaction Icons (Speed Icons)
  const icons = [
    {
      code: "fire",
      name: "Fuego",
      label: "����",
      iconUrl: "https://images.habbo.com/c_images/album1584/ES40T.gif",
      category: "general",
      rarity: "common",
      speedPointsCost: 0,
    },
    {
      code: "heart",
      name: "Corazón",
      label: "������",
      iconUrl: "https://images.habbo.com/c_images/album1584/ACH_VipClub1.gif",
      category: "general",
      rarity: "common",
      speedPointsCost: 0,
    },
    {
      code: "sparkles",
      name: "Brillo",
      label: "���",
      iconUrl: "https://images.habbo.com/c_images/album1584/ADM.gif",
      category: "general",
      rarity: "rare",
      speedPointsCost: 100,
    },
    {
      code: "trophy",
      name: "Trofeo",
      label: "����",
      iconUrl: "https://images.habbo.com/c_images/album1584/HSC01.gif",
      category: "event",
      rarity: "epic",
      speedPointsCost: 500,
    },
    {
      code: "crown",
      name: "Corona",
      label: "����",
      iconUrl: "https://images.habbo.com/c_images/album1584/DE636.gif",
      category: "vip",
      rarity: "legendary",
      speedPointsCost: 1000,
    },
    {
      code: "radio",
      name: "Radio",
      label: "����",
      iconUrl: "https://images.habbo.com/c_images/album1584/ES992.gif",
      category: "radio",
      rarity: "rare",
      speedPointsCost: 200,
    },
    {
      code: "diamond",
      name: "Diamante",
      label: "����",
      iconUrl: "https://images.habbo.com/c_images/album1584/IT128.gif",
      category: "vip",
      rarity: "legendary",
      speedPointsCost: 2000,
    },
    {
      code: "star",
      name: "Estrella",
      label: "���",
      iconUrl: "https://images.habbo.com/c_images/album1584/Z53.gif",
      category: "general",
      rarity: "rare",
      speedPointsCost: 150,
    },
  ];

  for (const icon of icons) {
    try {
      await pool.query(
        `INSERT INTO reaction_icons (code, name, label, icon_url, category, rarity, speed_points_cost, is_active, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true,0)
         ON CONFLICT (code) DO NOTHING`,
        [
          icon.code,
          icon.name,
          icon.label,
          icon.iconUrl,
          icon.category,
          icon.rarity,
          icon.speedPointsCost,
        ],
      );
    } catch (e) {
      console.log("Icon skip:", icon.code);
    }
  }
  console.log("��� Reaction icons seeded");

  // Cards
  const cardList = [
    {
      code: "daily_login",
      name: "Login Diario",
      description: "Por entrar cada día",
      imageUrl: "https://images.habbo.com/c_images/album1584/ADM.gif",
      category: "habbo",
      rarity: "common",
      series: "base",
      earnCondition: { type: "daily_login", days: 1 },
      speedPointsValue: 10,
    },
    {
      code: "radio_listener",
      name: "Oyente Fiel",
      description: "Escucha la radio 1h",
      imageUrl: "https://images.habbo.com/c_images/album1584/UK084.gif",
      category: "radio",
      rarity: "common",
      series: "base",
      earnCondition: { type: "radio_listen", minutes: 60 },
      speedPointsValue: 25,
    },
    {
      code: "news_reader",
      name: "Lector Voraz",
      description: "Lee 5 noticias",
      imageUrl:
        "https://images.habbo.com/c_images/album1584/ACH_RoomDecoHalloween10.gif",
      category: "habbo",
      rarity: "rare",
      series: "base",
      earnCondition: { type: "news_read", count: 5 },
      speedPointsValue: 50,
    },
    {
      code: "event_goer",
      name: "Fiestero",
      description: "Asiste a 3 eventos",
      imageUrl: "https://images.habbo.com/c_images/album1584/COM.gif",
      category: "event",
      rarity: "rare",
      series: "base",
      earnCondition: { type: "event_attend", count: 3 },
      speedPointsValue: 100,
    },
    {
      code: "penalty_master",
      name: "Penalty Master",
      description: "Gana 10 penales",
      imageUrl: "https://images.habbo.com/c_images/album1584/ES49C.gif",
      category: "game",
      rarity: "epic",
      series: "temporada-1",
      earnCondition: { type: "game_win", game: "penalty", count: 10 },
      speedPointsValue: 500,
    },
    {
      code: "trivia_genius",
      name: "Genio Trivia",
      description: "Acertar 50 preguntas",
      imageUrl: "https://images.habbo.com/c_images/album1584/Z53.gif",
      category: "game",
      rarity: "epic",
      series: "temporada-1",
      earnCondition: { type: "game_win", game: "trivia", count: 50 },
      speedPointsValue: 500,
    },
    {
      code: "memer",
      name: "Meme Lord",
      description: "Crea 20 memes",
      imageUrl: "https://images.habbo.com/c_images/album1584/ES40T.gif",
      category: "special",
      rarity: "legendary",
      series: "temporada-1",
      earnCondition: { type: "meme_create", count: 20 },
      speedPointsValue: 1000,
    },
    {
      code: "reporter",
      name: "Reportero",
      description: "Publica 10 noticias aprobadas",
      imageUrl: "https://images.habbo.com/c_images/album1584/ES992.gif",
      category: "special",
      rarity: "legendary",
      series: "base",
      earnCondition: { type: "news_publish", count: 10 },
      speedPointsValue: 1000,
    },
  ];

  for (const c of cardList) {
    try {
      await pool.query(
        `INSERT INTO cards (code, name, description, image_url, category, rarity, series, earn_condition, speed_points_value, is_active, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,0)
         ON CONFLICT (code) DO NOTHING`,
        [
          c.code,
          c.name,
          c.description,
          c.imageUrl,
          c.category,
          c.rarity,
          c.series,
          JSON.stringify(c.earnCondition),
          c.speedPointsValue,
        ],
      );
    } catch (e) {
      console.log("Card skip:", c.code);
    }
  }
  console.log("��� Cards seeded");

  // Mini Games
  const games = [
    {
      code: "penalty",
      name: "Tanda de Penales",
      description: "Lanza y ataja penales",
      category: "sports",
      thumbnailUrl: "https://images.habbo.com/c_images/album1584/ES49C.gif",
      maxScore: 100,
      rewardConfig: { speedPoints: 50, cards: ["penalty_master"] },
      config: { shots: 5, timeLimit: 30 },
    },
    {
      code: "trivia",
      name: "Trivia Habbo",
      description: "Preguntas sobre Habbo y la fansite",
      category: "quiz",
      thumbnailUrl: "https://images.habbo.com/c_images/album1584/Z53.gif",
      maxScore: 500,
      rewardConfig: { speedPoints: 100, cards: ["trivia_genius"] },
      config: { questions: 10, timePerQuestion: 15 },
    },
    {
      code: "memory",
      name: "Memory Furni",
      description: "Empareja furnis iguales",
      category: "puzzle",
      thumbnailUrl:
        "https://images.habbo.com/c_images/album1584/ACH_RoomDecoHalloween10.gif",
      maxScore: 1000,
      rewardConfig: { speedPoints: 75 },
      config: { pairs: 8, timeLimit: 60 },
    },
    {
      code: "clicker",
      name: "Speed Clicker",
      description: "Click lo más rápido posible",
      category: "arcade",
      thumbnailUrl: "https://images.habbo.com/c_images/album1584/ES40T.gif",
      maxScore: 10000,
      rewardConfig: { speedPoints: 25 },
      config: { duration: 10 },
    },
  ];

  for (const g of games) {
    try {
      await pool.query(
        `INSERT INTO mini_games (code, name, description, category, thumbnail_url, max_score, reward_config, config, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
         ON CONFLICT (code) DO NOTHING`,
        [
          g.code,
          g.name,
          g.description,
          g.category,
          g.thumbnailUrl,
          g.maxScore,
          JSON.stringify(g.rewardConfig),
          JSON.stringify(g.config),
        ],
      );
    } catch (e) {
      console.log("Game skip:", g.code);
    }
  }
  console.log("��� Mini games seeded");

  // Speed Missions
  const missions = [
    {
      code: "daily_login",
      name: "Login Diario",
      description: "Entra a la web hoy",
      category: "daily",
      type: "login",
      target: { count: 1 },
      rewardConfig: { speedPoints: 10, cards: ["daily_login"] },
      iconUrl: "https://images.habbo.com/c_images/album1584/ADM.gif",
      isRepeatable: true,
      cooldownHours: 24,
      sortOrder: 1,
    },
    {
      code: "read_news",
      name: "Lector de Noticias",
      description: "Lee 3 noticias",
      category: "daily",
      type: "news_read",
      target: { count: 3 },
      rewardConfig: { speedPoints: 25, cards: ["news_reader"] },
      iconUrl:
        "https://images.habbo.com/c_images/album1584/ACH_RoomDecoHalloween10.gif",
      isRepeatable: true,
      cooldownHours: 24,
      sortOrder: 2,
    },
    {
      code: "listen_radio",
      name: "Sintoniza la Radio",
      description: "Escucha 30 min de radio",
      category: "daily",
      type: "radio_listen",
      target: { minutes: 30 },
      rewardConfig: { speedPoints: 20, cards: ["radio_listener"] },
      iconUrl: "https://images.habbo.com/c_images/album1584/UK084.gif",
      isRepeatable: true,
      cooldownHours: 24,
      sortOrder: 3,
    },
    {
      code: "play_game",
      name: "Juega un Minijuego",
      description: "Juega 1 partida",
      category: "daily",
      type: "game_play",
      target: { count: 1 },
      rewardConfig: { speedPoints: 15 },
      iconUrl: "https://images.habbo.com/c_images/album1584/ES49C.gif",
      isRepeatable: true,
      cooldownHours: 24,
      sortOrder: 4,
    },
    {
      code: "comment_news",
      name: "Opina en Noticias",
      description: "Comenta en 2 noticias",
      category: "daily",
      type: "comment",
      target: { count: 2 },
      rewardConfig: { speedPoints: 20 },
      iconUrl: "https://images.habbo.com/c_images/album1584/COM.gif",
      isRepeatable: true,
      cooldownHours: 24,
      sortOrder: 5,
    },
    {
      code: "weekly_streak",
      name: "Racha Semanal",
      description: "Entra 7 días seguidos",
      category: "weekly",
      type: "login",
      target: { count: 7, streak: true },
      rewardConfig: { speedPoints: 200, cards: ["event_goer"] },
      iconUrl: "https://images.habbo.com/c_images/album1584/HSC01.gif",
      isRepeatable: false,
      cooldownHours: 168,
      sortOrder: 10,
    },
  ];

  for (const m of missions) {
    try {
      await pool.query(
        `INSERT INTO speed_missions (code, name, description, category, type, target, reward_config, icon_url, is_repeatable, cooldown_hours, is_active, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11)
         ON CONFLICT (code) DO NOTHING`,
        [
          m.code,
          m.name,
          m.description,
          m.category,
          m.type,
          JSON.stringify(m.target),
          JSON.stringify(m.rewardConfig),
          m.iconUrl,
          m.isRepeatable,
          m.cooldownHours,
          m.sortOrder,
        ],
      );
    } catch (e) {
      console.log("Mission skip:", m.code);
    }
  }
  console.log("��� Speed missions seeded");

  // Seasonal Stamps
  const stamps = [
    {
      code: "verano_2026_1",
      name: "Sol de Verano",
      description: "Completa misión diaria 7 días en agosto",
      imageUrl: "https://images.habbo.com/c_images/album1584/ES40T.gif",
      season: "verano-2026",
      rarity: "common",
      obtainMethod: { type: "mission", missionCode: "weekly_streak" },
    },
    {
      code: "verano_2026_2",
      name: "Playa Habbo",
      description: "Asiste a 3 eventos de verano",
      imageUrl: "https://images.habbo.com/c_images/album1584/ES48T.gif",
      season: "verano-2026",
      rarity: "rare",
      obtainMethod: { type: "event_attend", count: 3 },
    },
    {
      code: "verano_2026_3",
      name: "Rey de Penales",
      description: "Gana el torneo de penales semanal",
      imageUrl: "https://images.habbo.com/c_images/album1584/HSC01.gif",
      season: "verano-2026",
      rarity: "epic",
      obtainMethod: { type: "game_win", game: "penalty", tournament: true },
    },
    {
      code: "navidad_2026_1",
      name: "Gorro de Papá Noel",
      description: "Login en Navidad",
      imageUrl: "https://images.habbo.com/c_images/album1584/DE636.gif",
      season: "navidad-2026",
      rarity: "common",
      obtainMethod: { type: "login", date: "2026-12-25" },
    },
  ];

  for (const s of stamps) {
    try {
      await pool.query(
        `INSERT INTO seasonal_stamps (code, name, description, image_url, season, rarity, obtain_method, is_active, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true,0)
         ON CONFLICT (code) DO NOTHING`,
        [
          s.code,
          s.name,
          s.description,
          s.imageUrl,
          s.season,
          s.rarity,
          JSON.stringify(s.obtainMethod),
        ],
      );
    } catch (e) {
      console.log("Stamp skip:", s.code);
    }
  }
  console.log("��� Seasonal stamps seeded");

  // News Sections
  const sections = [
    {
      code: "guias",
      name: "Guías Habbo",
      description: "Tutoriales y guías para jugar",
      icon: "BookOpen",
      color: "#3b82f6",
      sortOrder: 1,
    },
    {
      code: "placas",
      name: "Gana Placas",
      description: "Cómo conseguir placas exclusivas",
      icon: "Award",
      color: "#f59e0b",
      sortOrder: 2,
    },
    {
      code: "eventos",
      name: "Eventos",
      description: "Eventos oficiales y de la comunidad",
      icon: "CalendarDays",
      color: "#ef4444",
      sortOrder: 3,
    },
    {
      code: "trucos",
      name: "Trucos y Secretos",
      description: "Trucos, glitches y secretos",
      icon: "Zap",
      color: "#8b5cf6",
      sortOrder: 4,
    },
    {
      code: "comunidad",
      name: "Comunidad",
      description: "Noticias de la comunidad HabboSpeed",
      icon: "Users",
      color: "#ec4899",
      sortOrder: 5,
    },
    {
      code: "radio",
      name: "Radio & Música",
      description: "Programación, DJs y canciones",
      icon: "Radio",
      color: "#06b6d4",
      sortOrder: 6,
    },
    {
      code: "actualizaciones",
      name: "Actualizaciones",
      description: "Changelogs y novedades del sitio",
      icon: "GitBranch",
      color: "#22c55e",
      sortOrder: 7,
    },
  ];

  for (const s of sections) {
    try {
      await pool.query(
        `INSERT INTO news_sections (code, name, description, icon, color, is_active, sort_order)
         VALUES ($1,$2,$3,$4,$5,true,$6)
         ON CONFLICT (code) DO NOTHING`,
        [s.code, s.name, s.description, s.icon, s.color, s.sortOrder],
      );
    } catch (e) {
      console.log("Section skip:", s.code);
    }
  }
  console.log("��� News sections seeded");

  // DJ Slots (weekly recurring)
  const slots = [
    {
      dayOfWeek: 1,
      startTime: "20:00",
      endTime: "22:00",
      showName: "Lunes de Ritmo",
      description: "Inicio de semana con buena música",
      status: "available",
    },
    {
      dayOfWeek: 2,
      startTime: "20:00",
      endTime: "22:00",
      showName: "Martes de Trivia",
      description: "Trivia en vivo con premios",
      status: "available",
    },
    {
      dayOfWeek: 3,
      startTime: "20:00",
      endTime: "22:00",
      showName: "Miércoles Meme",
      description: "Los mejores memes de la semana",
      status: "available",
    },
    {
      dayOfWeek: 4,
      startTime: "20:00",
      endTime: "22:00",
      showName: "Jueves de Peticiones",
      description: "Tú pides, nosotros ponemos",
      status: "available",
    },
    {
      dayOfWeek: 5,
      startTime: "20:00",
      endTime: "23:00",
      showName: "Viernes FIESTA",
      description: "La mejor fiesta de la semana",
      status: "available",
    },
    {
      dayOfWeek: 6,
      startTime: "18:00",
      endTime: "21:00",
      showName: "Sábado Retro",
      description: "Clásicos de Habbo y más",
      status: "available",
    },
    {
      dayOfWeek: 0,
      startTime: "18:00",
      endTime: "20:00",
      showName: "Domingo Chill",
      description: "Relájate con música tranquila",
      status: "available",
    },
  ];

  for (const s of slots) {
    try {
      await pool.query(
        `INSERT INTO dj_slots (day_of_week, start_time, end_time, show_name, description, status, recurring)
         VALUES ($1,$2,$3,$4,$5,$6,true)
         ON CONFLICT DO NOTHING`,
        [
          s.dayOfWeek,
          s.startTime,
          s.endTime,
          s.showName,
          s.description,
          s.status,
        ],
      );
    } catch (e) {
      console.log("Slot skip:", s.dayOfWeek);
    }
  }
  console.log("��� DJ slots seeded");

  // User Roles (empty - granted by admins)
  console.log("��� All seed data complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
