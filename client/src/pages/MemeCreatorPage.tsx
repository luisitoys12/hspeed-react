import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Copy,
  Share2,
  Image,
  Smile,
  Zap,
  Sparkles,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { proxyImage } from "@/lib/habboProxy";

const HABBO_FONTS = [
  {
    value: "habbo",
    label: "Habbo Classic",
    fontFamily: "'Habbo', 'Arial', sans-serif",
  },
  {
    value: "pixel",
    label: "Pixel (Press Start 2P)",
    fontFamily: "'Press Start 2P', cursive",
  },
  {
    value: "comic",
    label: "Comic Sans MS",
    fontFamily: "'Comic Sans MS', cursive",
  },
  {
    value: "impact",
    label: "Impact (Meme classic)",
    fontFamily: "'Impact', sans-serif",
  },
  { value: "arial", label: "Arial", fontFamily: "'Arial', sans-serif" },
];

const MEME_TEMPLATES = [
  {
    id: "custom",
    name: "Personalizado",
    imageUrl: null,
    textAreas: [
      { x: 50, y: 10, width: 90, height: 20, placeholder: "Texto superior" },
      { x: 50, y: 75, width: 90, height: 20, placeholder: "Texto inferior" },
    ],
  },
  {
    id: "drake",
    name: "Drake Hotline Bling",
    imageUrl: "https://i.imgflip.com/30b1gx.jpg",
    textAreas: [
      { x: 50, y: 15, width: 90, height: 30, placeholder: "No me gusta esto" },
      { x: 50, y: 65, width: 90, height: 30, placeholder: "Me gusta esto" },
    ],
  },
  {
    id: "distracted",
    name: "Distracted Boyfriend",
    imageUrl: "https://i.imgflip.com/1ur9b0.jpg",
    textAreas: [
      { x: 15, y: 75, width: 30, height: 15, placeholder: "Yo" },
      { x: 50, y: 10, width: 35, height: 15, placeholder: "Nueva placa" },
      { x: 85, y: 75, width: 30, height: 15, placeholder: "Placa vieja" },
    ],
  },
  {
    id: "brain",
    name: "Expanding Brain",
    imageUrl: "https://i.imgflip.com/1jwhww.jpg",
    textAreas: [
      { x: 50, y: 8, width: 90, height: 18, placeholder: "Nivel 1" },
      { x: 50, y: 28, width: 90, height: 18, placeholder: "Nivel 2" },
      { x: 50, y: 48, width: 90, height: 18, placeholder: "Nivel 3" },
      { x: 50, y: 68, width: 90, height: 18, placeholder: "Nivel 4 (DIOS)" },
    ],
  },
  {
    id: "change",
    name: "Change My Mind",
    imageUrl: "https://i.imgflip.com/24y43o.jpg",
    textAreas: [
      {
        x: 50,
        y: 35,
        width: 80,
        height: 40,
        placeholder: "HabboSpeed es la mejor fansite\nChange my mind",
      },
    ],
  },
  {
    id: "habbo_classic",
    name: "Habbo Console Log",
    imageUrl:
      "https://images.habbo.com/c_images/reception/rec_background_beach.png",
    textAreas: [
      {
        x: 50,
        y: 85,
        width: 90,
        height: 12,
        placeholder: "[SYSTEM] Usuario ganó 1000 SpeedPoints",
      },
    ],
  },
];

interface TextArea {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  fontFamily: string;
  align: "left" | "center" | "right";
}

