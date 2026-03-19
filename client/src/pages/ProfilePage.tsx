import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Zap, Calendar, Shield } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrador", color: "bg-red-500/10 text-red-400 border-red-500/30" },
  dj: { label: "DJ", color: "bg-primary/10 text-primary border-primary/30" },
  user: { label: "Usuario", color: "bg-secondary text-muted-foreground border-border" },
  pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
};

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();

  const { data: habboUser, isLoading } = useQuery<any>({
    queryKey: ["/api/habbo/user", username],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/user/${username}`);
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <User className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Perfil</h1>
      </div>

      {isLoading ? (
        <div className="flex gap-6">
          <Skeleton className="w-32 h-48 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="bg-secondary/50 rounded-xl border border-border overflow-hidden w-32 h-48 flex items-end justify-center">
              {username ? (
                <img
                  src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${username}&size=b`}
                  alt={username}
                  className="h-full w-auto object-contain"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.opacity = "0.2";
                  }}
                  data-testid="img-profile-avatar"
                />
              ) : (
                <User className="w-16 h-16 text-muted-foreground/30 mb-4" />
              )}
            </div>
            {/* Avatar sizes */}
            <div className="flex gap-2 items-end">
              {["s", "m"].map((size) => (
                <div key={size} className="flex flex-col items-center gap-1">
                  <img
                    src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${username}&size=${size}&headonly=1`}
                    alt={`${username} ${size}`}
                    className="object-contain"
                    style={{ height: size === "s" ? "28px" : "36px" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                  />
                  <span className="text-[9px] text-muted-foreground">{size}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-bold" data-testid="text-profile-username">@{username}</h2>
              {habboUser && (
                <p className="text-xs text-muted-foreground mt-1">{habboUser.motto || "Sin lema"}</p>
              )}
            </div>

            {habboUser && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Nivel {habboUser.level || "—"}</span>
                </div>
                {habboUser.memberSince && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Miembro desde {new Date(habboUser.memberSince).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}</span>
                  </div>
                )}
                {habboUser.totalExperience !== undefined && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{habboUser.totalExperience?.toLocaleString()} puntos de experiencia</span>
                  </div>
                )}
              </div>
            )}

            {/* Habbo data card */}
            {habboUser && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: "Likes", value: habboUser.totalLikes || 0 },
                  { label: "Salas", value: habboUser.roomCount || 0 },
                  { label: "Estrellas", value: habboUser.starGemCount || 0 },
                ].map((stat) => (
                  <Card key={stat.label} className="bg-card border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-lg font-bold text-primary">{stat.value.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!habboUser && !isLoading && (
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Usuario de Habbo no encontrado o perfil privado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
