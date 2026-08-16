import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Card as CardType, UserCard } from "@shared/schema";
import {
  Zap,
  Trophy,
  Sparkles,
  Crown,
  Flame,
  Star,
  Shield,
  Sword,
  Heart,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { proxyImage } from "@/lib/habboProxy";

interface CardWithEarnCondition extends CardType {
  earnCondition: { type: string; [key: string]: unknown } | null;
}

const RARITY_CONFIG: Record<
  string,
  { color: string; icon: any; label: string }
> = {
  common: { color: "bg-gray-500/20 text-gray-400", icon: Star, label: "Común" },
  rare: {
    color: "bg-blue-500/20 text-blue-400",
    icon: Sparkles,
    label: "Rara",
  },
  epic: {
    color: "bg-purple-500/20 text-purple-400",
    icon: Flame,
    label: "Épica",
  },
  legendary: {
    color: "bg-yellow-500/20 text-yellow-400",
    icon: Crown,
    label: "Legendaria",
  },
  mythic: {
    color: "bg-orange-500/20 text-orange-400",
    icon: Trophy,
    label: "Mítica",
  },
};

const CATEGORY_ICONS: Record<string, any> = {
  habbo: Trophy,
  radio: Sparkles,
  event: Flame,
  game: Trophy,
  seasonal: Crown,
  staff: Shield,
  special: Heart,
};

export default function CartasPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allCards, isLoading: loadingCards } = useQuery<
    CardWithEarnCondition[]
  >({
    queryKey: ["/api/cards"],
  });

  const { data: userCards, isLoading: loadingUserCards } = useQuery<UserCard[]>(
    {
      queryKey: ["/api/users", user?.id, "cards"],
      enabled: !!user,
    },
  );

  const equipMutation = useMutation({
    mutationFn: async ({ cardId, slot }: { cardId: number; slot: number }) => {
      const res = await apiRequest(
        "POST",
        `/api/users/${user?.id}/cards/${cardId}/equip`,
        { slot },
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "cards"],
      });
      toast({
        title: "Carta equipada",
        description: "Tu mazo se ha actualizado",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const cards = allCards || [];
  const userCardMap = new Map<number, UserCard>(
    (userCards || []).map((uc) => [uc.cardId, uc]),
  );
  const equippedCards = (userCards || []).filter(
    (uc) => uc.equippedSlot !== null && uc.equippedSlot !== undefined,
  );

  const seriesList = Array.from(
    new Set(cards.map((c) => c.series || "base")),
  ).sort();
  const categoryList = Array.from(new Set(cards.map((c) => c.category))).sort();
  const rarityList = ["common", "rare", "epic", "legendary", "mythic"];

  const [activeSeries, setActiveSeries] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeRarity, setActiveRarity] = useState("all");
  const [showOnlyOwned, setShowOnlyOwned] = useState(false);

  const filteredCards = cards.filter((c) => {
    if (activeSeries !== "all" && c.series !== activeSeries) return false;
    if (activeCategory !== "all" && c.category !== activeCategory) return false;
    if (activeRarity !== "all" && c.rarity !== activeRarity) return false;
    if (showOnlyOwned && !userCardMap.has(c.id)) return false;
    return true;
  });

  const getUserCard = (cardId: number) => userCardMap.get(cardId);

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Colección de Cartas</h1>
          <p className="text-xs text-muted-foreground">
            Consíguelas jugando, completando misiones y participando en eventos
            (sin azar)
          </p>
        </div>
        {user && (
          <Badge variant="secondary" className="text-[10px] ml-auto">
            {userCardMap.size} / {cards.length} cartas
          </Badge>
        )}
      </div>

      {/* Mazo equipado */}
      {user && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" /> Tu Mazo Activo (5 slots)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((slot) => {
                const equipped = equippedCards.find(
                  (c) => c.equippedSlot === slot,
                );
                const card = equipped
                  ? cards.find((c) => c.id === equipped.cardId)
                  : null;
                return (
                  <div
                    key={slot}
                    className={`relative aspect-square rounded-xl border-2 ${
                      card
                        ? "border-primary/30 bg-primary/5"
                        : "border-dashed border-border"
                    } flex items-center justify-center`}
                  >
                    {card ? (
                      <>
                        <img
                          src={proxyImage(card.imageUrl)}
                          alt={card.name}
                          className="w-full h-full object-contain p-1"
                        />
                        <Badge
                          className="absolute -top-1 -right-1 text-[8px]"
                          variant="secondary"
                        >
                          Slot {slot + 1}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        Slot {slot + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Equipa cartas desde la colección para ganar bonificaciones de
              stats
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-muted-foreground">
                Serie:
              </label>
              <select
                value={activeSeries}
                onChange={(e) => setActiveSeries(e.target.value)}
                className="px-2 py-1 text-sm border border-border rounded bg-card"
              >
                <option value="all">Todas</option>
                {seriesList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-muted-foreground">
                Categoría:
              </label>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="px-2 py-1 text-sm border border-border rounded bg-card"
              >
                <option value="all">Todas</option>
                {categoryList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-muted-foreground">
                Rareza:
              </label>
              <select
                value={activeRarity}
                onChange={(e) => setActiveRarity(e.target.value)}
                className="px-2 py-1 text-sm border border-border rounded bg-card"
              >
                <option value="all">Todas</option>
                {rarityList.map((r) => (
                  <option key={r} value={r}>
                    {RARITY_CONFIG[r].label}
                  </option>
                ))}
              </select>
            </div>
            {user && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyOwned}
                  onChange={(e) => setShowOnlyOwned(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-[10px]">
                  Solo mis cartas ({userCardMap.size})
                </span>
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Colección */}
      {loadingCards ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="aspect-[3/4]">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>No hay cartas que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCards.map((card) => {
            const userCard = getUserCard(card.id);
            const isOwned = !!userCard;
            const quantity = userCard?.quantity || 0;
            const isEquipped =
              userCard?.equippedSlot !== null &&
              userCard?.equippedSlot !== undefined;
            const equippedSlot = userCard?.equippedSlot;
            const rarity = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;
            const RarityIcon = rarity.icon;
            const CategoryIcon = CATEGORY_ICONS[card.category] || Trophy;

            return (
              <Card
                key={card.id}
                className={`relative overflow-hidden transition-all hover:shadow-xl ${
                  isOwned ? "border-primary/30 bg-primary/5" : "opacity-60"
                }`}
              >
                <div className="aspect-[3/4] relative bg-gradient-to-br from-primary/10 to-card">
                  {card.imageUrl && (
                    <img
                      src={proxyImage(card.imageUrl)}
                      alt={card.name}
                      className="w-full h-full object-contain p-2"
                    />
                  )}
                  {!isOwned && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Trophy className="w-10 h-10 text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="secondary"
                      className={`${rarity.color} text-[8px]`}
                    >
                      <RarityIcon className="w-2.5 h-2.5 mr-1" />
                      {rarity.label}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="outline"
                      className="text-[8px] border-border"
                    >
                      <CategoryIcon className="w-2.5 h-2.5 mr-1" />
                      {card.category}
                    </Badge>
                  </div>
                  {isEquipped && (
                    <div className="absolute bottom-2 left-2">
                      <Badge
                        variant="default"
                        className="bg-primary text-primary-foreground text-[8px]"
                      >
                        <Shield className="w-2.5 h-2.5 mr-1" /> Slot{" "}
                        {equippedSlot! + 1}
                      </Badge>
                    </div>
                  )}
                  {quantity > 1 && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-[8px]">
                        x{quantity}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-2 space-y-1">
                  <h3 className="font-bold text-sm truncate">{card.name}</h3>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {card.series || "base"}
                  </p>
                  {card.description && (
                    <p className="text-[9px] text-muted-foreground line-clamp-1">
                      {card.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Zap className="w-2.5 h-2.5" />
                      {card.speedPointsValue || 0} SP
                    </div>
                    {card.earnCondition && (
                      <Badge variant="outline" className="text-[8px]">
                        {card.earnCondition.type}
                      </Badge>
                    )}
                  </div>

                  {user && (
                    <div className="flex gap-1 mt-2">
                      {isOwned ? (
                        <>
                          {isEquipped ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1 text-[9px]"
                              onClick={() =>
                                equipMutation.mutate({
                                  cardId: card.id,
                                  slot: -1,
                                })
                              }
                            >
                              <RotateCcw className="w-3 h-3 mr-1" /> Desequipar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="flex-1 text-[9px]"
                              onClick={() =>
                                equipMutation.mutate({
                                  cardId: card.id,
                                  slot: 0,
                                })
                              }
                            >
                              <Shield className="w-3 h-3 mr-1" /> Equipar
                            </Button>
                          )}
                        </>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="w-full text-[9px]"
                        >
                          No obtenida
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats de rareza */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Progreso por Rareza</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {rarityList.map((r) => {
              const total = cards.filter((c) => c.rarity === r).length;
              const owned = cards.filter(
                (c) => c.rarity === r && userCardMap.has(c.id),
              ).length;
              const config = RARITY_CONFIG[r];
              return (
                <div
                  key={r}
                  className="text-center p-3 bg-card rounded-lg border"
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <config.icon
                      className={`w-4 h-4 ${config.color.replace("bg-", "text-").replace("/20", "")}`}
                    />
                    <span className="font-semibold text-xs">
                      {config.label}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">
                    {owned} / {total}
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                    <div
                      className={`h-full rounded-full ${config.color.replace("bg-", "").replace("/20", "")}`}
                      style={{
                        width: total > 0 ? `${(owned / total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
