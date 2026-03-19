import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Send, Plus, ChevronDown, ChevronUp, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
  senderName?: string;
  senderHabbo?: string;
}

export default function MessagesPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ to: "", subject: "", content: "" });

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/messages", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/messages/${id}/read`, {}, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/messages"] }),
  });

  const sendMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/messages", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("No se pudo enviar el mensaje");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setComposing(false);
      setForm({ to: "", subject: "", content: "" });
      toast({ title: "Mensaje enviado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const msg = messages?.find((m) => m.id === id);
      if (msg && !msg.read) markReadMutation.mutate(id);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center space-y-3">
        <Mail className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <p className="text-muted-foreground">
          <Link href="/login"><a className="text-primary hover:underline">Inicia sesión</a></Link> para ver tus mensajes
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Mensajes</h1>
        </div>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/80 text-white text-xs"
          onClick={() => setComposing(!composing)}
          data-testid="button-compose"
        >
          <Plus className="w-3 h-3 mr-1.5" />
          Nuevo mensaje
        </Button>
      </div>

      {/* Compose Form */}
      {composing && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              Redactar mensaje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Para (usuario)</Label>
              <Input
                placeholder="Nombre de usuario..."
                value={form.to}
                onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}
                data-testid="input-message-to"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Asunto</Label>
              <Input
                placeholder="Asunto del mensaje..."
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                data-testid="input-message-subject"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Mensaje</Label>
              <Textarea
                placeholder="Escribe tu mensaje..."
                rows={4}
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                data-testid="input-message-content"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-primary hover:bg-primary/80 text-white text-xs"
                onClick={() => sendMutation.mutate(form)}
                disabled={sendMutation.isPending || !form.to || !form.subject || !form.content}
                data-testid="button-send-message"
              >
                <Send className="w-3 h-3 mr-1.5" />
                Enviar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setComposing(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inbox */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))
        ) : (messages || []).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tienes mensajes</p>
          </div>
        ) : (
          (messages || []).map((msg) => (
            <Card
              key={msg.id}
              className={`bg-card border-border transition-colors cursor-pointer ${!msg.read ? "border-primary/30 bg-primary/5" : ""}`}
              data-testid={`card-message-${msg.id}`}
            >
              <CardContent className="p-4">
                <div
                  className="flex items-center justify-between gap-3"
                  onClick={() => handleExpand(msg.id)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {msg.senderHabbo ? (
                      <img
                        src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${msg.senderHabbo}&size=s&headonly=1`}
                        alt={msg.senderName || ""}
                        className="w-7 h-7 rounded bg-secondary flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                      />
                    ) : (
                      <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{msg.senderName || "Usuario"}</span>
                        {!msg.read && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] py-0">nuevo</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("es-ES") : ""}
                    </span>
                    {expandedId === msg.id
                      ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                      : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    }
                  </div>
                </div>

                {expandedId === msg.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
