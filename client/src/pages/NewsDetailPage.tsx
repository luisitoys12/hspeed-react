import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageSquare, Send, User } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { News, Comment } from "@shared/schema";

function HabboHeadAvatar({ username, displayName }: { username?: string | null; displayName: string }) {
  const initial = displayName.charAt(0).toUpperCase();
  if (!username) {
    return (
      <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
        {initial}
      </div>
    );
  }
  return (
    <div className="relative flex-shrink-0">
      <img
        src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=s&headonly=1`}
        alt={displayName}
        className="w-9 h-9 rounded-xl bg-secondary object-contain"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = "none";
          const fb = el.nextSibling as HTMLElement;
          if (fb) fb.style.display = "flex";
        }}
      />
      <div
        className="w-9 h-9 rounded-xl bg-primary/20 items-center justify-center text-primary text-sm font-bold absolute inset-0"
        style={{ display: "none" }}
      >
        {initial}
      </div>
    </div>
  );
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  const { data: article, isLoading } = useQuery<News>({
    queryKey: ["/api/news", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/news/${id}`);
      return res.json();
    },
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/comments/article", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/comments/article/${id}`);
      return res.json();
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST", "/api/comments",
        { articleId: parseInt(id!), content },
        token ? `Bearer ${token}` : undefined
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al comentar");
      return data;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments/article", id] });
      toast({ title: "Comentario publicado ✓" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Noticia no encontrada</p>
        <Link href="/news"><a className="text-primary text-sm mt-2 inline-block">← Volver a Noticias</a></Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/news">
        <a className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-back-news">
          <ArrowLeft className="w-4 h-4" />Volver a Noticias
        </a>
      </Link>

      {/* Article */}
      <article className="space-y-5">
        {article.imageUrl && (
          <div className="h-64 rounded-2xl overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-primary/30 text-primary/80">{article.category}</Badge>
          <span className="text-xs text-muted-foreground">{article.date}</span>
        </div>
        <h1 className="text-2xl font-bold leading-tight" data-testid="text-news-title">{article.title}</h1>
        <p className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-4 leading-relaxed">{article.summary}</p>
        <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{article.content}</div>
      </article>

      {/* Comments Section */}
      <div className="border-t border-border pt-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Comentarios ({comments?.length || 0})
        </h2>

        {/* Comment box */}
        {user ? (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <HabboHeadAvatar username={user.habboUsername} displayName={user.displayName} />
              <div>
                <p className="text-xs font-semibold">{user.displayName}</p>
                {user.habboUsername && <p className="text-[10px] text-muted-foreground">@{user.habboUsername}</p>}
              </div>
            </div>
            <Textarea
              placeholder="Escribe tu comentario..."
              className="resize-none text-sm"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              data-testid="input-comment"
            />
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/80 text-white text-xs gap-1.5"
              onClick={() => comment.trim() && commentMutation.mutate(comment)}
              disabled={commentMutation.isPending || !comment.trim()}
              data-testid="button-submit-comment"
            >
              <Send className="w-3 h-3" />Comentar
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/50 p-5 text-center">
            <p className="text-sm text-muted-foreground">
              <Link href="/login"><a className="text-primary hover:underline">Inicia sesión</a></Link> para comentar
            </p>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-3">
          {(comments || []).map((c: any) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-4"
              data-testid={`card-comment-${c.id}`}
            >
              <div className="flex items-start gap-3">
                <HabboHeadAvatar username={c.habboUsername} displayName={c.authorName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-xs font-semibold">{c.authorName}</span>
                      {c.habboUsername && (
                        <span className="text-[10px] text-muted-foreground ml-1.5">@{c.habboUsername}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("es-ES") : ""}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{c.content}</p>
                </div>
              </div>
            </div>
          ))}
          {(!comments || comments.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Sé el primero en comentar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
