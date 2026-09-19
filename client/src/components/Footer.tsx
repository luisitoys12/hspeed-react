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
  return (
    <footer className="relative bg-[#080d19] border-t border-white/10 text-slate-400 py-8 mt-auto font-sans" data-testid="footer">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-3">
        {/* Brand logo */}
        <div className="flex justify-center items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-white">
            h<span className="text-cyan-400">Speed</span>
          </span>
        </div>

        {/* Disclaimer Sulake */}
        <p className="text-[11px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Copyright © HabboSpeed. Todos los derechos reservados. Habbo es una marca registrada de Sulake Corporation Oy. Este fansite no está afiliado, respaldado ni aprobado específicamente por Sulake Corporation Oy.
        </p>

        {/* Links */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400 pt-1">
          <Link href="/legal" className="hover:text-cyan-400 transition-colors">Legal</Link>
          <span className="text-slate-700">|</span>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacidad</Link>
          <span className="text-slate-700">|</span>
          <Link href="/soporte" className="hover:text-cyan-400 transition-colors">Soporte</Link>
          <span className="text-slate-700">|</span>
          <Link href="/contact" className="hover:text-cyan-400 transition-colors">Contacto</Link>
        </div>
      </div>
    </footer>
  );
}
