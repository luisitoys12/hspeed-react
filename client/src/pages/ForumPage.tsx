import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageCircle,
  Plus,
  Pin,
  Lock,
  Eye,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ForumCategory, ForumThread } from "@shared/schema";
import PageContainer from "@/components/PageContainer";
import PageHeaderCard from "@/components/PageHeaderCard";

function ThreadList({
  categoryId,
  categoryName,
}: {
  categoryId: number;
  categoryName: string;
}) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const { data: threads, isLoading } = useQuery<ForumThread[]>({
    queryKey: ["/api/forum/categories", categoryId, "threads"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/forum/categories/${categoryId}/threads`,
      );
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      categoryId: number;
    }) => {
      const res = await apiRequest(
        "POST",
        "/api/forum/threads",
        data,
        token ? `Bearer ${token}` : undefined,
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al crear hilo");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/forum/categories", categoryId, "threads"],
      });
      toast({ title: "Hilo creado correctamente" });
      setOpen(false);
      setForm({ title: "", content: "" });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {threads?.length || 0} hilos en esta categoría
        </p>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1"
                data-testid="button-new-thread"
              >
                <Plus className="w-3 h-3" />
                Nuevo hilo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-sm font-black">
                  Nuevo hilo en {categoryName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-bold">Título</Label>
                  <Input
                    className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    placeholder="Título del hilo..."
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    data-testid="input-thread-title"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold">Contenido</Label>
                  <Textarea
                    className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    placeholder="Escribe el contenido..."
                    rows={5}
                    value={form.content}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, content: e.target.value }))
                    }
                    data-testid="input-thread-content"
                  />
                </div>
                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs"
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

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))
      ) : (threads || []).length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-xs font-bold">
            No hay hilos aún. ¡Sé el primero en iniciar un debate!
          </p>
        </div>
      ) : (
        (threads || []).map((thread) => (
          <Link href={`/forum/${thread.id}`} key={thread.id}>
            <div
              className="block group"
              data-testid={`link-thread-${thread.id}`}
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-cyan-400 transition-all">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {thread.isPinned && (
                    <Pin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  )}
                  {thread.isLocked && (
                    <Lock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-500 transition-colors truncate">
                    {thread.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-shrink-0">
                  <span className="hidden sm:flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {thread.views}
                  </span>
                  <span className="hidden sm:block font-bold text-slate-600 dark:text-slate-300">{thread.authorName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

export default function ForumPage() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const { data: categories, isLoading } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  return (
    <PageContainer>
      {/* Header Card */}
      <PageHeaderCard
        title="Cihabbo Foro"
        kicker="Comunidad HabboSpeed"
        subtitle="Discute, comparte trucos, presenta tus salas y conecta con la comunidad del hotel."
        icon={<MessageCircle className="w-5 h-5 text-teal-400" />}
      />

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2"
              >
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            ))
          : (categories || []).map((cat) => {
              const isOpen = expandedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`rounded-2xl border transition-all overflow-hidden shadow-xs ${
                    isOpen
                      ? "border-cyan-400 bg-white dark:bg-slate-900 shadow-cyan-500/5"
                      : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-400/60"
                  }`}
                  data-testid={`card-category-${cat.id}`}
                >
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 text-left group"
                    onClick={() => setExpandedCategory(isOpen ? null : cat.id)}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isOpen
                          ? "bg-cyan-500 text-black font-black"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-cyan-500"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-black transition-colors ${isOpen ? "text-cyan-500" : "text-slate-900 dark:text-slate-100 group-hover:text-cyan-500"}`}
                      >
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-cyan-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                      )}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                      <ThreadList categoryId={cat.id} categoryName={cat.name} />
                    </div>
                  )}
                </div>
              );
            })}
      </div>

      {!isLoading && (!categories || categories.length === 0) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-center py-20 text-slate-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold">El foro aún no tiene categorías</p>
          <p className="text-xs mt-1">
            Un administrador debe crearlas desde el panel administrativo
          </p>
        </div>
      )}
    </PageContainer>
  );
}