export default function MemeCreatorPage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [template, setTemplate] = useState<(typeof MEME_TEMPLATES)[0]>(
    MEME_TEMPLATES[0],
  );
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [textAreas, setTextAreas] = useState<TextArea[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontFamily, setFontFamily] = useState("impact");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "center",
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);

  const selectedText = textAreas.find((t) => t.id === selectedTextId);

  useEffect(() => {
    const areas = template.textAreas.map((ta, i) => ({
      id: `text-${i}`,
      text: ta.placeholder,
      x: ta.x,
      y: ta.y,
      width: ta.width,
      height: ta.height,
      fontSize: 24,
      color: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 3,
      fontFamily: "impact",
      align: "center" as const,
    }));
    setTextAreas(areas);
    setSelectedTextId(areas[0]?.id || null);
  }, [template]);

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    const src = customImage || template.imageUrl;
    if (!src) {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawText(ctx, canvas);
      return;
    }

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawText(ctx, canvas);
    };
    img.onerror = () => {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawText(ctx, canvas);
    };
    img.src = src;
  };

  const drawText = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    textAreas.forEach((ta) => {
      const font = `${ta.fontSize}px ${HABBO_FONTS.find((f) => f.value === ta.fontFamily)?.fontFamily || ta.fontFamily}`;
      ctx.font = font;
      ctx.fillStyle = ta.color;
      ctx.strokeStyle = ta.strokeColor;
      ctx.lineWidth = ta.strokeWidth;
      ctx.textAlign = ta.align;
      ctx.textBaseline = "middle";

      const x = (ta.x / 100) * canvas.width;
      const y = (ta.y / 100) * canvas.height;
      const maxWidth = (ta.width / 100) * canvas.width;

      const lines = wrapText(ctx, ta.text, maxWidth);
      const lineHeight = ta.fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      const startY = y - totalHeight / 2 + lineHeight / 2;

      lines.forEach((line, i) => {
        const lineY = startY + i * lineHeight;
        if (ta.strokeWidth > 0) ctx.strokeText(line, x, lineY);
        ctx.fillText(line, x, lineY);
      });

      if (ta.id === selectedTextId) {
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          x - maxWidth / 2 - 5,
          y - totalHeight / 2 - 5,
          maxWidth + 10,
          totalHeight + 10,
        );
        ctx.setLineDash([]);
      }
    });
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  useEffect(() => {
    drawMeme();
  }, [template, customImage, textAreas]);

  const handleCanvasClick = (
    e:
      React.MouseEvent<HTMLCanvasElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    const target = e.currentTarget as HTMLCanvasElement | HTMLButtonElement;
    if (target.tagName === "BUTTON") {
      // Click on "Añadir texto" button - add text in center
      const newId = `text-${Date.now()}`;
      const newText: TextArea = {
        id: newId,
        text: "Nuevo texto",
        x: 50,
        y: 50,
        width: 80,
        height: 20,
        fontSize,
        color: textColor,
        strokeColor,
        strokeWidth,
        fontFamily,
        align: textAlign,
      };
      setTextAreas((prev) => [...prev, newText]);
      setSelectedTextId(newId);
      return;
    }
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clicked = textAreas.find((ta) => {
      const tx = ta.x;
      const ty = ta.y;
      const tw = ta.width;
      const th = ta.height;
      return (
        x >= tx - tw / 2 &&
        x <= tx + tw / 2 &&
        y >= ty - th / 2 &&
        y <= ty + th / 2
      );
    });

    if (clicked) {
      setSelectedTextId(clicked.id);
    } else {
      const newId = `text-${Date.now()}`;
      const newText: TextArea = {
        id: newId,
        text: "Nuevo texto",
        x,
        y,
        width: 80,
        height: 20,
        fontSize,
        color: textColor,
        strokeColor,
        strokeWidth,
        fontFamily,
        align: textAlign,
      };
      setTextAreas((prev) => [...prev, newText]);
      setSelectedTextId(newId);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedText) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsDragging(true);
    setDragOffset({ x: x - selectedText.x, y: y - selectedText.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedText) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTextAreas((prev) =>
      prev.map((ta) =>
        ta.id === selectedTextId
          ? { ...ta, x: x - dragOffset.x, y: y - dragOffset.y }
          : ta,
      ),
    );
  };

  const handleCanvasMouseUp = () => setIsDragging(false);

  const updateText = (field: keyof TextArea, value: any) => {
    if (!selectedText) return;
    setTextAreas((prev) =>
      prev.map((ta) =>
        ta.id === selectedTextId ? { ...ta, [field]: value } : ta,
      ),
    );
  };

  const deleteText = () => {
    if (!selectedText || textAreas.length <= 1) return;
    setTextAreas((prev) => prev.filter((ta) => ta.id !== selectedTextId));
    setSelectedTextId(
      textAreas.find((ta) => ta.id !== selectedTextId)?.id || null,
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCustomImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const generateMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setGeneratedMeme(dataUrl);
    toast({
      title: "¡Meme generado!",
      description: "Puedes descargarlo o copiar la imagen",
    });
  };

  const downloadMeme = () => {
    if (!generatedMeme) return;
    const a = document.createElement("a");
    a.href = generatedMeme;
    a.download = `habbospeed-meme-${Date.now()}.png`;
    a.click();
  };

  const copyMeme = async () => {
    if (!generatedMeme) return;
    try {
      const response = await fetch(generatedMeme);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast({
        title: "¡Copiado al portapapeles!",
        description: "Pega el meme donde quieras (Ctrl+V)",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo copiar. Usa descargar.",
        variant: "destructive",
      });
    }
  };

  const resetMeme = () => {
    setCustomImage(null);
    setTemplate(MEME_TEMPLATES[0]);
    setGeneratedMeme(null);
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Image className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Creador de Memes Habbo</h1>
        <Badge variant="secondary" className="text-[10px]">
          Beta
        </Badge>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Panel de controles */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Plantilla</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={template.id}
                onValueChange={(v) =>
                  setTemplate(
                    MEME_TEMPLATES.find((t) => t.id === v) || MEME_TEMPLATES[0],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {MEME_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {template.id === "custom" && (
                <div className="space-y-2">
                  <Label className="text-xs">Subir imagen base</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  {customImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCustomImage(null);
                        fileInputRef.current!.value = "";
                      }}
                      className="w-full"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Quitar imagen
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Textos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {textAreas.map((ta) => (
                <Button
                  key={ta.id}
                  variant={ta.id === selectedTextId ? "default" : "outline"}
                  className="w-full justify-start text-xs truncate"
                  onClick={() => setSelectedTextId(ta.id)}
                >
                  {ta.text.slice(0, 20)}...
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleCanvasClick}
              >
                <span className="flex items-center gap-1">
                  <Smile className="w-3 h-3" /> Añadir texto (click en canvas)
                </span>
              </Button>
            </CardContent>
          </Card>

          {selectedText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  Editar texto{" "}
                  <Badge variant="secondary">{selectedText.id}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label>Contenido</Label>
                <Input
                  value={selectedText.text}
                  onChange={(e) => updateText("text", e.target.value)}
                  placeholder="Escribe tu texto"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Label>Tamaño: {fontSize}px</Label>
                </div>
                <Slider
                  value={[fontSize]}
                  max={72}
                  min={8}
                  step={1}
                  onValueChange={(v) => {
                    setFontSize(v[0]);
                    updateText("fontSize", v[0]);
                  }}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Label>Color texto</Label>
                  <Input
                    type="color"
                    value={selectedText.color}
                    onChange={(e) => updateText("color", e.target.value)}
                    className="h-8 w-full cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Label>Contorno</Label>
                  <Input
                    type="color"
                    value={selectedText.strokeColor}
                    onChange={(e) => updateText("strokeColor", e.target.value)}
                    className="h-8 w-full cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Label>Grosor contorno: {strokeWidth}px</Label>
                </div>
                <Slider
                  value={[strokeWidth]}
                  max={10}
                  min={0}
                  step={1}
                  onValueChange={(v) => {
                    setStrokeWidth(v[0]);
                    updateText("strokeWidth", v[0]);
                  }}
                />

                <Label>Fuente</Label>
                <Select
                  value={selectedText.fontFamily}
                  onValueChange={(v) => updateText("fontFamily", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HABBO_FONTS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Alineación</Label>
                <div className="flex gap-1">
                  {["left", "center", "right"].map((a) => (
                    <Button
                      key={a}
                      variant={selectedText.align === a ? "default" : "outline"}
                      size="icon"
                      onClick={() => updateText("align", a as any)}
                      title={a}
                    >
                      {a === "left" && <span className="text-[10px]">��</span>}
                      {a === "center" && (
                        <span className="text-[10px]">���</span>
                      )}
                      {a === "right" && <span className="text-[10px]">��</span>}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={deleteText}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Eliminar este texto
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={generateMeme}
                disabled={!canvasRef.current}
              >
                <Zap className="w-4 h-4 mr-2" /> Generar Meme
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={downloadMeme}
                disabled={!generatedMeme}
              >
                <Download className="w-4 h-4 mr-2" /> Descargar PNG
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={copyMeme}
                disabled={!generatedMeme}
              >
                <Copy className="w-4 h-4 mr-2" /> Copiar al portapapeles
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={resetMeme}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Resetear
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Canvas / Preview */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  className="w-full h-full cursor-crosshair"
                  onClick={handleCanvasClick}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
                {generatedMeme && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button size="lg" onClick={downloadMeme}>
                      <Download className="w-5 h-5 mr-2" /> Descargar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            <div className="p-2 bg-card rounded-lg border">
              <div className="font-bold">640×360</div>
              <div>Canvas size</div>
            </div>
            <div className="p-2 bg-card rounded-lg border">
              <div className="font-bold">{textAreas.length}</div>
              <div>Textos</div>
            </div>
            <div className="p-2 bg-card rounded-lg border">
              <div className="font-bold">{template.name}</div>
              <div>Plantilla</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery de memes guardados (localStorage) */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm">Mis Memes Recientes</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => localStorage.clear()}
          >
            <Trash2 className="w-3 h-3 mr-1" /> Limpiar galería
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {JSON.parse(localStorage.getItem("habbo_memes") || "[]")
              .reverse()
              .map((meme: any, i: number) => (
                <div
                  key={i}
                  className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden border"
                >
                  <img
                    src={meme}
                    alt={`Meme ${i}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white"
                      onClick={() => navigator.clipboard.writeText(meme)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            {JSON.parse(localStorage.getItem("habbo_memes") || "[]").length ===
              0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No hay memes guardados aún. ¡Genera tu primero!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
