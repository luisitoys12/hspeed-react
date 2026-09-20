import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { proxyImage, proxyImagesInHtml } from "@/lib/habboProxy";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageSquare, Send, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SEOMeta } from "@/components/SEOMeta";
import PageContainer from "@/components/PageContainer";
import type { News, Comment } from "@shared/schema";

function HabboHeadAvatar({
  username,
  displayName,
}: {
  username?: string | null;
  displayName: string;
}) {
  const initial = displayName.charAt(0).toUpperCase();
  if (!username) {
    return (
      <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
        {initial}
      </div>
    );
  }
  return (
    <img
      src={proxyImage(
        `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=s&headonly=1`,
      )}
      alt={displayName}
      className="w-9 h-9 rounded-xl bg-secondary object-contain flex-shrink-0"
      onError={(e) => {
        const el = e.target as HTMLImageElement;
        el.style.display = "none";
        const fb = document.createElement("div");
        fb.className =
          "w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0";
        fb.textContent = initial;
        el.parentNode?.replaceChild(fb, el);
      }}
    />
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
        "POST",
        "/api/comments",
        { articleId: parseInt(id!), content },
        token ? `Bearer ${token}` : undefined,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al comentar");
      return data;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({
        queryKey: ["/api/comments/article", id],
      });
      toast({ title: "Comentario publicado ✓" });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
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
        <Link href="/news" className="text-primary text-sm mt-2 inline-block">
          ← Volver a Noticias
        </Link>
      </div>
    );
  }

  const isFeatured = (article as any).featured;

  const reactionsCount = article.reactions
    ? Object.values(article.reactions as Record<string, number>).reduce(
        (a: number, b: number) => a + b,
        0,
      )
    : 0;
  const tags = [article.category, "Habbo", "HabboSpeed", "Fansite"];

  return (
    <>
      <SEOMeta
        title={article.title}
        description={article.summary}
        image={article.imageUrl}
        type="article"
        publishedTime={
          article.createdAt
            ? new Date(article.createdAt).toISOString()
            : article.date
        }
        author={(article as any).authorName || "HabboSpeed"}
        section={article.category}
        tags={tags}
      />
      <PageContainer>
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline transition-colors"
          data-testid="link-back-news"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Noticias
        </Link>

        <article className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
          {/* Hero image */}
          {article.imageUrl && (
            <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800">
              <img
                src={proxyImage(article.imageUrl)}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {isFeatured && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-400 text-black text-[10px] font-black px-2.5 py-1 rounded-md shadow">
                  <Star className="w-3 h-3" /> Destacada
                </div>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded">
              {article.category}
            </span>
            <span className="text-xs text-slate-400">
              {article.date}
            </span>
            {isFeatured && !article.imageUrl && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                <Star className="w-3 h-3" /> Destacada
              </span>
            )}
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight"
            data-testid="text-news-title"
          >
            {article.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 italic border-l-4 border-cyan-400 pl-4 leading-relaxed bg-slate-50 dark:bg-slate-800/40 py-2 rounded-r-xl">
            {article.summary}
          </p>

          {/* Rich content */}
          {article.content &&
            ((article.content as string).includes("<") ? (
              <div
                className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2
                [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1.5
                [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                [&_li]:mb-1 [&_strong]:text-slate-900 dark:[&_strong]:text-white
                [&_em]:text-slate-600 dark:[&_em]:text-slate-400 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-800 [&_hr]:my-4
                [&_img]:rounded-xl [&_img]:my-4 [&_img]:max-w-full
                [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500"
                dangerouslySetInnerHTML={{
                  __html: proxyImagesInHtml(article.content as string),
                }}
              />
            ) : (
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            ))}
        </article>

        {/* Comments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center text-xs font-black">
              <MessageSquare className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Comentarios ({comments?.length || 0})
            </h2>
          </div>

          {user ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <HabboHeadAvatar
                  username={user.habboUsername}
                  displayName={user.displayName}
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.displayName}</p>
                  {user.habboUsername && (
                    <p className="text-[10px] text-slate-400">
                      @{user.habboUsername}
                    </p>
                  )}
                </div>
              </div>
              <Textarea
                placeholder="Escribe tu comentario..."
                className="resize-none text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                data-testid="input-comment"
              />
              <Button
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5"
                onClick={() =>
                  comment.trim() && commentMutation.mutate(comment)
                }
                disabled={commentMutation.isPending || !comment.trim()}
                data-testid="button-submit-comment"
              >
                <Send className="w-3 h-3" />
                Comentar
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-5 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <Link href="/login" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">
                  Inicia sesión
                </Link>{" "}
                para comentar
              </p>
            </div>
          )}

          <div className="space-y-3">
            {(comments || []).map((c: any) => (
              <div
                key={c.id}
                className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 p-3.5"
                data-testid={`card-comment-${c.id}`}
              >
                <div className="flex items-start gap-3">
                  <HabboHeadAvatar
                    username={c.habboUsername}
                    displayName={c.authorName}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {c.authorName}
                        </span>
                        {c.habboUsername && (
                          <span className="text-[10px] text-slate-400 ml-1.5">
                            @{c.habboUsername}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString("es-ES")
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!comments || comments.length === 0) && (
              <div className="text-center py-8 text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold">Sé el primero en comentar</p>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
