import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, CheckCircle } from "lucide-react";

const SUBJECTS = [
  "Consulta general",
  "Reporte de error",
  "Colaboración / Patrocinio",
  "Problema con mi cuenta",
  "Solicitud de equipo",
  "Otro",
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;
    setLoading(true);
    // Simulate sending (no backend endpoint for contact yet)
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="p-4 lg:p-6 max-w-xl mx-auto flex flex-col items-center justify-center min-h-64 text-center space-y-4">
        <CheckCircle className="w-14 h-14 text-green-400" />
        <h2 className="text-lg font-bold">¡Mensaje enviado!</h2>
        <p className="text-sm text-muted-foreground">Gracias por contactarnos. Te responderemos lo antes posible.</p>
        <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="border-primary/30 text-primary hover:bg-primary/10">
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Mail className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Contacto</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        ¿Tienes alguna pregunta, sugerencia o propuesta? ¡Escríbenos!
      </p>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">Envíanos un mensaje</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Nombre *</Label>
                <Input
                  placeholder="Tu nombre..."
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                  data-testid="input-contact-name"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Email *</Label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  data-testid="input-contact-email"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Asunto *</Label>
              <Select value={form.subject} onValueChange={(v) => setForm(p => ({ ...p, subject: v }))}>
                <SelectTrigger data-testid="select-contact-subject">
                  <SelectValue placeholder="Selecciona el asunto..." />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Mensaje *</Label>
              <Textarea
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                value={form.message}
                onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                required
                data-testid="input-contact-message"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-white"
              disabled={loading || !form.name || !form.email || !form.subject || !form.message}
              data-testid="button-contact-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: "📻", title: "Radio en vivo", desc: "Conéctate 24/7" },
          { icon: "💬", title: "Foro", desc: "Habla con la comunidad" },
          { icon: "🏆", title: "Eventos", desc: "Participa y gana premios" },
        ].map((item) => (
          <div key={item.title} className="bg-card/50 border border-border rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-xs font-semibold">{item.title}</p>
            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
