import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Send, CheckCircle } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeaderCard } from "@/components/PageHeaderCard";

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
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setSent(true);
    } catch (err) {
      alert("Error al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <PageContainer>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-10 max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
          <CheckCircle className="w-14 h-14 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">¡Mensaje enviado!</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gracias por contactarnos. Te responderemos lo antes posible.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSent(false);
              setForm({ name: "", email: "", subject: "", message: "" });
            }}
            className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-xl"
          >
            Enviar otro mensaje
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeaderCard
        title="Contacto HabboSpeed"
        description="¿Tienes alguna pregunta, sugerencia o propuesta? ¡Escríbenos directamente!"
        icon={<Mail className="w-5 h-5 text-amber-500" />}
      />

      <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">Envíanos un mensaje</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Nombre *
                </Label>
                <Input
                  placeholder="Tu nombre..."
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                  data-testid="input-contact-name"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Email *
                </Label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                  data-testid="input-contact-email"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Asunto *
              </Label>
              <Select
                value={form.subject}
                onValueChange={(v) => setForm((p) => ({ ...p, subject: v }))}
              >
                <SelectTrigger data-testid="select-contact-subject">
                  <SelectValue placeholder="Selecciona el asunto..." />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Mensaje *
              </Label>
              <Textarea
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
                required
                data-testid="input-contact-message"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-white"
              disabled={
                loading ||
                !form.name ||
                !form.email ||
                !form.subject ||
                !form.message
              }
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
          <div
            key={item.title}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-center shadow-xs"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
