import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  Shirt,
  Scissors,
  Eye,
  Copy,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Crown,
  Footprints,
  Glasses,
  Palette,
  Search,
  User,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClothingItem {
  id: number;
  colors: number[];
  label: string;
  type?: string; // for accessories that have different sub-types
}

interface FigurePart {
  type: string;
  id: number;
  color: number;
}

// ─── Clothing Data ────────────────────────────────────────────────────────────

const CLOTHING_DATA: Record<string, ClothingItem[]> = {
  hr: [
    { id: 110, colors: [61, 40, 1, 3, 62], label: "Clásico" },
    { id: 165, colors: [61, 40, 1, 3], label: "Largo" },
    { id: 170, colors: [61, 40, 1], label: "Punk" },
    { id: 175, colors: [61, 40, 1, 3], label: "Afro" },
    { id: 177, colors: [61, 40, 1], label: "Corto" },
    { id: 185, colors: [61, 40, 1, 3], label: "Moderno" },
    { id: 680, colors: [61, 40, 1], label: "Emo" },
    { id: 828, colors: [61, 40, 1], label: "Trendy" },
    { id: 890, colors: [61, 40, 1, 3], label: "Elegante" },
    { id: 3048, colors: [61, 40, 1], label: "Nuevo" },
  ],
  ha: [
    { id: 1001, colors: [0], label: "Gorra" },
    { id: 1002, colors: [0], label: "Sombrero" },
    { id: 1003, colors: [0], label: "Boina" },
    { id: 1012, colors: [110, 62], label: "Gorro" },
    { id: 1013, colors: [0], label: "Casco" },
    { id: 1014, colors: [0], label: "Corona" },
  ],
  ch: [
    { id: 210, colors: [66, 82, 110, 92, 62], label: "Camiseta" },
    { id: 215, colors: [66, 82, 110, 92], label: "Polo" },
    { id: 220, colors: [66, 82, 110], label: "Camisa" },
    { id: 225, colors: [66, 82, 110, 92], label: "Chaleco" },
    { id: 230, colors: [66, 82, 110], label: "Sudadera" },
    { id: 232, colors: [66, 82, 110, 92], label: "Blazer" },
    { id: 255, colors: [66, 82, 110], label: "Tank Top" },
    { id: 804, colors: [1341, 110, 82], label: "Premium" },
  ],
  lg: [
    { id: 270, colors: [82, 110, 92, 62], label: "Jeans" },
    { id: 275, colors: [110, 82, 92], label: "Pantalón" },
    { id: 280, colors: [110, 82, 66], label: "Largo" },
    { id: 281, colors: [110, 82], label: "Bermuda" },
    { id: 285, colors: [110, 82, 92], label: "Cargo" },
    { id: 290, colors: [110, 82], label: "Sport" },
  ],
  sh: [
    { id: 290, colors: [80, 62, 110], label: "Zapatillas" },
    { id: 295, colors: [62, 80, 110], label: "Botas" },
    { id: 300, colors: [62, 80, 110], label: "Sandalias" },
    { id: 305, colors: [62, 80, 110], label: "Zapatos" },
    { id: 3089, colors: [110, 62, 80], label: "Deportivas" },
  ],
  acc: [
    { id: 100, type: "he", colors: [0], label: "Gafas" },
    { id: 102, type: "he", colors: [0], label: "Lentes Sol" },
    { id: 105, type: "fa", colors: [0], label: "Barba" },
    { id: 110, type: "ea", colors: [0], label: "Aretes" },
  ],
};

// Color swatch map: maps Habbo color IDs to approximate display hex values
const COLOR_SWATCHES: Record<number, string> = {
  0: "#888888",
  1: "#3b2a1a",
  3: "#5c3d1e",
  40: "#c8a87a",
  61: "#1a1a1a",
  62: "#4a4a8a",
  66: "#c0392b",
  80: "#2c3e50",
  82: "#2c3e50",
  92: "#27ae60",
  110: "#1a1a1a",
  1341: "#f39c12",
};

