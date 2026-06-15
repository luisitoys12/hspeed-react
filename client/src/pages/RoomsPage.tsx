import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

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
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1000);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = 
      room.name.toLowerCase().includes(search.toLowerCase()) || 
      (room.description && room.description.toLowerCase().includes(search.toLowerCase())) ||
      (room.ownerHabbo && room.ownerHabbo.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || room.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl relative">
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

      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold uppercase tracking-tight text-white mb-2 font-cabinet">
          Salas de la <span className="text-primary">Comunidad</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Visita las salas recomendadas y oficiales de la radio para compartir y bailar con otros Habbos.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-card/40 backdrop-blur p-4 rounded-xl border border-border/60">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              className={`text-xs font-bold ${
                selectedCategory === cat.value ? "bg-primary text-black" : "text-muted-foreground border-border hover:bg-zinc-800"
              }`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
        <div className="w-full md:w-72">
          <Input
            placeholder="Buscar por nombre o dueño..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs bg-zinc-950 border-border"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 bg-card/40 rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/20">
          <i className="fa-solid fa-hotel text-3xl text-muted-foreground mb-3 block"></i>
          <p className="text-muted-foreground text-sm">No se encontraron salas registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRooms.map((room) => (
            <Card 
              key={room.id} 
              className={`border transition-all duration-300 bg-card/50 overflow-hidden ${
                room.featured ? "border-primary/50 shadow-[0_0_15px_rgba(245,166,35,0.08)]" : "border-border"
              }`}
            >
              <div className="flex flex-col sm:flex-row h-full">
                {/* Image / Thumbnail */}
                <div className="w-full sm:w-1/3 relative bg-zinc-900 border-b sm:border-b-0 sm:border-r border-border min-h-[120px] flex items-center justify-center overflow-hidden">
                  <img 
                    src={room.thumbnailUrl || "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png"} 
                    alt={room.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.habbo.com/c_images/Official_Rooms/official_room_wide.png";
                    }}
                  />
                  {room.featured && (
                    <span className="absolute top-2 left-2 bg-primary text-black font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      Destacada
                    </span>
                  )}
                  {room.category && (
                    <span className="absolute bottom-2 left-2 bg-black/80 text-muted-foreground border border-zinc-800 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded">
                      {room.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm leading-tight truncate">{room.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        {room.currentVisitors}
                      </div>
                    </div>
                    
                    {room.ownerHabbo && (
                      <p className="text-[10px] text-primary font-semibold mb-2">
                        Dueño: {room.ownerHabbo}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {room.description || "Sin descripción disponible."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-border/40">
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <i className="fa-solid fa-server"></i> Hotel .{room.hotel.toUpperCase()}
                    </span>

                    {room.roomCode && (
                      <Button 
                        size="sm" 
                        className="text-xs font-bold bg-primary text-black hover:bg-primary/95 flex items-center gap-1.5 py-1 px-3"
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
    </div>
  );
}
