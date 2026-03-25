import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Plus, Pin, Lock, Eye, ArrowRight, ChevronDown, ChevronRight, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ForumCategory, ForumThread } from "@shared/schema";

function HabboAvatar({ username, size = "s" }: { username?: string | null; size?: "s" | "m" }) {
  if (!username) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }
  return (
    <img
      src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=${size}&headonly=1`}
      alt={username}
      className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 object-contain"
      onError={(e) => {
        const el = e.target as HTMLImageElement;
        el.style.display = "none";
        const parent = el.parentElement;
        if (parent) {
          const fb = document.createElement("div");
          fb.className = "w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary";
          fb.textContent = username.charAt(0).toUpperCase();
          parent.appendChild(fb);
        }
      }}
    />
  );
}

function ThreadList({ categoryId, categoryName }: { categoryId: number; categoryName: string }) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const { data: threads, isLoading } = useQuery<ForumThread[]>({
    queryKey: ["/api/forum/categories", categoryId, "threads"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/forum/categories/${categoryId}/threads`);
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; categoryId: number }) => {
      const res = await apiRequest("POST", "/api/forum/threads", data, token ? `Bearer ${token}` : undefined);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al crear hilo");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories", categoryId, "threads"] });
      toast({ title: "Hilo creado ✓" });
      setOpen(false);
      setForm({ title: "", content: "" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">{threads?.length || 0} hilos en esta categoría</p>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs gap-1" data-testid="button-new-thread">
                <Plus className="w-3 h-3" />Nuevo hilo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-sm">Nuevo hilo en {categoryName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Título</Label>
                  <Input className="mt-1" placeholder="Título del hilo..." value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} data-testid="input-thread-title" />
                </div>
                <div>
                  <Label className="text-xs">Contenido</Label>
                  <Textarea className="mt-1" placeholder="Escribe el contenido..." rows={5} value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} data-testid="input-thread-content" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/80 text-white text-xs" onClick={() => createMutation.mutate({ ...form, categoryId })} disabled={createMutation.isPending || !form.title.trim()} data-testid="button-submit-thread">
                  Crear hilo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
        : (threads || []).length === 0
          ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No hay hilos aún. ¡Sé el primero!</p>
            </div>
          )
          : (threads || []).map((thread) => (
            <Link href={`/forum/${thread.id}`} key={thread.id}>
              <a className="block group" data-testid={`link-thread-${thread.id}`}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/20 hover:bg-secondary/50 border border-border/40 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {thread.isPinned && <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                    {thread.isLocked && <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                    <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">{thread.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-shrink-0">
                    <span className="hidden sm:flex items-center gap-1"><Eye className="w-3 h-3" />{thread.views}</span>
                    <span className="hidden sm:block">{thread.authorName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </a>
            </Link>
          ))
      }
    </div>
  );
}

export default function ForumPage() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const { data: categories, isLoading } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Foro</h1>
          <p className="text-xs text-muted-foreground">Discute, comparte y conecta con la comunidad</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          ))
          : (categories || []).map((cat) => {
            const isOpen = expandedCategory === cat.id;
            return (
              <div
                key={cat.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen ? "border-primary/40 bg-card shadow-lg shadow-primary/5" : "border-border bg-card/60 hover:border-border/80"
                }`}
                data-testid={`card-category-${cat.id}`}
              >
                {/* Category header */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left group"
                  onClick={() => setExpandedCategory(isOpen ? null : cat.id)}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isOpen ? "bg-primary/20" : "bg-secondary/50 group-hover:bg-primary/10"
                  }`}>
                    <MessageCircle className={`w-4 h-4 transition-colors ${isOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold transition-colors ${isOpen ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                      {cat.name}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-primary" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    }
                  </div>
                </button>

                {/* Threads accordion */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border/40 pt-4">
                    <ThreadList categoryId={cat.id} categoryName={cat.name} />
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {!isLoading && (!categories || categories.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">El foro aún no tiene categorías</p>
          <p className="text-xs mt-1">Un administrador debe crearlas desde el panel</p>
        </div>
      )}
    </div>
  );
}
