import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MDEditor from "@uiw/react-md-editor";

const EMPTY_FORM = {
  title: "",
  summary: "",
  content: "",
  imageUrl: "",
  category: "General",
  date: new Date().toISOString().split("T")[0],
  featured: false,
};

export default function NewsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  const { data: news } = useQuery<any[]>({ queryKey: ["/api/news"] });

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      title: item.title || "",
      summary: item.summary || "",
      content: item.content || "",
      imageUrl: item.imageUrl || "",
      category: item.category || "General",
      date: item.date || new Date().toISOString().split("T")[0],
      featured: item.featured || false,
    });
    setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/news", data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al crear noticia");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setOpen(false);
      setForm(EMPTY_FORM);
      toast({ title: "✅ Noticia creada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/news/${id}`, data, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al actualizar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setOpen(false);
      toast({ title: "✅ Noticia actualizada" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      const res = await apiRequest("PUT", `/api/news/${id}`, { featured }, token ? `Bearer ${token}` : undefined);
      if (!res.ok) throw new Error("Error al actualizar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Noticia actualizada" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/news/${id}`, undefined, token ? `Bearer ${token}` : undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Noticia eliminada" });
    },
  });

  const handleSubmit = () => {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Gestión de Noticias ({news?.length || 0})</h2>
        <Button size="sm" className="bg-primary hover:bg-primary/80 text-white text-xs" onClick={openCreate} data-testid="button-new-news">
          <Plus className="w-3 h-3 mr-1" />Nueva Noticia
        </Button>
      </div>

      {/* News list */}
      <div className="space-y-2">
        {(news || []).map(item => (
          <div key={item.id} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2 border border-border">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {item.featured && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                <p className="text-sm truncate font-medium">{item.title}</p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[9px] border-border">{item.category}</Badge>
                <span className="text-[10px] text-muted-foreground">{item.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Destacar */}
              <Button
                variant="ghost" size="icon"
                className={`h-7 w-7 ${ item.featured ? "text-yellow-400" : "text-muted-foreground/40 hover:text-yellow-400" }`}
                onClick={() => toggleFeaturedMutation.mutate({ id: item.id, featured: !item.featured })}
                title={item.featured ? "Quitar destacado" : "Destacar"}
                data-testid={`button-featured-news-${item.id}`}
              >
                <Star className={`w-3.5 h-3.5 ${item.featured ? "fill-yellow-400" : ""}`} />
              </Button>
              {/* Editar */}
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => openEdit(item)}
                data-testid={`button-edit-news-${item.id}`}
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              {/* Eliminar */}
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                onClick={() => deleteMutation.mutate(item.id)}
                data-testid={`button-delete-news-${item.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {(news || []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No hay noticias publicadas</p>
        )}
      </div>

      {/* Dialog crear / editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">{editItem ? "Editar Noticia" : "Nueva Noticia"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <Label className="text-xs">Título</Label>
                <Input className="mt-1" value={form.title} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} data-testid="input-news-title" />
              </div>
              <div>
                <Label className="text-xs">Categoría</Label>
                <Select value={form.category} onValueChange={v => setForm((p: any) => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["General", "Actualización", "Evento", "Comunidad", "Radio"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Fecha</Label>
                <Input className="mt-1" type="date" value={form.date} onChange={e => setForm((p: any) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">URL de imagen (portada)</Label>
                <Input className="mt-1" placeholder="https://..." value={form.imageUrl} onChange={e => setForm((p: any) => ({ ...p, imageUrl: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Resumen (se muestra en la lista)</Label>
                <Input className="mt-1" value={form.summary} onChange={e => setForm((p: any) => ({ ...p, summary: e.target.value }))} />
              </div>
            </div>

            {/* Rich text editor */}
            <div>
              <Label className="text-xs block mb-1.5">Contenido del artículo (Markdown)</Label>
              <div data-color-mode="dark">
                <MDEditor
                  value={form.content}
                  onChange={v => setForm((p: any) => ({ ...p, content: v || "" }))}
                  height={320}
                  preview="edit"
                  data-testid="editor-news-content"
                />
              </div>
            </div>

            {/* Destacar toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm((p: any) => ({ ...p, featured: !p.featured }))}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  form.featured
                    ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                    : "border-border bg-secondary/30 text-muted-foreground hover:text-yellow-400"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${form.featured ? "fill-yellow-400" : ""}`} />
                {form.featured ? "Noticia destacada" : "Marcar como destacada"}
              </button>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/80 text-white text-xs"
              onClick={handleSubmit}
              disabled={isPending || !form.title}
              data-testid="button-submit-news"
            >
              {isPending ? "Guardando..." : editItem ? "Guardar Cambios" : "Publicar Noticia"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
