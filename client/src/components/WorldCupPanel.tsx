import { useState } from "react";
import { Link } from "wouter";
import { Trophy, Globe, Map, Users } from "lucide-react";

export default function WorldCupPanel() {
  const [tab, setTab] = useState<"forecast" | "adventure" | "mini">("forecast");

  return (
    <section className="site-panel-strong p-4 rounded-2xl overflow-hidden" data-testid="worldcup-panel">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-extrabold text-foreground">Mundial 2026 — Zona Fansite</h3>
          <p className="text-[11px] text-muted-foreground mt-1">Modo Habbo: pronóstico, aventura y mini torneos para la comunidad.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTab("forecast")} className={`px-3 py-1 rounded-md text-xs font-bold ${tab==="forecast"?"bg-theme-gradient text-white":"bg-white/5 text-white/80"}`}>Pronóstico</button>
          <button onClick={() => setTab("adventure")} className={`px-3 py-1 rounded-md text-xs font-bold ${tab==="adventure"?"bg-theme-gradient text-white":"bg-white/5 text-white/80"}`}>Aventura</button>
          <button onClick={() => setTab("mini")} className={`px-3 py-1 rounded-md text-xs font-bold ${tab==="mini"?"bg-theme-gradient text-white":"bg-white/5 text-white/80"}`}>Mini Torneos</button>
        </div>
      </div>

      <div>
        {tab === "forecast" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs font-bold">Pronósticos</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Adivina resultados, gana SpeedPoints por aciertos.</p>
                </div>
              </div>
              <Link href="/mundial/pronosticos" className="inline-block mt-3 text-xs text-primary font-bold hover:underline">Ir a pronósticos →</Link>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-xs font-bold">Ranking Fansite</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Top jugadores por aciertos y participación.</p>
                </div>
              </div>
              <Link href="/mundial/ranking" className="inline-block mt-3 text-xs text-primary font-bold hover:underline">Ver ranking →</Link>
            </div>

            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs font-bold">Tu Equipo Habbo</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Forma equipos, compite en mini torneos dentro del hotel.</p>
                </div>
              </div>
              <Link href="/mundial/equipos" className="inline-block mt-3 text-xs text-primary font-bold hover:underline">Crear equipo →</Link>
            </div>
          </div>
        )}

        {tab === "adventure" && (
          <div className="space-y-3">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Map className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs font-bold">Aventura Interactiva</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Recorre minijuegos y pruebas temáticas con recompensas SP.</p>
                </div>
              </div>
              <Link href="/mundial/aventura" className="inline-block mt-3 text-xs text-primary font-bold hover:underline">Empezar aventura →</Link>
            </div>
          </div>
        )}

        {tab === "mini" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-lg p-3">
              <p className="text-xs font-bold">Torneo Rápido</p>
              <p className="text-[11px] text-muted-foreground mt-1">Sistemas de bracket y partidas rápidas dentro del hotel.</p>
              <Link href="/mundial/mini/rapido" className="inline-block mt-3 text-xs text-primary font-bold hover:underline">Unirse →</Link>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <p className="text-xs font-bold">Sorteos y Premios</p>
              <p className="text-[11px] text-muted-foreground mt-1">Participa en sorteos exclusivos por actividad.</p>
              <Link href="/mundial/mini/sorteos" className="inline-block mt-3 text-xs text-primary font-bold hover:underline">Participar →</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
