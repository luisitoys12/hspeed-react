import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border mt-12 py-8">
      <div className="container mx-auto text-center text-xs text-muted-foreground">
        <p className="font-bold mb-2">
          Copyrights © {new Date().getFullYear()} @djluisalegre | Habbospeed
        </p>
        <p className="mb-4">
          Todos los derechos reservados. Se respeta la manera Habbo.
        </p>
        <p>
          Habbospeed no está afiliada a, respaldada, promocionada o aprobada específicamente por Sulake Corporation Oy o sus Afiliados.
          De acuerdo a la <Link href="https://www.habbo.es/playing-habbo/fansites" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Política de Webs fans de Habbo</Link>, esta radio puede utilizar las marcas comerciales y otras propiedades intelectuales de Habbo.
        </p>
      </div>
    </footer>
  );
}
