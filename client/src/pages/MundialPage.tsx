import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Trophy,
  Globe,
  MapPinned,
  Users,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";

type SourceItem = { id: string; name: string; url: string; note: string };

const DEFAULT_SOURCES: SourceItem[] = [
  { id: "fifa", name: "FIFA", url: "https://www.fifa.com/", note: "Calendario, sede y anuncios oficiales" },
  { id: "uefa", name: "UEFA", url: "https://www.uefa.com/", note: "Cobertura europea y contexto competitivo" },
  { id: "marca", name: "Marca", url: "https://www.marca.com/futbol/", note: "Noticias, previas y análisis diario" },
];

function getSection(pathname: string) {
  if (pathname.startsWith("/mundial/source/")) return "source";
  if (pathname.startsWith("/mundial/pronosticos")) return "forecast";
  if (pathname.startsWith("/mundial/ranking")) return "ranking";
  if (pathname.startsWith("/mundial/equipos")) return "teams";
  if (pathname.startsWith("/mundial/aventura")) return "adventure";
  if (pathname.startsWith("/mundial/mini/rapido")) return "mini-rapid";
  if (pathname.startsWith("/mundial/mini/sorteos")) return "mini-draw";
  return "home";
}

export default function MundialPage() {
  const [location] = useLocation();
  const section = getSection(location);
  const [customSources, setCustomSources] = useState<SourceItem[]>([]);
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceNote, setSourceNote] = useState("");

  const sources = useMemo(() => [...customSources, ...DEFAULT_SOURCES], [customSources]);
  const activeTitle =
    section === "forecast"
      ? "Pronósticos Habbo"
      : section === "ranking"
        ? "Ranking Mundial"
        : section === "teams"
          ? "Equipos y clanes"
          : section === "adventure"
            ? "Aventura Mundial"
            : section === "mini-rapid"
              ? "Mini torneo rápido"
              : section === "mini-draw"
                ? "Sorteos y premios"
                : section === "source"
                  ? "Fuente seleccionada"
                  : "Mundial 2026";

  const activeCopy =
    section === "forecast"
      ? "Apuesta tus predicciones y gana SpeedPoints por aciertos."
      : section === "ranking"
        ? "Sube en la tabla con participación, aciertos y constancia."
        : section === "teams"
          ? "Forma tu equipo del hotel y compite por mini torneos y recompensas."
          : section === "adventure"
            ? "Explora retos guiados, pistas y pruebas temáticas con premio final."
            : section === "mini-rapid"
              ? "Partidas flash y brackets cortos para sesiones rápidas dentro del hotel."
              : section === "mini-draw"
                ? "Participa en sorteos comunitarios ligados a actividad y eventos."
                : section === "source"
                  ? "Gestiona fuentes externas del Mundial y mantén visible el disclaimer."
                  : "Zona temática para seguir el Mundial 2026 con pronósticos, aventura y mini torneos.";

  const addSource = () => {
    if (!sourceName.trim() || !sourceUrl.trim()) return;
    setCustomSources((items) => [
      {
        id: `${Date.now()}`,
        name: sourceName.trim(),
        url: sourceUrl.trim(),
        note: sourceNote.trim() || "Fuente agregada por la comunidad",
      },
      ...items,
    ]);
    setSourceName("");
    setSourceUrl("");
    setSourceNote("");
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      <div className="site-panel-strong overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-amber-400/10 pointer-events-none" />
        <div className="relative p-5 lg:p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Link>
            </Button>
            <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-400/20">
              Mundial 2026
            </Badge>
            <Badge className="bg-white/10 text-white border-white/10">Modo Habbo</Badge>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <p className="site-kicker">Sección especial</p>
              <h1 className="text-3xl lg:text-5xl font-black text-white mt-2">
                {activeTitle}
              </h1>
              <p className="text-white/80 mt-3 max-w-2xl leading-relaxed">
                {activeCopy}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 text-xs text-white/70">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Pronósticos</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Aventura</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Mini torneos</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">SpeedPoints</span>
              </div>
            </div>

            <Card className="bg-card/90 border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Disclaimer
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta sección usa fuentes externas para información del Mundial. Revisa siempre las webs oficiales antes de tomar decisiones o publicar contenido en el hotel.
                </p>
                <div className="text-[11px] text-muted-foreground">
                  No somos afiliados a FIFA, UEFA ni a medios externos enlazados.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-card/90 border-border/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Globe className="w-4 h-4 text-primary" />
              Pronósticos
            </div>
            <p className="text-xs text-muted-foreground">Predice marcadores, goleadores y llaves.</p>
            <Link href="/mundial/pronosticos" className="text-xs text-primary font-semibold hover:underline">Abrir pronósticos →</Link>
          </CardContent>
        </Card>
        <Card className="bg-card/90 border-border/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <MapPinned className="w-4 h-4 text-primary" />
              Aventura
            </div>
            <p className="text-xs text-muted-foreground">Recorre retos, pistas y micro misiones.</p>
            <Link href="/mundial/aventura" className="text-xs text-primary font-semibold hover:underline">Empezar aventura →</Link>
          </CardContent>
        </Card>
        <Card className="bg-card/90 border-border/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Trophy className="w-4 h-4 text-primary" />
              Mini torneos
            </div>
            <p className="text-xs text-muted-foreground">Compite por fichas, badges y SpeedPoints.</p>
            <Link href="/mundial/mini/rapido" className="text-xs text-primary font-semibold hover:underline">Ver torneos →</Link>
          </CardContent>
        </Card>
      </div>

      {section === "source" ? (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-card/90 border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Sparkles className="w-4 h-4 text-primary" />
                Agregar fuente
              </div>
              <Input placeholder="Nombre de la fuente" value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
              <Input placeholder="https://sitio-ejemplo.com" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
              <Input placeholder="Nota breve" value={sourceNote} onChange={(e) => setSourceNote(e.target.value)} />
              <Button onClick={addSource} className="w-full bg-theme-gradient text-white">Guardar fuente</Button>
            </CardContent>
          </Card>
          <Card className="bg-card/90 border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Users className="w-4 h-4 text-primary" />
                Fuentes disponibles
              </div>
              <div className="space-y-2">
                {sources.map((source) => (
                  <div key={source.id} className="rounded-xl border border-border/60 bg-background/40 p-3 flex items-start justify-between gap-3">
                    <div>
                      <a href={source.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                        {source.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <p className="text-[11px] text-muted-foreground mt-1">{source.note}</p>
                      <p className="text-[10px] text-muted-foreground break-all mt-1">{source.url}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-card/90 border-border/60">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Trophy className="w-4 h-4 text-primary" />
              Detalle de la sección
            </div>
            <p className="text-xs text-muted-foreground">{activeCopy}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">Habbo + Mundial</Badge>
              <Badge variant="secondary">Noticias guiadas</Badge>
              <Badge variant="secondary">Eventos comunitarios</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
