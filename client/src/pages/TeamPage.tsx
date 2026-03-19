import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Star } from "lucide-react";
import type { TeamMember } from "@shared/schema";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrador", color: "bg-red-500/10 text-red-400 border-red-500/30" },
  dj: { label: "DJ", color: "bg-primary/10 text-primary border-primary/30" },
  moderador: { label: "Moderador", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  colaborador: { label: "Colaborador", color: "bg-green-500/10 text-green-400 border-green-500/30" },
};

export default function TeamPage() {
  const { data: team, isLoading } = useQuery<TeamMember[]>({ queryKey: ["/api/team"] });

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Nuestro Equipo</h1>
      </div>

      <p className="text-sm text-muted-foreground">Las personas que hacen posible HabboSpeed cada día.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-24 h-24 rounded-xl" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          : (team || []).map((member) => (
              <Card
                key={member.id}
                className="bg-card border-border hover:border-primary/30 hover:glow-purple transition-all text-center overflow-hidden group"
                data-testid={`card-team-${member.id}`}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  {/* Habbo Avatar */}
                  <div className="relative">
                    <div className="w-20 h-24 bg-secondary/50 rounded-lg overflow-hidden flex items-center justify-end group-hover:bg-secondary/70 transition-colors">
                      <img
                        src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${member.habboUsername}&size=l`}
                        alt={member.displayName}
                        className="h-full w-auto object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://www.habbo.es/habbo-imaging/avatarimage?user=${member.habboUsername}&size=m`;
                        }}
                      />
                    </div>
                    {(member.role === "admin" || member.role === "dj") && (
                      <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold truncate w-full">{member.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">@{member.habboUsername}</p>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[9px] ${ROLE_LABELS[member.role]?.color || "border-border text-muted-foreground"}`}
                  >
                    {ROLE_LABELS[member.role]?.label || member.role}
                  </Badge>

                  {member.motto && (
                    <p className="text-[10px] text-muted-foreground italic line-clamp-2">"{member.motto}"</p>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && (!team || team.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">El equipo aún no está configurado</p>
        </div>
      )}
    </div>
  );
}