// ─── Figure String Helpers ────────────────────────────────────────────────────

function parseFigureString(fig: string): FigurePart[] {
  if (!fig) return [];
  return fig
    .split(".")
    .map((part) => {
      const segments = part.split("-");
      if (segments.length < 2) return null;
      const [type, idStr, colorStr] = segments;
      const id = parseInt(idStr, 10);
      const color = colorStr ? parseInt(colorStr, 10) : 0;
      if (isNaN(id)) return null;
      return { type, id, color };
    })
    .filter(Boolean) as FigurePart[];
}

function buildFigureString(parts: FigurePart[]): string {
  return parts.map((p) => `${p.type}-${p.id}-${p.color}`).join(".");
}

function replaceFigurePart(
  parts: FigurePart[],
  type: string,
  id: number,
  color: number
): FigurePart[] {
  const existing = parts.find((p) => p.type === type);
  if (existing) {
    return parts.map((p) => (p.type === type ? { ...p, id, color } : p));
  }
  return [...parts, { type, id, color }];
}

function removeFigurePart(parts: FigurePart[], type: string): FigurePart[] {
  return parts.filter((p) => p.type !== type);
}

// ─── Avatar Image URL Builder ────────────────────────────────────────────────

function buildAvatarUrl(opts: {
  figure?: string;
  user?: string;
  size?: string;
  direction?: number;
  headDirection?: number;
  isOrigins?: boolean;
}): string {
  const {
    figure,
    user,
    size = "l",
    direction = 3,
    headDirection = 3,
    isOrigins = false,
  } = opts;

  const base = isOrigins
    ? "https://origins.habbo.es/habbo-imaging/avatarimage"
    : "https://www.habbo.es/habbo-imaging/avatarimage";

  const params = new URLSearchParams();
  if (figure) {
    params.set("figure", figure);
  } else if (user) {
    params.set("user", user);
  }
  params.set("size", size);
  params.set("direction", String(direction));
  params.set("head_direction", String(headDirection));

  return `${base}?${params.toString()}`;
}

// Default base figure for item previews (neutral body)
const BASE_FIGURE = "hd-180-1";

function buildItemPreviewUrl(
  figType: string,
  itemId: number,
  color: number,
  isOrigins: boolean
): string {
  const fig = `${BASE_FIGURE}.${figType}-${itemId}-${color}`;
  return buildAvatarUrl({ figure: fig, size: "s", direction: 3, isOrigins });
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "hr", label: "Cabello", icon: Scissors, figType: "hr" },
  { key: "ha", label: "Sombreros", icon: Crown, figType: "ha" },
  { key: "ch", label: "Camisas", icon: Shirt, figType: "ch" },
  { key: "lg", label: "Pantalones", icon: Palette, figType: "lg" },
  { key: "sh", label: "Zapatos", icon: Footprints, figType: "sh" },
  { key: "acc", label: "Accesorios", icon: Glasses, figType: "acc" },
];

// ─── Habbo color display helper ───────────────────────────────────────────────

