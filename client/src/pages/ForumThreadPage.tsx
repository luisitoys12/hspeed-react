import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { proxyImage } from "@/lib/habboProxy";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Send,
  Lock,
  Pin,
  Eye,
  User,
  MessageCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ForumThread, ForumPost } from "@shared/schema";
import PageContainer from "@/components/PageContainer";

function HabboAvatar({
  username,
  displayName,
  isOP = false,
}: {
  username?: string | null;
  displayName: string;
  isOP?: boolean;
}) {
  const initial = displayName.charAt(0).toUpperCase();
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      {username ? (
        <img
          src={proxyImage(
            `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=s&headonly=1`,
          )}
          alt={displayName}
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 object-contain border border-slate-200 dark:border-slate-700"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            const fb = document.createElement("div");
            fb.className =
              "w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center text-sm font-bold";
            fb.textContent = initial;
            el.parentNode?.replaceChild(fb, el);
          }}
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center text-sm font-bold">
          {initial}
        </div>
      )}
      {isOP && (
        <Badge
          variant="outline"
          className="text-[8px] border-cyan-500/30 text-cyan-500 px-1 py-0"
        >
          OP
        </Badge>
      )}
    </div>
  );
}

export default function ForumThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [reply, setReply] = useState("");

  const { data: thread, isLoading: threadLoading } = useQuery<ForumThread>({
    queryKey: ["/api/forum/threads", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/forum/threads/${id}`);
      return res.json();
    },
  });

  const { data: posts, isLoading: postsLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum/threads", id, "posts"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/forum/threads/${id}/posts`);
      return res.json();
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST",
        `/api/forum/threads/${id}/posts`,
        { content },
        token ? `Bearer ${token}` : undefined,
      );
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Error al publicar respuesta");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/forum/threads", id, "posts"],
      });
      toast({ title: "Respuesta publicada \u2713" });
      setReply("");
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  if (threadLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </PageContainer>
    );
  }

  if (!thread) {
    return (
      <PageContainer>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-slate-500 font-bold">Hilo no encontrado</p>
          <Link href="/forum" className="text-cyan-500 font-black text-sm mt-2 inline-block hover:underline">
            ← Volver al Foro
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link
        href="/forum"
        className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline transition-colors"
        data-testid="link-back-forum"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Foro
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {thread.isPinned && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] font-bold">
              <Pin className="w-2.5 h-2.5 mr-1" />
              Fijado
            </Badge>
          )}
          {thread.isLocked && (
            <Badge
              variant="outline"
              className="text-[9px] border-slate-200 dark:border-slate-700 text-slate-400 font-bold"
            >
              <Lock className="w-2.5 h-2.5 mr-1" />
              Cerrado
            </Badge>
          )}
        </div>
        <h1
          className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight"
          data-testid="text-thread-title"
        >
          {thread.title}
        </h1>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
            <User className="w-3 h-3" />
            {thread.authorName}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3 h-3" />
            {thread.views} vistas
          </span>
          {thread.createdAt && (
            <span>
              {new Date(thread.createdAt).toLocaleDateString("es-ES")}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {postsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))
          : (posts || []).map((post, index) => (
              <div
                key={post.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-xs ${
                  index === 0
                    ? "border-cyan-400/50 dark:border-cyan-500/30"
                    : "border-slate-200/90 dark:border-slate-800"
                }`}
                data-testid={`card-post-${post.id}`}
              >
                <div className="flex items-start gap-3">
                  <HabboAvatar
                    username={(post as any).habboUsername}
                    displayName={post.authorName}
                    isOP={index === 0}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {post.authorName}
                        </span>
                        {index === 0 && (
                          <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-1 rounded">
                            (Autor)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString("es-ES")
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        {!postsLoading && (!posts || posts.length === 0) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-center py-8 text-slate-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-bold">Aún no hay respuestas</p>
          </div>
        )}
      </div>

      {!thread.isLocked ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {user.habboUsername ? (
                  <img
                    src={proxyImage(
                      `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(user.habboUsername)}&size=s&headonly=1`,
                    )}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.displayName}</span>
              </div>
              <Textarea
                placeholder="Escribe tu respuesta..."
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                data-testid="input-post-reply"
              />
              <Button
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs gap-1.5"
                onClick={() => reply.trim() && replyMutation.mutate(reply)}
                disabled={replyMutation.isPending || !reply.trim()}
                data-testid="button-submit-reply"
              >
                <Send className="w-3.5 h-3.5" />
                Publicar respuesta
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <Link href="/login" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">
                  Inicia sesión
                </Link>{" "}
                para responder
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-slate-400 text-sm rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 font-bold">
          <Lock className="w-4 h-4" />
          Este hilo está cerrado para nuevas respuestas
        </div>
      )}
    </PageContainer>
  );
}
