import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Coins,
  ShoppingCart,
  Sparkles,
  Palette,
  Home,
  Package,
  Check,
  Eye,
} from "lucide-react";
import PageContainer from "@/components/PageContainer";
import PageHeaderCard from "@/components/PageHeaderCard";

const CATEGORIES = [
  { id: "decoracion", label: "Decoración", icon: Sparkles },
  { id: "objeto", label: "Objetos", icon: Package },
  { id: "tema", label: "Temas", icon: Palette },
  { id: "fondo", label: "Fondos", icon: Home },
];

export default function ShopPage() {
  const { user, token } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("decoracion");

  const { data: products, isLoading } = useQuery<any[]>({
    queryKey: ["/api/shop/products"],
  });

  const { data: inventory } = useQuery<any[]>({
    queryKey: ["/api/inventory"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        "/api/inventory",
        undefined,
        token ? `Bearer ${token}` : undefined,
      );
      return res.json();
    },
    enabled: !!user,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest(
        "POST",
        "/api/inventory/purchase",
        { productId },
        token ? `Bearer ${token}` : undefined,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al comprar");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/inventory"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "¡Comprado con éxito!" });
    },
    onError: (err: any) => {
      toast({
        title: "Error al comprar",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const ownedProductIds = new Set(
    (inventory || []).map((i: any) => i.productId),
  );
  const filteredProducts = (products || []).filter(
    (p: any) => p.category === activeCategory,
  );

  return (
    <PageContainer>
      {/* Header Card */}
      <PageHeaderCard
        title="Tienda SpeedPoints"
        kicker="Catálogo Exclusivo"
        subtitle="Canjea tus SpeedPoints por furnis raros, coleccionables, fondos de perfil y personalizaciones."
        icon={<ShoppingCart className="w-5 h-5 text-amber-500" />}
        rightElement={
          user && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-black text-xs shadow-xs">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{(user as any).speedPoints ?? 0} SP Disponibles</span>
            </div>
          )
        }
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 h-auto flex-wrap gap-1 p-1 rounded-xl">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="text-xs font-bold gap-1.5 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black data-[state=active]:font-black"
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map(({ id }) => (
            <TabsContent key={id} value={id} className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-56 rounded-2xl" />
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-bold">
                      No hay productos en esta categoría
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((product: any) => {
                    const owned = ownedProductIds.has(product.id);
                    return (
                      <div
                        key={product.id}
                        className={`bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700/60 rounded-2xl overflow-hidden transition-all hover:border-cyan-400 shadow-xs flex flex-col justify-between ${
                          owned ? "opacity-75" : ""
                        }`}
                      >
                        <div className="h-32 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center relative p-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-20 h-20 object-contain drop-shadow"
                            />
                          ) : (
                            <Sparkles className="w-12 h-12 text-cyan-400/40" />
                          )}
                          {owned && (
                            <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1 shadow">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                              {product.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                              {product.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/40 mt-2">
                            <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                              <Coins className="w-3.5 h-3.5" />
                              <span>{product.price} SP</span>
                            </div>
                            {owned ? (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                                Adquirido
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                className="text-xs font-black h-7 bg-cyan-500 hover:bg-cyan-400 text-black px-3 rounded-lg"
                                disabled={purchaseMutation.isPending}
                                onClick={() =>
                                  purchaseMutation.mutate(product.id)
                                }
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" /> Comprar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PageContainer>
  );
}
