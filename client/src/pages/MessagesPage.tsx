import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail, Send, Plus, ChevronLeft, User, Flag, X, Reply, Inbox, CheckCheck, Ticket, MessageSquare,
} from "lucide-react";
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

function AvatarBubble({ habbo, name }: { habbo?: string; name?: string }) {
  return habbo ? (
    <img
      src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${habbo}&size=s&headonly=1`}
      alt={name || ""}
      className="w-9 h-9 rounded-full bg-muted flex-shrink-0 ring-2 ring-primary/30"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
      <User className="w-4 h-4 text-primary" />
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function MessagesPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"messages" | "tickets">("messages");
  
  // Message states
  const [activeId, setActiveId] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [form, setForm] = useState({ to: "", subject: "", content: "" });

  // Ticket states
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
  const [composingTicket, setComposingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", description: "", category: "general" });

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/messages", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    enabled: !!user,
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery<any[]>({
    queryKey: ["/api/tickets"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tickets", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    enabled: !!user && activeTab === "tickets",
    refetchInterval: 10000,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof ticketForm) => {
      const res = await apiRequest("POST", "/api/tickets", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("No se pudo crear el ticket");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setComposingTicket(false);
      setTicketForm({ subject: "", description: "", category: "general" });
      toast({ title: "✅ Ticket Creado", description: "El equipo de soporte revisará tu solicitud pronto." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/messages/${id}/read`, {}, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/messages"] }),
  });

  const reportMutation = useMutation({
    mutationFn: async ({ messageId, reason }: { messageId: number; reason: string }) => {
      const res = await apiRequest("POST", "/api/reported-messages", { messageId, reason }, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al reportar");
      return res.json();
    },
    onSuccess: () => toast({ title: "Mensaje reportado", description: "Un administrador revisará este mensaje." }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
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
      toast({ title: "✅ Mensaje enviado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const replySendMutation = useMutation({
    mutationFn: async ({ msg, content }: { msg: Message; content: string }) => {
      const data = {
        to: msg.senderName || "",
        subject: `Re: ${msg.subject}`,
        content,
      };
      const res = await apiRequest("POST", "/api/messages", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("No se pudo enviar la respuesta");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setReplyContent("");
      toast({ title: "↩️ Respuesta enviada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleOpen = (id: number) => {
    setComposing(false);
    setReplyContent("");
    if (activeId === id) {
      setActiveId(null);
      return;
    }
    setActiveId(id);
    const msg = messages?.find((m) => m.id === id);
    if (msg && !msg.read) markReadMutation.mutate(id);
  };

  const unreadCount = (messages || []).filter((m) => !m.read).length;
  const activeMsg = messages?.find((m) => m.id === activeId);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold">Buzón de mensajes</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          <Link href="/login" className="text-primary hover:underline font-semibold">Inicia sesión</Link> para ver y enviar mensajes privados.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-5 space-y-4">
      {/* Navigation Tabs */}
      <div className="flex bg-muted/65 p-1 rounded-xl border border-border/70 max-w-xs">
        <button
          className={cn(
            "flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all",
            activeTab === "messages"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => { setActiveTab("messages"); setActiveId(null); setComposing(false); }}
        >
          Chat Personal
        </button>
        <button
          className={cn(
            "flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all",
            activeTab === "tickets"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => { setActiveTab("tickets"); setActiveTicketId(null); setComposingTicket(false); }}
        >
          Soporte (Tickets)
        </button>
      </div>

      {activeTab === "messages" ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Inbox className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-none">Buzón de Mensajes</h1>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-primary font-semibold mt-0.5 block">
                    {unreadCount} sin leer
                  </span>
                )}
              </div>
            </div>
            <Button
              size="sm"
              className="bg-theme-gradient text-white text-xs rounded-xl shadow-md hover:opacity-90 transition-opacity"
              onClick={() => { setComposing(true); setActiveId(null); }}
              data-testid="button-compose"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Nuevo
            </Button>
          </div>

          {/* Compose Panel */}
          {composing && (
            <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between px-4 py-3 bg-primary/8 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Send className="w-3.5 h-3.5 text-primary" />
                  Nuevo mensaje
                </div>
                <button onClick={() => setComposing(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <Input
                  placeholder="Para: nombre de usuario"
                  value={form.to}
                  onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}
                  className="bg-muted/50 border-border text-sm rounded-xl"
                  data-testid="input-message-to"
                />
                <Input
                  placeholder="Asunto"
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  className="bg-muted/50 border-border text-sm rounded-xl"
                  data-testid="input-message-subject"
                />
                <Textarea
                  placeholder="Escribe tu mensaje..."
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  className="bg-muted/50 border-border text-sm rounded-xl resize-none"
                  data-testid="input-message-content"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs rounded-xl"
                    onClick={() => setComposing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-theme-gradient text-white text-xs rounded-xl shadow hover:opacity-90"
                    onClick={() => sendMutation.mutate(form)}
                    disabled={sendMutation.isPending || !form.to || !form.subject || !form.content}
                    data-testid="button-send-message"
                  >
                    <Send className="w-3 h-3 mr-1.5" />
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Active Message Thread */}
          {activeMsg && !composing && (
            <div className="rounded-2xl border border-primary/20 bg-card shadow-lg overflow-hidden animate-fade-in-up">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-primary/5">
                <button
                  onClick={() => setActiveId(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors mr-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <AvatarBubble habbo={activeMsg.senderHabbo} name={activeMsg.senderName} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{activeMsg.senderName || "Usuario"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{activeMsg.subject}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeMsg.read && <CheckCheck className="w-3.5 h-3.5 text-primary" />}
                  <span className="text-[10px] text-muted-foreground">{formatDate(activeMsg.createdAt)}</span>
                </div>
              </div>

              <div className="px-4 py-4">
                <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{activeMsg.content}</p>
                </div>

                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder={`Responder a ${activeMsg.senderName || "este usuario"}...`}
                    rows={3}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="bg-muted/50 border-border text-sm rounded-xl resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] h-6 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                      onClick={() => {
                        const reason = window.prompt("¿Por qué reportas este mensaje?");
                        if (reason) reportMutation.mutate({ messageId: activeMsg.id, reason });
                      }}
                      data-testid={`button-report-message-${activeMsg.id}`}
                    >
                      <Flag className="w-3 h-3 mr-1" />
                      Reportar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-theme-gradient text-white text-xs rounded-xl shadow hover:opacity-90"
                      disabled={!replyContent.trim() || replySendMutation.isPending}
                      onClick={() => replySendMutation.mutate({ msg: activeMsg, content: replyContent })}
                    >
                      <Reply className="w-3 h-3 mr-1.5" />
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inbox List */}
          {!activeMsg && !composing && (
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl" />
                ))
              ) : (messages || []).length === 0 ? (
                <div className="text-center py-16 text-muted-foreground space-y-3">
                  <div className="w-14 h-14 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <Mail className="w-7 h-7 opacity-30" />
                  </div>
                  <p className="text-sm">Tu bandeja está vacía</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => setComposing(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Enviar primer mensaje
                  </Button>
                </div>
              ) : (
                (messages || []).map((msg) => (
                  <button
                    key={msg.id}
                    className={`w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden group
                      ${activeId === msg.id
                        ? "border-primary/40 bg-primary/8 shadow-md"
                        : !msg.read
                        ? "border-primary/25 bg-primary/5 hover:border-primary/40 hover:bg-primary/8"
                        : "border-border bg-card hover:border-border/70 hover:bg-muted/20"
                      }`}
                    onClick={() => handleOpen(msg.id)}
                    data-testid={`card-message-${msg.id}`}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <AvatarBubble habbo={msg.senderHabbo} name={msg.senderName} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs truncate ${!msg.read ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                            {msg.senderName || "Usuario"}
                          </span>
                          {!msg.read && (
                            <Badge className="bg-primary text-white text-[8px] py-0 px-1.5 rounded-full h-4">
                              nuevo
                            </Badge>
                          )}
                        </div>
                        <p className={`text-[11px] truncate ${!msg.read ? "text-foreground/70" : "text-muted-foreground"}`}>
                          <span className="font-medium">{msg.subject}</span>
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-[10px] text-muted-foreground">
                        {msg.createdAt ? formatDate(msg.createdAt) : ""}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Support Tickets Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Ticket className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-none">Tickets de Soporte</h1>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Reporta fallos, dudas o solicita soporte de radio y VIP.
                </span>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-theme-gradient text-white text-xs rounded-xl shadow-md hover:opacity-90 transition-opacity"
              onClick={() => { setComposingTicket(true); setActiveTicketId(null); }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Crear Ticket
            </Button>
          </div>

          {/* Ticket Composer */}
          {composingTicket && (
            <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between px-4 py-3 bg-primary/8 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Ticket className="w-3.5 h-3.5 text-primary" />
                  Abrir nuevo ticket de soporte
                </div>
                <button onClick={() => setComposingTicket(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Categoría</label>
                  <select
                    className="flex h-9 w-full rounded-xl border border-input bg-muted/50 px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="general">Duda General</option>
                    <option value="bug">Reportar Bug / Error</option>
                    <option value="radio">Soporte de Radio / DJ</option>
                    <option value="vip">Membresía VIP</option>
                    <option value="other">Otros</option>
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Asunto</label>
                  <Input
                    placeholder="Ej. Problema con el reproductor de radio"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm((p) => ({ ...p, subject: e.target.value }))}
                    className="bg-muted/50 border-border text-xs rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Descripción Detallada</label>
                  <Textarea
                    placeholder="Describe detalladamente el problema para darte una solución rápida..."
                    rows={4}
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm((p) => ({ ...p, description: e.target.value }))}
                    className="bg-muted/50 border-border text-xs rounded-xl resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs rounded-xl"
                    onClick={() => setComposingTicket(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-theme-gradient text-white text-xs rounded-xl shadow hover:opacity-90"
                    onClick={() => createTicketMutation.mutate(ticketForm)}
                    disabled={createTicketMutation.isPending || !ticketForm.subject || !ticketForm.description}
                  >
                    <Send className="w-3 h-3 mr-1.5" />
                    Abrir Ticket
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Active Ticket Thread (Live Support Chat) */}
          {activeTicketId !== null && !composingTicket && (() => {
            const ticket = tickets?.find((t) => t.id === activeTicketId);
            if (!ticket) return null;
            
            const categoryColors: Record<string, string> = {
              general: "bg-blue-500/10 text-blue-400 border-blue-500/25",
              bug: "bg-red-500/10 text-red-400 border-red-500/25",
              radio: "bg-purple-500/10 text-purple-400 border-purple-500/25",
              vip: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
            };

            const statusLabels: Record<string, { t: string; c: string }> = {
              open: { t: "Abierto", c: "bg-green-500/10 text-green-400 border-green-500/20" },
              in_progress: { t: "En Proceso", c: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
              resolved: { t: "Resuelto", c: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
              closed: { t: "Cerrado", c: "bg-red-500/10 text-red-400 border-red-500/20" },
            };

            return (
              <div className="rounded-2xl border border-primary/20 bg-card shadow-lg overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTicketId(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors mr-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <p className="text-xs font-black truncate">{ticket.subject}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{formatDate(ticket.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className={cn("text-[8px] py-0 px-2 border uppercase h-4.5 rounded-full font-bold", categoryColors[ticket.category] || "bg-slate-500/10 text-slate-400 border-slate-500/25")}>
                      {ticket.category}
                    </Badge>
                    <Badge className={cn("text-[8px] py-0 px-2 border uppercase h-4.5 rounded-full font-bold", statusLabels[ticket.status]?.c || "bg-slate-500/10 text-slate-400 border-slate-500/25")}>
                      {statusLabels[ticket.status]?.t || ticket.status}
                    </Badge>
                  </div>
                </div>

                {/* Ticket Body / Chat en vivo de soporte */}
                <div className="p-4 space-y-4 max-h-[350px] overflow-y-auto bg-card">
                  {/* Mensaje 1: Pregunta del Usuario */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/25 flex-shrink-0 text-primary font-bold text-xs">
                      {user.displayName.slice(0, 1)}
                    </div>
                    <div className="bg-secondary/15 border border-border/60 rounded-2xl rounded-tl-sm px-3.5 py-2 max-w-[85%]">
                      <p className="text-[10px] font-bold text-primary mb-0.5">Tú</p>
                      <p className="text-xs text-foreground/90 whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                  </div>

                  {/* Mensaje 2: Auto-Respuesta / Live Chat Bot */}
                  <div className="flex items-start gap-2.5 flex-row-reverse">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/15 flex items-center justify-center border border-primary/25 flex-shrink-0">
                      <img
                        src="https://www.habbo.es/habbo-imaging/avatarimage?user=Frank&size=s&headonly=1"
                        alt="Frank"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="bg-primary/10 border border-primary/15 rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[85%] text-right">
                      <p className="text-[10px] font-bold text-primary mb-0.5">Frank (Soporte en Vivo)</p>
                      <p className="text-xs text-foreground/85 leading-normal">
                        ¡Hola! Tu ticket ha sido recibido con éxito. Nuestro staff de HabboSpeed lo está revisando en este momento para brindarte una solución a la brevedad.
                      </p>
                    </div>
                  </div>

                  {/* Mensaje 3: Si está resuelto o cerrado */}
                  {(ticket.status === "resolved" || ticket.status === "closed") && (
                    <div className="flex items-start gap-2.5 flex-row-reverse animate-fade-in">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/15 flex items-center justify-center border border-primary/25 flex-shrink-0">
                        <img
                          src="https://www.habbo.es/habbo-imaging/avatarimage?user=Staff_HS&size=s&headonly=1"
                          alt="Staff"
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://www.habbo.es/habbo-imaging/avatarimage?user=Frank&size=s&headonly=1"; }}
                        />
                      </div>
                      <div className="bg-[#23f59e]/10 border border-[#23f59e]/20 rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[85%] text-right">
                        <p className="text-[10px] font-bold text-[#23f59e] mb-0.5">Staff Administrativo</p>
                        <p className="text-xs text-foreground/85 leading-normal">
                          Hemos revisado y procesado tu caso. El estado de este ticket se ha actualizado a <strong className="text-[#23f59e]">{statusLabels[ticket.status]?.t}</strong>. Revisa tus mensajes del Chat Personal por si te enviamos detalles adicionales.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer del chat */}
                <div className="p-3 border-t border-border bg-secondary/10 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Soporte en vivo vía tickets activo las 24/7.</span>
                  {ticket.status !== "closed" && ticket.status !== "resolved" ? (
                    <span className="flex items-center gap-1.5 text-[#23f59e]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#23f59e] animate-pulse" />
                      Staff en línea
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold uppercase tracking-wider">Ticket Finalizado</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Tickets List */}
          {activeTicketId === null && !composingTicket && (
            <div className="space-y-2">
              {ticketsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl" />
                ))
              ) : (tickets || []).length === 0 ? (
                <div className="text-center py-16 text-muted-foreground space-y-3">
                  <div className="w-14 h-14 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <Ticket className="w-7 h-7 opacity-30" />
                  </div>
                  <p className="text-sm">No tienes tickets de soporte creados</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => setComposingTicket(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Abrir mi primer ticket
                  </Button>
                </div>
              ) : (
                (tickets || []).map((t) => {
                  const statusColors: Record<string, string> = {
                    open: "bg-green-500/10 text-green-400 border-green-500/20",
                    in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    resolved: "bg-slate-500/10 text-slate-400 border-slate-500/20",
                    closed: "bg-red-500/10 text-red-400 border-red-500/20",
                  };

                  return (
                    <button
                      key={t.id}
                      className="w-full text-left rounded-2xl border border-border bg-card hover:border-border/70 hover:bg-muted/20 transition-all duration-200"
                      onClick={() => setActiveTicketId(t.id)}
                    >
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-secondary/40 flex items-center justify-center border border-border/50">
                            <MessageSquare className="w-4.5 h-4.5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground leading-snug">{t.subject}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Categoría: {t.category} • {formatDate(t.createdAt)}</p>
                          </div>
                        </div>
                        <Badge className={cn("text-[8.5px] py-0.5 px-2 border uppercase rounded-full font-bold", statusColors[t.status] || "bg-slate-500/10 text-slate-400 border-slate-500/25")}>
                          {t.status === "open" ? "Abierto" : t.status === "in_progress" ? "Procesando" : t.status === "resolved" ? "Resuelto" : "Cerrado"}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
