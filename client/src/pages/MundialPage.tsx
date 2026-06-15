import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DEFAULT_SOURCES = [
  { id: "fifa", name: "FIFA Oficial", url: "https://www.fifa.com/", note: "Calendario, sede y anuncios oficiales de la copa mundial." },
  { id: "marca", name: "Marca", url: "https://www.marca.com/", note: "Noticias, previas, resultados y análisis diario de fútbol internacional." },
];

const TEAMS = [
  { name: "México", flag: "🇲🇽", group: "A" },
  { name: "Estados Unidos", flag: "🇺🇸", group: "A" },
  { name: "Canadá", flag: "🇨🇦", group: "A" },
  { name: "Argentina", flag: "🇦🇷", group: "B" },
  { name: "Brasil", flag: "🇧🇷", group: "B" },
  { name: "Uruguay", flag: "🇺🇾", group: "B" },
  { name: "Colombia", flag: "🇨🇴", group: "B" },
  { name: "España", flag: "🇪🇸", group: "C" },
  { name: "Francia", flag: "🇫🇷", group: "C" },
  { name: "Alemania", flag: "🇩🇪", group: "C" },
  { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "D" },
  { name: "Italia", flag: "🇮🇹", group: "D" },
  { name: "Portugal", flag: "🇵🇹", group: "D" },
  { name: "Países Bajos", flag: "🇳🇱", group: "D" },
  { name: "Bélgica", flag: "🇧🇪", group: "E" },
  { name: "Croacia", flag: "🇭🇷", group: "E" },
  { name: "Marruecos", flag: "🇲🇦", group: "F" },
  { name: "Senegal", flag: "🇸🇳", group: "F" },
  { name: "Japón", flag: "🇯🇵", group: "G" },
  { name: "Corea del Sur", flag: "🇰🇷", group: "G" },
  { name: "Arabia Saudita", flag: "🇸🇦", group: "H" },
  { name: "Australia", flag: "🇦🇺", group: "H" },
  { name: "Camerún", flag: "🇨🇲", group: "H" },
  { name: "Ecuador", flag: "🇪🇨", group: "H" }
];

function seedRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

export interface SimulatedMatch {
  id: string;
  teamA: string;
  teamB: string;
  flagA: string;
  flagB: string;
  date: string;
  group: string;
  time: string;
  scoreA: number;
  scoreB: number;
  status: string;
  min: string;
}

