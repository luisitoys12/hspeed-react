import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { proxyImage } from "@/lib/habboProxy";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import PageContainer from "@/components/PageContainer";
import {
  Sparkles,
  Trophy,
  Coins,
  Fish,
  Flame,
  Shield,
  ArrowRight,
  Search,
  Award,
} from "lucide-react";

function badgeImageUrl(badgeCode: string) {
  return proxyImage(
    `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
  );
}

function furniIconUrl(classname: string) {
  return proxyImage(
    `https://images.habbo.com/dcr/hof_furni/0/${classname}_icon.png`,
  );
}

// Catálogo con insignias reales de Habbo como las del mockup
const POPULAR_ACHIEVEMENTS = [
  {
    code: "ACH_AvatarLooks10",
    nextCode: "ACH_AvatarLooks10",
    name: "Hot Looks",
    desc: "Cambia tu estilo y luce atuendos en el hotel",
    category: "Identidad",
    level: 10,
    progress: "0/10",
  },
  {
    code: "ACH_GroupMember10",
    nextCode: "ACH_GroupMember10",
    name: "Busca Clanes",
    desc: "Únete y participa en grupos comunitarios",
    category: "Comunidad",
    level: 10,
    progress: "0/10",
  },
  {
    code: "ACH_FootballGoal10",
    nextCode: "ACH_FootballGoal10",
    name: "Previsiones",
    desc: "Acierta marcadores en torneos de fútbol",
    category: "Deportes",
    level: 10,
    progress: "0/10",
  },
  {
    code: "ACH_HappyHour10",
    nextCode: "ACH_HappyHour10",
    name: "Babbo Badge",
    desc: "Pasa tiempo divirtiéndote en el hotel",
    category: "Social",
    level: 10,
    progress: "0/10",
  },
  {
    code: "ACH_BattleBallTiles10",
    nextCode: "ACH_BattleBallTiles10",
    name: "Battle Banzai",
    desc: "Bloquea y pinta baldosas en Banzai",
    category: "Juegos",
    level: 10,
    progress: "0/10",
  },
  {
    code: "ACH_Freeze10",
    nextCode: "ACH_Freeze10",
    name: "Cacha Banzai",
    desc: "Congela rivales con bolas de nieve",
    category: "Juegos",
    level: 10,
    progress: "0/10",
  },
  {
    code: "ACH_RespectGiven10",
    nextCode: "ACH_RespectGiven10",
    name: "Respetos Dados",
    desc: "Reparte respetos diarios a tus amigos",
    category: "Social",
    level: 10,
    progress: "0/10",
  },
  {
    code: "ACH_RoomDeco10",
    nextCode: "ACH_RoomDeco10",
    name: "Decorador Pro",
    desc: "Coloca furnis y diseña salas únicas",
    category: "Construcción",
    level: 10,
    progress: "0/10",
  },
  {
    code: "ACH_Trader10",
    nextCode: "ACH_Trader10",
    name: "Mercader Élite",
    desc: "Vende e intercambia furnis en la feria",
    category: "Economía",
    level: 10,
    progress: "0/10",
  },
];

