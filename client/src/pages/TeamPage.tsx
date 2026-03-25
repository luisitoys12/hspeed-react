import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Star, Wifi, WifiOff, Crown, Shield, Music } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string; Icon: any }> = {
  admin:       { label: "Administrador", color: "bg-red-500/10 text-red-400 border-red-500/30",         Icon: Crown },
  dj:          { label: "DJ",            color: "bg-primary/10 text-primary border-primary/30",          Icon: Music },
  moderador:   { label: "Moderador",     color: "bg-orange-500/10 text-orange-400 border-orange-500/30", Icon: Shield },
  colaborador: { label: "Colaborador",   color: "bg-green-500/10 text-green-400 border-green-500/30",   Icon: Star },
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
    <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
      isOnline ? "bg-green-400" : "bg-muted-foreground/40"
    }`} title={isOnline ? "En línea en Habbo" : "Desconectado"} />
  );
}

export default function TeamPage() {
  const { data: team, isLoading } = useQuery<any[]>({
    queryKey: ["/api/team-users"],
    retry: false,
  });

  const admins  = (team || []).filter((m) => m.role === "admin");
  const djs     = (team || []).filter((m) => m.role === "dj");
  const mods    = (team || []).filter((m) => m.role === "moderador" || m.role === "colaborador");

  const renderGroup = (title: string, icon: any, members: any[]) => {
    if (!members.length) return null;
    const Icon = icon;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Icon className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
          <span className="ml-auto text-xs text-muted-foreground">{members.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {members.map((member) => (
            <Link key={member.id} href={`/profile/${member.habboUsername || member.displayName}`}>
              <a className="block" data-testid={`card-team-${member.id}`}>
                <Card className="bg-card border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all text-center overflow-hidden group cursor-pointer">
                  <CardContent className="p-4 flex flex-col items-center gap-2">

                    {/* Avatar con estado online */}
                    <div className="relative">
                      <div className="w-20 h-24 bg-secondary/50 rounded-xl overflow-hidden flex items-end justify-center group-hover:bg-secondary/80 transition-colors">
                        <img
                          src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${member.habboUsername}&size=l&direction=2&head_direction=2`}
                          alt={member.displayName}
                          className="h-full w-auto object-contain transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://www.habbo.es/habbo-imaging/avatarimage?user=${member.habboUsername}&size=m&direction=2&head_direction=2`;
                          }}
                        />
                      </div>
                      {/* Star para admins / DJs */}
                      {(member.role === "admin" || member.role === "dj") && (
                        <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 fill-yellow-400" />
                      )}
                      {/* Online indicator desde Habbo API */}
                      {member.habboUsername && (
                        <HabboOnlineBadge username={member.habboUsername} />
                      )}
                    </div>

                    <div className="w-full">
                      <p className="text-sm font-bold truncate">{member.displayName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">@{member.habboUsername}</p>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[9px] ${
                        ROLE_LABELS[member.role]?.color || "border-border text-muted-foreground"
                      }`}
                    >
                      {ROLE_LABELS[member.role]?.label || member.role}
                    </Badge>

                    {member.motto && (
                      <p className="text-[10px] text-muted-foreground italic line-clamp-2">
                        &ldquo;{member.motto}&rdquo;
                      </p>
                    )}

                    {member.speedPoints !== undefined && (
                      <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-semibold">
                        <Zap className="w-3 h-3" />
                        {member.speedPoints.toLocaleString()} SP
                      </div>
                    )}
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Nuestro Equipo</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-8">
          Las personas que hacen posible HabboSpeed cada día.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" /> En línea en Habbo
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 inline-block" /> Desconectado
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-24 h-28 rounded-xl" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {renderGroup("Administración", Crown, admins)}
          {renderGroup("DJs", Music, djs)}
          {renderGroup("Staff", Shield, mods)}
        </div>
      )}

      {!isLoading && (!team || team.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">El equipo aún no está configurado</p>
          <p className="text-xs mt-1">Agrega miembros desde el Panel de Administración</p>
        </div>
      )}
    </div>
  );
}
