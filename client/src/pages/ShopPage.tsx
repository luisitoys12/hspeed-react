import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Coins, ShoppingCart, Sparkles, Palette, Home, Package, Check, Eye } from "lucide-react";

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
      const res = await apiRequest("GET", "/api/inventory", undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    enabled: !!user,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("POST", "/api/inventory/purchase", { productId }, token ? `Bearer ${token}` : undefined);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al comprar");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/inventory"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "¡Compra exitosa!", description: "Producto agregado a tu inventario." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const ownedProductIds = new Set((inventory || []).map((i: any) => i.productId));
  const filteredProducts = (products || []).filter((p: any) => p.category === activeCategory);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Tienda SpeedPoints</h1>
        </div>
        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">{(user as any).speedPoints ?? 0} SP</span>
          </div>
        )}
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="bg-secondary/50 border border-border h-auto flex-wrap gap-0.5">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Icon className="w-3 h-3" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(({ id }) => (
          <TabsContent key={id} value={id}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">No hay productos en esta categoría</p>
                </div>
              ) : (
                filteredProducts.map((product: any) => {
                  const owned = ownedProductIds.has(product.id);
                  return (
                    <Card key={product.id} className={`bg-card border-border overflow-hidden transition-all hover:border-primary/30 ${owned ? "opacity-80" : ""}`}>
                      <CardContent className="p-0">
                        <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-contain" />
                          ) : (
                            <Sparkles className="w-12 h-12 text-primary/30" />
                          )}
                          {owned && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="text-sm font-bold truncate">{product.name}</h3>
                          <p className="text-[10px] text-muted-foreground line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Coins className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold">{product.price} SP</span>
                            </div>
                            {owned ? (
                              <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">Adquirido</Badge>
                            ) : (
                              <Button
                                size="sm"
                                className="text-[10px] h-7 bg-primary hover:bg-primary/80"
                                disabled={purchaseMutation.isPending}
                                onClick={() => purchaseMutation.mutate(product.id)}
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" /> Comprar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}