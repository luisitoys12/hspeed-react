import { useState, useEffect } from "react";
import { Settings, Wrench, Radio, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function MaintenancePage() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      {/* Animated gear icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center animate-pulse">
          <Settings className="w-12 h-12 text-primary animate-spin" style={{ animationDuration: "8s" }} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-yellow-500/10 border-2 border-yellow-500/20 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-yellow-400" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-2" data-testid="text-maintenance-title">
        En Mantenimiento{dots}
      </h1>

      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Estamos realizando mejoras en HabboSpeed para ofrecerte una mejor experiencia. 
        Volveremos pronto con novedades.
      </p>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mb-8">
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <Radio className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <p className="text-xs font-semibold">Radio</p>
          <p className="text-[10px] text-green-400">En Línea</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <Settings className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
          <p className="text-xs font-semibold">Web</p>
          <p className="text-[10px] text-yellow-400">Mantenimiento</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-xs font-semibold">Tiempo</p>
          <p className="text-[10px] text-blue-400">Estimado: 1h</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-6">
        <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse"
            style={{ width: "65%", animationDuration: "2s" }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">Progreso estimado: 65%</p>
      </div>

      {/* Social / contact */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Mientras tanto, escucha nuestra radio en vivo o síguenos en redes sociales para actualizaciones.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm" className="text-xs" data-testid="button-back-home">
            <ArrowLeft className="w-3 h-3 mr-1.5" />
            Volver al Inicio
          </Button>
        </Link>
      </div>

      {/* HabboSpeed branding */}
      <div className="mt-12 opacity-30">
        <p className="text-[10px] text-muted-foreground">
          HabboSpeed © {new Date().getFullYear()} · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
