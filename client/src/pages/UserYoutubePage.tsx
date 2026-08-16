import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Zap,
  Heart,
  Share2,
  ExternalLink,
  Edit,
  Trash2,
  Plus,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Clock,
  Star,
} from "lucide-react";
import { proxyImage } from "@/lib/habboProxy";

interface YoutubeEmbed {
  id: number;
  userId: number;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  description: string;
  isFeatured: boolean;
  isApproved: boolean;
  views: number;
  likes: number;
  createdAt: string;
}

interface UserProfile {
  id: number;
  displayName: string;
  habboUsername: string;
  avatarUrl: string;
  bio: string;
  speedPoints: number;
}

export default function UserYoutubePage() {
  const { user, token } = useAuth();
  const { id: username } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isOwnProfile = user?.habboUsername === username;

  const { data: profile, isLoading: loadingProfile } = useQuery<UserProfile>({
    queryKey: ["/api/users", "by-habbo", username],
  });

  const { data: embeds, isLoading: loadingEmbeds } = useQuery<YoutubeEmbed[]>({
    queryKey: ["/api/users", profile?.id, "youtube-embeds"],
    enabled: !!profile,
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      videoId: string;
      title: string;
      description: string;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/users/${profile?.id}/youtube-embeds`,
        data,
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", profile?.id, "youtube-embeds"],
      });
      toast({
        title: "Video enviado",
        description: "Pendiente de aprobación del staff",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<YoutubeEmbed>;
    }) => {
      const res = await apiRequest(
        "PUT",
        `/api/youtube-embeds/${id}`,
        data,
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", profile?.id, "youtube-embeds"],
      });
      toast({ title: "Actualizado" });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(
        "DELETE",
        `/api/youtube-embeds/${id}`,
        undefined,
        token ? `Bearer ${token}` : undefined,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", profile?.id, "youtube-embeds"],
      });
      toast({ title: "Video eliminado" });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const extractVideoId = (url: string): string => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  const getThumbnail = (videoId: string) =>
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const handleAdd = () => {
    const videoId = extractVideoId(newVideoUrl);
    if (!videoId) {
      toast({
        title: "URL inválida",
        description: "Introduce una URL de YouTube válida",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({
      videoId,
      title: newTitle || "Mi SpeedShort",
      description: newDescription,
    });
    setShowAddDialog(false);
    setNewVideoUrl("");
    setNewTitle("");
    setNewDescription("");
  };

  if (loadingProfile) {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6 text-center">
        <h1 className="text-xl font-bold">Usuario no encontrado</h1>
        <Link
          href="/tendencias"
          className="text-primary text-sm mt-2 inline-block"
        >
          ← Volver a Tendencias
        </Link>
      </div>
    );
  }

  const userEmbeds = embeds || [];
  const approvedEmbeds = userEmbeds.filter((e: any) => e.isApproved);
  const pendingEmbeds = userEmbeds.filter((e: any) => !e.isApproved);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header del perfil */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <img
              src={proxyImage(
                profile.avatarUrl ||
                  `https://www.habbo.es/habbo-imaging/avatarimage?user=${profile.habboUsername}&size=b`,
              )}
              alt={profile.displayName}
              className="w-24 h-24 rounded-xl object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                {isOwnProfile && (
                  <Badge variant="secondary" className="text-[10px]">
                    Tu perfil
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                @{profile.habboUsername}
              </p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {profile.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {profile.speedPoints} SP
                </span>
                <span className="flex items-center gap-1">
                  <Play className="w-3 h-3" /> {approvedEmbeds.length} videos
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />{" "}
                  {approvedEmbeds.reduce(
                    (sum: number, e: any) => sum + e.views,
                    0,
                  )}{" "}
                  vistas
                </span>
              </div>
            </div>
            {isOwnProfile && (
              <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" /> Subir SpeedShort
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Videos aprobados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">SpeedShorts</h2>
            <Badge variant="secondary">
              {approvedEmbeds.length} publicados
            </Badge>
          </div>
          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-3 h-3 mr-1" /> Subir nuevo
            </Button>
          )}
        </div>

        {loadingEmbeds ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-64">
                <Skeleton className="h-full w-full" />
              </Card>
            ))}
          </div>
        ) : approvedEmbeds.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Play className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>
              {isOwnProfile
                ? "Aún no tienes videos publicados"
                : "Este usuario no tiene videos publicados"}
            </p>
            {isOwnProfile && (
              <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" /> Subir tu primer SpeedShort
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedEmbeds.map((embed: any) => (
              <Link
                key={embed.id}
                href={`https://youtube.com/watch?v=${embed.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="group overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all">
                  <div className="relative aspect-video overflow-hidden bg-secondary/30">
                    <img
                      src={getThumbnail(embed.videoId)}
                      alt={embed.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="default"
                        className="bg-green-500/20 text-green-400 text-[8px]"
                      >
                        <Check className="w-2.5 h-2.5 mr-1" /> Aprobado
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                      <Play className="w-3 h-3" />
                      <span>{embed.views.toLocaleString()}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="lg"
                        variant="default"
                        className="bg-white/90 hover:bg-white"
                      >
                        <Play className="w-6 h-6 text-primary" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {embed.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />{" "}
                        {embed.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />{" "}
                        {embed.likes.toLocaleString()}
                      </span>
                    </div>
                    {embed.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-2">
                        {embed.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Videos pendientes (solo propio perfil) */}
        {isOwnProfile && pendingEmbeds.length > 0 && (
          <div className="space-y-4 border-t border-border/50 pt-6">
            <div className="flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold">Pendientes de aprobación</h2>
              <Badge
                variant="secondary"
                className="bg-yellow-500/20 text-yellow-400"
              >
                {pendingEmbeds.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingEmbeds.map((embed: any) => (
                <Card
                  key={embed.id}
                  className="border-yellow-500/30 bg-yellow-500/5"
                >
                  <div className="relative aspect-video overflow-hidden bg-secondary/30">
                    <img
                      src={getThumbnail(embed.videoId)}
                      alt={embed.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="secondary"
                        className="bg-yellow-500/20 text-yellow-400 text-[8px]"
                      >
                        <Clock className="w-2.5 h-2.5 mr-1" /> En revisión
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-bold text-sm line-clamp-1">
                      {embed.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
                      <Badge
                        variant="outline"
                        className="text-[8px] border-yellow-500/30 text-yellow-400"
                      >
                        Pendiente
                      </Badge>
                      <span>
                        {new Date(embed.createdAt).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    {embed.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-2">
                        {embed.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-[9px]"
                        onClick={() =>
                          updateMutation.mutate({
                            id: embed.id,
                            data: { isFeatured: !embed.isFeatured },
                          })
                        }
                      >
                        <Star className="w-3 h-3 mr-1" /> Destacar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 text-[9px]"
                        onClick={() => deleteMutation.mutate(embed.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Dialog agregar video */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir SpeedShort</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 p-4">
              <Input
                placeholder="URL de YouTube (ej: https://youtube.com/watch?v=...)"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
              />
              <Input
                placeholder="Título del video"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Input
                placeholder="Descripción (opcional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={createMutation.isPending || !newVideoUrl}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Subir"
                  )}{" "}
                  SpeedShort
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
