import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Newspaper, Calendar, Clock, Users, Shield, Plus, Trash2, Edit, Palette, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@shared/schema";

const SECTIONS = [
  { id: "themes", label: "Temáticas", icon: Palette },
  { id: "news", label: "Noticias", icon: Newspaper },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "schedule", label: "Horarios", icon: Clock },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "config", label: "Configuración", icon: Settings },
];

// ============ THEMES ADMIN ============
function ThemesAdmin() {
  const { theme: activeTheme, themes, setActiveTheme, isSettingTheme } = useTheme();
  const { toast } = useToast();

  const handleSetTheme = (slug: string) => {
    setActiveTheme(slug);
    toast({ title: "Temática cambiada", description: `Tema activo: ${slug}` });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold mb-1">Temática Activa</h2>
        <p className="text-xs text-muted-foreground">Selecciona una temática y todo el sitio cambiará de colores, decoraciones y efectos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {themes.map((t: Theme) => {
          const colors = t.colors as any;
          const decorations = t.decorations as any;
          const isActive = activeTheme?.slug === t.slug;

          return (
            <button
              key={t.id}
              onClick={() => handleSetTheme(t.slug)}
              disabled={isSettingTheme}
              className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                isActive
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
              data-testid={`button-theme-${t.slug}`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* Color preview bar */}
              <div className="flex gap-1 mb-3">
                <div className="h-6 flex-1 rounded" style={{ background: colors?.gradientFrom || "#7c3aed" }} />
                <div className="h-6 flex-1 rounded" style={{ background: colors?.gradientTo || "#3b82f6" }} />
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{decorations?.emoji || "⚡"}</span>
                <span className="text-sm font-semibold">{t.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t.description}</p>
              
              {/* Decoration preview */}
              {decorations?.accentEmojis && (
                <div className="flex gap-1 mt-2">
                  {(decorations.accentEmojis as string[]).map((e: string, i: number) => (
                    <span key={i} className="text-xs opacity-50">{e}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {activeTheme && (
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Vista previa de colores</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries((activeTheme.colors as any) || {}).map(([key, value]) => {
              if (typeof value !== 'string') return null;
              const isHSL = /^\d/.test(value);
              return (
                <div key={key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div
                    className="w-4 h-4 rounded border border-border flex-shrink-0"
                    style={{ background: isHSL ? `hsl(${value})` : value }}
                  />
                  {key}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ NEWS ADMIN ============
function NewsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", content: "", imageUrl: "", category: "General", date: new Date().toISOString().split("T")[0] });

  const { data: news } = useQuery<any[]>({ queryKey: ["/api/news"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/news", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al crear noticia");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setOpen(false);
      setForm({ title: "", summary: "", content: "", imageUrl: "", category: "General", date: new Date().toISOString().split("T")[0] });
      toast({ title: "Noticia creada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/news/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Noticia eliminada" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Gestión de Noticias ({news?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-new-news">
              <Plus className="w-3 h-3 mr-1" />Nueva Noticia
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader><DialogTitle className="text-sm">Nueva Noticia</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Título</Label><Input className="mt-1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} data-testid="input-news-title" /></div>
              <div><Label className="text-xs">Resumen</Label><Textarea className="mt-1 resize-none" rows={2} value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} /></div>
              <div><Label className="text-xs">Contenido</Label><Textarea className="mt-1" rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Categoría</Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["General", "Actualización", "Evento", "Comunidad", "Radio"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Fecha</Label><Input className="mt-1" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">URL de imagen</Label><Input className="mt-1" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} /></div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title} data-testid="button-submit-news">Crear Noticia</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {(news || []).map(item => (
          <div key={item.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-border">
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[9px] border-border">{item.category}</Badge>
                <span className="text-[10px] text-muted-foreground">{item.date}</span>
              </div>
            </div>
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              onClick={() => deleteMutation.mutate(item.id)}
              data-testid={`button-delete-news-${item.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ EVENTS ADMIN ============
function EventsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", server: "es", date: "", time: "", roomName: "", roomOwner: "", host: "", imageUrl: "", imageHint: "" });
  const { data: events } = useQuery<any[]>({ queryKey: ["/api/events"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/events", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al crear evento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setOpen(false);
      toast({ title: "Evento creado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/events/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Evento eliminado" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Gestión de Eventos ({events?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-new-event"><Plus className="w-3 h-3 mr-1" />Nuevo Evento</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader><DialogTitle className="text-sm">Nuevo Evento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Título</Label><Input className="mt-1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Fecha</Label><Input className="mt-1" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                <div><Label className="text-xs">Hora</Label><Input className="mt-1" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Nombre Sala</Label><Input className="mt-1" value={form.roomName} onChange={e => setForm(p => ({ ...p, roomName: e.target.value }))} /></div>
                <div><Label className="text-xs">Dueño Sala</Label><Input className="mt-1" value={form.roomOwner} onChange={e => setForm(p => ({ ...p, roomOwner: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Anfitrión</Label><Input className="mt-1" value={form.host} onChange={e => setForm(p => ({ ...p, host: e.target.value }))} /></div>
                <div><Label className="text-xs">Servidor</Label>
                  <Select value={form.server} onValueChange={v => setForm(p => ({ ...p, server: v }))}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["es","com","com.br","de","fr"].map(s => <SelectItem key={s} value={s}>.{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">URL Imagen</Label><Input className="mt-1" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} /></div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title} data-testid="button-submit-event">Crear Evento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {(events || []).map(item => (
          <div key={item.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-border">
            <div>
              <p className="text-sm">{item.title}</p>
              <p className="text-[10px] text-muted-foreground">{item.date} · {item.time} · Sala: {item.roomName}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(item.id)} data-testid={`button-delete-event-${item.id}`}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ SCHEDULE ADMIN ============
function ScheduleAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ day: "Lunes", startTime: "", endTime: "", showName: "", djName: "" });
  const { data: schedule } = useQuery<any[]>({ queryKey: ["/api/schedule"] });

  const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/schedule", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedule"] }); setOpen(false); toast({ title: "Horario creado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/schedule/${id}`, undefined, token ? `Bearer ${token}` : undefined); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/schedule"] }); toast({ title: "Horario eliminado" }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Horarios ({schedule?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" data-testid="button-new-schedule"><Plus className="w-3 h-3 mr-1" />Nuevo Horario</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="text-sm">Nuevo Horario</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Día</Label>
                <Select value={form.day} onValueChange={v => setForm(p => ({ ...p, day: v }))}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Inicio</Label><Input className="mt-1" type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} /></div>
                <div><Label className="text-xs">Fin</Label><Input className="mt-1" type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Nombre del programa</Label><Input className="mt-1" value={form.showName} onChange={e => setForm(p => ({ ...p, showName: e.target.value }))} /></div>
              <div><Label className="text-xs">DJ</Label><Input className="mt-1" value={form.djName} onChange={e => setForm(p => ({ ...p, djName: e.target.value }))} /></div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} data-testid="button-submit-schedule">Crear</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {(schedule || []).map(item => (
          <div key={item.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 border border-border">
            <div>
              <p className="text-sm">{item.showName} — {item.djName}</p>
              <p className="text-[10px] text-muted-foreground">{item.day} · {item.startTime} – {item.endTime}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(item.id)} data-testid={`button-delete-schedule-${item.id}`}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ USERS ADMIN ============
function UsersAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/users"] }); toast({ title: "Usuario actualizado" }); },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">Usuarios ({users?.length || 0})</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-xs">Usuario</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Rol</TableHead>
              <TableHead className="text-xs">Estado</TableHead>
              <TableHead className="text-xs">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(users || []).map(u => (
              <TableRow key={u.id} className="border-border">
                <TableCell className="text-xs">{u.displayName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={v => updateMutation.mutate({ id: u.id, data: { role: v } })}>
                    <SelectTrigger className="h-7 text-[11px] w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["admin", "dj", "user", "pending"].map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[9px] ${u.approved ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"}`}>
                    {u.approved ? "Aprobado" : "Pendiente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!u.approved && (
                    <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => updateMutation.mutate({ id: u.id, data: { approved: true } })} data-testid={`button-approve-user-${u.id}`}>
                      Aprobar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============ CONFIG ADMIN ============
function ConfigAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data: config } = useQuery<any>({ queryKey: ["/api/config"] });
  const [form, setForm] = useState({ radioService: "azuracast", apiUrl: "", listenUrl: "" });
  const [loaded, setLoaded] = useState(false);

  if (config && !loaded) {
    setForm({ radioService: config.radioService || "azuracast", apiUrl: config.apiUrl || "", listenUrl: config.listenUrl || "" });
    setLoaded(true);
  }

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/config", data, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/config"] }); toast({ title: "Configuración guardada" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-sm font-semibold">Configuración del Sistema</h2>
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Servicio de Radio</Label>
          <Select value={form.radioService} onValueChange={v => setForm(p => ({ ...p, radioService: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="azuracast">AzuraCast</SelectItem>
              <SelectItem value="shoutcast">SHOUTcast</SelectItem>
              <SelectItem value="icecast">Icecast</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">URL de la API Now Playing</Label>
          <Input placeholder="https://radio.example.com/api/nowplaying/station" value={form.apiUrl} onChange={e => setForm(p => ({ ...p, apiUrl: e.target.value }))} data-testid="input-config-api-url" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">URL de escucha (stream)</Label>
          <Input placeholder="https://radio.example.com/listen/station/radio.mp3" value={form.listenUrl} onChange={e => setForm(p => ({ ...p, listenUrl: e.target.value }))} data-testid="input-config-listen-url" />
        </div>
        <Button className="bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} data-testid="button-save-config">
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}

// ============ MAIN PANEL ============
export default function AdminPanel() {
  const { section } = useParams<{ section?: string }>();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(section || "themes");

  if (!user || !isAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4 text-center">
        <Shield className="w-14 h-14 text-muted-foreground/30" />
        <h2 className="text-lg font-bold">Acceso restringido</h2>
        <p className="text-sm text-muted-foreground">Necesitas permisos de administrador</p>
        <Link href="/login">
          <a className="text-primary text-sm hover:underline">Iniciar sesión</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Panel de Administración</h1>
        <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[9px]">ADMIN</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 border border-border h-auto flex-wrap gap-0.5">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white" data-testid={`tab-admin-${id}`}>
              <Icon className="w-3 h-3" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="themes">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><ThemesAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="news">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><NewsAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="events">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><EventsAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><ScheduleAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><UsersAdmin /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="config">
          <Card className="bg-card border-border">
            <CardContent className="p-5"><ConfigAdmin /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
