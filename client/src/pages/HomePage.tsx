import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { proxyImage } from "@/lib/habboProxy";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FutbolHubPanel from "@/components/FutbolHubPanel";
import HabboRadioWidget from "@/components/HabboRadioWidget";
import type { News, Poll } from "@shared/schema";

/* ============================================================
   FALLBACK DATA: PLACAS & FURNIS REALES DE HABBO
   ============================================================ */
const DEFAULT_BADGES = [
  { code: "ADM", name: "Staff Oficial Habbo", desc: "Placa exclusiva del equipo administrativo", category: "special" },
  { code: "ACH_Music10", name: "Estrella de la Radio", desc: "Nivel 10 de oyente fiel en Habbo", category: "radio" },
  { code: "ACH_AllTimeHotelPresence10", name: "Veterano del Hotel", desc: "Más de 500 horas dentro de la comunidad", category: "achievements" },
  { code: "ES99A", name: "HabboSpeed Aniversario", desc: "Placa conmemorativa de hSpeed", category: "special" },
  { code: "ACH_FootballGoal10", name: "Goleador Estrella", desc: "Ganador de torneos en Fútbol Hub", category: "games" },
  { code: "ACH_RoomRaid10", name: "Anfitrión Legendario", desc: "Salas populares y concurridas", category: "building" },
  { code: "ACH_SafetyQuiz1", name: "Experto en Seguridad", desc: "Conocedor del código de Habbo", category: "special" },
  { code: "ACH_BattleBallTiles10", name: "Campeón Battle Banzai", desc: "Dominio de baldosas y juego en equipo", category: "games" },
  { code: "ACH_RespectEarned10", name: "Respetado por Todos", desc: "Más de 1000 respetos recibidos", category: "achievements" },
  { code: "ACH_Tag10", name: "Etiqueta Popular", desc: "Intereses y tendencias compartidas", category: "special" },
  { code: "ACH_VipClub10", name: "Socio Club HC", desc: "Miembro honorable del Club Habbo", category: "special" },
  { code: "ACH_PetLover10", name: "Amante de Mascotas", desc: "Cuidado y cariño a tus mascotas", category: "achievements" },
  { code: "ACH_TraderPass10", name: "Magnate del Mercadillo", desc: "Comerciante experto en rares y furnis", category: "special" },
  { code: "ACH_SelfModChatMute1", name: "Guardián de Sala", desc: "Moderación y ambiente sano", category: "special" },
  { code: "ACH_AvatarLooks1", name: "Icono de Moda", desc: "Estilo único en el Hotel", category: "special" },
  { code: "ACH_FriendListSize10", name: "Conexión Total", desc: "Amigo de toda la comunidad", category: "achievements" },
  { code: "ACH_Graduate1", name: "Graduado Habbo", desc: "Misiones completadas con éxito", category: "achievements" },
  { code: "ACH_CameraPhotoTaken10", name: "Fotógrafo Oficial", desc: "Momentos inolvidables capturados", category: "special" },
  { code: "ACH_Roller10", name: "Maestro de Rollers", desc: "Laberintos y habilidad esquivando", category: "games" },
  { code: "ACH_HorseRider10", name: "Jinete de Élite", desc: "Carreras y saltos a caballo", category: "achievements" },
  { code: "ACH_FreezeWinner10", name: "Rey de Freeze", desc: "Estrategia congelante en la arena", category: "games" },
  { code: "ACH_GameArcade10", name: "Gamer Arcade", desc: "Récords en minijuegos comunitarios", category: "games" },
  { code: "ACH_GiftGiver10", name: "Espíritu Generoso", desc: "Regalos entregados a amigos", category: "achievements" },
  { code: "ACH_RoomDeco10", name: "Diseñador de Interiores", desc: "Salas majestuosas y acogedoras", category: "building" },
];