function LogrosTab() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["/api/habbo/achievements"],
    retry: 1,
  });

  const apiAchievements: any[] = Array.isArray(data) ? data : [];
  
  const achievements = apiAchievements.length > 0 
    ? apiAchievements.map((a: any, i: number) => {
        const ach = a?.achievement || a;
        const levels = a?.levelRequirements || [];
        const maxLevel = levels.length || 10;
        const code = ach?.badgeId || `ACH_${ach?.name?.replace(/\s+/g, "") || "Badge"}${maxLevel}`;
        return {
          code,
          nextCode: code,
          name: ach?.name || `Logro #${i + 1}`,
          desc: ach?.description || "Insignia oficial del catálogo de Habbo Hotel",
          category: ach?.category || "General",
          level: maxLevel,
          progress: `0/${maxLevel}`,
        };
      })
    : POPULAR_ACHIEVEMENTS;

  const filtered = query
    ? achievements.filter((a) =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.desc.toLowerCase().includes(query.toLowerCase()) ||
        a.category.toLowerCase().includes(query.toLowerCase())
      )
    : achievements;

  return (
    <div className="space-y-4">
      {/* Subtítulo del tab */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
        <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span>Catálogo completo de logros e insignias de Habbo, con sus niveles.</span>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Buscar logro por nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="input-search-achievement"
          className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl shadow-sm text-xs font-medium"
        />
      </div>



      {/* Grid de Logros estilo Mockup 3 Columnas */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        data-testid="grid-achievements"
      >
        {filtered.map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#121a2c] border border-slate-200/80 dark:border-white/10 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-cyan-400/50 transition-all flex items-center justify-between gap-2.5 group cursor-pointer"
          >
            {/* Izquierda: Badge Icon */}
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 flex items-center justify-center flex-shrink-0 p-1 group-hover:scale-105 transition-transform">
              <img
                src={badgeImageUrl(item.code)}
                alt={item.name}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/habbo-radio/estampa_staff.png";
                }}
              />
            </div>

            {/* Centro: Info del Logro */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {item.name}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                {item.desc}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                  Nivel: {item.level}
                </span>
              </div>
            </div>

            {/* Derecha: Badge preview / target pill */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 flex items-center justify-center">
                <img
                  src={badgeImageUrl(item.nextCode)}
                  alt="Nivel"
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/habbo-radio/estampa_audifonos_dj.png";
                  }}
                />
              </div>
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded-full">
                {item.progress}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground bg-white dark:bg-[#121a2c] rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-semibold">No se encontraron logros con ese nombre</p>
          <p className="text-xs text-slate-400 mt-1">Prueba buscando "Looks", "Clanes", "Banzai" o "Previsiones"</p>
        </div>
      )}
    </div>
  );
}