export function generateMatchesForDate(d: Date): SimulatedMatch[] {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const rand = seedRandom(dateStr);
  const shuffled = [...TEAMS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const matches: SimulatedMatch[] = [];
  const times = ["14:00", "17:00", "20:00"];
  const monthsSp = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const readableDate = `${day} de ${monthsSp[d.getMonth()]}, ${year}`;

  for (let idx = 0; idx < 3; idx++) {
    const teamA = shuffled[idx * 2];
    const teamB = shuffled[idx * 2 + 1];
    const scoreA = Math.floor(rand() * 4);
    const scoreB = Math.floor(rand() * 4);
    
    const now = new Date();
    const isToday = now.toDateString() === d.toDateString();
    const isPast = d.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    let status = "PRÓXIMAMENTE";
    let min = "—";
    let curScoreA = scoreA;
    let curScoreB = scoreB;

    if (isPast) {
      status = "FINAL";
      min = "90'";
    } else if (isToday) {
      const matchHour = parseInt(times[idx].split(":")[0]);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if (currentHour > matchHour + 1) {
        status = "FINAL";
        min = "90'";
      } else if (currentHour === matchHour || (currentHour === matchHour + 1 && currentMinute < 45)) {
        status = "LIVE";
        const elapsed = (currentHour === matchHour) ? currentMinute : currentMinute + 60;
        min = `${elapsed}'`;
        if (elapsed < 30) {
          curScoreA = Math.min(scoreA, 0);
          curScoreB = Math.min(scoreB, 0);
        } else if (elapsed < 60) {
          curScoreA = Math.min(scoreA, Math.max(0, scoreA - 1));
          curScoreB = Math.min(scoreB, Math.max(0, scoreB - 1));
        }
      } else {
        status = `HOY ${times[idx]}`;
        min = "—";
        curScoreA = 0;
        curScoreB = 0;
      }
    } else {
      status = `HOY ${times[idx]}`;
      min = "—";
      curScoreA = 0;
      curScoreB = 0;
    }

    matches.push({
      id: `m_${dateStr.replace(/-/g, "")}_${idx + 1}`,
      teamA: teamA.name,
      teamB: teamB.name,
      flagA: teamA.flag,
      flagB: teamB.flag,
      date: readableDate,
      group: `Grupo ${teamA.group}`,
      time: times[idx],
      scoreA: curScoreA,
      scoreB: curScoreB,
      status,
      min
    });
  }
  return matches;
}

const ESTAMPAS = [
  { id: "trofeo", name: "Copa Dorada 2026", rarity: "Legendario", image: "/habbo-radio/estampa_trofeo.png", cost: 25, badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", glowClass: "shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:border-yellow-500/80 border-yellow-500/20" },
  { id: "balon", name: "Balón Imperial", rarity: "Épico", image: "/habbo-radio/estampa_balon.png", cost: 15, badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30", glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:border-purple-500/80 border-purple-500/20" },
  { id: "estadio", name: "Estadio Cyber", rarity: "Raro", image: "/habbo-radio/estampa_estadio.png", cost: 10, badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30", glowClass: "shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/80 border-blue-500/20" },
  { id: "botas", name: "Botas de Neón", rarity: "Común", image: "/habbo-radio/estampa_botas.png", cost: 5, badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30", glowClass: "shadow-[0_0_20px_rgba(148,163,184,0.15)] hover:border-slate-500/80 border-slate-500/20" },
];

const LOGROS = [
  { id: "penales", name: "Guante del Campeón", requirement: "Anotar 5 goles en la tanda de penales", image: "/habbo-radio/logro_penales.png", badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { id: "votante", name: "Pronosticador Experto", requirement: "Enviar un pronóstico de partido", image: "/habbo-radio/logro_votante.png", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { id: "hincha", name: "Megáfono de Oro", requirement: "Completar una misión de aventura", image: "/habbo-radio/logro_hincha.png", badgeColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30" },
  { id: "chateador", name: "Hablador Píxel", requirement: "Interactuar en el chat o reclamar logro", image: "/habbo-radio/logro_chateador.png", badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { id: "staff", name: "Placa Staff HSpeed", requirement: "Pertenecer al equipo oficial del fansite", image: "/habbo-radio/estampa_staff.png", badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { id: "dj", name: "Audífonos Locutor", requirement: "Rango de DJ Locutor en la radio", image: "/habbo-radio/estampa_audifonos_dj.png", badgeColor: "bg-red-500/20 text-red-300 border-red-500/30" },
];

function getSection(pathname: string) {
  if (pathname.includes("/source")) return "source";
  if (pathname.includes("/pronosticos")) return "forecast";
  if (pathname.includes("/ranking")) return "ranking";
  if (pathname.includes("/equipos")) return "teams";
  if (pathname.includes("/aventura")) return "adventure";
  if (pathname.includes("/mini/rapido")) return "mini-rapid";
  if (pathname.includes("/mini/sorteos")) return "mini-draw";
  return "home";
}

// 8-bit Web Audio Synth helper
const playSynthSound = (type: "click" | "pack_shake" | "pack_open" | "goal" | "save" | "win" | "purchase" | "logro") => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } 
    else if (type === "pack_shake") {
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 800;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();
    }
    else if (type === "pack_open") {
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
      });
    }
    else if (type === "goal") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1500, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      
      const bufferSize = ctx.sampleRate * 1.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1200;
      filter.Q.value = 1.5;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.03, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();
    }
    else if (type === "save") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
    else if (type === "win") {
      const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.3);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    }
    else if (type === "purchase" || type === "logro") {
      const freqs = [587.33, 880.00, 1174.66];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    }
  } catch (e) {
    console.warn("Audio Context init failed", e);
  }
};

export default function MundialPage() {
  const [location] = useLocation();
  const section = getSection(location);
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();

  // 1. Estados Derivados de la DB
  const claimedStamps = useMemo(() => user?.mundialStamps || [], [user]);
  const unlockedLogros = useMemo(() => user?.mundialLogros || [], [user]);
  const userPredictions = useMemo(() => user?.mundialPredictions || {}, [user]);
  const selectedClan = useMemo(() => user?.mundialClan || null, [user]);
  const ticketsCount = useMemo(() => user?.mundialTickets || 0, [user]);
  const penaltyStats = useMemo(() => user?.mundialPenalties || { maxScore: 0, totalGames: 0 }, [user]);

  const adventureMissions = useMemo(() => ({
    mis1: unlockedLogros.includes("mision_mis1"),
    mis2: unlockedLogros.includes("mision_mis2"),
    mis3: unlockedLogros.includes("mision_mis3"),
  }), [unlockedLogros]);

  // 2. Estados Locales de UI
  const [albumTab, setAlbumTab] = useState<"tienda" | "logros">("tienda");
  const [packOpening, setPackOpening] = useState(false);
  const [revealedStamp, setRevealedStamp] = useState<typeof ESTAMPAS[0] | null>(null);
  const [packModalOpen, setPackModalOpen] = useState(false);

  // Estados de Pronósticos Dinámicos
  const todayMatches = useMemo(() => generateMatchesForDate(new Date()), []);
  const [predictionsInput, setPredictionsInput] = useState<Record<string, { t1: string; t2: string }>>({});

  useEffect(() => {
    const initialInput: Record<string, { t1: string; t2: string }> = {};
    todayMatches.forEach(m => {
      initialInput[m.id] = { t1: "", t2: "" };
    });
    
    if (user?.mundialPredictions) {
      const p = user.mundialPredictions as Record<string, { t1: string; t2: string }>;
      todayMatches.forEach(m => {
        if (p[m.id]) {
          initialInput[m.id] = p[m.id];
        }
      });
    }
    setPredictionsInput(initialInput);
  }, [user, todayMatches]);

  // 3. Noticias & Fuentes
  const [sources, setSources] = useState<{ id: string; name: string; url: string; note?: string }[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mundial_custom_sources");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved sources", e);
        }
      }
    }
    return DEFAULT_SOURCES;
  });

  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const handleAddSource = () => {
    if (!sourceName.trim() || !sourceUrl.trim()) {
      toast({ title: "Error", description: "Rellena el nombre y la dirección URL.", variant: "destructive" });
      return;
    }

    let formattedUrl = sourceUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    const newSource = {
      id: "src_" + Date.now().toString(),
      name: sourceName.trim(),
      url: formattedUrl,
      note: "Fuente externa agregada por el usuario."
    };

    const updated = [newSource, ...sources];
    setSources(updated);
    localStorage.setItem("mundial_custom_sources", JSON.stringify(updated));
    setSourceName("");
    setSourceUrl("");
    playSynthSound("click");
    toast({ title: "Fuente agregada", description: `Has registrado "${newSource.name}" como fuente de noticias.` });
  };

  const handleRemoveSource = (id: string) => {
    if (id === "fifa" || id === "marca") {
      toast({ title: "Acción no permitida", description: "No puedes borrar las fuentes oficiales predeterminadas.", variant: "destructive" });
      return;
    }
    const updated = sources.filter(s => s.id !== id);
    setSources(updated);
    localStorage.setItem("mundial_custom_sources", JSON.stringify(updated));
    playSynthSound("click");
    toast({ title: "Fuente eliminada", description: "La fuente ha sido retirada del listado." });
  };

  // API Call Handlers
  const handleClaimStamp = async (stamp: typeof ESTAMPAS[0]) => {
    if (claimedStamps.includes(stamp.id)) {
      toast({ title: "Estampa ya reclamada", description: "Ya tienes esta estampa en tu álbum." });
      return;
    }
    if ((user?.speedPoints ?? 0) < stamp.cost) {
      toast({ title: "SpeedPoints insuficientes", description: `Necesitas ${stamp.cost} SP para comprar esta estampa.`, variant: "destructive" });
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/mundial/buy-stamp", { stampId: stamp.id, cost: stamp.cost });
      if (res.ok) {
        playSynthSound("purchase");
        await refetchUser();
        toast({
          title: "¡Estampa Reclamada!",
          description: `Has canjeado "${stamp.name}" por ${stamp.cost} SpeedPoints.`,
        });
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.message || "Error al canjear", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Error al contactar con el servidor", variant: "destructive" });
    }
  };

  const handleOpenPack = async () => {
    if (packOpening) return;
    if ((user?.speedPoints ?? 0) < 10) {
      toast({ title: "SpeedPoints insuficientes", description: "Necesitas 10 SpeedPoints para abrir un sobre.", variant: "destructive" });
      return;
    }

    setPackOpening(true);
    setRevealedStamp(null);
    setPackModalOpen(true);
    playSynthSound("pack_shake");

    // Repeat pack shake audio effect
    const interval = setInterval(() => {
      if (packOpening) playSynthSound("pack_shake");
    }, 450);

    try {
      const res = await apiRequest("POST", "/api/mundial/buy-pack");
      clearInterval(interval);
      if (res.ok) {
        const data = await res.json();
        const stamp = ESTAMPAS.find((e) => e.id === data.stampId);

        setTimeout(() => {
          setRevealedStamp(stamp || null);
          setPackOpening(false);
          playSynthSound("pack_open");
          refetchUser();
          toast({
            title: "¡Sobre Abierto!",
            description: `Te salió la estampa "${stamp?.name || data.stampId}".`,
          });
        }, 1500);
      } else {
        setPackOpening(false);
        setPackModalOpen(false);
        const err = await res.json();
        toast({ title: "Error", description: err.message || "Error al abrir el sobre", variant: "destructive" });
      }
    } catch (e) {
      clearInterval(interval);
      setPackOpening(false);
      setPackModalOpen(false);
      toast({ title: "Error", description: "Error al contactar con el servidor", variant: "destructive" });
    }
  };

  const handleClaimLogroManual = async (logroId: string, name: string) => {
    if (unlockedLogros.includes(logroId)) {
      toast({ title: "Logro ya desbloqueado", description: "Ya tienes esta estampa de logro." });
      return;
    }

    // Verify requirements client-side
    let isEligible = false;
    if (logroId === "chateador") {
      isEligible = true; // Claimable
    } else if (logroId === "staff") {
      const isUserStaff = user && (user.role === "admin" || user.role === "dj" || user.role === "moderador" || user.role === "colaborador" || user.role === "periodista" || user.role === "diseñador" || user.role === "builder" || user.role === "mentor" || user.role === "eventos");
      isEligible = !!isUserStaff;
    } else if (logroId === "dj") {
      const isUserDj = user && (user.role === "admin" || user.role === "dj");
      isEligible = !!isUserDj;
    } else if (logroId === "penales") {
      isEligible = (penaltyStats.maxScore || 0) >= 5;
    } else if (logroId === "votante") {
      isEligible = Object.keys(userPredictions).length > 0;
    } else if (logroId === "hincha") {
      isEligible = Object.values(adventureMissions).some(v => v);
    }

    if (!isEligible) {
      toast({ title: "Requisitos no cumplidos", description: `Aún no cumples con el requisito para reclamar "${name}".`, variant: "destructive" });
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/mundial/claim-logro", { logroId });
      if (res.ok) {
        playSynthSound("logro");
        await refetchUser();
        toast({
          title: "¡Logro Desbloqueado!",
          description: `¡Felicidades! Conseguiste la estampa "${name}".`,
        });
      }
    } catch (e) {
      toast({ title: "Error al reclamar logro", variant: "destructive" });
    }
  };

  const handleSavePrediction = async (matchId: string, teamA: string, teamB: string) => {
    const pred = predictionsInput[matchId];
    if (!pred || pred.t1 === "" || pred.t2 === "") {
      toast({ title: "Error", description: "Por favor rellena ambos marcadores.", variant: "destructive" });
      return;
    }
    try {
      const res = await apiRequest("POST", "/api/mundial/predict", { matchId, t1: pred.t1, t2: pred.t2 });
      if (res.ok) {
        playSynthSound("logro");
        await refetchUser();
        toast({
          title: "Pronóstico Guardado",
          description: `Has guardado tu predicción: ${teamA} ${pred.t1} - ${pred.t2} ${teamB}.`,
        });
      }
    } catch (e) {
      toast({ title: "Error al guardar pronóstico", variant: "destructive" });
    }
  };

  const handleJoinClan = async (clanName: string) => {
    try {
      const res = await apiRequest("POST", "/api/mundial/join-clan", { clanName });
      if (res.ok) {
        playSynthSound("click");
        await refetchUser();
        toast({ title: "¡Te has unido!", description: `Ahora representas al "${clanName}" en el hotel.` });
      }
    } catch (e) {
      toast({ title: "Error al unirse al clan", variant: "destructive" });
    }
  };

  const handleCompleteMission = async (misId: string, title: string) => {
    try {
      const res = await apiRequest("POST", "/api/mundial/complete-mission", { missionId: misId });
      if (res.ok) {
        playSynthSound("logro");
        await refetchUser();
        toast({ title: "¡Misión Completada!", description: `Has terminado la misión "${title}". ¡Ganaste 15 SpeedPoints!` });
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.message || "Error al completar la misión", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error al enviar la misión", variant: "destructive" });
    }
  };

  // Estados del Mini Juego (Penales)
  const [penaltyState, setPenaltyState] = useState<{
    status: "idle" | "playing" | "result" | "over";
    lastResult: "scored" | "missed" | null;
    shotsRemaining: number;
    score: number;
  }>({
    status: "idle",
    lastResult: null,
    shotsRemaining: 5,
    score: 0,
  });

  const [userShot, setUserShot] = useState<"izq" | "cen" | "der" | null>(null);
  const [keeperJump, setKeeperJump] = useState<"izq" | "cen" | "der" | null>(null);
  const [isShooting, setIsShooting] = useState(false);

  const submitPenaltyResult = async (finalScore: number) => {
    try {
      const res = await apiRequest("POST", "/api/mundial/penalty-result", { score: finalScore });
      if (res.ok) {
        const data = await res.json();
        playSynthSound("win");
        await refetchUser();
        if (finalScore >= 5) {
          toast({
            title: "¡Marcador Perfecto!",
            description: `¡Anotaste los 5 penales! Ganaste ${data.reward} SP y desbloqueaste tu logro.`,
          });
        } else {
          toast({
            title: "Tanda Finalizada",
            description: `Has recibido +${data.reward} SpeedPoints por tus goles.`,
          });
        }
      }
    } catch (e) {
      console.error("Error submitting penalty result:", e);
    }
  };

  const handleShoot = (direction: "izq" | "cen" | "der") => {
    if (penaltyState.shotsRemaining <= 0 || isShooting) return;
    
    playSynthSound("click");
    setIsShooting(true);
    setUserShot(direction);
    
    const goalkeeperChoice = ["izq", "cen", "der"][Math.floor(Math.random() * 3)];
    
    setTimeout(() => {
      setKeeperJump(goalkeeperChoice as any);
      const isGoal = direction !== goalkeeperChoice;

      setTimeout(() => {
        if (isGoal) playSynthSound("goal");
        else playSynthSound("save");

        setPenaltyState((prev) => {
          const newScore = isGoal ? prev.score + 1 : prev.score;
          const newShots = prev.shotsRemaining - 1;
          
          if (newShots === 0) {
            submitPenaltyResult(newScore);
            return {
              status: "over",
              lastResult: isGoal ? "scored" : "missed",
              shotsRemaining: newShots,
              score: newScore,
            };
          }

          return {
            status: "result",
            lastResult: isGoal ? "scored" : "missed",
            shotsRemaining: newShots,
            score: newScore,
          };
        });

        setTimeout(() => {
          setUserShot(null);
          setKeeperJump(null);
          setIsShooting(false);
        }, 1200);

      }, 500);
    }, 200);
  };

  const handleResetPenaltyGame = () => {
    playSynthSound("click");
    setPenaltyState({
      status: "playing",
      lastResult: null,
      shotsRemaining: 5,
      score: 0,
    });
    setUserShot(null);
    setKeeperJump(null);
    setIsShooting(false);
  };

  // Sorteos
  const handleBuyTicket = async () => {
    if ((user?.speedPoints ?? 0) < 15) {
      toast({ title: "SpeedPoints insuficientes", description: "Cada boleto cuesta 15 SP.", variant: "destructive" });
      return;
    }
    try {
      const res = await apiRequest("POST", "/api/mundial/buy-ticket");
      if (res.ok) {
        playSynthSound("purchase");
        await refetchUser();
        toast({ title: "Boleto Comprado", description: "Has adquirido un boleto para el próximo gran sorteo de placas." });
      }
    } catch (e) {
      toast({ title: "Error al comprar boleto", variant: "destructive" });
    }
  };

  // Simulación de partidos mundialistas en vivo
  const [liveMatches, setLiveMatches] = useState([
    { t1: "México", t2: "Estados Unidos", flag1: "🇲🇽", flag2: "🇺🇸", score1: 1, score2: 1, min: "74'", status: "LIVE" },
    { t1: "Argentina", t2: "Brasil", flag1: "🇦🇷", flag2: "🇧🇷", score1: 0, score2: 0, min: "—", status: "HOY 20:00" },
    { t1: "España", t2: "Francia", flag1: "🇪🇸", flag2: "🇫🇷", score1: 2, score2: 1, min: "90+4'", status: "FINAL" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMatches(prev => prev.map(m => {
        if (m.status === "LIVE") {
          const currentMin = parseInt(m.min);
          const nextMin = currentMin < 90 ? currentMin + 1 : 90;
          let nextScore1 = m.score1;
          let nextScore2 = m.score2;
          if (Math.random() < 0.05) {
            if (Math.random() < 0.5) nextScore1++;
            else nextScore2++;
          }
          return {
            ...m,
            min: `${nextMin}'`,
            score1: nextScore1,
            score2: nextScore2,
            status: nextMin === 90 ? "FINAL" : "LIVE"
          };
        }
        return m;
      }));
    }, 15000); // update every 15s

    return () => clearInterval(interval);
  }, []);

  // Countdown timer para sorteo
  const [countdown, setCountdown] = useState("3d 04h 12m 45s");
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(d.getDate() + (7 - d.getDay()) % 7);
      nextSunday.setHours(21, 0, 0, 0); // Sunday at 9 PM
      
      let diff = nextSunday.getTime() - d.getTime();
      if (diff < 0) diff += 7 * 24 * 60 * 60 * 1000; // next week

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setCountdown(`${days}d ${hours}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
              ? "Tanda de Penales"
              : section === "mini-draw"
                ? "Sorteos y premios"
                : section === "source"
                  ? "Fuente seleccionada"
                  : "Mundial 2026";

  const activeCopy =
    section === "forecast"
      ? "Apuesta tus predicciones de partidos y gana SpeedPoints por tus aciertos exactos."
      : section === "ranking"
        ? "Sube en la tabla comunitaria con tus aciertos en pronósticos y obtén recompensas exclusivas."
        : section === "teams"
          ? "Únete a un clan del hotel para acumular puntos grupales y competir en torneos isométricos."
          : section === "adventure"
            ? "Completa misiones especiales interactuando en la radio y el foro de la comunidad."
            : section === "mini-rapid"
              ? "¡Patea penales contra el portero Frank y suma puntos a tu perfil!"
              : section === "mini-draw"
                ? "Compra boletos usando SpeedPoints y participa en el gran sorteo de raras y estampas."
                : section === "source"
                  ? "Gestiona fuentes externas del Mundial y mantén visible el disclaimer."
                  : "Zona temática para seguir el Mundial 2026 con pronósticos, aventura y colección de estampas.";

  if (!user) {
    return (
      <div className="p-4 lg:p-6 max-w-md mx-auto my-16 font-sans">
        <Card className="bg-card border-border shadow-2xl">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <i className="fa-solid fa-lock text-3xl"></i>
            </div>
            <h2 className="text-lg font-black uppercase text-foreground">Acceso de Aficionados</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              La sección especial del <strong>Mundial 2026</strong> requiere tener una sesión iniciada para participar en los pronósticos, aventuras, y coleccionar estampas.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button className="w-full bg-primary hover:bg-primary/80 text-white font-bold text-xs py-2.5 uppercase tracking-wider">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">
              ¿Eres nuevo? <Link href="/register" className="text-primary hover:underline font-extrabold">Regístrate ahora</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5 font-sans">
      
      {/* Banner Principal */}
      <div className="site-panel-strong overflow-hidden relative rounded-3xl border border-border/80 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-amber-400/10 pointer-events-none" />
        <div className="relative p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-8">
                <Link href="/">
                  <i className="fa-solid fa-arrow-left mr-1.5 text-[10px]"></i>
                  Volver al Inicio
                </Link>
              </Button>
              <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-400/20 text-[10px] font-bold">
                Mundial 2026
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 text-[10px] font-bold">Modo Habbo</Badge>
            </div>

            {/* SpeedPoints Balance inside header */}
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-full shadow-lg">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
              <i className="fa-solid fa-bolt text-yellow-400 text-xs"></i>
              <span className="text-xs font-black text-yellow-400 font-mono">{(user?.speedPoints ?? 0).toLocaleString()} SP</span>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <p className="site-kicker font-black text-emerald-400">Fansite Hub</p>
              <h1 className="text-2xl lg:text-4xl font-black text-white mt-2 uppercase tracking-tight">
                {activeTitle}
              </h1>
              <p className="text-white/80 mt-2.5 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {activeCopy}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-bold text-white/70">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Pronósticos</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Aventura</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Mini torneos</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Estampas</span>
              </div>
            </div>

            <Card className="bg-card/95 border-border/80">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
                  <i className="fa-solid fa-circle-exclamation text-primary"></i>
                  Disclaimer Oficial
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Esta zona especial es interactiva para la comunidad. No tenemos afiliación oficial con la FIFA o marcas asociadas.
                </p>
                <div className="text-[10px] text-muted-foreground font-semibold">
                  Tus SpeedPoints acumulados en la radio se usan para jugar en el hub.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sub-Navegación del Mundial (Pestañas Rápidas) */}
      <div className="grid gap-2 grid-cols-4 md:grid-cols-8">
        <Link href="/mundial" className={cn("p-2 border rounded-xl text-center text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1", section === "home" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-trophy text-xs"></i> ÁLBUM
        </Link>
        <Link href="/mundial/pronosticos" className={cn("p-2 border rounded-xl text-center text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1", section === "forecast" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-chart-line text-xs"></i> PRONÓSTICOS
        </Link>
        <Link href="/mundial/ranking" className={cn("p-2 border rounded-xl text-center text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1", section === "ranking" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-ranking-star text-xs"></i> RANKING
        </Link>
        <Link href="/mundial/equipos" className={cn("p-2 border rounded-xl text-center text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1", section === "teams" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-users-gear text-xs"></i> CLANES
        </Link>
        <Link href="/mundial/aventura" className={cn("p-2 border rounded-xl text-center text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1", section === "adventure" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-compass text-xs"></i> AVENTURA
        </Link>
        <Link href="/mundial/mini/rapido" className={cn("p-2 border rounded-xl text-center text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1", section === "mini-rapid" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-futbol text-xs"></i> PENALES
        </Link>
        <Link href="/mundial/mini/sorteos" className={cn("p-2 border rounded-xl text-center text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1", section === "mini-draw" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-gift text-xs"></i> SORTEOS
        </Link>
        <Link href="/mundial/sources" className={cn("p-2 border rounded-xl text-center text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1", section === "source" ? "bg-primary border-primary text-white" : "bg-card border-border hover:bg-secondary/40")}>
          <i className="fa-solid fa-newspaper text-xs"></i> FUENTES
        </Link>
      </div>

      {/* Renderizado de Sección Activa */}

      {/* 1. ALBUM DE ESTAMPAS (Home) */}
      {section === "home" && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border md:col-span-2 flex flex-col justify-center">
              <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-5 justify-between">
                <div className="text-center sm:text-left space-y-1.5">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <i className="fa-solid fa-box-open text-primary"></i>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">¿Probarás tu suerte?</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground max-w-sm">
                    Abre un sobre sorpresa por <strong>10 SpeedPoints</strong>. Puedes conseguir cualquiera de las 4 estampas oficiales de forma aleatoria y guardarlas en tu cuenta de forma permanente.
                  </p>
                </div>
                <Button
                  onClick={handleOpenPack}
                  disabled={packOpening}
                  className="bg-primary hover:bg-primary/95 text-white text-[11px] font-black h-9 px-6 shrink-0 relative overflow-hidden"
                >
                  {packOpening ? (
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-notch animate-spin"></i> ABRIENDO...
                    </span>
                  ) : (
                    <span>ABRIR SOBRE (10 SP)</span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Live Matches Widget on Home */}
            <LiveMatchesWidget />
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-border/80 pb-3.5 mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-images text-primary text-sm"></i>
                  <h3 className="text-sm font-extrabold uppercase">Colección de Estampas del Mundial</h3>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAlbumTab("tienda")}
                    variant={albumTab === "tienda" ? "default" : "outline"}
                    className="text-[10px] font-black h-8 px-4"
                  >
                    TIENDA DE ESTAMPAS (SP)
                  </Button>
                  <Button
                    onClick={() => setAlbumTab("logros")}
                    variant={albumTab === "logros" ? "default" : "outline"}
                    className="text-[10px] font-black h-8 px-4"
                  >
                    ESTAMPAS DE LOGROS (GRATIS)
                  </Button>
                </div>
              </div>

              {albumTab === "tienda" ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground mb-4">
                    Compra estampas conmemorativas del Mundial usando tus <strong>SpeedPoints</strong>. Se guardarán en tu inventario persistente.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {ESTAMPAS.map((stamp) => {
                      const isClaimed = claimedStamps.includes(stamp.id);
                      return (
                        <div
                          key={stamp.id}
                          className={cn(
                            "relative border rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all bg-[#0e0a32]/40 duration-300",
                            isClaimed ? `border-emerald-500/50 ${stamp.glowClass}` : "border-border/60 grayscale opacity-45"
                          )}
                        >
                          <Badge className={cn("absolute top-3 right-3 font-bold text-[9px] border", stamp.badgeColor)}>
                            {stamp.rarity}
                          </Badge>
                          
                          <div className="w-28 h-28 my-3 flex items-center justify-center relative overflow-hidden bg-black/20 rounded-xl border border-white/5 group">
                            <img src={stamp.image} alt={stamp.name} className="w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-110" />
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-white">{stamp.name}</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold">Costo: {stamp.cost} SP</p>
                          </div>

                          <div className="mt-4 w-full">
                            {isClaimed ? (
                              <Button disabled className="w-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold h-8">
                                <i className="fa-solid fa-check mr-1"></i> ADQUIRIDA
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleClaimStamp(stamp)}
                                className="w-full bg-primary hover:bg-primary/80 text-white text-[10px] font-bold h-8"
                              >
                                COMPRAR POR {stamp.cost} SP
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground mb-4">
                    Desbloquea estas estampas especiales completando actividades temáticas en los mini juegos o rangos especiales.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {LOGROS.map((logro) => {
                      const isUnlocked = unlockedLogros.includes(logro.id);
                      return (
                        <div
                          key={logro.id}
                          className={cn(
                            "relative border rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all bg-[#0e0a32]/40 duration-300",
                            isUnlocked ? "border-emerald-500/50 shadow-lg shadow-emerald-500/5" : "border-border/60 grayscale opacity-45"
                          )}
                        >
                          <Badge className={cn("absolute top-3 right-3 font-bold text-[9px] border", logro.badgeColor)}>
                            LOGRO
                          </Badge>
                          
                          <div className="w-28 h-28 my-3 flex items-center justify-center relative overflow-hidden bg-black/20 rounded-xl border border-white/5">
                            <img src={logro.image} alt={logro.name} className="w-24 h-24 object-contain" />
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-white">{logro.name}</h4>
                            <p className="text-[10px] text-muted-foreground leading-tight px-1 mt-0.5">{logro.requirement}</p>
                          </div>

                          <div className="mt-4 w-full">
                            {isUnlocked ? (
                              <Button disabled className="w-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold h-8">
                                <i className="fa-solid fa-lock-open mr-1"></i> DESBLOQUEADO
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleClaimLogroManual(logro.id, logro.name)}
                                className="w-full bg-secondary hover:bg-secondary/80 text-foreground text-[10px] font-bold h-8"
                              >
                                COMPROBAR LOGRO
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. PRONÓSTICOS */}
      {section === "forecast" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-chart-bar text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Pronosticar Partidos del Mundial</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Predice marcadores. Si aciertas el ganador ganas 15 SP. Si aciertas el marcador exacto ganas **50 SpeedPoints** (y desbloqueas tu estampa de pronósticos).
              </p>

              <div className="space-y-3 pt-2">
                {todayMatches.map((match) => {
                  const hasPred = userPredictions[match.id] !== undefined;
                  const dbPred = userPredictions[match.id] || { t1: "", t2: "" };
                  
                  return (
                    <div key={match.id} className="p-4 bg-secondary/10 border border-border/60 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-center md:text-left">
                        <p className="text-[10px] text-muted-foreground font-semibold">{match.date}</p>
                        <p className="text-xs font-bold text-foreground mt-0.5">{match.group} • {match.time}</p>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <span className="text-sm font-bold w-24 text-right">{match.teamA} {match.flagA}</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          disabled={hasPred}
                          className="w-12 h-8 text-center text-xs font-bold bg-background"
                          value={hasPred ? dbPred.t1 : predictionsInput[match.id]?.t1 || ""}
                          onChange={(e) => setPredictionsInput({
                            ...predictionsInput,
                            [match.id]: { ...predictionsInput[match.id], t1: e.target.value }
                          })}
                        />
                        <span className="text-xs text-slate-400 font-bold">vs</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          disabled={hasPred}
                          className="w-12 h-8 text-center text-xs font-bold bg-background"
                          value={hasPred ? dbPred.t2 : predictionsInput[match.id]?.t2 || ""}
                          onChange={(e) => setPredictionsInput({
                            ...predictionsInput,
                            [match.id]: { ...predictionsInput[match.id], t2: e.target.value }
                          })}
                        />
                        <span className="text-sm font-bold w-24 text-left">{match.flagB} {match.teamB}</span>
                      </div>

                      <div>
                        {hasPred ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] py-1.5 px-3">
                            ENVIADO: {dbPred.t1} - {dbPred.t2}
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleSavePrediction(match.id, match.teamA, match.teamB)}
                            className="bg-primary hover:bg-primary/80 text-white text-[10px] font-bold h-8"
                          >
                            Enviar Pronóstico
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. RANKING */}
      {section === "ranking" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-ranking-star text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Tabla de Líderes de Pronósticos</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Los usuarios que aciertan los partidos oficiales del Mundial suben en el ranking del hotel para ganar placas y SpeedPoints.
              </p>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/80 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-secondary/20">
                      <th className="py-2.5 px-3">Puesto</th>
                      <th className="py-2.5 px-3">Aficionado</th>
                      <th className="py-2.5 px-3 text-center">Puntos</th>
                      <th className="py-2.5 px-3 text-center">Aciertos</th>
                      <th className="py-2.5 px-3 text-right">Rango</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[
                      { pos: 1, name: "Dj_Invitado", points: 120, aciertos: 6, rank: "Pichichi" },
                      { pos: 2, name: "HabboSpeed", points: 95, aciertos: 4, rank: "Goleador" },
                      { pos: 3, name: "FrankManager", points: 80, aciertos: 3, rank: "Goleador" },
                      { pos: 4, name: user.displayName, points: Object.keys(userPredictions).length * 15, aciertos: Object.keys(userPredictions).length, rank: "Defensa" },
                      { pos: 5, name: "PixelKing", points: 30, aciertos: 1, rank: "Amateur" },
                    ].sort((a, b) => b.points - a.points).map((row, idx) => {
                      const isSelf = row.name === user.displayName;
                      return (
                        <tr key={idx} className={cn("hover:bg-secondary/10", isSelf && "bg-primary/5 font-bold border-l-2 border-primary")}>
                          <td className="py-3 px-3">
                            <Badge className={cn("text-[10px] font-mono", idx === 0 ? "bg-yellow-500 text-white" : idx === 1 ? "bg-slate-300 text-black" : idx === 2 ? "bg-amber-600 text-white" : "bg-card border text-foreground")}>
                              #{idx + 1}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 flex items-center gap-2">
                            <img
                              src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(row.name)}&size=s&headonly=1&head_direction=2`}
                              alt=""
                              className="w-5 h-5 bg-secondary/35 rounded-full object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif"; }}
                            />
                            <span>{row.name}</span>
                          </td>
                          <td className="py-3 px-3 text-center text-primary font-bold">{row.points}</td>
                          <td className="py-3 px-3 text-center">{row.aciertos}</td>
                          <td className="py-3 px-3 text-right text-muted-foreground text-[10px] font-semibold">{row.rank}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. CLANES */}
      {section === "teams" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-users text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Selecciona tu Clan del Mundial</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Únete a un grupo temático en el hotel de forma persistente para acumular puntos colectivos y competir en misiones del fansite.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {[
                  { name: "Clan Gladiadores Neón", members: 14, icon: "fa-solid fa-shield-halved", color: "text-cyan-400 border-cyan-400/20 bg-cyan-950/20" },
                  { name: "Clan Furia Píxel", members: 8, icon: "fa-solid fa-fire", color: "text-amber-400 border-amber-400/20 bg-amber-950/20" },
                  { name: "Clan Fucsia Extremo", members: 19, icon: "fa-solid fa-bolt", color: "text-fuchsia-400 border-fuchsia-400/20 bg-fuchsia-950/20" },
                ].map((clan) => {
                  const isMyClan = selectedClan === clan.name;
                  return (
                    <div key={clan.name} className={cn("border rounded-2xl p-4 flex flex-col justify-between text-center gap-3.5 transition-all duration-300", clan.color, isMyClan && "border-primary border-2 shadow-lg")}>
                      <div className="mx-auto w-12 h-12 rounded-full border border-current/25 flex items-center justify-center">
                        <i className={cn(clan.icon, "text-xl")}></i>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{clan.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1">Miembros: {clan.members + (isMyClan ? 1 : 0)}</p>
                      </div>
                      <div className="pt-2">
                        {isMyClan ? (
                          <Button disabled className="w-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold h-8">
                            <i className="fa-solid fa-check mr-1.5"></i> ERES MIEMBRO
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleJoinClan(clan.name)}
                            className="w-full bg-white text-slate-900 hover:bg-white/90 text-[10px] font-bold h-8 animate-pulse"
                          >
                            Unirse al Clan
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. AVENTURA */}
      {section === "adventure" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-compass text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Aventura Mundialista: Misiones Activas</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Completa estas misiones interactivas para acumular SpeedPoints adicionales de manera definitiva.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { id: "mis1", title: "Inauguración de Radio", desc: "Sintoniza la radio durante 15 minutos en el reproductor." },
                  { id: "mis2", title: "Saludo de Hincha", desc: "Envía un mensaje de saludo al DJ actual usando la barra de control." },
                  { id: "mis3", title: "Goleador Exacto", desc: "Realiza tu primer pronóstico exacto de algún partido del Mundial." },
                ].map((mission) => {
                  const isDone = adventureMissions[mission.id as keyof typeof adventureMissions];
                  return (
                    <div key={mission.id} className="p-4 bg-secondary/15 border border-border/60 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-black text-white">{mission.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{mission.desc}</p>
                      </div>
                      <div>
                        {isDone ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold py-1 px-2.5">
                            COMPLETADA
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleCompleteMission(mission.id, mission.title)}
                            className="bg-primary hover:bg-primary/80 text-white text-[10px] font-bold h-8"
                          >
                            Completar Misión
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 6. PENALES */}
      {section === "mini-rapid" && (
        <div className="space-y-4 font-sans animate-fade-in">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-futbol text-primary text-sm animate-spin" style={{ animationDuration: "3s" }}></i>
                  <h3 className="text-sm font-extrabold uppercase">Tanda de Penales contra el Bot Frank</h3>
                </div>
                {penaltyStats.totalGames > 0 && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Récord: <strong className="text-primary">{penaltyStats.maxScore} goles</strong> | Jugados: {penaltyStats.totalGames}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Frank es el portero. Elige a dónde patear el balón. Cada gol te recompensa con <strong>+2 SpeedPoints</strong> en el backend. ¡Logra 5/5 para obtener un bono de **+10 SP** y la estampa <strong>Guante del Campeón</strong>!
              </p>

              <div className="bg-[#0b0632] border border-white/10 rounded-2xl p-6 text-center max-w-xl mx-auto flex flex-col justify-center items-center gap-5 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(38,215,255,0.08),transparent_70%)] pointer-events-none" />
                
                {penaltyState.status === "idle" ? (
                  <div className="py-6 space-y-4 relative z-10">
                    <i className="fa-solid fa-circle-play text-5xl text-primary animate-pulse cursor-pointer" onClick={handleResetPenaltyGame}></i>
                    <h4 className="text-sm font-black text-white uppercase">¿Listo para patear?</h4>
                    <Button onClick={handleResetPenaltyGame} className="bg-primary hover:bg-primary/80 text-white text-xs font-bold px-6">
                      Iniciar Partido
                    </Button>
                  </div>
                ) : (
                  <div className="w-full space-y-5 relative z-10">
                    
                    {/* Cancha y Portería Visual */}
                    <div className="relative w-80 h-40 border-4 border-slate-200 bg-emerald-950/70 rounded-t-2xl overflow-hidden mx-auto flex items-center justify-center shadow-inner">
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30" />
                      
                      {/* Portero (Frank) */}
                      <div
                        className={cn(
                          "absolute w-12 h-16 transition-all duration-500 bottom-2",
                          keeperJump === "izq" ? "left-6 translate-y-3 rotate-[-45deg] scale-95" :
                          keeperJump === "der" ? "right-6 translate-y-3 rotate-[45deg] scale-95" :
                          keeperJump === "cen" ? "bottom-5 scale-110" : "left-[calc(50%-24px)]"
                        )}
                      >
                        <img
                          src="/habbo-radio/frank_small_03.gif"
                          alt="Frank Portero"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Balón */}
                      <div
                        className={cn(
                          "absolute w-6 h-6 transition-all duration-500 ease-out",
                          userShot === "izq" ? "left-8 top-10 scale-75 rotate-[360deg]" :
                          userShot === "der" ? "right-8 top-10 scale-75 rotate-[360deg]" :
                          userShot === "cen" ? "left-[calc(50%-12px)] top-8 scale-75 rotate-[360deg]" :
                          "bottom-2 left-[calc(50%-12px)] scale-100 cursor-pointer animate-pulse"
                        )}
                      >
                        <i className="fa-solid fa-futbol text-lg text-white"></i>
                      </div>
                    </div>

                    {/* Marcador */}
                    <div className="flex items-center justify-between bg-black/45 border border-white/5 rounded-xl px-4 py-2 text-xs">
                      <span className="font-bold text-slate-400">Pateador: <strong className="text-white">{user.displayName}</strong></span>
                      <span className="font-mono text-cyan-400 font-bold bg-[#140b49] px-2.5 py-0.5 rounded border border-white/10 text-xs">
                        {penaltyState.score} Goles
                      </span>
                      <span className="font-bold text-slate-400">Tiros: <strong className="text-white">{penaltyState.shotsRemaining}</strong></span>
                    </div>

                    {/* Animación o Mensaje de Estado */}
                    <div className="h-20 flex flex-col items-center justify-center text-center">
                      {penaltyState.lastResult === "scored" && (
                        <div className="space-y-1.5 animate-bounce">
                          <i className="fa-solid fa-circle-check text-3xl text-emerald-400"></i>
                          <h5 className="text-emerald-400 font-black text-xs uppercase">¡GOLAZO! Frank no llegó.</h5>
                        </div>
                      )}
                      {penaltyState.lastResult === "missed" && (
                        <div className="space-y-1.5 animate-shake">
                          <i className="fa-solid fa-circle-xmark text-3xl text-rose-500"></i>
                          <h5 className="text-rose-400 font-black text-xs uppercase">¡Atajadón! Frank la desvió.</h5>
                        </div>
                      )}
                      {penaltyState.lastResult === null && penaltyState.status !== "over" && (
                        <div className="space-y-1 text-slate-300">
                          <i className="fa-solid fa-circle-info text-cyan-400 animate-pulse text-lg block"></i>
                          <h5 className="font-bold text-[10px] uppercase">¡Haz tu tiro! Elige la dirección.</h5>
                        </div>
                      )}
                      {penaltyState.status === "over" && (
                        <div className="space-y-1.5">
                          <i className="fa-solid fa-trophy text-3xl text-yellow-400"></i>
                          <h5 className="text-yellow-400 font-black text-xs uppercase">Tanda Terminada</h5>
                          <p className="text-[10px] text-slate-300">Lograste anotar {penaltyState.score} de 5 goles.</p>
                          {penaltyState.score >= 5 ? (
                            <p className="text-[10.5px] text-emerald-400 font-extrabold animate-pulse">🎉 ¡LOGRO CONSEGUIDO: Guante del Campeón! Ve al Álbum.</p>
                          ) : (
                            <p className="text-[9.5px] text-slate-400 italic">Inténtalo de nuevo para lograr el tiro perfecto.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botones de Acción de Disparo */}
                    {penaltyState.status !== "over" ? (
                      <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                        <Button
                          onClick={() => handleShoot("izq")}
                          disabled={isShooting}
                          className="bg-[#140b49] border border-white/10 text-xs font-bold text-white hover:bg-[#201170] h-9"
                        >
                          Izquierda
                        </Button>
                        <Button
                          onClick={() => handleShoot("cen")}
                          disabled={isShooting}
                          className="bg-[#140b49] border border-white/10 text-xs font-bold text-white hover:bg-[#201170] h-9"
                        >
                          Centro
                        </Button>
                        <Button
                          onClick={() => handleShoot("der")}
                          disabled={isShooting}
                          className="bg-[#140b49] border border-white/10 text-xs font-bold text-white hover:bg-[#201170] h-9"
                        >
                          Derecha
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={handleResetPenaltyGame} className="bg-primary hover:bg-primary/80 text-xs font-bold px-6">
                        Patear Otra Tanda
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 7. SORTEOS */}
      {section === "mini-draw" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-gift text-primary text-sm animate-pulse"></i>
                  <h3 className="text-sm font-extrabold uppercase">Sorteos de Placas del Mundial</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold bg-[#0e0a32] border border-white/10 px-3 py-1 rounded-full font-mono text-cyan-400">
                  <i className="fa-regular fa-clock"></i> Sorteo en: {countdown}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Participa en la rifa de placas y estampas raras usando tus SpeedPoints. Cada boleto te cuesta 15 SP. ¡Cuantos más boletos compres, mayor probabilidad de ganar!
              </p>

              <div className="grid gap-4 md:grid-cols-2 pt-2">
                {/* Caja de Compra */}
                <div className="p-5 bg-[#0e0a32]/45 border border-border/80 rounded-2xl flex flex-col justify-between items-center text-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none rounded-bl-full" />
                  
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl">
                    <i className="fa-solid fa-ticket-simple rotate-[-15deg]"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Comprar Boleto del Sorteo</h4>
                    <p className="text-[10px] text-muted-foreground mt-1">Costo por boleto: 15 SpeedPoints</p>
                    <p className="text-[11px] text-cyan-400 font-extrabold mt-3 bg-cyan-950/20 border border-cyan-500/20 py-1 px-3 rounded-full">
                      Tienes {ticketsCount} boletos adquiridos
                    </p>
                  </div>
                  <Button
                    onClick={handleBuyTicket}
                    className="w-full bg-primary hover:bg-primary/80 text-white text-xs font-bold py-2"
                  >
                    Comprar 1 Boleto (15 SP)
                  </Button>
                </div>

                {/* Info de Sorteos */}
                <div className="p-4 bg-secondary/10 border border-border/50 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Premios del Sorteo de esta semana</h4>
                    <ul className="text-xs space-y-2.5 text-slate-300 mt-2.5">
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-emerald-400"></i>
                        <span>Placa Especial \"Fanático de Oro 2026\"</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-emerald-400"></i>
                        <span>Estampa Legendaria de Habbo Mundial</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-emerald-400"></i>
                        <span>Premio Mayor: 250 SpeedPoints</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic pt-2 border-t border-border/30">
                    El sorteo se realiza automáticamente todos los domingos en la noche durante el programa en vivo de la radio.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 8. FUENTE EXTERNA SELECCIONADA */}
      {section === "source" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-newspaper text-primary text-sm"></i>
                <h3 className="text-sm font-extrabold uppercase">Fuentes Oficiales y Noticias Externas</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Agrega y gestiona tus propios enlaces o fuentes de noticias para estar al tanto de todo lo que ocurre en el Mundial 2026.
              </p>

              {/* Form to add custom sources */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-secondary/15 border border-border/40 rounded-2xl p-4 mt-2">
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input 
                      placeholder="Nombre de la fuente (Ej: FIFA Oficial)" 
                      value={sourceName} 
                      onChange={(e) => setSourceName(e.target.value)}
                      className="bg-background/80 border-border/60 text-xs h-9"
                    />
                    <Input 
                      placeholder="Dirección URL (Ej: www.fifa.com)" 
                      value={sourceUrl} 
                      onChange={(e) => setSourceUrl(e.target.value)}
                      className="bg-background/80 border-border/60 text-xs h-9"
                    />
                  </div>
                </div>
                <div className="flex items-end sm:justify-start">
                  <Button 
                    onClick={handleAddSource} 
                    className="w-full bg-primary hover:bg-primary/80 text-white font-bold text-xs h-9 flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                    Agregar Fuente
                  </Button>
                </div>
                <div className="sm:col-span-3 text-[10px] text-muted-foreground pt-1 border-t border-border/20 flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>Reglas:</strong> Solo fuentes verificadas.</span>
                  <span>Links públicos y respetuosos.</span>
                </div>
              </div>

              {/* List of sources */}
              <div className="space-y-3 pt-2">
                {sources.map((source) => {
                  const isDefault = source.id === "fifa" || source.id === "marca";
                  return (
                    <div key={source.id} className="rounded-xl border border-border/60 bg-background/40 p-4 flex items-start justify-between gap-3 hover:border-primary/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <a href={source.url} target="_blank" rel="noreferrer" className="text-xs font-black text-primary hover:underline inline-flex items-center gap-1">
                            {source.name}
                            <i className="fa-solid fa-up-right-from-square text-[9px]"></i>
                          </a>
                          {isDefault && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] px-1.5 py-0">
                              Oficial
                            </Badge>
                          )}
                        </div>
                        {source.note && <p className="text-[11px] text-muted-foreground">{source.note}</p>}
                        <p className="text-[9px] text-muted-foreground/80 font-mono break-all">{source.url}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-bold"
                        >
                          Ver
                        </a>
                        {!isDefault && (
                          <Button
                            onClick={() => handleRemoveSource(source.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL / POPUP DE APERTURA DE SOBRES */}
      <Dialog open={packModalOpen} onOpenChange={(open) => !open && !packOpening && setPackModalOpen(false)}>
        <DialogContent className="max-w-xs bg-slate-950/95 border-border/60 shadow-2xl rounded-3xl p-5 flex flex-col items-center justify-center min-h-[350px]">
          <DialogHeader className="w-full text-center">
            <DialogTitle className="text-xs font-black text-slate-300 uppercase tracking-widest">
              {packOpening ? "Abriendo Sobre..." : "¡Sobre Abierto!"}
            </DialogTitle>
          </DialogHeader>

          {packOpening && (
            <div className="flex flex-col items-center justify-center space-y-6 py-6 animate-bounce">
              <div className="relative w-36 h-56 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-2xl animate-pulse">
                <div className="w-full h-full bg-slate-900/90 rounded-[14px] flex flex-col items-center justify-center p-3 relative">
                  <i className="fa-solid fa-futbol text-4xl text-white/20 animate-spin" style={{ animationDuration: "4s" }}></i>
                  <p className="text-[10px] font-black text-white/60 tracking-wider uppercase mt-4">SACUDIENDO...</p>
                </div>
              </div>
            </div>
          )}

          {!packOpening && revealedStamp && (
            <div className="flex flex-col items-center justify-center space-y-4 py-4 w-full">
              <div className="relative w-40 h-60 rounded-2xl bg-[#0e0a32] border-2 border-emerald-500/50 p-4 shadow-xl flex flex-col items-center justify-between text-center animate-fade-in">
                <Badge className="font-bold text-[9px] border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  {revealedStamp.rarity}
                </Badge>
                <div className="w-24 h-24 my-2 flex items-center justify-center bg-black/25 rounded-xl border border-white/5">
                  <img src={revealedStamp.image} alt={revealedStamp.name} className="w-20 h-20 object-contain animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-white leading-tight">{revealedStamp.name}</h4>
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider">¡Añadida al álbum!</span>
                </div>
              </div>
              <Button onClick={() => setPackModalOpen(false)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold h-8 mt-2">
                Aceptar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

// Subcomponente de Simulador de Partidos
function LiveMatchesWidget() {
  const [matches, setMatches] = useState<SimulatedMatch[]>(() => generateMatchesForDate(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(generateMatchesForDate(new Date()));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card border-border overflow-hidden flex flex-col justify-between shadow-lg">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Marcadores en Vivo
          </div>
          <span className="text-[9px] text-muted-foreground font-mono">Actualizado</span>
        </div>
        <div className="space-y-2.5">
          {matches.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between bg-[#0e0a32]/20 border border-white/5 rounded-xl p-2 text-[10px]">
              <div className="flex items-center gap-1.5 w-[42%] justify-end font-semibold">
                <span className="font-bold truncate text-[10px]">{m.teamA} {m.flagA}</span>
                <span className="font-mono bg-black/35 px-1 py-0.5 rounded font-black text-primary">{m.scoreA}</span>
              </div>
              <span className="text-[9px] font-bold text-muted-foreground px-1">:</span>
              <div className="flex items-center gap-1.5 w-[42%] justify-start font-semibold">
                <span className="font-mono bg-black/35 px-1 py-0.5 rounded font-black text-primary">{m.scoreB}</span>
                <span className="font-bold truncate text-[10px]">{m.flagB} {m.teamB}</span>
              </div>
              <Badge className={m.status === "LIVE" ? "bg-red-500/15 text-red-400 border border-red-500/20 text-[8px] font-bold py-0.5 px-1 w-14 text-center flex justify-center" : "bg-secondary/40 text-muted-foreground text-[8px] py-0.5 px-1 w-14 text-center flex justify-center"}>
                {m.status === "LIVE" ? `${m.min}` : m.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
