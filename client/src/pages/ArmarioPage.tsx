import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { proxyImage } from "@/lib/habboProxy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Scissors,
  User,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  Shirt,
  Footprints,
  Crown,
  Glasses,
  Smile
} from "lucide-react";

import setsData from "@/data/sets.json";
import palettesData from "@/data/palettes.json";

// Categories definitions with their labels, keys, and display icons
const CATEGORIES = [
  { key: "hr", label: "Cabello", icon: Scissors },
  { key: "hd", label: "Cabeza", icon: User },
  { key: "ch", label: "Camisas", icon: Shirt },
  { key: "lg", label: "Pantalones", icon: Shirt }, // lg represents legs/trousers
  { key: "sh", label: "Zapatos", icon: Footprints },
  { key: "ha", label: "Sombreros", icon: Crown },
  { key: "he", label: "Acc. Ojos", icon: Glasses },
  { key: "ea", label: "Acc. Orejas", icon: Sparkles },
  { key: "fa", label: "Barba/Rostro", icon: Smile },
  { key: "ca", label: "Chaquetas", icon: Shirt },
  { key: "wa", label: "Cinturones", icon: Sparkles },
  { key: "cc", label: "Acc. Cuello", icon: Sparkles },
  { key: "cp", label: "Espalda/Capas", icon: Sparkles },
];

const ACTIONS = [
  { key: "std", label: "Normal" },
  { key: "wav", label: "Saludar" },
  { key: "wlk", label: "Caminar" },
  { key: "run", label: "Correr" },
  { key: "sit", label: "Sentarse" },
  { key: "lay", label: "Acostarse" },
  { key: "sml", label: "Hablar" },
];

// Helper to parse figure string
interface FigurePart {
  type: string;
  id: number;
  color: number;
  color2?: number;
}

function parseFigureString(fig: string): FigurePart[] {
  if (!fig) return [];
  return fig
    .split(".")
    .map((part) => {
      const segments = part.split("-");
      if (segments.length < 2) return null;
      const [type, idStr, colorStr, color2Str] = segments;
      const id = parseInt(idStr, 10);
      const color = colorStr ? parseInt(colorStr, 10) : 0;
      const color2 = color2Str ? parseInt(color2Str, 10) : undefined;
      if (isNaN(id)) return null;
      return { type, id, color, color2 };
    })
    .filter(Boolean) as FigurePart[];
}

function buildFigureString(parts: FigurePart[]): string {
  return parts
    .map((p) => {
      let str = `${p.type}-${p.id}-${p.color}`;
      if (p.color2 !== undefined) {
        str += `-${p.color2}`;
      }
      return str;
    })
    .join(".");
}

