import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Lock, Pin, Eye, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ForumThread, ForumPost } from "@shared/schema";

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
        "POST",
        "/api/forum/posts",
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
      toast({ title: "Respuesta publicada" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (threadLoading) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-3/4" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Hilo no encontrado</p>
        <Link href="/forum"><a className="text-primary text-sm mt-2 inline-block">← Volver al Foro</a></Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      {/* Back link */}
      <Link href="/forum">
        <a className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-back-forum">
          <ArrowLeft className="w-4 h-4" />
          Volver al Foro
        </a>
      </Link>

      {/* Thread Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {thread.isPinned && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px]"><Pin className="w-2.5 h-2.5 mr-1" />Fijado</Badge>}
          {thread.isLocked && <Badge variant="outline" className="text-[9px] border-border text-muted-foreground"><Lock className="w-2.5 h-2.5 mr-1" />Cerrado</Badge>}
        </div>
        <h1 className="text-xl font-bold" data-testid="text-thread-title">{thread.title}</h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{thread.authorName}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{thread.views} vistas</span>
          {thread.createdAt && <span>{new Date(thread.createdAt).toLocaleDateString("es-ES")}</span>}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {postsLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : (posts || []).map((post, index) => (
              <Card
                key={post.id}
                className={`bg-card border-border ${index === 0 ? "border-primary/20" : ""}`}
                data-testid={`card-post-${post.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {post.authorName.charAt(0).toUpperCase()}
                      </div>
                      {index === 0 && (
                        <Badge variant="outline" className="text-[8px] border-primary/30 text-primary/80">OP</Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">{post.authorName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString("es-ES") : ""}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        {!postsLoading && (!posts || posts.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">Aún no hay respuestas</p>
        )}
      </div>

      {/* Reply Form */}
      {!thread.isLocked && (
        <div className="border-t border-border pt-5">
          {user ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Responder</h3>
              <Textarea
                placeholder="Escribe tu respuesta..."
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                data-testid="input-post-reply"
              />
              <Button
                className="bg-primary hover:bg-primary/80 text-white text-xs"
                onClick={() => reply.trim() && replyMutation.mutate(reply)}
                disabled={replyMutation.isPending || !reply.trim()}
                data-testid="button-submit-reply"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Publicar respuesta
              </Button>
            </div>
          ) : (
            <div className="bg-card/50 rounded-lg p-4 border border-border text-center">
              <p className="text-sm text-muted-foreground">
                <Link href="/login"><a className="text-primary hover:underline">Inicia sesión</a></Link> para responder
              </p>
            </div>
          )}
        </div>
      )}
      {thread.isLocked && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm border border-border rounded-lg p-3">
          <Lock className="w-4 h-4" />
          Este hilo está cerrado
        </div>
      )}
    </div>
  );
}
