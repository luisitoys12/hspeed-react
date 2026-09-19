import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { proxyImage } from "@/lib/habboProxy";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Star, Crown, Shield, Music, Zap } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string; Icon: any }> =
  {
    admin: {
      label: "Administrador",
      color: "bg-red-500/10 text-red-400 border-red-500/30",
      Icon: Crown,
    },
    dj: {
      label: "DJ",
      color: "bg-primary/10 text-primary border-primary/30",
      Icon: Music,
    },
    moderador: {
      label: "Moderador",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      Icon: Shield,
    },
    colaborador: {
      label: "Colaborador",
      color: "bg-green-500/10 text-green-400 border-green-500/30",
      Icon: Star,
    },
    periodista: {
      label: "Periodista",
      color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      Icon: Star,
    },
    diseñador: {
      label: "Diseñador",
      color: "bg-pink-500/10 text-pink-400 border-pink-500/30",
      Icon: Star,
    },
    builder: {
      label: "Builder",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      Icon: Star,
    },
    mentor: {
      label: "Mentor",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      Icon: Star,
    },
    eventos: {
      label: "Eventos",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      Icon: Star,
    },
  };

function HabboOnlineBadge({ username }: { username: string }) {
  const { data } = useQuery<any>({
    queryKey: ["/api/habbo/user", username],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/user/${username}`);
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: 60000,
  });
  const isOnline = data?.online === true;
  return (
    <span
      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
        isOnline ? "bg-green-400" : "bg-muted-foreground/40"
      }`}
      title={isOnline ? "En línea en Habbo" : "Desconectado"}
    />
  );
}

function TeamMemberCard({ member }: { member: any }) {
  // Postura inicial única según el rol del miembro
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

  // Soporte de figura personalizada o username de Habbo
  const customFigure = member.figure || member.avatarFigure || null;
  const avatarUrl = customFigure
    ? `https://www.habbo.es/habbo-imaging/avatarimage?figure=${encodeURIComponent(
        customFigure,
      )}&action=${action}&direction=${direction}&head_direction=${direction}&gesture=sml&size=l`
    : `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(
        member.habboUsername || member.displayName,
      )}&action=${action}&direction=${direction}&head_direction=${direction}&gesture=sml&size=l`;

  return (
    <Card
      className="bg-card border-border hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/5 transition-all text-center overflow-hidden group rounded-2xl"
      data-testid={`card-team-${member.id}`}
    >
      <CardContent className="p-3.5 flex flex-col items-center gap-2">
        {/* Avatar + online indicator + sombra isométrica */}
        <div className="relative w-full">
          <div className="w-full h-32 bg-secondary/50 rounded-xl overflow-hidden flex items-end justify-center relative p-1 group-hover:bg-secondary/80 transition-colors">
            {/* Sombra isométrica en el suelo */}
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
            <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow" />
          )}
          {member.habboUsername && (
            <HabboOnlineBadge username={member.habboUsername} />
          )}
        </div>

        {/* Barra interactiva de acciones (Sentado, Caminando, Saludando, etc.) */}
        <div className="flex items-center justify-center gap-1 w-full pt-1 pb-1 border-b border-border/40">
          <button
            type="button"
            title="Parado / De pie"
            onClick={(e) => {
              e.preventDefault();
              setAction("std");
            }}
            className={`w-6 h-6 rounded-md text-[10px] flex items-center justify-center transition-all cursor-pointer ${
              action === "std"
                ? "bg-cyan-500 text-black font-black scale-110"
                : "bg-secondary/60 text-muted-foreground hover:text-cyan-400 hover:bg-secondary"
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
                : "bg-secondary/60 text-muted-foreground hover:text-cyan-400 hover:bg-secondary"
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
                : "bg-secondary/60 text-muted-foreground hover:text-cyan-400 hover:bg-secondary"
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
                : "bg-secondary/60 text-muted-foreground hover:text-cyan-400 hover:bg-secondary"
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
                : "bg-secondary/60 text-muted-foreground hover:text-cyan-400 hover:bg-secondary"
            }`}
          >
            ☕
          </button>
        </div>

        <Link
          href={`/profile/${member.habboUsername || member.displayName}`}
          className="w-full group/link"
        >
          <p className="text-sm font-bold truncate group-hover/link:text-cyan-400 transition-colors">
            {member.displayName}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            @{member.habboUsername}
          </p>
        </Link>

        <Badge
          variant="outline"
          className={`text-[9px] ${
            ROLE_LABELS[member.role]?.color ||
            "border-border text-muted-foreground"
          }`}
        >
          {ROLE_LABELS[member.role]?.label || member.role}
        </Badge>

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
          <p className="text-[10px] text-muted-foreground italic line-clamp-2 px-1">
            &ldquo;{member.motto}&rdquo;
          </p>
        )}

        {member.speedPoints !== undefined && member.speedPoints > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-semibold">
            <Zap className="w-3 h-3" />
            {member.speedPoints.toLocaleString()} SP
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const renderGroup = (title: string, icon: any, members: any[]) => {
  if (!members.length) return null;
  const Icon = icon;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {members.length}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
  const { data: team, isLoading } = useQuery<any[]>({
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
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Nuestro Equipo</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-8">
          Las personas que hacen posible HabboSpeed cada día. ¡Interactúa con sus avatares cambiando sus posturas!
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />{" "}
          En línea en Habbo
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 inline-block" />{" "}
          Desconectado
        </div>
      </div>

      <div className="space-y-8">
        {renderGroup("Administración", Crown, admins)}
        {renderGroup("DJs", Music, djs)}
        {renderGroup("Staff", Shield, staff)}
      </div>
    </div>
  );
}