function PreciosMercadoTab() {
  const [roomItemsText, setRoomItemsText] = useState("throne\ndino_egg\nice_cream");
  const [wallItemsText, setWallItemsText] = useState("poster_1");
  const [results, setResults] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const roomItems = roomItemsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((item) => ({ item }));
      const wallItems = wallItemsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((item) => ({ item }));
      const res = await apiRequest("POST", "/api/habbo/marketplace-stats", {
        roomItems,
        wallItems,
      });
      if (!res.ok) throw new Error("Error al consultar precios");
      return res.json();
    },
    onSuccess: (data) => setResults(data),
  });

  const roomStats: any[] = results?.roomItems || results?.roomItemStats || [];
  const wallStats: any[] = results?.wallItems || results?.wallItemStats || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
        <Coins className="w-4 h-4 text-yellow-500" />
        <p>Consulta el precio de mercado de varios furnis a la vez (un classname por línea).</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
            Room items (classname)
          </p>
          <Textarea
            value={roomItemsText}
            onChange={(e) => setRoomItemsText(e.target.value)}
            rows={4}
            placeholder="throne&#10;dino_egg"
            className="rounded-xl bg-white dark:bg-slate-900 font-mono text-xs"
            data-testid="input-room-items"
          />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
            Wall items (classname)
          </p>
          <Textarea
            value={wallItemsText}
            onChange={(e) => setWallItemsText(e.target.value)}
            rows={4}
            placeholder="poster_1"
            className="rounded-xl bg-white dark:bg-slate-900 font-mono text-xs"
            data-testid="input-wall-items"
          />
        </div>
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full sm:w-auto rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs"
        data-testid="button-check-prices"
      >
        <Search className="w-3.5 h-3.5 mr-2" />
        {mutation.isPending ? "Consultando..." : "Consultar precios de mercado"}
      </Button>

      {results && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          data-testid="grid-price-results"
        >
          {[...roomStats, ...wallStats].map((stat: any, i: number) => {
            const name = stat?.item || stat?.className || stat?.classname || "—";
            const avg = stat?.averagePrice ?? stat?.avgPrice ?? stat?.currentAveragePrice;
            const min = stat?.minPrice ?? stat?.lowestPrice;
            return (
              <div key={`stat-${name}-${i}`} className="bg-white dark:bg-[#121a2c] border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                <img
                  src={furniIconUrl(name)}
                  alt={name}
                  className="w-10 h-10 object-contain flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0.2";
                  }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold font-mono truncate text-slate-800 dark:text-slate-200">
                    {name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {avg !== undefined ? `Prom: ${Number(avg).toLocaleString()} créditos` : "Sin datos"}
                  </p>
                  {min !== undefined && (
                    <p className="text-[10px] text-amber-500 font-bold">
                      Mínimo: {Number(min).toLocaleString()}c
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RankingDerbyTab() {
  const { data: leaderboard } = useQuery<any>({
    queryKey: ["/api/habbo/skills-leaderboard"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        "/api/habbo/skills-leaderboard?skillType=FISHING&page=1",
      );
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  const entries: any[] = leaderboard?.entries || [
    { name: "DinhuLOL", score: 102 },
    { name: "Frank", score: 98 },
    { name: "SpeedMaster", score: 85 },
    { name: "HabboKing", score: 72 },
    { name: "PixelGirl", score: 64 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
        <Fish className="w-4 h-4 text-blue-500" />
        <p>Ranking de logros, habilidades y puntos de la comunidad.</p>
      </div>

      <div className="bg-white dark:bg-[#121a2c] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-2">
        {entries.map((e: any, i: number) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-black text-slate-400">
                #{i + 1}
              </span>
              <img
                src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(e.name || e.username || "Habbo")}&size=s&headonly=1`}
                alt={e.name}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-cyan-400/40 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                }}
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {e.name || e.username}
              </span>
            </div>
            <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">
              {(e.score ?? e.value ?? 0).toLocaleString()} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeriaPage() {
  const [activeTab, setActiveTab] = useState("logros");

  // Barra de navegación lateral fija estilo píldoras del Mockup
  const sidebarNavItems = [
    { label: "Página inicial", href: "/", icon: "fa-solid fa-house" },
    { label: "Perfil Speed", href: "/profile", icon: "fa-solid fa-user" },
    { label: "Cihabbo", href: "/herramientas", icon: "fa-solid fa-wand-magic-sparkles" },
    { label: "Ferramentas", href: "/herramientas", icon: "fa-solid fa-screwdriver-wrench" },
    { label: "Habbo Hotel", href: "/rooms", icon: "fa-solid fa-hotel" },
    { label: "Fútbol Hub", href: "/futbol-hub", icon: "fa-solid fa-futbol text-emerald-400" },
    { label: "Mis Badges", href: "/badges", icon: "fa-solid fa-award text-amber-400" },
  ];

  const rankingUsers = [
    { username: "DinhuLOL", points: 102, rank: 1 },
    { username: "SpeedMaster", points: 95, rank: 2 },
    { username: "PixelPro", points: 88, rank: 3 },
    { username: "HabboKing", points: 76, rank: 4 },
  ];

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ================= COLUMNA CENTRAL: HERO, ACCIONES RÁPIDAS, TABS Y GRILLA ================= */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. HERO BANNER URBANO DE LA FERIA */}
          <div className="relative overflow-hidden rounded-3xl shadow-md border border-slate-200/70 dark:border-white/10 min-h-[140px] flex items-center p-6 bg-[#0c1524]">
            {/* Imagen de fondo con overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-35"
              style={{
                backgroundImage: `url('/hspeed-hero-banner.png')`,
                backgroundPosition: "center 40%",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090e1a] via-[#090e1a]/85 to-transparent" />

            {/* Contenido del Banner */}
            <div className="relative z-10 max-w-xl space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 drop-shadow">
                  ✨ Feria
                </span>
                <span className="bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Oficial
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed drop-shadow-sm font-medium">
                El punto de encuentro de todas las herramientas de HabboSpeed: logros, precios de mercado, rankings y mucho más.
              </p>
            </div>
          </div>

          {/* 2. DOS TARJETAS DE ACCIÓN RÁPIDA (HOT LOOKS & BUSCADOR DE GRUPOS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tarjeta Hot Looks */}
            <Link href="/armario">
              <div className="bg-white dark:bg-[#0e1626] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    <Flame className="w-5 h-5 fill-amber-400/20 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors">
                      Hot Looks
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Avatares más populares del momento
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Tarjeta Buscador de Grupos */}
            <Link href="/rooms">
              <div className="bg-white dark:bg-[#0e1626] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-cyan-400/50 transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    <Shield className="w-5 h-5 fill-cyan-400/20 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white group-hover:text-cyan-400 transition-colors">
                      Buscador de Grupos
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Busca clanes y sus miembros
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>

          {/* 3. TABS REDONDEADAS BLANCAS CON PÍLDORAS ACTIVAS */}
          <div className="bg-white dark:bg-[#0e1626] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex border-b border-slate-100 dark:border-white/10 pb-3 gap-2">
              <button
                onClick={() => setActiveTab("logros")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === "logros"
                    ? "bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Logros</span>
              </button>

              <button
                onClick={() => setActiveTab("precios")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === "precios"
                    ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Precios</span>
              </button>

              <button
                onClick={() => setActiveTab("ranking")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === "ranking"
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Ranking</span>
              </button>
            </div>

            {/* Contenido según tab activa */}
            {activeTab === "logros" && <LogrosTab />}
            {activeTab === "precios" && <PreciosMercadoTab />}
            {activeTab === "ranking" && <RankingDerbyTab />}
          </div>

        </div>

        {/* ================= COLUMNA DERECHA: DESTACADOS Y RANKING ================= */}
        <aside className="lg:col-span-4 space-y-5">
          
          {/* 1. CARD DESTACADOS DEL MES */}
          <div className="bg-white dark:bg-[#0e1626] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Destacados del Mes
              </span>
              <span className="text-[10px] bg-cyan-400/15 text-cyan-500 dark:text-cyan-300 font-black px-2 py-0.5 rounded-full">
                Especial
              </span>
            </div>

            {/* Avatar & Bio */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative mb-2">
                <div className="w-24 h-28 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-2xl flex items-end justify-center p-2 border border-cyan-500/20">
                  <img
                    src="https://www.habbo.es/habbo-imaging/avatarimage?user=Frank&action=wav&direction=2&head_direction=3&gesture=sml&size=l"
                    alt="Frank"
                    className="h-full w-auto object-contain drop-shadow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                    }}
                  />
                </div>
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                  ⭐ Staff
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-800 dark:text-white">
                Frank el Bot
              </h4>
              <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
                Gerente General de Habbo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                ¡Bienvenido a la Feria de HabboSpeed! Explora los logros, revisa precios en vivo y desbloquea insignias exclusivas.
              </p>

              <Link href="/profile/Frank" className="w-full mt-4">
                <Button className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-sm cursor-pointer">
                  Conhecer perfil
                </Button>
              </Link>
            </div>
          </div>

          {/* 2. CARD RANKING DE LOGROS */}
          <div className="bg-white dark:bg-[#0e1626] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Ranking de Logros
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Top Speed</span>
            </div>

            <div className="space-y-2.5">
              {rankingUsers.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 text-center text-xs font-black ${
                      i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-slate-500"
                    }`}>
                      #{u.rank}
                    </span>
                    <img
                      src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(u.username)}&size=s&headonly=1`}
                      alt={u.username}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                      }}
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[90px]">
                      {u.username}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                    {u.points} SP
                  </span>
                </div>
              ))}
            </div>

            <Link href="/futbol-hub/ranking" className="block pt-2">
              <Button
                variant="outline"
                className="w-full text-xs font-bold rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Ver ranking completo
              </Button>
            </Link>
          </div>

        </aside>

      </div>
    </PageContainer>
  );
}
