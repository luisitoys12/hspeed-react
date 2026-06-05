import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing, CheckCheck, MessageSquare, Coins, Award, Info, AlertTriangle, ShoppingCart } from "lucide-react";

const NOTIF_ICONS: Record<string, any> = {
  info: Info,
  success: CheckCheck,
  warning: AlertTriangle,
  achievement: Award,
  points: Coins,
  message: MessageSquare,
  shop: ShoppingCart,
};

const NOTIF_COLORS: Record<string, string> = {
  info: "text-blue-400 bg-blue-500/10",
  success: "text-green-400 bg-green-500/10",
  warning: "text-yellow-400 bg-yellow-500/10",
  achievement: "text-purple-400 bg-purple-500/10",
  points: "text-yellow-400 bg-yellow-500/10",
  message: "text-cyan-400 bg-cyan-500/10",
  shop: "text-primary bg-primary/10",
};

export default function NotificationBell() {
  const { user, token } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifs } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/notifications?limit=20", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/notifications/unread-count", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", "/api/notifications/read-all", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const unreadCount = unreadData?.count || 0;

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors"
        data-testid="button-notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-primary animate-pulse" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center px-1 font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-primary/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-primary" /> Notificaciones
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-[10px] text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Marcar todas leídas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {(!notifs || notifs.length === 0) ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-muted-foreground">Sin notificaciones</p>
                </div>
              ) : (
                notifs.map((n: any) => {
                  const Icon = NOTIF_ICONS[n.type] || Info;
                  const colorClass = NOTIF_COLORS[n.type] || "text-muted-foreground bg-secondary/20";
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors ${!n.isRead ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{n.title}</p>
                        {n.message && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                        <p className="text-[9px] text-muted-foreground/50 mt-1">
                          {new Date(n.createdAt).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}