import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SIZES = [
  { value: "s", label: "Pequeño (s)", desc: "64x110px aprox" },
  { value: "m", label: "Mediano (m)", desc: "80x140px aprox" },
  { value: "l", label: "Grande (l)", desc: "100x175px aprox" },
  { value: "b", label: "Extra grande (b)", desc: "160x280px aprox" },
];

const DIRECTIONS = [
  { value: "0", label: "0 ↑ Norte" },
  { value: "1", label: "1 ↗ Noreste-N" },
  { value: "2", label: "2 ↗ Noreste" },
  { value: "3", label: "3 → Este" },
  { value: "4", label: "4 ↘ Sureste" },
  { value: "5", label: "5 ↓ Sur" },
  { value: "6", label: "6 ↙ Suroeste" },
  { value: "7", label: "7 ← Oeste" },
];

const GESTURES = [
  { value: "", label: "Por defecto" },
  { value: "std", label: "Estándar" },
  { value: "wav", label: "Saludar (wav)" },
  { value: "blw", label: "Soplar (blw)" },
  { value: "agr", label: "Agredir (agr)" },
  { value: "crr", label: "Correr (crr)" },
  { value: "sad", label: "Triste (sad)" },
  { value: "eyb", label: "Guiñar (eyb)" },
  { value: "spk", label: "Hablar (spk)" },
  { value: "snf", label: "Oler (snf)" },
  { value: "drk", label: "Beber (drk)" },
  { value: "eat", label: "Comer (eat)" },
];

const HOTELS = [
  { value: "es", label: "Habbo.es" },
  { value: "com", label: "Habbo.com" },
  { value: "com.br", label: "Habbo Brasil" },
  { value: "de", label: "Habbo.de" },
  { value: "fr", label: "Habbo.fr" },
];

export default function ImagerPage() {
  const [username, setUsername] = useState("");
  const [size, setSize] = useState("l");
  const [headOnly, setHeadOnly] = useState(false);
  const [direction, setDirection] = useState("3");
  const [headDirection, setHeadDirection] = useState("3");
  const [gesture, setGesture] = useState("");
  const [hotel, setHotel] = useState("es");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const hotelDomain = hotel === "es" ? "habbo.es" : hotel === "com" ? "habbo.com" : hotel === "com.br" ? "habbo.com.br" : hotel === "de" ? "habbo.de" : "habbo.fr";

  const buildUrl = (s: string, hOnly: boolean = headOnly) => {
    if (!username) return "";
    let url = `https://www.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=${s}&direction=${direction}&head_direction=${headDirection}`;
    if (hOnly) url += "&headonly=1";
    if (gesture) url += `&gesture=${gesture}`;
    return url;
  };

  const imageUrl = username ? buildUrl(size) : "";

  const handleGenerate = () => {
    if (!username.trim()) return;
    setLoading(true);
    setGenerated(true);
    setTimeout(() => setLoading(false), 800);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      toast({ title: "URL copiada al portapapeles" });
    });
  };

  const downloadImage = async () => {
    try {
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = `habbo-${username}.gif`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast({ title: "Abre la URL directamente en una nueva pestaña", variant: "destructive" });
    }
  };

  // Preview all sizes
  const allSizePreviews = ["s", "m", "l", "b"].map((s) => ({
    size: s,
    url: username ? buildUrl(s) : "",
  }));

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <ImageIcon className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Habbo Imager</h1>
      </div>
      <p className="text-sm text-muted-foreground">Genera imágenes de avatares de Habbo con diferentes opciones.</p>
      <p className="text-xs text-yellow-400/80">⚠ Requiere que el perfil de Habbo sea público en el hotel seleccionado.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Usuario de Habbo</Label>
                <Input
                  placeholder="Introduce tu usuario..."
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setGenerated(false); }}
                  data-testid="input-habbo-username"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Hotel</Label>
                <Select value={hotel} onValueChange={setHotel}>
                  <SelectTrigger data-testid="select-hotel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOTELS.map((h) => (
                      <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Tamaño</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger data-testid="select-avatar-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label} — {s.desc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Dirección del cuerpo</Label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger data-testid="select-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Dirección de la cabeza</Label>
                <Select value={headDirection} onValueChange={setHeadDirection}>
                  <SelectTrigger data-testid="select-head-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Gesto / Acción</Label>
                <Select value={gesture} onValueChange={setGesture}>
                  <SelectTrigger data-testid="select-gesture">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GESTURES.map((g) => (
                      <SelectItem key={g.value || "default"} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-muted-foreground">Solo cabeza</Label>
                  <p className="text-[10px] text-muted-foreground/60">Mostrar solo la cabeza del avatar</p>
                </div>
                <Switch
                  checked={headOnly}
                  onCheckedChange={setHeadOnly}
                  data-testid="switch-head-only"
                />
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/80 text-white"
                onClick={handleGenerate}
                disabled={!username.trim()}
                data-testid="button-generate-avatar"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Generar Avatar
              </Button>
            </CardContent>
          </Card>

          {/* URL box */}
          {generated && imageUrl && (
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-2">
                <Label className="text-xs text-muted-foreground">URL generada</Label>
                <div className="flex gap-2">
                  <Input
                    value={imageUrl}
                    readOnly
                    className="text-xs font-mono bg-secondary/50"
                    data-testid="text-avatar-url"
                  />
                  <Button variant="outline" size="icon" onClick={copyUrl} className="flex-shrink-0" data-testid="button-copy-url">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={downloadImage}
                  data-testid="button-download-avatar"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Abrir imagen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          {generated && username ? (
            <>
              <Card className="bg-card border-border">
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-48 gap-4">
                  <p className="text-xs text-muted-foreground">Vista previa: tamaño {size}</p>
                  {loading ? (
                    <div className="w-20 h-32 bg-secondary/50 rounded-lg animate-pulse" />
                  ) : (
                    <img
                      src={imageUrl}
                      alt={`Avatar de ${username}`}
                      className="object-contain drop-shadow-2xl"
                      data-testid="img-avatar-preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.3";
                      }}
                    />
                  )}
                  <p className="text-xs text-muted-foreground font-pixel text-[8px]">@{username}</p>
                </CardContent>
              </Card>

              {/* All sizes preview */}
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-3">Todos los tamaños</p>
                  <div className="flex items-end gap-4 justify-center">
                    {allSizePreviews.map(({ size: s, url }) => (
                      <div key={s} className="flex flex-col items-center gap-1.5">
                        <img
                          src={url}
                          alt={`${username} size ${s}`}
                          className="object-contain"
                          style={{ maxHeight: s === "b" ? "80px" : s === "l" ? "60px" : s === "m" ? "45px" : "35px" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                        />
                        <Badge variant="outline" className={`text-[9px] ${size === s ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                          {s}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <ImageIcon className="w-14 h-14 mb-3 opacity-20" />
              <p className="text-sm">Introduce un usuario y genera el avatar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
