import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Image
              src="https://files.habboemotion.com/resources/images/frank/frank_12.gif"
              alt="Frank de Habbo confundido"
              width={100}
              height={100}
              unoptimized
            />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-headline text-destructive">
            404 - Página no encontrada
          </CardTitle>
          <CardDescription className="mt-2">
            ¡Ups! Parece que te has perdido en los pasillos del hotel. La página que buscas no existe o ha sido movida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
