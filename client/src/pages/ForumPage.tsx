import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Plus, Pin, Lock, Eye, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ForumCategory, ForumThread } from "@shared/schema";

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
      toast({ title: "Hilo creado" });
      setOpen(false);
      setForm({ title: "", content: "" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{threads?.length || 0} hilos</p>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10" data-testid="button-new-thread">
                <Plus className="w-3 h-3 mr-1" />Nuevo hilo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-sm">Nuevo hilo en {categoryName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Título</Label>
                  <Input
                    className="mt-1"
                    placeholder="Título del hilo..."
                    value={form.title}
                    onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    data-testid="input-thread-title"
                  />
                </div>
                <div>
                  <Label className="text-xs">Contenido</Label>
                  <Textarea
                    className="mt-1"
                    placeholder="Escribe el contenido..."
                    rows={5}
                    value={form.content}
                    onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
                    data-testid="input-thread-content"
                  />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
                  onClick={() => createMutation.mutate({ ...form, categoryId })}
                  disabled={createMutation.isPending || !form.title.trim()}
                  data-testid="button-submit-thread"
                >
                  Crear hilo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)
        : (threads || []).length === 0
          ? <p className="text-xs text-muted-foreground py-3 text-center">No hay hilos aún. ¡Sé el primero!</p>
          : (threads || []).map((thread) => (
              <Link href={`/forum/${thread.id}`} key={thread.id}>
                <a className="block group" data-testid={`link-thread-${thread.id}`}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/60 border border-border/50 hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {thread.isPinned && <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                      {thread.isLocked && <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                      <span className="text-sm group-hover:text-primary transition-colors truncate">{thread.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-shrink-0">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{thread.authorName}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{thread.views}</span>
                      <ArrowRight className="w-3 h-3 text-primary/40" />
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
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Foro</h1>
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader><Skeleton className="h-4 w-48" /></CardHeader>
                <CardContent className="space-y-2"><Skeleton className="h-3 w-full" /></CardContent>
              </Card>
            ))
          : (categories || []).map((cat) => (
              <Card
                key={cat.id}
                className={`bg-card border transition-all ${expandedCategory === cat.id ? "border-primary/30 glow-purple" : "border-border hover:border-border/60"}`}
                data-testid={`card-category-${cat.id}`}
              >
                <CardHeader
                  className="cursor-pointer py-3 px-4"
                  onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                >
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      {cat.name}
                    </div>
                    <Badge variant="outline" className="text-[9px] border-border">
                      {expandedCategory === cat.id ? "−" : "+"}
                    </Badge>
                  </CardTitle>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                  )}
                </CardHeader>
                {expandedCategory === cat.id && (
                  <CardContent className="pt-0 px-4 pb-4">
                    <ThreadList categoryId={cat.id} categoryName={cat.name} />
                  </CardContent>
                )}
              </Card>
            ))}
      </div>

      {!isLoading && (!categories || categories.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">El foro aún no tiene categorías</p>
        </div>
      )}
    </div>
  );
}
