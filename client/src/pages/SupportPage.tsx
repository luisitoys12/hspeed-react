import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Ticket, Plus, ChevronLeft, Clock, CheckCircle2,
  AlertCircle, XCircle, LifeBuoy, MessageSquareDashed,
  ShieldCheck, Zap
} from "lucide-react";

const CATEGORIES = [
  { value: "general", label: "General", icon: "💬" },
  { value: "cuenta", label: "Cuenta / Acceso", icon: "🔑" },
  { value: "speedpoints", label: "Speed Points", icon: "⚡" },
  { value: "radio", label: "Radio", icon: "📻" },
  { value: "vip", label: "VIP / Membresía", icon: "👑" },
  { value: "tecnico", label: "Problema Técnico", icon: "🛠️" },
  { value: "abuso", label: "Reporte de Abuso", icon: "🚨" },
  { value: "otro", label: "Otro", icon: "📩" },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  open:        { label: "Abierto",     color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: AlertCircle },
  in_progress: { label: "En Progreso", color: "bg-blue-500/10 text-blue-400 border-blue-500/30",     icon: Clock },
  resolved:    { label: "Resuelto",    color: "bg-green-500/10 text-green-400 border-green-500/30",   icon: CheckCircle2 },
  closed:      { label: "Cerrado",     color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",      icon: XCircle },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SupportPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [form, setForm] = useState({ subject: "", description: "", category: "general" });

  const { data: tickets = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/tickets"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tickets", undefined, `Bearer ${token}`);
      return res.json();
    },
    enabled: !!user && !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/tickets", data, `Bearer ${token}`),
    onSuccess: () => {
      toast({ title: "✅ Ticket enviado", description: "Nuestro equipo te responderá pronto." });
      setCreating(false);
      setForm({ subject: "", description: "", category: "general" });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
    onError: () => toast({ title: "Error al enviar ticket", variant: "destructive" }),
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <LifeBuoy className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-black uppercase text-white">Soporte HabboSpeed</h2>
          <p className="text-sm text-muted-foreground">Necesitas iniciar sesión para acceder al sistema de soporte.</p>
          <div className="flex gap-2 justify-center">
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/80 text-white text-xs">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="text-xs">Registrarse</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Detail view
  if (selectedTicket) {
    const status = STATUS_MAP[selectedTicket.status] || STATUS_MAP["open"];
    const StatusIcon = status.icon;
    const cat = CATEGORIES.find(c => c.value === selectedTicket.category) || CATEGORIES[0];
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Volver a mis tickets
        </button>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <Ticket className="w-3.5 h-3.5" />
                  Ticket #{selectedTicket.id} · {cat.icon} {cat.label}
                </div>
                <h2 className="text-lg font-black text-white">{selectedTicket.subject}</h2>
                <p className="text-xs text-muted-foreground">{formatDate(selectedTicket.createdAt)}</p>
              </div>
              <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-bold ${status.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Descripción</p>
              <div className="bg-secondary/30 rounded-xl p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap border border-border">
                {selectedTicket.description}
              </div>
            </div>

            {/* Info box */}
            {selectedTicket.status === "open" && (
              <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                <Clock className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-yellow-400">En espera de respuesta</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Nuestro equipo revisará tu ticket y responderá en las próximas 24–48 horas.</p>
                </div>
              </div>
            )}
            {selectedTicket.status === "in_progress" && (
              <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-400">Siendo atendido</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Un miembro del equipo está trabajando en tu caso. Te contactaremos pronto.</p>
                </div>
              </div>
            )}
            {selectedTicket.status === "resolved" && (
              <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-green-400">Ticket resuelto</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Este ticket fue marcado como resuelto. Si el problema persiste, crea uno nuevo.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Create form view
  if (creating) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => setCreating(false)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Cancelar
        </button>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wide">Nuevo Ticket de Soporte</h2>
                <p className="text-[11px] text-muted-foreground">Describe tu problema y te ayudaremos lo antes posible.</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Categoría</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger className="h-10 bg-secondary/30 border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value} className="text-sm">
                      {c.icon} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Asunto</Label>
              <Input
                placeholder="Resume tu problema en pocas palabras..."
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="bg-secondary/30 border-border"
                maxLength={100}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{form.subject.length}/100 caracteres</p>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Descripción detallada</Label>
              <Textarea
                placeholder="Describe el problema con el mayor detalle posible: qué pasó, cuándo ocurrió, qué intentaste hacer..."
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={6}
                className="bg-secondary/30 border-border resize-none text-sm"
                maxLength={2000}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{form.description.length}/2000 caracteres</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-primary hover:bg-primary/80 text-white font-bold"
                disabled={!form.subject.trim() || !form.description.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate(form)}
              >
                {createMutation.isPending ? (
                  <><i className="fa-solid fa-spinner animate-spin mr-2"></i>Enviando...</>
                ) : (
                  <><Ticket className="w-4 h-4 mr-2" />Enviar Ticket</>
                )}
              </Button>
              <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-secondary/20 border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" /> Consejos para una respuesta más rápida
          </p>
          <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
            <li>Describe exactamente qué paso ocurría cuando tuvo el problema</li>
            <li>Menciona tu nombre de usuario en Habbo si aplica</li>
            <li>Si es un problema de SP, indica la cantidad y fecha aproximada</li>
            <li>Para errores técnicos, describe qué dispositivo/navegador usas</li>
          </ul>
        </div>
      </div>
    );
  }

  // Main list view
  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress");
  const closedTickets = tickets.filter(t => t.status === "resolved" || t.status === "closed");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0b0632] via-[#140b49] to-[#0b0632] border border-white/5 p-8">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Centro de Soporte</h1>
                <p className="text-[11px] text-white/50 uppercase tracking-wider">HabboSpeed Support</p>
              </div>
            </div>
            <p className="text-sm text-white/60 max-w-md">
              ¿Tienes un problema? Crea un ticket y nuestro equipo te ayudará en las próximas 24–48 horas.
            </p>
          </div>
          <Button
            onClick={() => setCreating(true)}
            className="bg-primary hover:bg-primary/80 text-white font-bold shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> Nuevo Ticket
          </Button>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Mis Tickets", value: tickets.length, color: "text-white" },
            { label: "Activos", value: openTickets.length, color: "text-yellow-400" },
            { label: "Resueltos", value: closedTickets.length, color: "text-green-400" },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active tickets */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/30 border border-border flex items-center justify-center mx-auto">
            <MessageSquareDashed className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">No tienes tickets aún</p>
            <p className="text-xs text-muted-foreground mt-1">¿Necesitas ayuda? Crea tu primer ticket de soporte.</p>
          </div>
          <Button onClick={() => setCreating(true)} className="bg-primary hover:bg-primary/80 text-white">
            <Plus className="w-4 h-4 mr-2" /> Crear primer ticket
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {openTickets.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-400" /> Tickets activos ({openTickets.length})
              </h2>
              {openTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} onClick={() => setSelectedTicket(ticket)} />)}
            </div>
          )}
          {closedTickets.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Tickets cerrados ({closedTickets.length})
              </h2>
              {closedTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} onClick={() => setSelectedTicket(ticket)} />)}
            </div>
          )}
        </div>
      )}

      {/* FAQ quick section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" /> Preguntas frecuentes
        </h3>
        <div className="space-y-3">
          {[
            { q: "¿Cuánto tarda en responderse un ticket?", a: "Normalmente respondemos en 24–48 horas. Los tickets urgentes (abuso, acceso) tienen prioridad." },
            { q: "¿Cómo gano más Speed Points?", a: "Participa en el chat, solicita canciones, asiste a eventos y usa las herramientas de la web." },
            { q: "¿Cómo recupero acceso a mi cuenta?", a: "Abre un ticket con categoría 'Cuenta / Acceso' y detalla el problema para que el equipo pueda ayudarte." },
            { q: "¿Dónde veo el estado de mi ticket?", a: "En esta misma página. Cada ticket muestra su estado actual: Abierto, En Progreso, Resuelto o Cerrado." },
          ].map((faq, i) => (
            <div key={i} className="border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
              <p className="text-xs font-bold text-white mb-1">{faq.q}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket, onClick }: { ticket: any; onClick: () => void }) {
  const status = STATUS_MAP[ticket.status] || STATUS_MAP["open"];
  const StatusIcon = status.icon;
  const cat = CATEGORIES.find(c => c.value === ticket.category) || CATEGORIES[0];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border hover:border-primary/40 rounded-xl p-4 transition-all hover:bg-card/80 group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 text-base group-hover:bg-primary/10 transition-colors">
            {cat.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-muted-foreground">#{ticket.id}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground">{cat.label}</span>
            </div>
            <p className="text-sm font-bold text-white truncate">{ticket.subject}</p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{ticket.description?.slice(0, 80)}...</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border font-bold ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          <span className="text-[10px] text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}</span>
        </div>
      </div>
    </button>
  );
}