const DEFAULT_FURNIS = [
  {
    id: "furni-1",
    name: "Raro Rococó",
    category: "Raros Clásicos",
    priceSP: 50,
    priceCredits: 120,
    imageUrl: "https://images.habbo.com/c_images/catalogue/icon_186.png",
    trend: "+12%",
    rarity: "Raro",
  },
  {
    id: "furni-2",
    name: "Raro Cocar",
    category: "Colección Élite",
    priceSP: 50,
    priceCredits: 95,
    imageUrl: "https://images.habbo.com/c_images/catalogue/icon_175.png",
    trend: "Estable",
    rarity: "Exclusivo",
  },
  {
    id: "furni-3",
    name: "Trono Clásico",
    category: "Lujo & Prestigio",
    priceSP: 150,
    priceCredits: 500,
    imageUrl: "https://images.habbo.com/c_images/catalogue/icon_154.png",
    trend: "+25%",
    rarity: "Mega Raro",
  },
  {
    id: "furni-4",
    name: "Dragón de Fuego",
    category: "Lámparas Dragón",
    priceSP: 80,
    priceCredits: 220,
    imageUrl: "https://images.habbo.com/c_images/catalogue/icon_180.png",
    trend: "+8%",
    rarity: "Raro",
  },
  {
    id: "furni-5",
    name: "HoloBoy Vintage",
    category: "Tecnología Sci-Fi",
    priceSP: 45,
    priceCredits: 85,
    imageUrl: "https://images.habbo.com/c_images/catalogue/icon_162.png",
    trend: "Popular",
    rarity: "Clásico",
  },
  {
    id: "furni-6",
    name: "Fuente de Jade",
    category: "Jardín & Naturaleza",
    priceSP: 60,
    priceCredits: 140,
    imageUrl: "https://images.habbo.com/c_images/catalogue/icon_168.png",
    trend: "+5%",
    rarity: "Limitado",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Queries
  const { data: news = [] } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const { data: badgesFromApi = [] } = useQuery<any[]>({
    queryKey: ["/api/habbo/badges/es"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/habbo/badges/es?limit=24");
      const d = await r.json();
      return Array.isArray(d) ? d.slice(0, 24) : (d.badges || d.data || []).slice(0, 24);
    },
    retry: false,
    staleTime: 120000,
  });

  const { data: forumThreads = [] } = useQuery<any[]>({
    queryKey: ["/api/forum/threads"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/forum/threads?limit=4");
      if (!r.ok) return [];
      return r.json();
    },
    retry: false,
  });

  const { data: furnisFromApi = [] } = useQuery<any[]>({
    queryKey: ["/api/habbo/furni"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/habbo/furni?limit=6");
      if (!r.ok) return [];
      return r.json();
    },
    retry: false,
  });

  // State
  const [badgeCategory, setBadgeCategory] = useState<string>("all");
  const [hoveredBadge, setHoveredBadge] = useState<any>(null);
  const [furniPage, setFurniPage] = useState(0);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [pollVoted, setPollVoted] = useState(false);

  // Placas activas
  const activeBadges = badgesFromApi.length > 0 ? badgesFromApi : DEFAULT_BADGES;
  const filteredBadges = activeBadges.filter((b: any) => {
    if (badgeCategory === "all") return true;
    return b.category === badgeCategory;
  });

  // Furnis activos
  const activeFurnis = furnisFromApi.length > 0 ? furnisFromApi : DEFAULT_FURNIS;
  const visibleFurnis = activeFurnis.slice(furniPage * 3, (furniPage + 1) * 3);
  const maxFurniPages = Math.ceil(activeFurnis.length / 3);

  const handleVotePoll = () => {
    if (selectedPollOption === null) {
      toast({
        title: "Selecciona una opción",
        description: "Por favor elige una alternativa para votar.",
        variant: "destructive",
      });
      return;
    }
    setPollVoted(true);
    toast({
      title: "¡Voto registrado!",
      description: "Gracias por participar en la encuesta del mes.",
    });
  };

  // Quick News fallback
  const mockQuickNews = [
    {
      id: 1,
      title: "Lanzamiento del hSpeed Shop!",
      summary: "Adquiere furnis raros exclusivos por SpeedPoints.",
      icon: "https://images.habbo.com/c_images/catalogue/icon_186.png",
      comments: 6,
    },
    {
      id: 2,
      title: "Previa del Torneo de Fútbol",
      summary: "Grandes premios en créditos y placas exclusivas.",
      icon: "https://images.habbo.com/c_images/album1584/ACH_FootballGoal1.gif",
      comments: 6,
    },
    {
      id: 3,
      title: "Doce Cosntts Matela de Malos",
      summary: "Conoce a los mejores DJs de la semana en hSpeed.",
      icon: "https://images.habbo.com/c_images/catalogue/icon_175.png",
      comments: 130,
    },
    {
      id: 4,
      title: "Acga de Cesis Conciscis",
      summary: "Nuevas actividades en el hotel para toda la comunidad.",
      icon: "https://images.habbo.com/c_images/catalogue/icon_154.png",
      comments: 8,
    },
  ];

  // Forum Threads fallback
  const mockForumThreads = [
    {
      id: 1,
      title: "NICORAMSXSTS DE CARASHOO",
      author: "Baikiiga",
      icon: "https://images.habbo.com/c_images/album1584/ACH_RoomRaid1.gif",
      badge: "GENERAL",
      replies: 18,
    },
    {
      id: 2,
      title: "MAUSO MAUUSO DELESPMINNS",
      author: "Garage",
      icon: "https://images.habbo.com/c_images/album1584/ACH_SafetyQuiz1.gif",
      badge: "DISCUSIÓN",
      replies: 12,
    },
    {
      id: 3,
      title: "SALA CANDOR PIRO DE EL ARMSNO",
      author: "Bolegra",
      icon: "https://images.habbo.com/c_images/album1584/ACH_BattleBallTiles1.gif",
      badge: "SALAS",
      replies: 24,
    },
    {
      id: 4,
      title: "SEREE DE 59 HRR MI NSOWO",
      author: "Boigo",
      icon: "https://images.habbo.com/c_images/album1584/ACH_RespectEarned1.gif",
      badge: "HABBO",
      replies: 9,
    },
  ];

  const mockNovedades = [
    {
      title: "JALES DE LA WOODGAN DE EINASAGGALL",
      desc: "Nuevas placas de colección añadidas al catálogo.",
      icon: "https://images.habbo.com/c_images/album1584/ACH_Tag1.gif",
    },
    {
      title: "CESPESSA DE STATTEE SL KONN, NOLL",
      desc: "Torneo de penales en el Fútbol Hub este viernes.",
      icon: "https://images.habbo.com/c_images/album1584/ACH_BattleBallTiles1.gif",
    },
    {
      title: "OVENTOS DES COWBAA",
      desc: "Sintoniza a nuestro DJ invitado en la sesión nocturna.",
      icon: "https://images.habbo.com/c_images/album1584/ACH_VipClub1.gif",
    },
  ];

  return (
    <div className="min-h-screen bg-[#edf2f7] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 pb-16 transition-colors">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* ============================================================
              BARRA LATERAL IZQUIERDA (Pills de Navegación del Mockup)
              ============================================================ */}
          <aside className="w-full lg:w-48 flex-shrink-0">
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              <Link
                href="/"
                className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 text-xs flex-shrink-0 transition-all hover:border-cyan-400"
              >
                <i className="fa-solid fa-house text-cyan-500 w-4 text-center"></i>
                <span>Página inicial</span>
              </Link>
              <Link
                href={user ? `/profile/${user.habboUsername || user.displayName}` : "/login"}
                className="flex items-center gap-2.5 px-3 py-2 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 text-xs flex-shrink-0 transition-all hover:border-cyan-400"
              >
                <i className="fa-solid fa-user text-slate-400 w-4 text-center"></i>
                <span>Perfil Speed</span>
              </Link>
              <Link
                href="/forum"
                className="flex items-center gap-2.5 px-3 py-2 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 text-xs flex-shrink-0 transition-all hover:border-cyan-400"
              >
                <i className="fa-solid fa-comments text-slate-400 w-4 text-center"></i>
                <span>Cihabbo Foro</span>
              </Link>
              <Link
                href="/herramientas"
                className="flex items-center gap-2.5 px-3 py-2 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 text-xs flex-shrink-0 transition-all hover:border-cyan-400"
              >
                <i className="fa-solid fa-screwdriver-wrench text-slate-400 w-4 text-center"></i>
                <span>Herramientas</span>
              </Link>
              <Link
                href="/rooms"
                className="flex items-center gap-2.5 px-3 py-2 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 text-xs flex-shrink-0 transition-all hover:border-cyan-400"
              >
                <i className="fa-solid fa-hotel text-slate-400 w-4 text-center"></i>
                <span>Habbo Hotel</span>
              </Link>
              <Link
                href="/futbol-hub"
                className="flex items-center gap-2.5 px-3 py-2 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 text-xs flex-shrink-0 transition-all hover:border-cyan-400"
              >
                <i className="fa-solid fa-futbol text-emerald-500 w-4 text-center"></i>
                <span>Fútbol Hub</span>
              </Link>
              <Link
                href="/badges"
                className="flex items-center gap-2.5 px-3 py-2 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 text-xs flex-shrink-0 transition-all hover:border-cyan-400"
              >
                <i className="fa-solid fa-award text-amber-500 w-4 text-center"></i>
                <span>Mis Badges</span>
              </Link>
            </div>
          </aside>

          {/* ============================================================
              CONTENEDOR PRINCIPAL: HERO BANNER + 4 COLUMNAS
              ============================================================ */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* 1. HERO BANNER ISOMÉTRICO (Hip Hop Radio & Speed) */}
            <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative h-36 sm:h-44 md:h-48 group">
              <img
                src="/hspeed-hero-banner.png"
                alt="hSpeed - Somos tu radio Hip Hop"
                className="w-full h-full object-cover object-left sm:object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/slides/slide-welcome.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 text-white drop-shadow hidden sm:block">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-black/60 px-2 py-0.5 rounded-md border border-cyan-400/40">
                  HABBO SPEED V1
                </span>
                <p className="text-xs font-bold text-slate-200 mt-1">
                  Somos tu radio Hip Hop 24/7 · ¡Sintoniza y participa!
                </p>
              </div>
            </div>

            {/* 2. DASHBOARD DE 4 COLUMNAS MODULARES (Fiel a media_1789788256156.png) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-start">
              {/* ==========================================
                  COLUMNA 1 (Izquierda: Radio + Noticias + Foro)
                  ========================================== */}
              <div className="space-y-3.5">
                {/* Card 1: hSpeed Radio Widget con Panel DJ (Fiel al Mockup media_1789790438699.png) */}
                <HabboRadioWidget />

                {/* Card 2: Últimas Noticias (NewsPage) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-newspaper"></i>
                      </span>
                      <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                        Últimas Noticias (NewsPage)
                      </h3>
                    </div>
                    <Link href="/news" className="text-slate-400 hover:text-cyan-600 text-xs">
                      <i className="fa-solid fa-ellipsis"></i>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(news.length ? news.slice(0, 4) : mockQuickNews).map((item: any, i) => (
                      <Link
                        key={item.id || i}
                        href={`/news/${item.id}`}
                        className="group bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-all flex flex-col justify-between"
                      >
                        <div className="h-14 w-full rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden relative mb-1.5">
                          <img
                            src={item.imageUrl || item.icon || "/fallback-news.png"}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/fallback-news.png";
                            }}
                          />
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-cyan-500 line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
                          <span className="bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 px-1 rounded font-semibold text-[8px]">
                            {item.category || "Habbo"}
                          </span>
                          <span>💬 06</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Card 3: Temas del Fórum (ForumPage) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-comments"></i>
                      </span>
                      <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                        Temas del Fórum
                      </h3>
                    </div>
                    <Link href="/forum" className="text-slate-400 hover:text-cyan-600 text-xs">
                      <i className="fa-solid fa-ellipsis"></i>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {(forumThreads.length ? forumThreads.slice(0, 4) : mockForumThreads).map((thread: any, i) => (
                      <Link
                        key={thread.id || i}
                        href={`/forum/${thread.id}`}
                        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center flex-shrink-0">
                          <img
                            src={thread.icon || "https://images.habbo.com/c_images/album1584/ACH_RoomRaid1.gif"}
                            alt=""
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-cyan-500">
                            {thread.title}
                          </p>
                          <p className="text-[8px] text-slate-400 truncate">
                            Por {thread.author || "HabboUser"} · {thread.badge || "Habbo"}
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                          💬 {thread.replies || 12}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* ==========================================
                  COLUMNA 2 (Centro: Bienvenida + Rápidas + Novedades + Encuesta)
                  ========================================== */}
              <div className="space-y-3.5">
                {/* Card 1: Bienvenidos a HabboSpeed v1 */}
                <div className="bg-[#0f172a] text-white rounded-2xl p-3.5 border border-white/10 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-cyan-400/40 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      <img
                        src="https://www.habbo.es/habbo-imaging/avatarimage?user=HabboSpeed&size=s&headonly=1"
                        alt="DJ"
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black truncate text-white">
                        Bienvenidos a HabboSpeed v1
                      </h4>
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1 truncate font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Comunidad oficial & Radio Hip Hop
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/radio"
                    className="px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-black text-[10px] rounded-lg transition-colors flex-shrink-0"
                  >
                    Sintonizar
                  </Link>
                </div>

                {/* Card 2: Noticias Rápidas (2x2 Grid) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-bolt"></i>
                      </span>
                      <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                        Noticias Rápidas
                      </h3>
                    </div>
                    <Link href="/news" className="text-slate-400 hover:text-cyan-600 text-xs">
                      <i className="fa-solid fa-ellipsis"></i>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {mockQuickNews.map((item) => (
                      <Link
                        key={item.id}
                        href="/news"
                        className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between transition-all group"
                      >
                        <div className="flex items-start gap-1.5">
                          <img
                            src={item.icon}
                            alt=""
                            className="w-6 h-6 object-contain bg-white dark:bg-slate-800 rounded-md p-0.5 border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-[10px] font-black text-slate-800 dark:text-slate-200 leading-tight group-hover:text-cyan-500 line-clamp-2">
                              {item.title}
                            </h5>
                            <p className="text-[8px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                              {item.summary}
                            </p>
                          </div>
                        </div>
                        <div className="text-[8px] text-slate-400 text-right mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1">
                          <i className="fa-regular fa-comment"></i>
                          <span>{item.comments}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Card 3: Novedades hSpeed */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-sparkles"></i>
                      </span>
                      <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                        Novedades hSpeed
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {mockNovedades.map((nov, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700/50"
                      >
                        <img
                          src={nov.icon}
                          alt=""
                          className="w-6 h-6 object-contain bg-white dark:bg-slate-800 rounded-md p-0.5 border border-slate-200 dark:border-slate-700 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {nov.title}
                          </h5>
                          <p className="text-[8px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {nov.desc}
                          </p>
                        </div>
                        <span className="text-[8px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-full">
                          NEW
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 4: Enquetes (Encuestas) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-chart-pie"></i>
                      </span>
                      <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                        Enquetes
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                      Melhor Evento de Mês
                    </p>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 0, text: "Motiv to Brasil" },
                        { id: 1, text: "Battle Banzai" },
                        { id: 2, text: "Rolls Rygge" },
                        { id: 3, text: "Caça de Tesouro" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedPollOption(opt.id)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] font-bold border transition-all text-left ${
                            selectedPollOption === opt.id
                              ? "bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-900 dark:text-amber-300"
                              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              selectedPollOption === opt.id
                                ? "border-amber-500 bg-amber-500"
                                : "border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {selectedPollOption === opt.id && (
                              <div className="w-1 h-1 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="truncate">{opt.text}</span>
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={handleVotePoll}
                      disabled={pollVoted}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs py-1.5 rounded-xl shadow-xs mt-1"
                    >
                      {pollVoted ? "¡Voto Confirmado!" : "Confirmar voto"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* ==========================================
                  COLUMNA 3 (Derecha Centro: Staff + PLACAS + Ranking)
                  ========================================== */}
              <div className="space-y-3.5">
                {/* Card 1: Destacados del Mes */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-star"></i>
                      </span>
                      <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                        Destacados del Mes
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="w-12 h-14 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-300 dark:border-slate-700 flex-shrink-0 relative">
                      <img
                        src="https://www.habbo.es/habbo-imaging/avatarimage?user=Frank&size=b&direction=2&head_direction=2&gesture=sml"
                        alt="Staff"
                        className="absolute top-[-8px] w-14 h-20 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                        Staff de hSpeed
                      </span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                        Administrador Oficial
                      </h4>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        Coordinación y gestión de la radio comunitaria.
                      </p>
                      <Link
                        href="/team"
                        className="inline-block mt-1 px-2.5 py-0.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-[9px] rounded-lg transition-colors"
                      >
                        Conocer
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Card 2: ÚLTIMAS PLACAS (SECCIÓN COMPLETA DE PLACAS PEDIDA POR EL USUARIO) */}
                <div
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3"
                  data-testid="seccion-placas-home"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-award"></i>
                      </span>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                          Últimas placas (hSpeed)
                        </h3>
                      </div>
                    </div>
                    <Link
                      href="/badges"
                      className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Ver todas</span>
                      <i className="fa-solid fa-arrow-right text-[8px]"></i>
                    </Link>
                  </div>

                  {/* Filtro de Categorías de Placas */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[9px]">
                    {[
                      { id: "all", label: "Todas" },
                      { id: "special", label: "Especiales" },
                      { id: "radio", label: "Radio" },
                      { id: "achievements", label: "Logros" },
                      { id: "games", label: "Juegos" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setBadgeCategory(cat.id)}
                        className={`px-2 py-0.5 rounded-md font-bold transition-all flex-shrink-0 ${
                          badgeCategory === cat.id
                            ? "bg-purple-500 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Matriz 4x6 de Placas Oficiales de Habbo */}
                  <div className="grid grid-cols-6 gap-1.5 bg-slate-50/70 dark:bg-slate-800/30 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    {filteredBadges.slice(0, 24).map((badge: any, i: number) => {
                      const code = badge.code || badge.badge_code || `ACH_${i}`;
                      const name = badge.name || badge.badge_name || code;
                      const img =
                        badge.url_habbo ||
                        `https://images.habbo.com/c_images/album1584/${code}.gif`;
                      return (
                        <div
                          key={badge.id || i}
                          onMouseEnter={() => setHoveredBadge({ code, name, desc: badge.desc || "Insignia oficial de Habbo" })}
                          onMouseLeave={() => setHoveredBadge(null)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:scale-110 transition-all flex items-center justify-center cursor-pointer relative shadow-2xs group"
                          title={`${name} (${code})`}
                        >
                          <img
                            src={proxyImage(img)}
                            alt={code}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.habbo.com/c_images/album1584/ADM.gif";
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Detalle al pasar el cursor sobre una placa */}
                  {hoveredBadge ? (
                    <div className="bg-purple-50/80 dark:bg-purple-950/40 p-2 rounded-xl border border-purple-200/60 dark:border-purple-800/50 text-[10px] flex items-center gap-2">
                      <img
                        src={`https://images.habbo.com/c_images/album1584/${hoveredBadge.code}.gif`}
                        alt=""
                        className="w-6 h-6 object-contain flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/habbo-radio/estampa_staff.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-purple-900 dark:text-purple-300 truncate">
                          {hoveredBadge.name}
                        </p>
                        <p className="text-[8px] text-purple-700/80 dark:text-purple-400 truncate">
                          Código: {hoveredBadge.code} · {hoveredBadge.desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 text-center italic py-0.5">
                      Pasa el cursor sobre cualquier placa para ver su información
                    </div>
                  )}
                </div>

                {/* Card 3: Ranking (hSpeed...) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-trophy"></i>
                      </span>
                      <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                        Ranking (hSpeed...)
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { rank: 1, name: "CinhuLOL", points: "362 responses", color: "bg-amber-400 text-slate-900" },
                      { rank: 2, name: "DinhuLOL", points: "300 responses", color: "bg-slate-300 text-slate-800" },
                      { rank: 3, name: "KinhuLOL", points: "133 responses", color: "bg-amber-600 text-white" },
                    ].map((userRank) => (
                      <div
                        key={userRank.rank}
                        className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                      >
                        <span
                          className={`w-4 h-4 rounded-full ${userRank.color} font-black text-[9px] flex items-center justify-center flex-shrink-0`}
                        >
                          {userRank.rank}
                        </span>
                        <img
                          src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(userRank.name)}&size=s&headonly=1`}
                          alt=""
                          className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {userRank.name}
                          </p>
                          <p className="text-[8px] text-slate-400 truncate">
                            {userRank.points}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ==========================================
                  COLUMNA 4 (Extrema Derecha: FURNIS & SHOP + Encuestas Visuales + Tendencias)
                  ========================================== */}
              <div className="space-y-3.5">
                {/* Card 1: HABBOSPEED SHOP & FURNIS (SECCIÓN COMPLETA DE FURNIS PEDIDA POR EL USUARIO) */}
                <div
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3"
                  data-testid="seccion-furnis-home"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-store"></i>
                      </span>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                          Habbospeed Shop & Furnis
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => setFurniPage((p) => Math.max(0, p - 1))}
                        disabled={furniPage === 0}
                        className="hover:text-slate-800 dark:hover:text-white disabled:opacity-30 p-1"
                        title="Anterior"
                      >
                        <i className="fa-solid fa-chevron-left text-[10px]"></i>
                      </button>
                      <button
                        onClick={() => setFurniPage((p) => Math.min(maxFurniPages - 1, p + 1))}
                        disabled={furniPage >= maxFurniPages - 1}
                        className="hover:text-slate-800 dark:hover:text-white disabled:opacity-30 p-1"
                        title="Siguiente"
                      >
                        <i className="fa-solid fa-chevron-right text-[10px]"></i>
                      </button>
                    </div>
                  </div>

                  {/* Grid de 3 Furnis Destacados con Precios e Imágenes Reales */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {visibleFurnis.map((item: any, i: number) => (
                      <div
                        key={item.id || i}
                        className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center text-center space-y-1 group hover:border-amber-400/60 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1 py-0.5 rounded">
                            {item.priceSP || 50} SP
                          </span>
                        </div>

                        <div className="w-10 h-10 flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                          <img
                            src={proxyImage(item.imageUrl || item.iconUrl || "https://images.habbo.com/c_images/catalogue/icon_186.png")}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.habbo.com/c_images/catalogue/icon_186.png";
                            }}
                          />
                        </div>

                        <span className="text-[9px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                          {item.name}
                        </span>

                        <span className="text-[7px] text-slate-400 truncate">
                          {item.category || "Raro"}
                        </span>

                        <Link
                          href="/tienda"
                          className="w-full py-0.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-[9px] rounded transition-colors text-center block"
                        >
                          Comprar
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Accesos directos a Catálogo y Mercadillo */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href="/catalog"
                      className="flex-1 py-1 text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] font-black rounded-lg transition-colors"
                    >
                      Ver Catálogo
                    </Link>
                    <Link
                      href="/marketplace"
                      className="flex-1 py-1 text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] font-black rounded-lg transition-colors"
                    >
                      Mercadillo
                    </Link>
                  </div>
                </div>

                {/* Card 2: Enquetes (hSpeed Polls Visuales con Banner) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-images"></i>
                      </span>
                      <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                        Eventos Destacados
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-950/40 dark:to-blue-950/40 p-2 rounded-xl border border-cyan-200/60 dark:border-cyan-800/50 flex flex-col items-center text-center">
                      <img
                        src="https://images.habbo.com/c_images/album1584/ACH_BattleBallTiles10.gif"
                        alt="Banzai"
                        className="w-8 h-8 object-contain mb-1"
                      />
                      <span className="text-[9px] font-bold text-cyan-900 dark:text-cyan-200">
                        Super Banzai
                      </span>
                      <span className="text-[8px] text-slate-400">Torneo Viernes</span>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-950/40 dark:to-orange-950/40 p-2 rounded-xl border border-amber-200/60 dark:border-amber-800/50 flex flex-col items-center text-center">
                      <img
                        src="https://images.habbo.com/c_images/album1584/ACH_FootballGoal10.gif"
                        alt="Fútbol"
                        className="w-8 h-8 object-contain mb-1"
                      />
                      <span className="text-[9px] font-bold text-amber-900 dark:text-amber-200">
                        Fútbol Clásico
                      </span>
                      <span className="text-[8px] text-slate-400">Liga hSpeed</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Tendencias y SpeedShorts */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-black">
                        <i className="fa-solid fa-fire"></i>
                      </span>
                      <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100">
                        Tendencias & SpeedShorts
                      </h3>
                    </div>
                    <Link href="/tendencias" className="text-slate-400 hover:text-cyan-600 text-xs">
                      <i className="fa-solid fa-ellipsis"></i>
                    </Link>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { tag: "Festa no Brasil", icon: "fa-cake-candles" },
                      { tag: "Battle Banzai", icon: "fa-gamepad" },
                      { tag: "Verse Hyrge", icon: "fa-music" },
                      { tag: "Caça de Tesouro", icon: "fa-gem" },
                    ].map((item, idx) => (
                      <Link
                        key={idx}
                        href="/tendencias"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-pink-50/80 dark:bg-pink-950/30 hover:bg-pink-100 dark:hover:bg-pink-950/60 border border-pink-200/70 dark:border-pink-800/40 text-pink-900 dark:text-pink-200 text-[10px] font-bold transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <i className={`fa-solid ${item.icon} text-pink-500 text-[10px]`}></i>
                          {item.tag}
                        </span>
                        <i className="fa-solid fa-arrow-right text-[8px] text-pink-400"></i>
                      </Link>
                    ))}
                  </div>

                  <Link href="/tendencias" className="block pt-1">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-1.5 rounded-xl shadow-xs">
                      Ver SpeedShorts
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ============================================================
                3. SECCIÓN FÚTBOL HUB INTERACTIVA
                ============================================================ */}
            <div className="pt-2">
              <FutbolHubPanel />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
