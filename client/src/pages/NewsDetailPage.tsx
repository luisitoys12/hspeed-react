import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageSquare, Send, User } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { News, Comment } from "@shared/schema";

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
      const res = await apiRequest("POST", "/api/comments", { articleId: parseInt(id!), content }, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments/article", id] });
      toast({ title: "Comentario publicado" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "No se pudo publicar el comentario.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
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
      {/* Back link */}
      <Link href="/news">
        <a className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-back-news">
          <ArrowLeft className="w-4 h-4" />
          Volver a Noticias
        </a>
      </Link>

      {/* Article */}
      <article>
        {article.imageUrl && (
          <div className="h-64 rounded-xl overflow-hidden mb-6">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-[9px] border-primary/30 text-primary/80">{article.category}</Badge>
          <span className="text-xs text-muted-foreground">{article.date}</span>
        </div>

        <h1 className="text-xl font-bold mb-3" data-testid="text-news-title">{article.title}</h1>
        <p className="text-sm text-muted-foreground italic mb-6 border-l-2 border-primary/30 pl-4">{article.summary}</p>

        <div className="prose prose-invert prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </article>

      {/* Comments Section */}
      <div className="border-t border-border pt-6">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-primary" />
          Comentarios ({comments?.length || 0})
        </h2>

        {/* Comment form */}
        {user ? (
          <div className="bg-card/50 rounded-lg p-4 border border-border mb-4 space-y-3">
            <div className="flex items-center gap-2">
              {user.habboUsername ? (
                <img
                  src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${user.habboUsername}&size=s&headonly=1`}
                  alt={user.displayName}
                  className="w-7 h-7 rounded bg-secondary"
                />
              ) : (
                <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
              <span className="text-xs font-medium">{user.displayName}</span>
            </div>
            <Textarea
              placeholder="Escribe tu comentario..."
              className="text-sm resize-none"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              data-testid="input-comment"
            />
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/80 text-white text-xs"
              onClick={() => comment.trim() && commentMutation.mutate(comment)}
              disabled={commentMutation.isPending || !comment.trim()}
              data-testid="button-submit-comment"
            >
              <Send className="w-3 h-3 mr-1.5" />
              Comentar
            </Button>
          </div>
        ) : (
          <div className="bg-card/50 rounded-lg p-4 border border-border mb-4 text-center">
            <p className="text-sm text-muted-foreground">
              <Link href="/login"><a className="text-primary hover:underline">Inicia sesión</a></Link> para comentar
            </p>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-3">
          {(comments || []).map((c) => (
            <Card key={c.id} className="bg-card border-border" data-testid={`card-comment-${c.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium">{c.authorName}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("es-ES") : ""}
                  </span>
                </div>
                <p className="text-sm text-foreground/80">{c.content}</p>
              </CardContent>
            </Card>
          ))}
          {(!comments || comments.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">Sé el primero en comentar</p>
          )}
        </div>
      </div>
    </div>
  );
}
