import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Lock, Pin, Eye, User, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ForumThread, ForumPost } from "@shared/schema";

function HabboAvatar({ username, displayName, isOP = false }: { username?: string | null; displayName: string; isOP?: boolean }) {
  const initial = displayName.charAt(0).toUpperCase();
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      {username ? (
        <img
          src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=s&headonly=1`}
          alt={displayName}
          className="w-10 h-10 rounded-xl bg-secondary object-contain"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            const fb = document.createElement("div");
            fb.className = "w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-sm font-bold";
            fb.textContent = initial;
            el.parentNode?.replaceChild(fb, el);
          }}
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
          {initial}
        </div>
      )}
      {isOP && (
        <Badge variant="outline" className="text-[8px] border-primary/30 text-primary/80 px-1 py-0">OP</Badge>
      )}
    </div>
  );
}

export default function ForumThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [reply, setReply] = useState("");

  const { data: thread, isLoading: threadLoading } = useQuery<ForumThread>({
    queryKey: ["/api/forum/threads", threadId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/forum/threads/${threadId}`);
      return res.json();
    },
  });

  const { data: posts, isLoading: postsLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum/threads", threadId, "posts"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/forum/threads/${threadId}/posts`);
      return res.json();
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST", "/api/forum/posts",
        { threadId: parseInt(threadId!), content },
        token ? `Bearer ${token}` : undefined
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al responder");
      return data;
    },
    onSuccess: () => {
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads", threadId, "posts"] });
      toast({ title: "Respuesta publicada \u2713" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (threadLoading) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-3/4" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Hilo no encontrado</p>
        <Link href="/forum"><a className="text-primary text-sm mt-2 inline-block">\u2190 Volver al Foro</a></Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <Link href="/forum">
        <a className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-back-forum">
          <ArrowLeft className="w-4 h-4" />Volver al Foro
        </a>
      </Link>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {thread.isPinned && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px]"><Pin className="w-2.5 h-2.5 mr-1" />Fijado</Badge>}
          {thread.isLocked && <Badge variant="outline" className="text-[9px] border-border text-muted-foreground"><Lock className="w-2.5 h-2.5 mr-1" />Cerrado</Badge>}
        </div>
        <h1 className="text-xl font-bold leading-tight" data-testid="text-thread-title">{thread.title}</h1>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><User className="w-3 h-3" />{thread.authorName}</span>
          <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" />{thread.views} vistas</span>
          {thread.createdAt && <span>{new Date(thread.createdAt).toLocaleDateString("es-ES")}</span>}
        </div>
      </div>

      <div className="space-y-3">
        {postsLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : (posts || []).map((post, index) => (
            <div
              key={post.id}
              className={`rounded-2xl border p-4 ${
                index === 0 ? "border-primary/30 bg-primary/5" : "border-border bg-card"
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
                      <span className="text-xs font-semibold">{post.authorName}</span>
                      {index === 0 && <span className="text-[9px] text-primary/70">(Autor)</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString("es-ES") : ""}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>
              </div>
            </div>
          ))
        }
        {!postsLoading && (!posts || posts.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">A\u00fan no hay respuestas</p>
          </div>
        )}
      </div>

      {!thread.isLocked ? (
        <div className="border-t border-border pt-5">
          {user ? (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                {user.habboUsername ? (
                  <img
                    src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(user.habboUsername)}&size=s&headonly=1`}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-xl bg-secondary object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <span className="text-xs font-medium">{user.displayName}</span>
              </div>
              <Textarea
                placeholder="Escribe tu respuesta..."
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                data-testid="input-post-reply"
              />
              <Button
                className="bg-primary hover:bg-primary/80 text-white text-xs gap-1.5"
                onClick={() => reply.trim() && replyMutation.mutate(reply)}
                disabled={replyMutation.isPending || !reply.trim()}
                data-testid="button-submit-reply"
              >
                <Send className="w-3.5 h-3.5" />Publicar respuesta
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card/50 p-5 text-center">
              <p className="text-sm text-muted-foreground">
                <Link href="/login"><a className="text-primary hover:underline">Inicia sesi\u00f3n</a></Link> para responder
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground text-sm rounded-2xl border border-border p-4">
          <Lock className="w-4 h-4" />Este hilo est\u00e1 cerrado
        </div>
      )}
    </div>
  );
}
