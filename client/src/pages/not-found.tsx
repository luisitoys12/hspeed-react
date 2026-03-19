import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-52px)] w-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="font-pixel text-[10px] text-primary glow-text">ERROR</p>
        <h1 className="text-6xl font-bold text-primary/30">404</h1>
        <h2 className="text-lg font-bold">Página no encontrada</h2>
        <p className="text-sm text-muted-foreground">Esta página no existe o fue eliminada</p>
        <Link href="/">
          <a>
            <Button className="bg-primary hover:bg-primary/80 text-white mt-2" data-testid="button-go-home">
              <Home className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </a>
        </Link>
      </div>
    </div>
  );
}