function ColorSwatch({
  colorId,
  selected,
  onClick,
}: {
  colorId: number;
  selected: boolean;
  onClick: () => void;
}) {
  const hex = COLOR_SWATCHES[colorId] ?? "#999999";
  return (
    <button
      onClick={onClick}
      data-testid={`swatch-color-${colorId}`}
      className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
        selected
          ? "border-primary ring-2 ring-primary ring-offset-1 scale-110"
          : "border-border/60 hover:border-border"
      }`}
      style={{ backgroundColor: hex }}
      title={`Color ${colorId}`}
    />
  );
}

// ─── Clothing Item Card ───────────────────────────────────────────────────────

function ClothingItemCard({
  item,
  figType,
  isSelected,
  selectedColor,
  isOrigins,
  onSelect,
  onColorChange,
}: {
  item: ClothingItem;
  figType: string;
  isSelected: boolean;
  selectedColor: number | null;
  isOrigins: boolean;
  onSelect: (item: ClothingItem) => void;
  onColorChange: (item: ClothingItem, color: number) => void;
}) {
  const effectiveFigType = item.type || figType;
  const displayColor = selectedColor ?? item.colors[0];
  const previewUrl = buildItemPreviewUrl(effectiveFigType, item.id, displayColor, isOrigins);

  return (
    <div
      className={`flex flex-col rounded-lg border transition-all cursor-pointer group ${
        isSelected
          ? "border-primary bg-primary/10 dark:bg-primary/20"
          : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
      }`}
      onClick={() => onSelect(item)}
      data-testid={`clothing-item-${effectiveFigType}-${item.id}`}
    >
      {/* Avatar preview */}
      <div className="flex items-end justify-center pt-2 pb-1 min-h-[56px] relative overflow-hidden">
        <img
          src={previewUrl}
          alt={item.label}
          className="object-contain max-h-14 drop-shadow-sm"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = "0.2";
          }}
        />
        {isSelected && (
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-[10px] text-center text-muted-foreground px-1 pb-1 truncate leading-tight">
        {item.label}
      </p>

      {/* Color swatches (only visible when selected) */}
      {isSelected && item.colors.length > 1 && (
        <div
          className="flex flex-wrap gap-1 justify-center pb-2 px-1"
          onClick={(e) => e.stopPropagation()}
        >
          {item.colors.map((c) => (
            <ColorSwatch
              key={c}
              colorId={c}
              selected={displayColor === c}
              onClick={() => onColorChange(item, c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Direction Control ────────────────────────────────────────────────────────

function DirectionControl({
  direction,
  onChange,
}: {
  direction: number;
  onChange: (d: number) => void;
}) {
  const prev = () => onChange((direction + 7) % 8);
  const next = () => onChange((direction + 1) % 8);

  const LABELS: Record<number, string> = {
    0: "↑ Norte",
    1: "↗ N-E",
    2: "↗ Este-N",
    3: "→ Este",
    4: "↘ Sur-E",
    5: "↓ Sur",
    6: "↙ Sur-O",
    7: "← Oeste",
  };

  return (
    <div className="flex items-center gap-1" data-testid="direction-control">
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        onClick={prev}
        data-testid="button-direction-prev"
        title="Girar izquierda"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </Button>
      <span className="text-[10px] text-muted-foreground w-16 text-center font-mono">
        {direction} {LABELS[direction]}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        onClick={next}
        data-testid="button-direction-next"
        title="Girar derecha"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ArmarioPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Username input (can be pre-filled from auth user)
  const [usernameInput, setUsernameInput] = useState(user?.habboUsername ?? "");
  const [searchedUser, setSearchedUser] = useState<string>("");

  // Figure string state
  const [figureParts, setFigureParts] = useState<FigurePart[]>([]);
  const [originalFigure, setOriginalFigure] = useState<string>("");

  // UI state
  const [direction, setDirection] = useState(3);
  const [size, setSize] = useState<"s" | "m" | "l" | "b">("l");
  const [isOrigins, setIsOrigins] = useState(false);
  const [activeCategory, setActiveCategory] = useState("hr");

  // Per-item selected colors: key = `type-id`, value = colorId
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({});

  // Fetch user's figure string
  const {
    data: habboUserData,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery<{ figureString?: string; name?: string }>({
    queryKey: ["/api/habbo/user", searchedUser, isOrigins ? "origins" : "normal"],
    queryFn: async () => {
      if (!searchedUser) return {};
      const url = isOrigins
        ? `/api/habbo/origins/user/${encodeURIComponent(searchedUser)}`
        : `/api/habbo/user/${encodeURIComponent(searchedUser)}`;
      const res = await apiRequest("GET", url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo encontrar el usuario");
      }
      return res.json();
    },
    enabled: !!searchedUser,
    retry: false,
    staleTime: 60000,
  });

  // When user data loads, apply figure string
  const handleUserLoad = useCallback(
    (data: { figureString?: string } | undefined) => {
      if (data?.figureString) {
        const parts = parseFigureString(data.figureString);
        setFigureParts(parts);
        setOriginalFigure(data.figureString);
      }
    },
    []
  );

  // Effect: sync when data changes
  useMemo(() => {
    if (habboUserData && !isLoadingUser) {
      handleUserLoad(habboUserData);
    }
  }, [habboUserData, isLoadingUser, handleUserLoad]);

  // Current figure string
  const currentFigure = figureParts.length > 0 ? buildFigureString(figureParts) : originalFigure;

  // Avatar URL
  const avatarUrl = useMemo(() => {
    if (currentFigure) {
      return buildAvatarUrl({ figure: currentFigure, size, direction, isOrigins });
    }
    if (searchedUser && !figureParts.length) {
      return buildAvatarUrl({ user: searchedUser, size, direction, isOrigins });
    }
    return "";
  }, [currentFigure, searchedUser, figureParts, size, direction, isOrigins]);

  // Search handler
  const handleSearch = () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    setSearchedUser(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // Reset avatar to original
  const handleReset = () => {
    if (originalFigure) {
      setFigureParts(parseFigureString(originalFigure));
      setSelectedColors({});
      toast({ title: "Avatar restablecido al original" });
    }
  };

  // Copy figure string
  const handleCopyFigure = () => {
    if (!currentFigure) return;
    navigator.clipboard.writeText(currentFigure).then(() => {
      toast({ title: "String de figura copiada al portapapeles" });
    });
  };

  // Apply a clothing item
  const handleSelectItem = (item: ClothingItem, figType: string) => {
    const effectiveType = item.type || figType;
    const colorKey = `${effectiveType}-${item.id}`;
    const color = selectedColors[colorKey] ?? item.colors[0];

    setFigureParts((prev) => replaceFigurePart(prev.length ? prev : parseFigureString(currentFigure || BASE_FIGURE), effectiveType, item.id, color));
  };

  // Change color for a selected item
  const handleColorChange = (item: ClothingItem, figType: string, color: number) => {
    const effectiveType = item.type || figType;
    const colorKey = `${effectiveType}-${item.id}`;
    setSelectedColors((prev) => ({ ...prev, [colorKey]: color }));
    setFigureParts((prev) => {
      const existing = prev.find((p) => p.type === effectiveType && p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.type === effectiveType && p.id === item.id ? { ...p, color } : p
        );
      }
      return prev;
    });
  };

  // Remove a clothing part
  const handleRemovePart = (figType: string) => {
    setFigureParts((prev) => removeFigurePart(prev, figType));
  };

  // Check if item is currently active in figure
  const isItemSelected = (item: ClothingItem, figType: string): boolean => {
    const effectiveType = item.type || figType;
    return figureParts.some((p) => p.type === effectiveType && p.id === item.id);
  };

  const getSelectedColor = (item: ClothingItem, figType: string): number | null => {
    const effectiveType = item.type || figType;
    const colorKey = `${effectiveType}-${item.id}`;
    if (selectedColors[colorKey] !== undefined) return selectedColors[colorKey];
    const part = figureParts.find((p) => p.type === effectiveType && p.id === item.id);
    return part?.color ?? null;
  };

  const SIZES: { value: "s" | "m" | "l" | "b"; label: string }[] = [
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "b", label: "XL" },
  ];

  return (
    <TooltipProvider>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shirt className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Armario</h1>
            <p className="text-xs text-muted-foreground">
              Prueba ropa en tu avatar de Habbo en tiempo real
            </p>
          </div>
        </div>

        {/* User search */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Usuario de Habbo
                </Label>
                <Input
                  placeholder="Introduce tu usuario de Habbo..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  data-testid="input-habbo-username"
                />
              </div>
              <div className="flex items-center gap-2 pb-0.5">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">
                  Habbo Origins
                </Label>
                <Switch
                  checked={isOrigins}
                  onCheckedChange={(v) => {
                    setIsOrigins(v);
                    if (searchedUser) {
                      // re-fetch with new hotel
                      setSearchedUser("");
                      setTimeout(() => setSearchedUser(searchedUser), 50);
                    }
                  }}
                  data-testid="switch-origins-mode"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!usernameInput.trim() || isLoadingUser}
                className="bg-primary hover:bg-primary/80 text-white sm:w-auto w-full"
                data-testid="button-load-avatar"
              >
                {isLoadingUser ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Cargar Avatar
                  </>
                )}
              </Button>
            </div>
            {userError && (
              <p className="text-xs text-destructive mt-2" data-testid="text-user-error">
                ⚠ No se pudo cargar el avatar. Verifica que el usuario exista y su perfil sea público.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          {/* ── Left: Avatar Preview ── */}
          <div className="space-y-3">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Vista Previa
                  {isOrigins && (
                    <Badge variant="outline" className="text-[9px] ml-auto border-amber-500/50 text-amber-500">
                      Origins
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex flex-col items-center gap-3">
                {/* Avatar image */}
                <div
                  className="flex items-end justify-center bg-secondary/30 rounded-xl border border-border/50 w-full min-h-44 relative overflow-hidden"
                  data-testid="avatar-preview-container"
                >
                  {isLoadingUser ? (
                    <Skeleton className="w-20 h-36 rounded-lg my-4" />
                  ) : avatarUrl ? (
                    <img
                      key={avatarUrl}
                      src={avatarUrl}
                      alt={`Avatar de ${searchedUser || "Habbo"}`}
                      className="object-contain drop-shadow-2xl my-4"
                      style={{
                        maxHeight:
                          size === "b" ? "160px" : size === "l" ? "120px" : size === "m" ? "90px" : "70px",
                      }}
                      data-testid="img-avatar-preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.2";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/40">
                      <User className="w-12 h-12 mb-2" />
                      <p className="text-xs">Carga un avatar para empezar</p>
                    </div>
                  )}

                  {/* Hotel badge */}
                  <div className="absolute bottom-2 right-2">
                    <Badge
                      variant="outline"
                      className="text-[9px] border-border/40 text-muted-foreground"
                      data-testid="badge-hotel-mode"
                    >
                      {isOrigins ? "Origins" : "Normal"}
                    </Badge>
                  </div>
                </div>

                {/* Direction control */}
                <div className="flex flex-col items-center gap-1 w-full">
                  <p className="text-[10px] text-muted-foreground">Dirección</p>
                  <DirectionControl direction={direction} onChange={setDirection} />
                </div>

                {/* Size selector */}
                <div className="flex flex-col items-center gap-1 w-full">
                  <p className="text-[10px] text-muted-foreground">Tamaño</p>
                  <div className="flex gap-1" data-testid="size-selector">
                    {SIZES.map((s) => (
                      <Button
                        key={s.value}
                        variant={size === s.value ? "default" : "outline"}
                        size="sm"
                        className={`h-7 w-10 text-xs ${size === s.value ? "bg-primary text-white" : ""}`}
                        onClick={() => setSize(s.value)}
                        data-testid={`button-size-${s.value}`}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={handleReset}
                    disabled={!originalFigure}
                    data-testid="button-reset-avatar"
                  >
                    <RotateCcw className="w-3 h-3 mr-1.5" />
                    Restablecer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={handleCopyFigure}
                    disabled={!currentFigure}
                    data-testid="button-copy-figure"
                  >
                    <Copy className="w-3 h-3 mr-1.5" />
                    Copiar String
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Figure string display */}
            {currentFigure && (
              <Card className="bg-card border-border" data-testid="card-figure-string">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-medium">String de figura</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={handleCopyFigure}
                      data-testid="button-copy-figure-small"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p
                    className="text-[9px] font-mono text-muted-foreground break-all leading-relaxed bg-secondary/40 rounded p-2 border border-border/40"
                    data-testid="text-figure-string"
                  >
                    {currentFigure}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Active parts list */}
            {figureParts.length > 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-3 space-y-1.5">
                  <p className="text-[10px] text-muted-foreground font-medium mb-2">Partes activas</p>
                  {figureParts.map((part) => (
                    <div
                      key={part.type}
                      className="flex items-center justify-between text-[10px] group"
                      data-testid={`part-row-${part.type}`}
                    >
                      <span className="font-mono text-primary/80 w-8">{part.type}</span>
                      <span className="text-muted-foreground flex-1 px-2">
                        id:{part.id} col:{part.color}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity text-[10px]"
                        onClick={() => handleRemovePart(part.type)}
                        data-testid={`button-remove-part-${part.type}`}
                        title={`Quitar ${part.type}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Right: Clothing Browser ── */}
          <Card className="bg-card border-border">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Explorar Ropa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-3">
              <Tabs
                value={activeCategory}
                onValueChange={setActiveCategory}
                data-testid="tabs-clothing-categories"
              >
                <TabsList className="flex flex-wrap h-auto gap-1 bg-secondary/50 p-1 rounded-lg mb-4">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <TabsTrigger
                        key={cat.key}
                        value={cat.key}
                        className="flex items-center gap-1.5 text-xs h-8 px-3 data-[state=active]:bg-primary data-[state=active]:text-white"
                        data-testid={`tab-category-${cat.key}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{cat.label}</span>
                        <span className="sm:hidden">{cat.label.slice(0, 3)}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {CATEGORIES.map((cat) => {
                  const items = CLOTHING_DATA[cat.key] ?? [];
                  return (
                    <TabsContent key={cat.key} value={cat.key} className="mt-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{cat.label}</span>
                          <Badge variant="outline" className="text-[9px] border-border/50 text-muted-foreground">
                            {items.length} items
                          </Badge>
                        </div>
                        {/* Remove current category part */}
                        {cat.key !== "acc" && figureParts.some((p) => p.type === cat.figType) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-destructive hover:text-destructive/80"
                            onClick={() => handleRemovePart(cat.figType)}
                            data-testid={`button-remove-category-${cat.key}`}
                          >
                            Quitar
                          </Button>
                        )}
                      </div>

                      <div
                        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2"
                        data-testid={`grid-clothing-${cat.key}`}
                      >
                        {items.map((item) => {
                          const effectiveType = item.type || cat.figType;
                          const isSelected = isItemSelected(item, cat.figType);
                          const selColor = getSelectedColor(item, cat.figType);

                          return (
                            <Tooltip key={`${effectiveType}-${item.id}`}>
                              <TooltipTrigger asChild>
                                <div>
                                  <ClothingItemCard
                                    item={item}
                                    figType={cat.figType}
                                    isSelected={isSelected}
                                    selectedColor={selColor}
                                    isOrigins={isOrigins}
                                    onSelect={(i) => handleSelectItem(i, cat.figType)}
                                    onColorChange={(i, c) =>
                                      handleColorChange(i, cat.figType, c)
                                    }
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="bg-card border-border text-xs"
                              >
                                <p className="font-medium">{item.label}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {effectiveType}-{item.id}
                                </p>
                                {isSelected && (
                                  <p className="text-[10px] text-primary">✓ Activo</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>

                      {/* Category color info */}
                      {activeCategory === cat.key && (
                        <p className="text-[10px] text-muted-foreground/60 mt-4 text-center">
                          Haz clic en un ítem para aplicarlo. Si está seleccionado, aparecen los colores disponibles.
                        </p>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Hotel info footer */}
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Las imágenes se generan desde{" "}
          {isOrigins
            ? "origins.habbo.es/habbo-imaging/avatarimage"
            : "habbo.es/habbo-imaging/avatarimage"}
          . El perfil del usuario debe ser público.
        </p>
      </div>
    </TooltipProvider>
  );
}
