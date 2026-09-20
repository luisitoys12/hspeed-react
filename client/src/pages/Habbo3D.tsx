import { useState } from "react";
import { HabboViewer } from "@/components/r3f/HabboViewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Box, User, Sparkles, Camera, RotateCcw, HelpCircle } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeaderCard } from "@/components/PageHeaderCard";

export default function Habbo3D() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.habboUsername || user?.displayName || "Frank");
  const [activeTab, setActiveTab] = useState<"avatar" | "room">("room");
  const [roomSize, setRoomSize] = useState(5);

  return (
    <PageContainer>
      <PageHeaderCard
        title="Habbo 3D Studio"
        description="Explora avatares, salas y furnis en renderizado tridimensional interactivo con React Three Fiber."
        icon={<Box className="w-5 h-5 text-amber-500" />}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "room" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("room")}
              className="text-xs font-bold"
            >
              <Box className="w-3.5 h-3.5 mr-1" /> Sala 3D
            </Button>
            <Button
              variant={activeTab === "avatar" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("avatar")}
              className="text-xs font-bold"
            >
              <User className="w-3.5 h-3.5 mr-1" /> Avatar 3D
            </Button>
          </div>
        }
      />

        {/* 3D Canvas Container */}
        <div className="relative w-full h-[580px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <HabboViewer
            size={roomSize}
            avatarFigure={activeTab === "avatar" ? username : undefined}
          />

          {/* Floating Controls Overlay */}
          <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 text-xs space-y-2 max-w-xs shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                <Camera className="w-3.5 h-3.5" /> Controles 3D
              </span>
              <span className="text-[10px] text-slate-400">OrbitControls</span>
            </div>
            <p className="text-[10px] text-slate-300">
              • <strong>Clic izquierdo + arrastrar:</strong> Rotar cámara
              <br />
              • <strong>Rueda del ratón:</strong> Zoom
              <br />
              • <strong>Clic derecho:</strong> Desplazar (Pan)
            </p>

            {activeTab === "avatar" && (
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <label className="text-[10px] text-slate-400 block font-bold">
                  Avatar Habbo:
                </label>
                <div className="flex gap-1.5">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario Habbo"
                    className="h-7 text-xs bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            )}

            {activeTab === "room" && (
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <label className="text-[10px] text-slate-400 block font-bold">
                  Tamaño de Sala: {roomSize}x{roomSize}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={roomSize}
                  onChange={(e) => setRoomSize(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 accent-cyan-400 rounded-full appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Bottom Right Avatar Preview Badge */}
          <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-lg">
            <img
              src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=s&direction=2&head_direction=2&gesture=sml`}
              alt={username}
              className="w-8 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/habbo-radio/frank_small_03.gif";
              }}
            />
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-black">Habbo</span>
              <p className="text-xs font-bold text-white">{username}</p>
            </div>
          </div>
        </div>
    </PageContainer>
  );
}
