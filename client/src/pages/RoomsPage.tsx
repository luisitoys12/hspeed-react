import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Home } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeaderCard } from "@/components/PageHeaderCard";

interface HSpeedRoom {
  id: number;
  name: string;
  description?: string;
  roomCode?: string;
  ownerHabbo?: string;
  hotel: string;
  category?: string;
  capacity?: number;
  currentVisitors: number;
  isActive: boolean;
  thumbnailUrl?: string;
  featured: boolean;
}

export default function RoomsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; color: string }[]
  >([]);

  const { data: rooms = [], isLoading } = useQuery<HSpeedRoom[]>({
    queryKey: ["/api/rooms"],
  });

  const categories = [
    { value: "all", label: "Todas las salas" },
    { value: "oficial", label: "Oficiales" },
    { value: "musica", label: "Música & Radio" },
    { value: "vip", label: "Exclusivas VIP" },
    { value: "evento", label: "Eventos" },
  ];

  const handleCopy = (code: string, e: React.MouseEvent) => {
    const command = `:room ${code}`;
    navigator.clipboard.writeText(command);

    toast({
      title: "¡Comando copiado!",
      description: `Usa "${command}" en el chat de Habbo para entrar directo.`,
    });

    // Confetti effect at cursor location
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      x: e.clientX + (Math.random() - 0.5) * 100,
      y: e.clientY + (Math.random() - 0.5) * 100,
      color: ["#f5a623", "#ffd075", "#ffffff"][Math.floor(Math.random() * 3)],
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id)),
      );
    }, 1000);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      (room.description &&
        room.description.toLowerCase().includes(search.toLowerCase())) ||
      (room.ownerHabbo &&
        room.ownerHabbo.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || room.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <PageContainer>
      {/* Floating particles for confetti effect */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="fixed pointer-events-none w-2 h-2 rounded-full animate-ping z-50 transition-all duration-1000 ease-out"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}

      <PageHeaderCard
        title="Salas de la Comunidad"
        description="Visita las salas recomendadas y oficiales de la radio para compartir y bailar con otros Habbos."
        icon={<Home className="w-5 h-5 text-amber-500" />}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedCategory === cat.value
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="w-44 sm:w-56">
              <Input
                placeholder="Buscar por sala o dueño..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        }
      />

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-44 bg-card/40 rounded-xl border border-border animate-pulse"
            />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 border border-slate-200/90 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-400">
          <i className="fa-solid fa-hotel text-3xl mb-3 block opacity-40"></i>
          <p className="text-sm font-bold">
            No se encontraron salas registradas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all duration-300 ${
                room.featured
                  ? "ring-2 ring-amber-500/40"
                  : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row h-full">
                {/* Image / Thumbnail */}
                <div className="w-full sm:w-1/3 relative bg-slate-100 dark:bg-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200/80 dark:border-slate-800 min-h-[120px] flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      room.thumbnailUrl ||
                      "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png"
                    }
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png";
                    }}
                  />
                  {room.featured && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                      Destacada
                    </span>
                  )}
                  {room.category && (
                    <span className="absolute bottom-2 left-2 bg-black/80 text-white/80 border border-white/10 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded">
                      {room.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight truncate">
                        {room.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {room.currentVisitors}
                      </div>
                    </div>

                    {room.ownerHabbo && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mb-2">
                        Dueño: {room.ownerHabbo}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {room.description || "Sin descripción disponible."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                      <i className="fa-solid fa-server"></i> Hotel .
                      {room.hotel.toUpperCase()}
                    </span>

                    {room.roomCode && (
                      <Button
                        size="sm"
                        className="text-xs font-bold bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 flex items-center gap-1.5 py-1 px-3 rounded-xl shadow-xs"
                        onClick={(e) => handleCopy(room.roomCode!, e)}
                      >
                        <i className="fa-solid fa-copy"></i>
                        <span>Copiar código</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
