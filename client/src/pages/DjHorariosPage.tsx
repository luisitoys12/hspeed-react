import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Calendar,
  Clock,
  Music,
  Mic,
  Crown,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Mail,
  Send,
  Loader2,
} from "lucide-react";
import { proxyImage } from "@/lib/habboProxy";

const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

interface DjSlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  djUserId: number | null;
  djName: string | null;
  showName: string | null;
  description: string | null;
  status: "available" | "booked" | "live" | "completed";
  recurring: boolean;
  notes: string | null;
}

interface DjSlotRequest {
  id: number;
  slotId: number;
  userId: number;
  showName: string;
  description: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewedBy: number | null;
  reviewedAt: string | null;
  createdAt: string;
  user?: { displayName: string; habboUsername: string; avatarUrl: string };
}

export default function DjHorariosPage() {
  const { user, token, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: slots, isLoading: loadingSlots } = useQuery<DjSlot[]>({
    queryKey: ["/api/dj-slots"],
  });

  const { data: requests, isLoading: loadingRequests } = useQuery<
    DjSlotRequest[]
  >({
    queryKey: ["/api/dj-slot-requests"],
    enabled: isAdmin,
  });

  const { data: userRequests } = useQuery<DjSlotRequest[]>({
    queryKey: ["/api/users", user?.id, "dj-requests"],
    enabled: !!user,
  });

  const requestMutation = useMutation({
    mutationFn: async ({
      slotId,
      showName,
      description,
    }: {
      slotId: number;
      showName: string;
      description: string;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/dj-slots/${slotId}/request`,
        { showName, description },
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dj-slots"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "dj-requests"],
      });
      toast({
        title: "Solicitud enviada",
        description: "El staff revisará tu petición",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const createSlotMutation = useMutation({
    mutationFn: async (data: Partial<DjSlot>) => {
      const res = await apiRequest(
        "POST",
        "/api/dj-slots",
        data,
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dj-slots"] });
      toast({
        title: "Slot creado",
        description: "El horario ya está disponible",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DjSlot> }) => {
      const res = await apiRequest(
        "PUT",
        `/api/dj-slots/${id}`,
        data,
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dj-slots"] });
      toast({ title: "Slot actualizado" });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(
        "DELETE",
        `/api/dj-slots/${id}`,
        undefined,
        token ? `Bearer ${token}` : undefined,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dj-slots"] });
      toast({ title: "Slot eliminado" });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const reviewRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest(
        "PUT",
        `/api/dj-slot-requests/${id}`,
        { status },
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dj-slot-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dj-slots"] });
      toast({ title: "Solicitud revisada" });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const slotsData = slots || [];
  const pendingRequests =
    requests?.filter((r: any) => r.status === "pending") || [];
  const myRequests = userRequests || [];

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: "20:00",
    endTime: "22:00",
    showName: "",
    description: "",
    recurring: true,
  });
  const [editingSlot, setEditingSlot] = useState<DjSlot | null>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available":
        return {
          color: "bg-green-500/20 text-green-400",
          label: "Disponible",
          icon: Check,
        };
      case "booked":
        return {
          color: "bg-blue-500/20 text-blue-400",
          label: "Reservado",
          icon: Clock,
        };
      case "live":
        return {
          color: "bg-green-500/20 text-green-400",
          label: "EN VIVO",
          icon: Mic,
        };
      case "completed":
        return {
          color: "bg-gray-500/20 text-gray-400",
          label: "Finalizado",
          icon: X,
        };
      default:
        return {
          color: "bg-gray-500/20 text-gray-400",
          label: status,
          icon: Clock,
        };
    }
  };

  const getRequestStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-500/20 text-yellow-400",
          label: "Pendiente",
          icon: Clock,
        };
      case "approved":
        return {
          color: "bg-green-500/20 text-green-400",
          label: "Aprobada",
          icon: Check,
        };
      case "rejected":
        return {
          color: "bg-red-500/20 text-red-400",
          label: "Rechazada",
          icon: X,
        };
      case "cancelled":
        return {
          color: "bg-gray-500/20 text-gray-400",
          label: "Cancelada",
          icon: X,
        };
      default:
        return {
          color: "bg-gray-500/20 text-gray-400",
          label: status,
          icon: Clock,
        };
    }
  };

  const handleCreateSlot = () => {
    createSlotMutation.mutate(newSlot, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setNewSlot({
          dayOfWeek: 1,
          startTime: "20:00",
          endTime: "22:00",
          showName: "",
          description: "",
          recurring: true,
        });
      },
    });
  };

  const handleUpdateSlot = () => {
    if (!editingSlot) return;
    updateSlotMutation.mutate(
      { id: editingSlot.id, data: editingSlot },
      {
        onSuccess: () => setEditingSlot(null),
      },
    );
  };

  const handleRequestSlot = (
    slotId: number,
    showName: string,
    description: string,
  ) => {
    requestMutation.mutate({ slotId, showName, description });
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Horarios DJ & Cabina</h1>
          <p className="text-xs text-muted-foreground">
            Reserva tu slot, gestiona tu show y conecta con la audiencia
          </p>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {slotsData.filter((s: any) => s.status === "available").length}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Slots libres
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {slotsData.filter((s: any) => s.status === "booked").length}
            </div>
            <div className="text-[10px] text-muted-foreground">Reservados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {slotsData.filter((s: any) => s.status === "live").length}
            </div>
            <div className="text-[10px] text-muted-foreground">
              En vivo ahora
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {pendingRequests.length}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Peticiones pendientes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendario semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Agenda Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSlots ? (
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="min-h-[200px] bg-card rounded-lg border p-2 flex flex-col"
                >
                  <div className="text-center text-xs font-bold text-muted-foreground mb-2 py-1 rounded">
                    {day}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {slotsData
                      .filter((s: any) => s.dayOfWeek === dayIndex)
                      .sort((a: any, b: any) =>
                        a.startTime.localeCompare(b.startTime),
                      )
                      .map((slot: any) => {
                        const statusConfig = getStatusConfig(slot.status);
                        const StatusIcon = statusConfig.icon;
                        const isBookedByMe = slot.djUserId === user?.id;
                        const canRequest =
                          slot.status === "available" && user && !isBookedByMe;
                        const canJoin =
                          slot.status === "live" && slot.djUserId === user?.id;

                        return (
                          <div
                            key={slot.id}
                            className={`relative p-2 rounded border text-[10px] ${
                              slot.status === "live"
                                ? "border-green-500/50 bg-green-500/5"
                                : slot.status === "booked"
                                  ? "border-blue-500/50 bg-blue-500/5"
                                  : "border-border/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`text-[8px] ${statusConfig.color}`}
                              >
                                <statusConfig.icon className="w-2.5 h-2.5 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <div className="font-semibold truncate">
                              {slot.showName || "Sin nombre"}
                            </div>
                            {slot.djName && (
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                <Music className="w-2.5 h-2.5" />
                                <span className="truncate">{slot.djName}</span>
                              </div>
                            )}
                            <div className="flex gap-1 mt-1">
                              {canRequest && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-[9px]"
                                  onClick={() => {
                                    const showName =
                                      prompt("Nombre de tu show:");
                                    const description = prompt(
                                      "Descripción (opcional):",
                                    );
                                    if (showName)
                                      handleRequestSlot(
                                        slot.id,
                                        showName,
                                        description || "",
                                      );
                                  }}
                                >
                                  Solicitar
                                </Button>
                              )}
                              {canJoin && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="flex-1 bg-green-500 text-xs"
                                  onClick={() =>
                                    toast({
                                      title: "Conectando...",
                                      description:
                                        "Redirigiendo a la cabina DJ",
                                    })
                                  }
                                >
                                  <Mic className="w-3 h-3 mr-1" /> EN VIVO
                                </Button>
                              )}
                              {isBookedByMe && slot.status === "booked" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="flex-1 text-[9px]"
                                  onClick={() => {
                                    /* cancelar */
                                  }}
                                >
                                  Cancelar
                                </Button>
                              )}
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="w-6 h-6 p-0"
                                  onClick={() => setEditingSlot(slot)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    {slotsData.filter((s: any) => s.dayOfWeek === dayIndex)
                      .length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-[10px]">
                        Sin slots programados
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mis peticiones */}
      {user && myRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> Mis Peticiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myRequests.map((req: any) => {
                const statusConfig = getRequestStatusConfig(req.status);
                const StatusIcon = statusConfig.icon;
                const slot = slotsData.find((s: any) => s.id === req.slotId);
                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon
                        className={`w-5 h-5 ${statusConfig.color.replace("bg-", "text-").replace("/20", "")}`}
                      />
                      <div>
                        <div className="font-medium">{req.showName}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {slot
                            ? `${DAYS[slot.dayOfWeek]} ${slot.startTime}-${slot.endTime}`
                            : "Slot eliminado"}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={statusConfig.color}>
                      <StatusIcon className="w-2.5 h-2.5 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin: Peticiones pendientes */}
      {isAdmin && pendingRequests.length > 0 && (
        <Card className="border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-yellow-400" /> Peticiones Pendientes
              (Admin)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingRequests.map((req: any) => {
                const slot = slotsData.find((s: any) => s.id === req.slotId);
                const reqUser = req.user;
                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          reqUser?.avatarUrl ||
                          `https://www.habbo.es/habbo-imaging/avatarimage?user=${reqUser?.habboUsername}&size=s&headonly=1`
                        }
                        alt={reqUser?.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium">
                          {reqUser?.displayName}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Show: {req.showName} ·{" "}
                          {slot
                            ? `${DAYS[slot.dayOfWeek]} ${slot.startTime}`
                            : ""}
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          {req.description || "Sin descripción"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() =>
                          reviewRequestMutation.mutate({
                            id: req.id,
                            status: "approved",
                          })
                        }
                      >
                        <Check className="w-3 h-3 mr-1" /> Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          reviewRequestMutation.mutate({
                            id: req.id,
                            status: "rejected",
                          })
                        }
                      >
                        <X className="w-3 h-3 mr-1" /> Rechazar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crear/Editar slot (Admin) */}
      {isAdmin && (showCreateDialog || editingSlot) && (
        <Dialog
          open={showCreateDialog || !!editingSlot}
          onOpenChange={(open) => {
            if (!open) {
              setShowCreateDialog(false);
              setEditingSlot(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? "Editar Slot" : "Crear Nuevo Slot"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Día</label>
                  <Select
                    value={
                      editingSlot
                        ? editingSlot.dayOfWeek.toString()
                        : newSlot.dayOfWeek.toString()
                    }
                    onValueChange={(v) => {
                      if (editingSlot)
                        setEditingSlot({
                          ...editingSlot,
                          dayOfWeek: parseInt(v),
                        });
                      else setNewSlot({ ...newSlot, dayOfWeek: parseInt(v) });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar día" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Hora inicio
                  </label>
                  <Input
                    type="time"
                    value={
                      editingSlot ? editingSlot.startTime : newSlot.startTime
                    }
                    onChange={(e) => {
                      if (editingSlot)
                        setEditingSlot({
                          ...editingSlot,
                          startTime: e.target.value,
                        });
                      else
                        setNewSlot({ ...newSlot, startTime: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Hora fin
                  </label>
                  <Input
                    type="time"
                    value={editingSlot ? editingSlot.endTime : newSlot.endTime}
                    onChange={(e) => {
                      if (editingSlot)
                        setEditingSlot({
                          ...editingSlot,
                          endTime: e.target.value,
                        });
                      else setNewSlot({ ...newSlot, endTime: e.target.value });
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">
                    Nombre del show
                  </label>
                  <Input
                    placeholder="Ej: Viernes FIESTA"
                    value={
                      editingSlot
                        ? editingSlot.showName || ""
                        : newSlot.showName
                    }
                    onChange={(e) => {
                      if (editingSlot)
                        setEditingSlot({
                          ...editingSlot,
                          showName: e.target.value,
                        });
                      else setNewSlot({ ...newSlot, showName: e.target.value });
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">
                    Descripción
                  </label>
                  <Input
                    placeholder="Descripción del show"
                    value={
                      editingSlot
                        ? editingSlot.description || ""
                        : newSlot.description
                    }
                    onChange={(e) => {
                      if (editingSlot)
                        setEditingSlot({
                          ...editingSlot,
                          description: e.target.value,
                        });
                      else
                        setNewSlot({ ...newSlot, description: e.target.value });
                    }}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      editingSlot ? editingSlot.recurring : newSlot.recurring
                    }
                    onChange={(e) => {
                      if (editingSlot)
                        setEditingSlot({
                          ...editingSlot,
                          recurring: e.target.checked,
                        });
                      else
                        setNewSlot({ ...newSlot, recurring: e.target.checked });
                    }}
                    className="rounded border-border"
                  />
                  <label className="text-sm">Recurrente (semanal)</label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingSlot(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingSlot ? handleUpdateSlot : handleCreateSlot}
                  disabled={
                    createSlotMutation.isPending || updateSlotMutation.isPending
                  }
                >
                  {editingSlot ? "Actualizar" : "Crear"} Slot
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Botón crear slot */}
      {isAdmin && !showCreateDialog && !editingSlot && (
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" /> Crear Slot
        </Button>
      )}

      {/* Info */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Music className="w-4 h-4" /> ¿Cómo funciona?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Elige día y hora
            </div>
            <div className="flex items-center gap-1">
              <Music className="w-3 h-3" /> Define tu show
            </div>
            <div className="flex items-center gap-1">
              <Send className="w-3 h-3" /> Solicita el slot
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" /> Staff aprueba
            </div>
            <div className="flex items-center gap-1">
              <Mic className="w-3 h-3" /> ¡En vivo!
            </div>
            <div className="flex items-center gap-1">
              <Crown className="w-3 h-3" /> Gana SP y fans
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