export default function ArmarioPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const sets = setsData as any[];
  const palettes = palettesData as Record<string, any>;

  // Avatar state
  const [gender, setGender] = useState<"M" | "F">("M");
  const [activeCategoryKey, setActiveCategoryKey] = useState("hr");
  const [colorTarget, setColorTarget] = useState<"color1" | "color2">("color1");

  // Initial figure logic
  const [figureParts, setFigureParts] = useState<FigurePart[]>(() => {
    const defaultFig = "hr-83-61.hd-180-1.ch-210-66.lg-270-82.sh-290-80";
    return parseFigureString(defaultFig);
  });

  const [direction, setDirection] = useState(2);
  const [headDirection, setHeadDirection] = useState(2);
  const [action, setAction] = useState("std");
  const [signal, setSignal] = useState<number | null>(null);
  const [handItem, setHandItem] = useState<number | null>(null);

  // Pagination for clothing items grid
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  // Selected item and color per category
  const activeCategoryIndex = useMemo(() => {
    return CATEGORIES.findIndex((c) => c.key === activeCategoryKey);
  }, [activeCategoryKey]);

  const activeCategorySet = useMemo(() => {
    return sets.find((s) => s.type === activeCategoryKey);
  }, [sets, activeCategoryKey]);

  const activePaletteId = activeCategorySet?.paletteid || 1;

  // Available items in the active category filtered by gender
  const availableItems = useMemo(() => {
    if (!activeCategorySet || !activeCategorySet.sets) return [];
    return Object.entries(activeCategorySet.sets)
      .map(([id, info]: [string, any]) => ({
        id: parseInt(id, 10),
        ...info,
      }))
      .filter((item) => {
        // filter out non-selectable items
        if (item.selectable !== 1) return false;
        // filter by gender
        return item.gender === "U" || item.gender === gender;
      });
  }, [activeCategorySet, gender]);

  // Total pages for items grid
  const totalPages = Math.ceil(availableItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return availableItems.slice(start, start + ITEMS_PER_PAGE);
  }, [availableItems, currentPage]);

  // Available colors for the active category
  const availableColors = useMemo(() => {
    const palette = palettes[String(activePaletteId)];
    if (!palette) return [];
    return Object.entries(palette)
      .map(([id, info]: [string, any]) => ({
        id: parseInt(id, 10),
        ...info,
      }))
      .filter((color) => color.selectable === 1)
      .sort((a, b) => a.index - b.index);
  }, [palettes, activePaletteId]);

  // Find currently selected values for active category
  const activeSelection = useMemo(() => {
    const found = figureParts.find((p) => p.type === activeCategoryKey);
    return {
      id: found?.id || null,
      color1: found?.color || 0,
      color2: found?.color2,
    };
  }, [figureParts, activeCategoryKey]);

  // Handle category change
  const handleCategoryChange = (key: string) => {
    setActiveCategoryKey(key);
    setCurrentPage(1);
    setColorTarget("color1");
  };

  // Update a specific part of the avatar
  const updateFigurePart = (itemId: number, color1: number, color2?: number) => {
    setFigureParts((prev) => {
      const existing = prev.find((p) => p.type === activeCategoryKey);
      if (existing) {
        return prev.map((p) =>
          p.type === activeCategoryKey
            ? { ...p, id: itemId, color: color1, color2 }
            : p
        );
      } else {
        return [...prev, { type: activeCategoryKey, id: itemId, color: color1, color2 }];
      }
    });
  };

  // Live figure string
  const figureString = useMemo(() => {
    return buildFigureString(figureParts);
  }, [figureParts]);

  // Build live avatar image URL
  const avatarUrl = useMemo(() => {
    const base = "https://www.habbo.es/habbo-imaging/avatarimage";
    const params = new URLSearchParams();
    params.set("figure", figureString);
    params.set("size", "l");
    params.set("direction", String(direction));
    params.set("head_direction", String(headDirection));

    // Handle gestures/actions
    if (action === "wav") {
      params.set("action", "wav");
    } else if (action === "wlk") {
      params.set("action", "wlk");
    } else if (action === "run") {
      params.set("action", "run");
    } else if (action === "sit") {
      params.set("action", "sit");
    } else if (action === "lay") {
      params.set("action", "lay");
    } else if (action === "sml") {
      params.set("gesture", "sml");
    }

    if (signal !== null) {
      params.set("action", `sig=${signal}`);
    }

    if (handItem !== null) {
      // If action is already set, append handitem
      const actVal = params.get("action");
      if (actVal) {
        params.set("action", `${actVal},drk=${handItem}`);
      } else {
        params.set("action", `drk=${handItem}`);
      }
    }

    return proxyImage(`${base}?${params.toString()}`);
  }, [figureString, direction, headDirection, action, signal, handItem]);

  // Rotate avatar body
  const rotateBody = (way: "left" | "right") => {
    setDirection((prev) => {
      let next = way === "left" ? prev - 1 : prev + 1;
      if (next < 1) next = 8;
      if (next > 8) next = 1;
      return next;
    });
  };

  // Rotate avatar head
  const rotateHead = (way: "left" | "right") => {
    setHeadDirection((prev) => {
      let next = way === "left" ? prev - 1 : prev + 1;
      if (next < 1) next = 8;
      if (next > 8) next = 1;
      return next;
    });
  };

  // Download Avatar PNG
  const downloadAvatar = () => {
    const link = document.createElement("a");
    link.href = avatarUrl;
    link.setAttribute("download", `habbo_avatar_${Date.now()}.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Descarga Iniciada", description: "La imagen de tu avatar se está descargando." });
  };

  // Copy figure code to clipboard
  const copyFigureCode = () => {
    navigator.clipboard.writeText(figureString);
    toast({ title: "Copiado", description: "Código de figura copiado al portapapeles." });
  };

  // Handle clothing item select
  const handleItemSelect = (itemId: number) => {
    const current = figureParts.find((p) => p.type === activeCategoryKey);
    const color1 = current?.color || availableColors[0]?.id || 0;
    const color2 = current?.color2;
    updateFigurePart(itemId, color1, color2);
  };

  // Handle color select
  const handleColorSelect = (colorId: number) => {
    const current = figureParts.find((p) => p.type === activeCategoryKey);
    if (!current) return;

    if (colorTarget === "color1") {
      updateFigurePart(current.id, colorId, current.color2);
    } else {
      updateFigurePart(current.id, current.color, colorId);
    }
  };

  // Render clothing preview image
  const buildItemPreview = (itemId: number) => {
    // Renders only the item on a neutral body
    const previewFig = `hd-180-1.${activeCategoryKey}-${itemId}-${activeSelection.color1}`;
    const url = `https://www.habbo.es/habbo-imaging/avatarimage?figure=${previewFig}&size=s&direction=3&head_direction=3&headonly=0`;
    return proxyImage(url);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5 font-sans">
      
      {/* Title Header */}
      <div className="site-panel-strong p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="site-kicker">Herramientas</p>
          <h1 className="site-title mt-2 flex items-center gap-3">
            <User className="w-5 h-5 text-primary animate-pulse" />
            Armario HabboSpeed
          </h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-2xl">
            Personaliza tu avatar con todas las prendas y paletas oficiales de Habbo. Rota tu personaje, añade gestos, señales u objetos en mano.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={gender === "M" ? "default" : "outline"}
            onClick={() => { setGender("M"); setCurrentPage(1); }}
            className={`text-xs px-4 h-8 font-bold ${gender === "M" ? "bg-primary text-black" : "border-border text-white"}`}
          >
            Masculino
          </Button>
          <Button
            variant={gender === "F" ? "default" : "outline"}
            onClick={() => { setGender("F"); setCurrentPage(1); }}
            className={`text-xs px-4 h-8 font-bold ${gender === "F" ? "bg-primary text-black" : "border-border text-white"}`}
          >
            Femenino
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Side: Live Preview & Action panel (Col-span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-border bg-card/60 backdrop-blur-md overflow-hidden relative shadow-lg">
            <CardHeader className="py-3 px-4 border-b border-border bg-secondary/20">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              
              {/* Live Image Box */}
              <div className="w-48 h-64 relative bg-zinc-950/40 rounded-2xl border border-border/80 flex items-center justify-center overflow-hidden group shadow-inner">
                
                {/* Body Rotation Buttons */}
                <button
                  onClick={() => rotateBody("left")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-primary/95 text-white hover:text-black border border-border/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow"
                  title="Girar Cuerpo Izquierda"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => rotateBody("right")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-primary/95 text-white hover:text-black border border-border/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow"
                  title="Girar Cuerpo Derecha"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Head Rotation Buttons */}
                <div className="absolute top-2 left-0 right-0 flex justify-between px-3">
                  <button
                    onClick={() => rotateHead("left")}
                    className="w-6 h-6 rounded-md bg-black/40 hover:bg-primary text-white hover:text-black text-[10px] flex items-center justify-center font-bold"
                    title="Girar Cabeza Izquierda"
                  >
                    H‹
                  </button>
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider self-center">Girar</span>
                  <button
                    onClick={() => rotateHead("right")}
                    className="w-6 h-6 rounded-md bg-black/40 hover:bg-primary text-white hover:text-black text-[10px] flex items-center justify-center font-bold"
                    title="Girar Cabeza Derecha"
                  >
                    H›
                  </button>
                </div>

                <img
                  src={avatarUrl}
                  alt="Avatar Live Preview"
                  className="w-44 h-56 object-contain drop-shadow-[0_4px_10px_rgba(180,0,255,0.4)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="w-full mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAvatar}
                  className="text-xs h-8 border-border hover:bg-primary hover:text-black font-bold"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Descargar PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyFigureCode}
                  className="text-xs h-8 border-border hover:bg-primary hover:text-black font-bold"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copiar Código
                </Button>
              </div>

              {/* Live Figure Output Display */}
              <div className="w-full mt-3">
                <Input
                  value={figureString}
                  readOnly
                  className="text-[10px] text-muted-foreground text-center bg-zinc-950 border-border h-8 font-mono"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>

            </CardContent>
          </Card>

          {/* Action settings panel */}
          <Card className="border border-border bg-card/60 backdrop-blur-md shadow-lg">
            <CardHeader className="py-3 px-4 border-b border-border bg-secondary/20">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">
                Gestos & Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Gestos/Acción */}
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Acción / Gesto</Label>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {ACTIONS.map((act) => (
                    <button
                      key={act.key}
                      onClick={() => {
                        setAction(act.key);
                        setSignal(null); // Clear signal if choosing standard gesture
                      }}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all truncate ${
                        action === act.key && signal === null
                          ? "bg-primary text-black border-primary shadow"
                          : "border-border/60 text-muted-foreground hover:text-white bg-black/15"
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Señales (Carteles 0-18) */}
              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Carteles / Señal</Label>
                  {signal !== null && (
                    <button
                      onClick={() => setSignal(null)}
                      className="text-[9px] text-red-400 hover:underline font-bold"
                    >
                      Quitar señal
                    </button>
                  )}
                </div>
                <div className="flex gap-1 overflow-x-auto py-1.5 px-0.5 mt-1 bg-black/20 rounded-xl border border-border/45 scrollbar-thin">
                  {Array.from({ length: 19 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSignal(i);
                        setAction("std"); // Clear custom gesture to show sign correctly
                      }}
                      className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-all bg-card ${
                        signal === i
                          ? "border-primary ring-1 ring-primary"
                          : "border-border/60 hover:border-border"
                      }`}
                    >
                      <img
                        src={`https://www.habbotravel.com/lookeditor/app/img/sign/sign${i}.png`}
                        alt={`Sign ${i}`}
                        className="w-5 h-5 object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Objeto en Mano */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Objeto de mano (ID)</Label>
                  <div className="flex gap-1.5 mt-1">
                    <Input
                      type="number"
                      value={handItem === null ? "" : handItem}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setHandItem(isNaN(val) ? null : val);
                      }}
                      placeholder="Ej: 1, 2, 9"
                      className="h-8 text-xs bg-zinc-950 border-border"
                      min={0}
                    />
                    {handItem !== null && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setHandItem(null)}
                        className="h-8 w-8 border-border text-red-400 hover:bg-red-500/10"
                      >
                        ✖
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="bg-zinc-900 border border-border/50 rounded-lg p-2 text-[9px] text-slate-400 leading-tight">
                    <p className="font-bold text-white">Ejemplos comunes:</p>
                    <p>1: Bebida · 2: Zanahoria · 9: Poción · 33: Taza</p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Side: Tabbed clothing selection (Col-span 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Category Tabs Scroll Bar */}
          <div className="flex overflow-x-auto gap-1 bg-white/5 rounded-xl p-1 border border-border/60 backdrop-blur-sm scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = cat.key === activeCategoryKey;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-primary text-black font-black"
                      : "text-muted-foreground hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* Color Swatches Grid (Col-span 4) */}
            <div className="md:col-span-4 bg-card/40 border border-border rounded-xl p-4 flex flex-col shadow-lg">
              
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">Paleta Colores</span>
                
                {/* Target Select */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setColorTarget("color1")}
                    className={`px-1.5 py-0.5 text-[8.5px] font-black uppercase rounded border transition-all ${
                      colorTarget === "color1"
                        ? "bg-primary text-black border-primary"
                        : "border-border/60 text-muted-foreground"
                    }`}
                  >
                    1ro
                  </button>
                  <button
                    onClick={() => setColorTarget("color2")}
                    className={`px-1.5 py-0.5 text-[8.5px] font-black uppercase rounded border transition-all ${
                      colorTarget === "color2"
                        ? "bg-primary text-black border-primary"
                        : "border-border/60 text-muted-foreground"
                    }`}
                  >
                    2do
                  </button>
                </div>
              </div>

              {/* Color swatches list */}
              <div className="grid grid-cols-5 gap-1.5 mt-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                {availableColors.map((col) => {
                  const isSelected =
                    colorTarget === "color1"
                      ? activeSelection.color1 === col.id
                      : activeSelection.color2 === col.id;

                  return (
                    <button
                      key={col.id}
                      onClick={() => handleColorSelect(col.id)}
                      className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 shadow-sm relative ${
                        isSelected
                          ? "border-primary ring-2 ring-primary ring-offset-1 scale-105"
                          : "border-border/55 hover:border-border"
                      }`}
                      style={{ backgroundColor: `#${col.hex}` }}
                      title={`Color ${col.id}`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-white/20 rounded-md flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Target Indicator Text */}
              <div className="mt-auto pt-3 border-t border-border/40 text-[9.5px] text-center text-slate-400 font-medium">
                {colorTarget === "color1" ? (
                  <span>Editando <span className="text-primary font-bold">Color Primario</span></span>
                ) : (
                  <span>Editando <span className="text-cyan-400 font-bold">Color Secundario</span></span>
                )}
              </div>

            </div>

            {/* Clothing Items Grid (Col-span 8) */}
            <div className="md:col-span-8 bg-card/40 border border-border rounded-xl p-4 flex flex-col shadow-lg min-h-[380px]">
              
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">Prendas Disponibles</span>
                <span className="text-[10px] text-muted-foreground font-semibold">{availableItems.length} ítems</span>
              </div>

              {availableItems.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-xs text-muted-foreground py-16">
                  Cargando prendas...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-3 flex-grow content-start">
                    {paginatedItems.map((item) => {
                      const isSelected = activeSelection.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemSelect(item.id)}
                          className={`aspect-square bg-zinc-950/40 rounded-xl border flex flex-col items-center justify-center p-1 transition-all relative overflow-hidden group hover:border-primary/60 hover:bg-zinc-950/60 ${
                            isSelected
                              ? "border-primary bg-zinc-950/80 shadow-md ring-1 ring-primary/45"
                              : "border-border/60"
                          }`}
                        >
                          <img
                            src={buildItemPreview(item.id)}
                            alt={`Item ${item.id}`}
                            loading="lazy"
                            className="w-14 h-14 object-contain scale-125 group-hover:scale-135 transition-all drop-shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
                            }}
                          />
                          <span className="absolute bottom-0.5 right-1.5 text-[8px] text-muted-foreground font-mono group-hover:text-primary transition-all">
                            {item.id}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-4 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-6 w-8 text-[10px] p-0"
                      >
                        «
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-6 w-8 text-[10px] p-0"
                      >
                        ‹
                      </Button>
                      <span className="text-[10px] text-muted-foreground px-2 font-bold uppercase tracking-wider">
                        Pág {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-6 w-8 text-[10px] p-0"
                      >
                        ›
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-6 w-8 text-[10px] p-0"
                      >
                        »
                      </Button>
                    </div>
                  )}
                </>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
