import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wrench,
  Search,
  Users,
  Home,
  Star,
  ChevronDown,
  ChevronRight,
  User,
  Award,
  DoorOpen,
  Flame,
  Shield,
} from "lucide-react";

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

function avatarHeadUrl(username: string) {
  return `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=b&headonly=1`;
}

function avatarBodyUrl(username: string) {
  return `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=b&headonly=0`;
}

function figureUrl(figureString: string) {
  return `https://www.habbo.es/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&size=l&direction=2`;
}

function badgeImageUrl(badgeCode: string) {
  return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─────────────────────────────────────────────
// Collapsible section
// ─────────────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="bg-card border-border">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors rounded-lg"
        onClick={() => setOpen((o) => !o)}
        data-testid={`collapsible-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center gap-2 font-semibold text-sm">
          {icon}
          {title}
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>}
    </Card>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Buscar Usuario
// ─────────────────────────────────────────────

function BuscarUsuarioTab() {
  const [inputValue, setInputValue] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");

  const { data: profile, isLoading, error } = useQuery<any>({
    queryKey: ["/api/habbo/user", searchedUsername, "profile"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/user/${encodeURIComponent(searchedUsername)}/profile`);
      if (!res.ok) throw new Error("Usuario no encontrado");
      return res.json();
    },
    enabled: !!searchedUsername,
    retry: false,
  });

  const { data: friends, isLoading: loadingFriends } = useQuery<any[]>({
    queryKey: ["/api/habbo/user", searchedUsername, "friends"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/user/${encodeURIComponent(searchedUsername)}/friends`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!searchedUsername,
    retry: false,
  });

  const { data: rooms, isLoading: loadingRooms } = useQuery<any[]>({
    queryKey: ["/api/habbo/user", searchedUsername, "rooms"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/user/${encodeURIComponent(searchedUsername)}/rooms`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!searchedUsername,
    retry: false,
  });

  const { data: groups, isLoading: loadingGroups } = useQuery<any[]>({
    queryKey: ["/api/habbo/user", searchedUsername, "groups"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/user/${encodeURIComponent(searchedUsername)}/groups`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!searchedUsername,
    retry: false,
  });

  const handleSearch = () => {
    if (inputValue.trim()) setSearchedUsername(inputValue.trim());
  };

  const user = profile?.user || profile;
  const profileData = profile?.profile || profile;

  const selectedBadges: any[] = profileData?.selectedBadges || user?.selectedBadges || [];

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Nombre de usuario de Habbo..."
            className="pl-9"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            data-testid="input-user-search"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!inputValue.trim()}
          className="bg-primary hover:bg-primary/80 text-white"
          data-testid="button-user-search"
        >
          Buscar
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-3">
            <div className="flex gap-4">
              <Skeleton className="w-24 h-40 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-10 h-10 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            Usuario no encontrado o perfil privado.
          </CardContent>
        </Card>
      )}

      {/* Profile result */}
      {!isLoading && !error && profile && (
        <div className="space-y-3">
          {/* Main profile card */}
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex gap-4 items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={avatarBodyUrl(user?.name || searchedUsername)}
                    alt={`Avatar de ${user?.name || searchedUsername}`}
                    className="object-contain drop-shadow-xl"
                    style={{ height: 120 }}
                    data-testid="img-user-avatar"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.2";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Online dot */}
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        user?.online ? "bg-green-400" : "bg-muted-foreground/40"
                      }`}
                      title={user?.online ? "En línea" : "Desconectado"}
                      data-testid="dot-online-status"
                    />
                    <h2 className="text-xl font-bold">{user?.name || searchedUsername}</h2>
                    {user?.online && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        En línea
                      </Badge>
                    )}
                  </div>

                  {user?.motto && (
                    <p className="text-sm text-muted-foreground italic">"{user.motto}"</p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {user?.memberSince && (
                      <span>
                        Miembro desde: <span className="text-foreground">{formatDate(user.memberSince)}</span>
                      </span>
                    )}
                    {(user?.level !== undefined && user?.level !== null) && (
                      <span>
                        Nivel: <span className="text-primary font-semibold">{user.level}</span>
                      </span>
                    )}
                    {(user?.starGemCount !== undefined && user?.starGemCount !== null) && (
                      <span>
                        Gemas: <span className="text-yellow-400 font-semibold">{user.starGemCount?.toLocaleString()}</span>
                      </span>
                    )}
                    {(user?.totalExperience !== undefined && user?.totalExperience !== null) && (
                      <span>
                        Experiencia: <span className="text-foreground">{user.totalExperience?.toLocaleString()}</span>
                      </span>
                    )}
                  </div>

                  {/* Selected badges */}
                  {selectedBadges.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Placas seleccionadas:</p>
                      <div className="flex flex-wrap gap-1.5" data-testid="badges-selected">
                        {selectedBadges.map((b: any, i: number) => {
                          const code = b.code || b.badgeCode || b.badge_code || "";
                          const name = b.name || b.badgeName || code;
                          return (
                            <div
                              key={`badge-${code}-${i}`}
                              className="w-10 h-10 bg-secondary/60 border border-border rounded flex items-center justify-center"
                              title={name}
                            >
                              <img
                                src={badgeImageUrl(code)}
                                alt={name}
                                className="w-9 h-9 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.opacity = "0.2";
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collapsibles */}
          <CollapsibleSection
            title="Amigos"
            icon={<Users className="w-4 h-4 text-primary" />}
          >
            {loadingFriends ? (
              <div className="space-y-2 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            ) : friends && friends.length > 0 ? (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2"
                data-testid="list-friends"
              >
                {friends.map((f: any, i: number) => {
                  const name = f.name || f.username || f.user?.name || "";
                  return (
                    <div
                      key={`friend-${name}-${i}`}
                      className="flex items-center gap-2 bg-secondary/40 rounded-lg p-2"
                    >
                      <img
                        src={avatarHeadUrl(name)}
                        alt={name}
                        className="w-8 h-8 object-contain flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0.2";
                        }}
                      />
                      <span className="text-xs font-medium truncate">{name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">No se encontraron amigos o la lista es privada.</p>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Salas"
            icon={<Home className="w-4 h-4 text-primary" />}
          >
            {loadingRooms ? (
              <div className="space-y-2 mt-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : rooms && rooms.length > 0 ? (
              <div className="space-y-2 mt-2" data-testid="list-rooms">
                {rooms.map((r: any, i: number) => (
                  <div
                    key={`room-${r.id || i}`}
                    className="bg-secondary/40 border border-border/50 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{r.name || "—"}</p>
                        {r.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {r.maxUsers !== undefined && (
                          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                            <Users className="w-2.5 h-2.5 mr-1" />
                            {r.maxUsers}
                          </Badge>
                        )}
                        {r.rating !== undefined && (
                          <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-400">
                            <Star className="w-2.5 h-2.5 mr-1" />
                            {r.rating}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">No se encontraron salas públicas.</p>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Grupos"
            icon={<Shield className="w-4 h-4 text-primary" />}
          >
            {loadingGroups ? (
              <div className="space-y-2 mt-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : groups && groups.length > 0 ? (
              <div className="space-y-2 mt-2" data-testid="list-groups">
                {groups.map((g: any, i: number) => {
                  const badge = g.badgeCode || g.badge_code || g.badge || "";
                  return (
                    <div
                      key={`group-${g.id || i}`}
                      className="flex items-center gap-3 bg-secondary/40 border border-border/50 rounded-lg p-3"
                    >
                      {badge && (
                        <img
                          src={badgeImageUrl(badge)}
                          alt={g.name}
                          className="w-10 h-10 object-contain flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = "0.2";
                          }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{g.name || "—"}</p>
                        {g.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{g.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">No se encontraron grupos.</p>
            )}
          </CollapsibleSection>
        </div>
      )}

      {/* Empty state */}
      {!searchedUsername && (
        <div className="text-center py-16 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Introduce un nombre de usuario para buscar</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Hot Looks
// ─────────────────────────────────────────────

function HotLooksTab() {
  const { data, isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/habbo/hotlooks"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/habbo/hotlooks");
      if (!res.ok) throw new Error("Error al cargar Hot Looks");
      return res.json();
    },
    retry: false,
  });

  const looks: any[] = Array.isArray(data) ? data : data ? [data] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-400" />
        <p className="text-sm text-muted-foreground">
          Los avatares más populares en Habbo en este momento.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-2">
              <Skeleton className="w-20 h-32 rounded-lg" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            Error al cargar Hot Looks. Inténtalo más tarde.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && looks.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          data-testid="grid-hot-looks"
        >
          {looks.map((look: any, i: number) => {
            const figure = look.figure || look.figureString || look.look || "";
            const username = look.user?.name || look.name || look.username || `Usuario ${i + 1}`;
            const gender = look.user?.gender || look.gender || "";

            return (
              <div
                key={`hotlook-${i}`}
                className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-primary/40 transition-colors"
                data-testid={`hot-look-${i}`}
              >
                <div className="h-32 flex items-end justify-center">
                  {figure ? (
                    <img
                      src={figureUrl(figure)}
                      alt={`Look de ${username}`}
                      className="object-contain drop-shadow-xl"
                      style={{ maxHeight: 128 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.2";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-28 bg-secondary/50 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-center truncate w-full">{username}</p>
                {gender && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      gender === "M" || gender === "Male"
                        ? "border-blue-500/30 text-blue-400"
                        : "border-pink-500/30 text-pink-400"
                    }`}
                  >
                    {gender === "M" || gender === "Male" ? "Hombre" : "Mujer"}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !error && looks.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Flame className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay Hot Looks disponibles en este momento</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Buscar Sala
// ─────────────────────────────────────────────

function BuscarSalaTab() {
  const [inputValue, setInputValue] = useState("");
  const [searchedId, setSearchedId] = useState("");

  const { data: room, isLoading, error } = useQuery<any>({
    queryKey: ["/api/habbo/room", searchedId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/room/${encodeURIComponent(searchedId)}`);
      if (!res.ok) throw new Error("Sala no encontrada");
      return res.json();
    },
    enabled: !!searchedId,
    retry: false,
  });

  const handleSearch = () => {
    if (inputValue.trim()) setSearchedId(inputValue.trim());
  };

  const owner = room?.ownerName || room?.owner?.name || room?.owner || "";

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ID de sala (ej: 12345)..."
            className="pl-9"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            data-testid="input-room-search"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!inputValue.trim()}
          className="bg-primary hover:bg-primary/80 text-white"
          data-testid="button-room-search"
        >
          Buscar
        </Button>
      </div>

      {isLoading && (
        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            Sala no encontrada. Verifica el ID e inténtalo de nuevo.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && room && (
        <Card className="bg-card border-border" data-testid="room-result">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-primary" />
              {room.name || "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {room.description && (
              <p className="text-sm text-muted-foreground">{room.description}</p>
            )}

            {/* Owner */}
            {owner && (
              <div className="flex items-center gap-2">
                <img
                  src={avatarHeadUrl(owner)}
                  alt={owner}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0.2";
                  }}
                />
                <div>
                  <p className="text-[10px] text-muted-foreground">Propietario</p>
                  <p className="text-sm font-semibold">{owner}</p>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap gap-2">
              {room.maxUsers !== undefined && (
                <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Máx. {room.maxUsers} usuarios
                </Badge>
              )}
              {room.rating !== undefined && (
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  {room.rating} puntos
                </Badge>
              )}
              {room.creationTime && (
                <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                  Creada: {formatDate(room.creationTime)}
                </Badge>
              )}
            </div>

            {/* Tags */}
            {room.tags && room.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {room.tags.map((tag: string, i: number) => (
                  <Badge
                    key={`tag-${i}`}
                    className="bg-primary/10 text-primary border-primary/20 text-xs"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!searchedId && (
        <div className="text-center py-16 text-muted-foreground">
          <DoorOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Introduce un ID de sala para buscar</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Buscar Grupo
// ─────────────────────────────────────────────

function BuscarGrupoTab() {
  const [inputValue, setInputValue] = useState("");
  const [searchedId, setSearchedId] = useState("");
  const [loadMembers, setLoadMembers] = useState(false);

  const { data: group, isLoading, error } = useQuery<any>({
    queryKey: ["/api/habbo/group", searchedId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/group/${encodeURIComponent(searchedId)}`);
      if (!res.ok) throw new Error("Grupo no encontrado");
      return res.json();
    },
    enabled: !!searchedId,
    retry: false,
  });

  const { data: members, isLoading: loadingMembers } = useQuery<any[]>({
    queryKey: ["/api/habbo/group", searchedId, "members"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/group/${encodeURIComponent(searchedId)}/members`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!searchedId && loadMembers,
    retry: false,
  });

  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchedId(inputValue.trim());
      setLoadMembers(false);
    }
  };

  const badgeCode = group?.badgeCode || group?.badge_code || group?.badge || "";
  const memberCount = group?.memberCount || group?.membersCount || group?.members_count;
  const roomInfo = group?.room || group?.homeRoom;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ID de grupo (ej: g-hhus-00xxxxxx)..."
            className="pl-9"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            data-testid="input-group-search"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!inputValue.trim()}
          className="bg-primary hover:bg-primary/80 text-white"
          data-testid="button-group-search"
        >
          Buscar
        </Button>
      </div>

      {isLoading && (
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex gap-4">
            <Skeleton className="w-12 h-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-28" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            Grupo no encontrado. Verifica el ID e inténtalo de nuevo.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && group && (
        <div className="space-y-3" data-testid="group-result">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex gap-4 items-start">
                {badgeCode && (
                  <img
                    src={badgeImageUrl(badgeCode)}
                    alt="Badge del grupo"
                    className="w-14 h-14 object-contain bg-secondary/50 border border-border rounded-lg p-1 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.2";
                    }}
                    data-testid="img-group-badge"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold">{group.name || "—"}</h2>
                  {group.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{group.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {memberCount !== undefined && (
                      <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {memberCount?.toLocaleString()} miembros
                      </Badge>
                    )}
                    {roomInfo && (
                      <Badge variant="outline" className="border-primary/30 text-primary/80 text-xs">
                        <Home className="w-3 h-3 mr-1" />
                        {roomInfo.name || "Sala principal"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Load members button */}
              {!loadMembers && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full text-xs"
                  onClick={() => setLoadMembers(true)}
                  data-testid="button-load-members"
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Cargar miembros
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Members list */}
          {loadMembers && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Miembros del grupo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingMembers ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : members && members.length > 0 ? (
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                    data-testid="list-group-members"
                  >
                    {members.map((m: any, i: number) => {
                      const name = m.name || m.username || m.user?.name || "";
                      return (
                        <div
                          key={`member-${name}-${i}`}
                          className="flex items-center gap-2 bg-secondary/40 rounded-lg p-2"
                        >
                          <img
                            src={avatarHeadUrl(name)}
                            alt={name}
                            className="w-8 h-8 object-contain flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.opacity = "0.2";
                            }}
                          />
                          <span className="text-xs font-medium truncate">{name}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No se encontraron miembros.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!searchedId && (
        <div className="text-center py-16 text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Introduce el ID de un grupo para buscar</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 5: Propietarios de Placa
// ─────────────────────────────────────────────

function PropietariosPlacaTab() {
  const [inputValue, setInputValue] = useState("");
  const [searchedCode, setSearchedCode] = useState("");

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["/api/habbo/badge-owners", searchedCode],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/badge-owners/${encodeURIComponent(searchedCode)}`);
      if (!res.ok) throw new Error("No se encontraron propietarios");
      return res.json();
    },
    enabled: !!searchedCode,
    retry: false,
  });

  const handleSearch = () => {
    if (inputValue.trim()) setSearchedCode(inputValue.trim());
  };

  const owners: any[] = Array.isArray(data)
    ? data
    : data?.owners || data?.users || data?.members || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Código de placa (ej: ADM, ACH_Basic1)..."
            className="pl-9"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            data-testid="input-badge-code-search"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!inputValue.trim()}
          className="bg-primary hover:bg-primary/80 text-white"
          data-testid="button-badge-owners-search"
        >
          Buscar
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            No se encontraron propietarios para esta placa o código inválido.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && data !== undefined && (
        <div className="space-y-3" data-testid="badge-owners-result">
          {/* Badge preview */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <img
                src={badgeImageUrl(searchedCode)}
                alt={`Placa ${searchedCode}`}
                className="w-14 h-14 object-contain bg-secondary/50 border border-border rounded-lg p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.2";
                }}
                data-testid="img-badge-preview"
              />
              <div>
                <p className="text-xs text-muted-foreground">Código de placa</p>
                <p className="font-mono font-semibold text-primary">{searchedCode}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {owners.length} propietario{owners.length !== 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Owners list */}
          {owners.length > 0 ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
              data-testid="list-badge-owners"
            >
              {owners.map((o: any, i: number) => {
                const name = o.name || o.username || o.user?.name || o;
                return (
                  <div
                    key={`owner-${name}-${i}`}
                    className="flex items-center gap-2 bg-card border border-border/50 rounded-lg p-2 hover:border-primary/30 transition-colors"
                  >
                    <img
                      src={avatarHeadUrl(typeof name === "string" ? name : "")}
                      alt={name}
                      className="w-8 h-8 object-contain flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.2";
                      }}
                    />
                    <span className="text-xs font-medium truncate">{name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No se encontraron propietarios para esta placa.
            </p>
          )}
        </div>
      )}

      {!searchedCode && (
        <div className="text-center py-16 text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Introduce un código de placa para buscar propietarios</p>
          <p className="text-xs mt-1 opacity-60">Ejemplos: ADM, HC1, ACH_Basic1</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function HerramientasPage() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Wrench className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Herramientas Habbo</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Consulta información pública de la API oficial de Habbo: usuarios, salas, grupos, Hot Looks y placas.
      </p>

      <Tabs defaultValue="usuario" className="w-full">
        <TabsList
          className="flex flex-wrap gap-1 h-auto bg-secondary/40 p-1 mb-2"
          data-testid="tabs-herramientas"
        >
          <TabsTrigger value="usuario" className="text-xs" data-testid="tab-usuario">
            <User className="w-3.5 h-3.5 mr-1.5" />
            Buscar Usuario
          </TabsTrigger>
          <TabsTrigger value="hotlooks" className="text-xs" data-testid="tab-hotlooks">
            <Flame className="w-3.5 h-3.5 mr-1.5" />
            Hot Looks
          </TabsTrigger>
          <TabsTrigger value="sala" className="text-xs" data-testid="tab-sala">
            <DoorOpen className="w-3.5 h-3.5 mr-1.5" />
            Buscar Sala
          </TabsTrigger>
          <TabsTrigger value="grupo" className="text-xs" data-testid="tab-grupo">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Buscar Grupo
          </TabsTrigger>
          <TabsTrigger value="placa" className="text-xs" data-testid="tab-placa">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Propietarios de Placa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuario" className="mt-4">
          <BuscarUsuarioTab />
        </TabsContent>

        <TabsContent value="hotlooks" className="mt-4">
          <HotLooksTab />
        </TabsContent>

        <TabsContent value="sala" className="mt-4">
          <BuscarSalaTab />
        </TabsContent>

        <TabsContent value="grupo" className="mt-4">
          <BuscarGrupoTab />
        </TabsContent>

        <TabsContent value="placa" className="mt-4">
          <PropietariosPlacaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
