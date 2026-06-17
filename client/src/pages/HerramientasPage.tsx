import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { proxyImage } from "@/lib/habboProxy";
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
  Globe,
  Activity,
  Trophy
} from "lucide-react";

// ─────────────────────────────────────────────
// Custom Search Components
// ─────────────────────────────────────────────

function SearchBar({
  placeholder,
  value,
  onChange,
  onSearch,
  disabled,
  icon: Icon,
  description
}: {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  disabled: boolean;
  icon: any;
  description: string;
}) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <Icon className="w-16 h-16 text-slate-500 mb-2.5" />
      <p className="text-sm text-slate-400 font-medium mb-6">
        {description}
      </p>
      <div className="flex items-center w-full max-w-xl border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900 shadow-lg">
        <Button
          onClick={onSearch}
          disabled={disabled}
          className="rounded-none bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 h-10 border-r border-zinc-700 font-black"
        >
          Buscar
        </Button>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="border-0 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0 h-10 flex-1 placeholder:text-zinc-500 text-xs px-3"
        />
      </div>
    </div>
  );
}

function ActiveSearchBar({
  placeholder,
  value,
  onChange,
  onSearch,
  disabled
}: {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center w-full border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900 shadow-md">
      <Button
        onClick={onSearch}
        disabled={disabled}
        className="rounded-none bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 h-10 border-r border-zinc-700 font-black"
      >
        Buscar
      </Button>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="border-0 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0 h-10 flex-1 placeholder:text-zinc-500 text-xs px-3"
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

function avatarHeadUrl(username: string) {
  return proxyImage(`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=b&headonly=1`);
}

function avatarBodyUrl(username: string) {
  return proxyImage(`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=b&headonly=0`);
}

function figureUrl(figureString: string) {
  return proxyImage(`https://www.habbo.es/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&size=l&direction=2`);
}

function badgeImageUrl(badgeCode: string) {
  return proxyImage(`https://images.habbo.com/c_images/album1584/${badgeCode}.gif`);
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

  const hasSearched = !!searchedUsername;

  return (
    <div className="space-y-4">
      {!hasSearched ? (
        <SearchBar
          placeholder="Nombre de usuario de Habbo..."
          value={inputValue}
          onChange={setInputValue}
          onSearch={handleSearch}
          disabled={!inputValue.trim()}
          icon={User}
          description="Introduce un nombre de usuario para buscar"
        />
      ) : (
        <>
          <ActiveSearchBar
            placeholder="Nombre de usuario de Habbo..."
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            disabled={!inputValue.trim()}
          />

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

        </>
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

  const hasSearched = !!searchedId;

  return (
    <div className="space-y-4">
      {!hasSearched ? (
        <SearchBar
          placeholder="ID de sala (ej: 12345)..."
          value={inputValue}
          onChange={setInputValue}
          onSearch={handleSearch}
          disabled={!inputValue.trim()}
          icon={DoorOpen}
          description="Introduce un ID de sala para buscar"
        />
      ) : (
        <>
          <ActiveSearchBar
            placeholder="ID de sala (ej: 12345)..."
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            disabled={!inputValue.trim()}
          />

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

        </>
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

  const hasSearched = !!searchedId;

  return (
    <div className="space-y-4">
      {!hasSearched ? (
        <SearchBar
          placeholder="ID de grupo (ej: g-hhus-00xxxxxx)..."
          value={inputValue}
          onChange={setInputValue}
          onSearch={handleSearch}
          disabled={!inputValue.trim()}
          icon={Shield}
          description="Introduce un ID de grupo para buscar"
        />
      ) : (
        <>
          <ActiveSearchBar
            placeholder="ID de grupo (ej: g-hhus-00xxxxxx)..."
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            disabled={!inputValue.trim()}
          />

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

        </>
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

  const hasSearched = !!searchedCode;

  return (
    <div className="space-y-4">
      {!hasSearched ? (
        <SearchBar
          placeholder="Código de placa (ej: ADM, ACH_Basic1)..."
          value={inputValue}
          onChange={setInputValue}
          onSearch={handleSearch}
          disabled={!inputValue.trim()}
          icon={Award}
          description="Introduce un código de placa para buscar propietarios"
        />
      ) : (
        <>
          <ActiveSearchBar
            placeholder="Código de placa (ej: ADM, ACH_Basic1)..."
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            disabled={!inputValue.trim()}
          />

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

        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 6: Habbo Origins Lookup
// ─────────────────────────────────────────────

function OriginsLookupTab() {
  const [inputValue, setInputValue] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");

  const { data: profile, isLoading, error } = useQuery<any>({
    queryKey: ["/api/habbo/origins/user", searchedUsername],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/habbo/origins/user/${encodeURIComponent(searchedUsername)}`);
      if (!res.ok) throw new Error("Usuario no encontrado en Habbo Origins");
      return res.json();
    },
    enabled: !!searchedUsername,
    retry: false,
  });

  const handleSearch = () => {
    if (inputValue.trim()) setSearchedUsername(inputValue.trim());
  };

  const hasSearched = !!searchedUsername;

  return (
    <div className="space-y-4">
      {!hasSearched ? (
        <SearchBar
          placeholder="Nombre de usuario en Habbo Origins..."
          value={inputValue}
          onChange={setInputValue}
          onSearch={handleSearch}
          disabled={!inputValue.trim()}
          icon={Globe}
          description="Introduce un nombre de usuario de Origins para buscar"
        />
      ) : (
        <>
          <ActiveSearchBar
            placeholder="Nombre de usuario en Habbo Origins..."
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            disabled={!inputValue.trim()}
          />

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
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            Usuario no encontrado en Habbo Origins o perfil privado.
          </CardContent>
        </Card>
      )}

      {/* Profile result */}
      {!isLoading && !error && profile && (
        <div className="space-y-3">
          <Card className="bg-card border-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />
            <CardContent className="p-5">
              <div className="flex gap-5 items-start flex-col sm:flex-row">
                {/* Avatar */}
                <div className="flex-shrink-0 mx-auto sm:mx-0 bg-secondary/25 p-4 rounded-xl border border-border/40 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                  <img
                    src={figureUrl(profile.figureString || "")}
                    alt={`Avatar de ${profile.name}`}
                    className="object-contain drop-shadow-xl relative z-10 mx-auto"
                    style={{ height: 140 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(profile.name)}&size=l`;
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        profile.online ? "bg-green-400 animate-pulse" : "bg-muted-foreground/40"
                      }`}
                      title={profile.online ? "En línea" : "Desconectado"}
                    />
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                      {profile.name}
                    </h2>
                    {profile.online ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        En línea
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                        Desconectado
                      </Badge>
                    )}
                  </div>

                  {profile.motto && (
                    <p className="text-sm text-muted-foreground italic text-center sm:text-left bg-secondary/30 py-1.5 px-3 rounded-lg border border-border/20">
                      "{profile.motto}"
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-secondary/20 p-2.5 rounded-lg border border-border/20 space-y-0.5">
                      <p className="text-muted-foreground">Miembro desde</p>
                      <p className="font-semibold text-foreground">{formatDate(profile.memberSince)}</p>
                    </div>
                    <div className="bg-secondary/20 p-2.5 rounded-lg border border-border/20 space-y-0.5">
                      <p className="text-muted-foreground">Último acceso</p>
                      <p className="font-semibold text-foreground">{formatDate(profile.lastAccessTime)}</p>
                    </div>
                    {profile.uniqueId && (
                      <div className="bg-secondary/20 p-2.5 rounded-lg border border-border/20 space-y-0.5 sm:col-span-2">
                        <p className="text-muted-foreground">ID Único</p>
                        <p className="font-mono text-xs text-primary truncate select-all">{profile.uniqueId}</p>
                      </div>
                    )}
                  </div>

                  {/* Origins specific stats if available */}
                  {(profile.starGemCount > 0 || profile.totalExperience > 0 || profile.currentLevel > 0) && (
                    <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                      {profile.currentLevel > 0 && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-2.5">
                          Nivel {profile.currentLevel}
                        </Badge>
                      )}
                      {profile.starGemCount > 0 && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 py-1 px-2.5">
                          ⭐ {profile.starGemCount.toLocaleString()} Gemas
                        </Badge>
                      )}
                      {profile.totalExperience > 0 && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 py-1 px-2.5">
                          ✨ {profile.totalExperience.toLocaleString()} EXP
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 7: Logros Habbo
// ─────────────────────────────────────────────

function LogrosTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: achievements, isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/habbo/achievements"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/habbo/achievements");
      if (!res.ok) throw new Error("Error al obtener logros");
      return res.json();
    },
    retry: false,
  });

  const categories = [
    { id: "all", name: "Todos", icon: <Award className="w-3.5 h-3.5" /> },
    { id: "identity", name: "Identidad", icon: <User className="w-3.5 h-3.5" /> },
    { id: "tutorial", name: "Guía", icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: "explore", name: "Explorar", icon: <Globe className="w-3.5 h-3.5" /> },
    { id: "social", name: "Social", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "pets", name: "Mascotas", icon: <Flame className="w-3.5 h-3.5" /> },
    { id: "games", name: "Juegos", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "room_builder", name: "Constructor", icon: <Home className="w-3.5 h-3.5" /> },
    { id: "trading", name: "Tradeos", icon: <Star className="w-3.5 h-3.5" /> },
    { id: "collectibles", name: "Colecciones", icon: <Award className="w-3.5 h-3.5" /> },
  ];

  // Map category code to human readable name
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "identity": return "Identidad";
      case "tutorial": return "Guía";
      case "explore": return "Explorar";
      case "social": return "Social";
      case "pets": return "Mascotas";
      case "games": return "Juegos";
      case "room_builder": return "Constructor de Salas";
      case "crackables": return "Crackeables";
      case "crafting": return "Crafteo";
      case "trading": return "Tradeo";
      case "collectibles": return "Coleccionables";
      default: return cat;
    }
  };

  // Humanize camelCase achievement names (e.g. "GamerPaycheck" -> "Gamer Paycheck")
  const humanizeName = (name: string) => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const filteredAchievements = (achievements || []).filter((item: any) => {
    const ach = item.achievement || {};
    const matchesCategory = selectedCategory === "all" || ach.category === selectedCategory;
    const matchesSearch = ach.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ach.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Category selector + Search bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar logro por nombre..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-achievements-search"
          />
        </div>

        {/* Horizontal Category Scroller */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="flex-shrink-0 gap-1.5"
            >
              {cat.icon}
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="w-12 h-12 rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            Error al obtener logros oficiales de Habbo. Inténtalo más tarde.
          </CardContent>
        </Card>
      )}

      {/* Achievements grid */}
      {!isLoading && !error && filteredAchievements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="grid-achievements">
          {filteredAchievements.map((item: any, idx: number) => {
            const ach = item.achievement || {};
            const levels = item.levelRequirements || [];
            const displayTitle = humanizeName(ach.name || "");

            return (
              <Card 
                key={`ach-${ach.id}-${idx}`}
                className="bg-card border-border hover:border-primary/30 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/2 rounded-full blur-xl -z-10 group-hover:bg-primary/10 transition-colors" />
                <CardHeader className="pb-2 pt-4 px-4 flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                      {displayTitle}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] mt-1 bg-secondary/30 text-muted-foreground border-border">
                      {getCategoryLabel(ach.category)}
                    </Badge>
                  </div>
                  {ach.creationTime && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {ach.creationTime}
                    </span>
                  )}
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-2">
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Niveles y Placas:</p>
                    <div className="flex flex-wrap gap-2">
                      {levels.map((lvl: any, lIdx: number) => {
                        const badgeCode = `${ach.name}${lvl.level}`;
                        return (
                          <div 
                            key={`lvl-${lvl.level}-${lIdx}`}
                            className="bg-secondary/40 border border-border/60 hover:border-primary/40 rounded-lg p-1.5 flex flex-col items-center gap-1 min-w-[56px] text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                            title={`${displayTitle} - Nivel ${lvl.level}`}
                          >
                            <img
                              src={badgeImageUrl(badgeCode)}
                              alt={badgeCode}
                              className="w-8 h-8 object-contain drop-shadow"
                              onError={(e) => {
                                // Fallback image if badge isn't uploaded
                                (e.target as HTMLImageElement).src = "https://images.habbo.com/c_images/album1584/ADM.gif";
                                (e.target as HTMLImageElement).style.opacity = "0.3";
                              }}
                            />
                            <div className="text-[10px] font-bold text-foreground">
                              Niv. {lvl.level}
                            </div>
                            <div className="text-[8px] text-muted-foreground bg-secondary px-1 rounded font-semibold">
                              {lvl.requiredScore} pts
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty Search Results */}
      {!isLoading && !error && filteredAchievements.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No se encontraron logros que coincidan con la búsqueda</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 7: Calculadora de Tradeo & Impuestos (NEW)
// ─────────────────────────────────────────────

function CalculadoraTradeoTab() {
  const [precioCompra, setPrecioCompra] = useState<number>(100);
  const [precioVenta, setPrecioVenta] = useState<number>(120);

  const adFee = 1;
  const commission = Math.max(1, Math.floor(precioVenta * 0.01));
  const totalTax = adFee + commission;
  const netEarnings = precioVenta - totalTax;
  const netProfit = netEarnings - precioCompra;
  const roi = precioCompra > 0 ? (netProfit / precioCompra) * 100 : 0;

  let advice = "Negocio Arriesgado ⚠️";
  let adviceColor = "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
  if (netProfit > 20) {
    advice = "¡Excelente Margen! 🔥";
    adviceColor = "text-green-400 border-green-500/30 bg-green-500/10";
  } else if (netProfit > 0) {
    advice = "Ganancia Aceptable 👍";
    adviceColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  } else if (netProfit <= 0) {
    advice = "Pérdida Asegurada 🛑";
    adviceColor = "text-rose-400 border-rose-500/30 bg-rose-500/10";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <p className="text-sm text-muted-foreground">
          Calculadora financiera para mercaderes de Habbo. Optimiza tus ganancias deduciendo comisiones e impuestos del Mercadillo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inputs */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Parámetros de Tradeo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Precio de Compra (Créditos 🪙)</label>
              <Input
                type="number"
                value={precioCompra || ""}
                onChange={(e) => setPrecioCompra(Number(e.target.value))}
                placeholder="Ej: 100"
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Precio de Venta en Mercadillo (Créditos 🪙)</label>
              <Input
                type="number"
                value={precioVenta || ""}
                onChange={(e) => setPrecioVenta(Number(e.target.value))}
                placeholder="Ej: 120"
                min={0}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-card border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl -z-10" />
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              Análisis Económico
              <span className={`text-[10px] px-2 py-0.5 rounded border ${adviceColor}`}>
                {advice}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-xs py-1 border-b border-border/40">
              <span className="text-muted-foreground">Tasa de Publicación (Fija):</span>
              <span className="font-semibold">{adFee} crédito</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/40">
              <span className="text-muted-foreground">Comisión de Venta (1%):</span>
              <span className="font-semibold text-rose-400">-{commission} créditos</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/40">
              <span className="text-muted-foreground">Total Impuestos Mercadillo:</span>
              <span className="font-semibold text-rose-500">-{totalTax} créditos</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/40">
              <span className="text-muted-foreground">Ingreso Neto de Venta:</span>
              <span className="font-semibold text-primary">{netEarnings} créditos</span>
            </div>
            <div className="flex justify-between text-sm py-2 font-bold border-b border-border/60 bg-secondary/20 px-2 rounded">
              <span className="text-foreground">Beneficio Neto:</span>
              <span className={netProfit >= 0 ? "text-green-400" : "text-rose-400"}>
                {netProfit} créditos
              </span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-muted-foreground">Retorno de Inversión (ROI):</span>
              <span className={`font-semibold ${netProfit >= 0 ? "text-green-400" : "text-rose-400"}`}>
                {roi.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function HerramientasPage() {
  const [activeTab, setActiveTab] = useState("usuario");
  const [toolsExpanded, setToolsExpanded] = useState(true);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5 font-sans">
      
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left column: Content Area (flex-1) */}
        <div className="w-full lg:flex-1 min-w-0 bg-[#1e293b]/20 border border-zinc-800 rounded-2xl p-6 shadow-xl relative min-h-[450px]">
          {activeTab === "usuario" && <BuscarUsuarioTab />}
          {activeTab === "origins" && <OriginsLookupTab />}
          {activeTab === "logros" && <LogrosTab />}
          {activeTab === "hotlooks" && <HotLooksTab />}
          {activeTab === "sala" && <BuscarSalaTab />}
          {activeTab === "grupo" && <BuscarGrupoTab />}
          {activeTab === "placa" && <PropietariosPlacaTab />}
          {activeTab === "calculadora" && <CalculadoraTradeoTab />}
        </div>

        {/* Right column: Sidebar (w-full lg:w-80) */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
          
          {/* Header Card */}
          <div className="bg-[#1e293b]/20 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-2">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider font-cabinet">
              <Wrench className="w-4 h-4 text-primary animate-pulse" /> Herramientas Habbo
            </h2>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Consulta información pública de la API oficial de Habbo: usuarios, salas, grupos, Hot Looks y placas.
            </p>
          </div>

          {/* Tools Collapsible Card */}
          <div className="bg-[#18181b] border border-zinc-850 rounded-2xl p-4 shadow-2xl space-y-3">
            
            {/* Header Accordion button */}
            <button 
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-2">
                <i className="fa-solid fa-toolbox text-primary" /> Herramientas
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${toolsExpanded ? "rotate-180" : ""}`} />
            </button>

            {toolsExpanded && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/50">
                {[
                  { id: "usuario", label: "Buscar Usuario", icon: User, img: "https://www.habbo.es/habbo-imaging/avatarimage?user=Staff&size=s&headonly=1" },
                  { id: "origins", label: "Habbo Origins", icon: Globe },
                  { id: "logros", label: "Logros Habbo", icon: Trophy },
                  { id: "hotlooks", label: "Hot Looks", icon: Flame },
                  { id: "sala", label: "Buscar Sala", icon: DoorOpen },
                  { id: "grupo", label: "Buscar Grupo", icon: Shield },
                  { id: "placa", label: "Propietarios de Placa", icon: Award },
                ].map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative border text-left ${
                        isActive
                          ? "bg-[#27272a]/60 text-white border-primary shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-primary/30"
                          : "bg-zinc-950/45 text-slate-400 border-zinc-800/60 hover:text-white hover:bg-zinc-900/40"
                      }`}
                    >
                      {item.img ? (
                        <img 
                          src={item.img} 
                          alt="avatar" 
                          className="w-4 h-4 object-contain rounded-full flex-shrink-0 scale-125 mr-0.5" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-slate-500"}`} />
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* Calculadora Tradeo (Independent bottom button) */}
                <div className="pt-2 mt-2 border-t border-zinc-805">
                  <button
                    onClick={() => setActiveTab("calculadora")}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                      activeTab === "calculadora"
                        ? "bg-[#27272a]/60 text-white border-primary shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-primary/30"
                        : "bg-zinc-950/45 text-slate-400 border-zinc-800/60 hover:text-white hover:bg-zinc-900/40"
                    }`}
                  >
                    <Activity className={`w-4 h-4 flex-shrink-0 ${activeTab === "calculadora" ? "text-primary" : "text-slate-500"}`} />
                    <span>Calculadora Tradeo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}

