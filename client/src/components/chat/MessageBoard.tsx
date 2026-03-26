import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, LogIn, UserPlus, RefreshCw, WifiOff } from "lucide-react";

type ChatMsg = {
  id: number;
  userName: string;
  habboUsername?: string | null;
  message: string;
  createdAt: string;
};

export function MessageBoard() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: chatMessages,
    isError,
    isFetching,
    refetch,
    error,
  } = useQuery<ChatMsg[]>({
    queryKey: ["/api/chat"],
    queryFn: async () => {
      const res = await fetch("/api/chat?limit=40");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Error ${res.status}`);
      }
      return res.json();
    },
    refetchInterval: isError ? false : 5000,
    retry: 2,
    retryDelay: 3000,
    staleTime: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const authToken = token || localStorage.getItem("token");
      if (!authToken) throw new Error("Debes iniciar sesión para chatear");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Error al enviar" }));
        throw new Error(err.message || "Error al enviar mensaje");
      }
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      inputRef.current?.focus();
    },
    onError: (err: any) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  useEffect(() => {
    if (chatMessages?.length) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || sendMutation.isPending) return;
    if (trimmed.length > 200) {
      toast({ title: "Mensaje muy largo", description: "Máximo 200 caracteres", variant: "destructive" });
      return;
    }
    sendMutation.mutate(trimmed);
  };

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    refetch();
  };

  const msgs = chatMessages || [];

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full"
      data-testid="message-board"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isError ? "bg-red-400" : isFetching ? "bg-yellow-400 animate-pulse" : "bg-green-400 animate-pulse"
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-wider">Chat en Vivo</span>
          {msgs.length > 0 && (
            <span className="text-[10px] text-muted-foreground">({msgs.length})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-1.5">
              {user.habboUsername && (
                <img
                  src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${user.habboUsername}&size=s&headonly=1`}
                  alt=""
                  className="w-5 h-5 rounded"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                {user.displayName}
              </span>
            </div>
          )}
          {isError && (
            <button
              onClick={handleRetry}
              className="text-[10px] text-primary hover:underline flex items-center gap-1"
              title="Reconectar"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0"
        style={{ maxHeight: "240px" }}
        data-testid="chat-messages"
      >
        {isError ? (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-3 text-center">
            <WifiOff className="w-8 h-8 text-muted-foreground/30" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Chat no disponible</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {(error as Error)?.message || "Error de conexión"}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 text-[11px] text-primary hover:underline font-medium"
            >
              <RefreshCw className="w-3 h-3" /> Reintentar
            </button>
          </div>
        ) : msgs.length > 0 ? (
          msgs.map((msg, i) => (
            <div
              key={msg.id || i}
              className="flex items-start gap-2 py-0.5 hover:bg-secondary/20 rounded px-1 transition-colors group"
            >
              <img
                src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${
                  msg.habboUsername || msg.userName || "HabboSpeed"
                }&size=s&headonly=1`}
                alt=""
                className="w-6 h-6 rounded flex-shrink-0 bg-secondary/50 mt-0.5"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-primary mr-1">
                  {msg.userName || "Anon"}:
                </span>
                <span className="text-[11px] text-foreground/85 break-words">
                  {msg.message}
                </span>
              </div>
              {msg.createdAt && (
                <span className="text-[8px] text-muted-foreground/40 ml-auto flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(msg.createdAt).toLocaleTimeString("es", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            <MessageSquare className="w-8 h-8 opacity-20" />
            <p className="text-xs font-medium text-muted-foreground">¡Sé el primero en escribir!</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-2.5 bg-secondary/20 flex-shrink-0">
        {user ? (
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Escribe un mensaje..."
              className="text-xs h-8 bg-background/50 border-border/50 focus:border-primary/50"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              maxLength={200}
              disabled={sendMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              className="h-8 w-8 bg-primary hover:bg-primary/80 flex-shrink-0"
              onClick={handleSend}
              disabled={sendMutation.isPending || !message.trim()}
              data-testid="button-chat-send"
            >
              {sendMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-0.5">
            <Link href="/login">
              <a className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                <LogIn className="w-3 h-3" /> Inicia sesión
              </a>
            </Link>
            <span className="text-muted-foreground text-xs">o</span>
            <Link href="/register">
              <a className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                <UserPlus className="w-3 h-3" /> Regístrate
              </a>
            </Link>
            <span className="text-xs text-muted-foreground">para chatear</span>
          </div>
        )}
      </div>
    </div>
  );
}
