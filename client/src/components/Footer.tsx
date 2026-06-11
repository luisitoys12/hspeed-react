import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";

const quickLinks = [
  { href: "/news", label: "Noticias" },
  { href: "/events", label: "Eventos" },
  { href: "/forum", label: "Foro" },
  { href: "/contact", label: "Contacto" },
];

const legalLinks = [
  { href: "/legal", label: "Aviso Legal" },
  { href: "/legal", label: "Privacidad" },
];

export default function Footer() {
  const { decorations } = useTheme();
  const emoji = decorations?.emoji || "";

  return (
    <footer className="relative site-footer-bar border-t border-border/70 mt-auto" data-testid="footer">
      <div className="h-[2px] w-full bg-theme-gradient" />

      <div className="max-w-7xl mx-auto px-4 py-7">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[10px] text-theme-gradient leading-tight">HABBOSPEED</span>
              {emoji && <span className="text-sm opacity-40" aria-hidden="true">{emoji}</span>}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Fansite de Habbo con radio, noticias, foros, armario y herramientas en un diseño inspirado en HabboRadio.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground mb-3">Enlaces</p>
            <div className="grid gap-2 text-sm">
              {quickLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm text-foreground/80 hover:text-primary transition-colors"
                  data-testid={`footer-link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground mb-3">Legal</p>
            <div className="grid gap-2 text-sm">
              <Link href="/legal" className="text-foreground/80 hover:text-primary transition-colors">Aviso Legal</Link>
              <Link href="/legal" className="text-foreground/80 hover:text-primary transition-colors">Privacidad</Link>
              <Link href="/legal" className="text-foreground/80 hover:text-primary transition-colors">Términos de Uso</Link>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/70 text-[10px] text-muted-foreground/70 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p>© 2026 HabboSpeed. Todos los derechos reservados.</p>
          <p>HabboSpeed es una fansite no oficial y no está afiliada con Sulake Corporation Oy.</p>
        </div>
      </div>
    </footer>
  );
}
