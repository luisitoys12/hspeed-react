import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Source { id: string; name: string; url: string }

export default function FootballNewsSection() {
  const [sources, setSources] = useState<Source[]>([
    { id: "1", name: "FIFA Oficial", url: "https://www.fifa.com/" },
    { id: "2", name: "Marca", url: "https://www.marca.com/" },
  ]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const addSource = () => {
    if (!name.trim() || !url.trim()) return;
    setSources((s) => [{ id: Date.now().toString(), name: name.trim(), url: url.trim() }, ...s]);
    setName(""); setUrl("");
  };

  const removeSource = (id: string) => setSources((s) => s.filter(x => x.id !== id));

  return (
    <section className="site-panel p-4 rounded-2xl overflow-hidden" data-testid="football-news">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-extrabold">Fútbol — Noticias & Fuentes</h3>
          <p className="text-[11px] text-muted-foreground mt-1">Añade y gestiona fuentes que informen del Mundial 2026. Contenido externo sujeto a sus términos.</p>
        </div>
        <div className="text-[11px] text-muted-foreground">Disclaimer: contenido externo, no afiliado.</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div className="sm:col-span-2">
          <div className="flex gap-2">
            <Input placeholder="Nombre fuente" value={name} onChange={(e:any)=>setName(e.target.value)} />
            <Input placeholder="https://" value={url} onChange={(e:any)=>setUrl(e.target.value)} />
            <Button onClick={addSource} className="ml-2">Agregar</Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <strong>Reglas:</strong>
          <ul className="list-disc ml-4 mt-1">
            <li>Solo fuentes verificadas.</li>
            <li>Links públicos y respetuosos.</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((s) => (
          <div key={s.id} className="bg-card border border-border rounded-lg p-3 flex items-start justify-between">
            <div>
              <a href={s.url} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">{s.name}</a>
              <div className="text-[11px] text-muted-foreground">{s.url}</div>
            </div>
            <div className="flex flex-col gap-2">
              <Link href={`/mundial/source/${s.id}`} className="text-xs text-white/80 bg-white/5 px-2 py-1 rounded">Ver</Link>
              <button onClick={() => removeSource(s.id)} className="text-xs text-red-400">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
