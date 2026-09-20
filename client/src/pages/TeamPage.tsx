import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { proxyImage } from "@/lib/habboProxy";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Star, Crown, Shield, Music, Zap } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import PageHeaderCard from "@/components/PageHeaderCard";

const ROLE_LABELS: Record<string, { label: string; color: string; Icon: any }> =
  {
    admin: {
      label: "Administrador",
      color: "bg-red-500/10 text-red-500 border-red-500/30",
      Icon: Crown,
    },
    dj: {
      label: "DJ",
      color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      Icon: Music,
    },
    moderador: {
      label: "Moderador",
      color: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      Icon: Shield,
    },
    colaborador: {
      label: "Colaborador",
      color: "bg-green-500/10 text-green-500 border-green-500/30",
      Icon: Star,
    },
    periodista: {
      label: "Periodista",
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      Icon: Star,
    },
    diseñador: {
      label: "Diseñador",
      color: "bg-pink-500/10 text-pink-500 border-pink-500/30",
      Icon: Star,
    },
    builder: {
      label: "Builder",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      Icon: Star,
    },
    mentor: {
      label: "Mentor",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
      Icon: Star,
    },
    eventos: {
      label: "Eventos",
      color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
      Icon: Star,
    },
  };

function HabboOnlineBadge({ username }: { username: string }) {
  const { data } = useQuery<{ online: boolean } | null>({
    queryKey: ["/api/habbo/profile", username, "online"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/profile/${username}`);
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: 60000,
  });
  const isOnline = data?.online === true;
  return (
    <span
      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
        isOnline ? "bg-emerald-400" : "bg-slate-400/40"
      }`}
      title={isOnline ? "En línea en Habbo" : "Desconectado"}
    />
  );
}

function TeamMemberCard({ member }: { member: any }) {
  const defaultAction =
    member.role === "admin"
      ? "sit"
      : member.role === "dj"
      ? "wav"
      : member.role === "eventos"
      ? "drk=1"
      : member.role === "colaborador" || member.role === "builder"
      ? "wlk"
      : "std";

  const [action, setAction] = useState<string>(defaultAction);
  const [direction, setDirection] = useState<number>(2);

  const customFigure = member.figure || member.avatarFigure || null;
  const avatarUrl = customFigure
    ? `https://www.habbo.es/habbo-imaging/avatarimage?figure=${encodeURIComponent(
        customFigure,
      )}&action=${action}&direction=${direction}&head_direction=${direction}&gesture=sml&size=l`
    : `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(
        member.habboUsername || member.displayName,
      )}&action=${action}&direction=${direction}&head_direction=${direction}&gesture=sml&size=l`;

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-cyan-400 shadow-xs transition-all text-center overflow-hidden group rounded-2xl p-3.5 flex flex-col items-center gap-2"
      data-testid={`card-team-${member.id}`}
    >
      {/* Avatar + online indicator + sombra isométrica */}
      <div className="relative w-full">
        <div className="w-full h-32 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden flex items-end justify-center relative p-1 group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
          <div className="absolute bottom-1 w-16 h-4 bg-black/15 dark:bg-black/40 rounded-full blur-[2px] transform scale-y-50" />

          <img
            src={proxyImage(avatarUrl)}
            alt={member.displayName}
            className="h-full w-auto object-contain transition-transform duration-200 group-hover:scale-105 relative z-10 drop-shadow"
            onError={(e) => {
              (e.target as HTMLImageElement).src = proxyImage(
                `https://www.habbo.es/habbo-imaging/avatarimage?user=${member.habboUsername}&size=m&direction=2&head_direction=2`,
              );
            }}
          />
        </div>

        {(member.role === "admin" || member.role === "dj") && (
          <Star className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 fill-amber-400 drop-shadow" />
        )}
        {member.habboUsername && (
          <HabboOnlineBadge username={member.habboUsername} />
        )}
      </div>

      {/* Barra interactiva de acciones (Sentado, Caminando, Saludando, etc.) */}
      <div className="flex items-center gap-1 justify-center bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200/70 dark:border-slate-700/50">
        <button
          type="button"
          title="De pie"
          onClick={(e) => {
            e.preventDefault();
            setAction("std");
          }}
          className={`w-6 h-6 rounded-md text-[10px] flex items-center justify-center transition-all cursor-pointer ${
            action === "std"
              ? "bg-cyan-500 text-black font-black scale-110"
              : "text-slate-400 hover:text-cyan-500 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          🕺
        </button>
        <button
          type="button"
          title="Sentado"
          onClick={(e) => {
            e.preventDefault();
            setAction("sit");
          }}
          className={`w-6 h-6 rounded-md text-[10px] flex items-center justify-center transition-all cursor-pointer ${
            action === "sit"
              ? "bg-cyan-500 text-black font-black scale-110"
              : "text-slate-400 hover:text-cyan-500 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          🪑
        </button>
        <button
          type="button"
          title="Caminando"
          onClick={(e) => {
            e.preventDefault();
            setAction("wlk");
          }}
          className={`w-6 h-6 rounded-md text-[10px] flex items-center justify-center transition-all cursor-pointer ${
            action === "wlk"
              ? "bg-cyan-500 text-black font-black scale-110"
              : "text-slate-400 hover:text-cyan-500 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          🚶
        </button>
        <button
          type="button"
          title="Saludando"
          onClick={(e) => {
            e.preventDefault();
            setAction("wav");
          }}
          className={`w-6 h-6 rounded-md text-[10px] flex items-center justify-center transition-all cursor-pointer ${
            action === "wav"
              ? "bg-cyan-500 text-black font-black scale-110"
              : "text-slate-400 hover:text-cyan-500 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          👋
        </button>
        <button
          type="button"
          title="Bebiendo café/refresco"
          onClick={(e) => {
            e.preventDefault();
            setAction("drk=1");
          }}
          className={`w-6 h-6 rounded-md text-[10px] flex items-center justify-center transition-all cursor-pointer ${
            action === "drk=1"
              ? "bg-cyan-500 text-black font-black scale-110"
              : "text-slate-400 hover:text-cyan-500 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          ☕
        </button>
      </div>

      <Link
        href={`/profile/${member.habboUsername || member.displayName}`}
        className="font-black text-xs text-slate-900 dark:text-slate-100 hover:text-cyan-500 transition-colors truncate max-w-full"
      >
        {member.displayName}
      </Link>

      {member.habboUsername && (
        <span className="text-[10px] text-slate-400 truncate max-w-full -mt-1">
          @{member.habboUsername}
        </span>
      )}

      {ROLE_LABELS[member.role] && (
        <Badge
          variant="outline"
          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${
            ROLE_LABELS[member.role].color
          }`}
        >
          {ROLE_LABELS[member.role].label}
        </Badge>
      )}

      {/* Placas y Estampas del Staff / DJ */}
      <div className="flex gap-1.5 justify-center py-0.5">
        <img
          src="/habbo-radio/estampa_staff.png"
          alt="Placa Staff HSpeed"
          className="w-5 h-5 object-contain hover:scale-110 transition-transform cursor-help"
          title="Staff HSpeed: Placa Oficial de Miembro del Equipo"
        />
        {(member.role === "admin" || member.role === "dj") && (
          <img
            src="/habbo-radio/estampa_audifonos_dj.png"
            alt="Audífonos DJ Locutor"
            className="w-5 h-5 object-contain hover:scale-110 transition-transform cursor-help"
            title="DJ Locutor HSpeed: Placa de Locución de Radio"
          />
        )}
      </div>

      {member.motto && (
        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-2 px-1">
          &ldquo;{member.motto}&rdquo;
        </p>
      )}

      {member.speedPoints !== undefined && member.speedPoints > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
          <Zap className="w-3 h-3" />
          {member.speedPoints.toLocaleString()} SP
        </div>
      )}
    </div>
  );
}

const renderGroup = (title: string, icon: any, members: any[]) => {
  if (!members.length) return null;
  const Icon = icon;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center text-xs font-black">
            <Icon className="w-3.5 h-3.5" />
          </span>
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-slate-100">
            {title}
          </h2>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {members.length} miembros
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {members.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
};

const DEFAULT_TEAM = [
  {
    id: "staff-1",
    displayName: "Frank",
    habboUsername: "Frank",
    role: "admin",
    motto: "¡Bienvenidos a HabboSpeed! Tu fansite y radio preferida.",
    speedPoints: 12500,
    figure: "hr-5756-48.hd-3093-1.ch-5206-73-82.lg-3057-82.sh-3115-82.ha-5727-82-82.he-5647-1408.ea-1404-110",
  },
  {
    id: "staff-2",
    displayName: "DinhuLOL",
    habboUsername: "DinhuLOL",
    role: "dj",
    motto: "Al aire con la mejor música 24/7 en HabboSpeed Radio.",
    speedPoints: 9400,
  },
  {
    id: "staff-3",
    displayName: "DJ_Speedy",
    habboUsername: "SpeedRadio",
    role: "dj",
    motto: "Pide tus temazos favoritos y manda tus saludos.",
    speedPoints: 7800,
  },
  {
    id: "staff-4",
    displayName: "LuciaSeguridad",
    habboUsername: "Lucia",
    role: "moderador",
    motto: "Manteniendo la comunidad segura, alegre y divertida.",
    speedPoints: 6200,
  },
  {
    id: "staff-5",
    displayName: "PixelBuilder",
    habboUsername: "BuilderPro",
    role: "builder",
    motto: "Construyendo las salas de eventos y laberintos.",
    speedPoints: 5300,
  },
  {
    id: "staff-6",
    displayName: "EventosAventuras",
    habboUsername: "EventosHS",
    role: "eventos",
    motto: "¡No te pierdas los torneos y dinámicas de hoy!",
    speedPoints: 4900,
  },
];

export default function TeamPage() {
  const { data: team } = useQuery<any[]>({
    queryKey: ["/api/team"],
    retry: false,
  });

  const activeTeam = team && team.length > 0 ? team : DEFAULT_TEAM;
  const admins = activeTeam.filter((m) => m.role === "admin");
  const djs = activeTeam.filter((m) => m.role === "dj");
  const staff = activeTeam.filter(
    (m) => m.role !== "admin" && m.role !== "dj",
  );

  return (
    <PageContainer>
      {/* Header Card */}
      <PageHeaderCard
        title="Nuestro Equipo"
        kicker="Directorio Oficial"
        subtitle="Las personas que hacen posible HabboSpeed cada día. ¡Interactúa con sus avatares cambiando sus posturas!"
        icon={<Users className="w-5 h-5 text-purple-400" />}
        rightElement={
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> En línea
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400/40 inline-block" /> Desconectado
            </span>
          </div>
        }
      />

      <div className="space-y-4">
        {renderGroup("Administración", Crown, admins)}
        {renderGroup("DJs y Locutores", Music, djs)}
        {renderGroup("Moderadores y Builders", Shield, staff)}
      </div>
    </PageContainer>
  );
}
