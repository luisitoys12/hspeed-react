import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";

type CatalogEntry = { id: string; name: string; classname?: string; iconUrl?: string; avgPrice?: number | null };

export default function CatalogPage() {
  const [, setLocation] = useLocation();

  const { data: furni, isLoading: loadingFurni } = useQuery<CatalogEntry[]>({
    queryKey: ["/api/habbo/furni"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/habbo/furni?limit=0");
      if (!r.ok) return [];
      const json = await r.json();
      return (json || []).map((it: any) => ({
        id: `${it.classname || it.id}-${it.revision ?? "0"}`,
        name: it.name || it.classname || it.itemName || it.classname,
        classname: it.classname,
        iconUrl: it.iconUrl || it.thumbnail || it.image || it.icon || it.iconUrl,
        avgPrice: it.averagePrice ?? it.avgPrice ?? null,
      }));
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const { data: figureparts } = useQuery<Record<string, any[]>>({
    queryKey: ["/api/habbo/figureparts"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/habbo/figureparts");
      if (!r.ok) return {};
      return r.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  const clothingEntries: CatalogEntry[] = useMemo(() => {
    const src = figureparts && Object.keys(figureparts).length ? figureparts : {};
    const built: CatalogEntry[] = [];
    if (Object.keys(src).length) {
      Object.keys(src).forEach((k) => {
        const list = (src as any)[k] || [];
        list.forEach((it: any) => built.push({ id: `${k}-${it.id}`, name: it.label || it.name || `${k}-${it.id}`, classname: `${k}_${it.id}`, iconUrl: `/api/habbo/avatar-proxy?figure=${encodeURIComponent(`${k}-${it.id}-0`)}` }));
      });
    }
    return built.concat(furni || []);
  }, [figureparts, furni]);

  const [selected, setSelected] = useState<Record<string, string>>({});

  const handleApply = (entry: CatalogEntry, targetType = "ch") => {
    // Save pending apply to localStorage and navigate to armario
    const payload = { entry, targetType };
    localStorage.setItem("hspeed_pending_apply", JSON.stringify(payload));
    setLocation("/armario");
  };

  return (
    <TooltipProvider>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Ropa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {clothingEntries.map((c) => (
                <div key={c.id} className="bg-secondary/40 rounded p-2 flex flex-col items-center">
                  <img src={c.iconUrl ? `/api/habbo/proxy-image?u=${encodeURIComponent(c.iconUrl)}` : "/public/fallback.png"} alt={c.name} className="w-20 h-20 object-contain mb-2" />
                  <div className="text-xs truncate text-center w-full">{c.name}</div>
                  <div className="mt-2 flex gap-1">
                    <Button size="sm" onClick={() => handleApply(c, "ch")}>
                      Aplicar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(c.name); }}>
                      Copiar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
