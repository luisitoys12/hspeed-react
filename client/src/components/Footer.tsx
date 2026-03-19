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
    <footer className="relative bg-card border-t border-border mt-auto" data-testid="footer">
      {/* Top gradient line */}
      <div className="h-[2px] w-full bg-theme-gradient" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: Logo + tagline */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {emoji && (
                <span className="text-lg" aria-hidden="true">
                  {emoji}
                </span>
              )}
              <span className="font-pixel text-[10px] text-theme-gradient leading-tight">
                HABBOSPEED
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tu fansite de Habbo favorita
            </p>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed mt-1">
              HabboSpeed es un fansite no oficial. No está afiliado, respaldado ni conectado con Sulake Corporation Oy. Habbo® es una marca registrada de Sulake Corporation Oy.
            </p>
          </div>

          {/* Center: Quick links */}
          <div className="flex flex-col items-start md:items-center gap-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Enlaces
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {quickLinks.map((link) => (
                <Link key={link.href + link.label} href={link.href}>
                  <a
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Legal Links */}
          <div className="flex flex-col items-start md:items-end gap-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Legal
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/legal">
                <a className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Aviso Legal
                </a>
              </Link>
              <Link href="/legal">
                <a className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidad
                </a>
              </Link>
              <Link href="/legal">
                <a className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Términos de Uso
                </a>
              </Link>
            </div>
            {emoji && (
              <span className="text-xs opacity-20" aria-hidden="true">
                {emoji} {emoji} {emoji}
              </span>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-border mt-6 pt-4 text-center">
          <p className="text-[10px] text-muted-foreground/60">
            © 2026 HabboSpeed. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
