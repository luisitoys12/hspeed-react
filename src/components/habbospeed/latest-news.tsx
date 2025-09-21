'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, LoaderCircle, Ghost } from 'lucide-react';
import { getLatestNews } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LatestNews() {
  const [news, setNews] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchNews = async () => {
    setIsLoading(true);
    setError(null);
    setNews(null);
    try {
      const result = await getLatestNews({ stationName: 'Ekus FM' });
      if(result.newsSummary) {
        setNews(result.newsSummary);
      } else {
        setError('No se pudieron obtener las últimas noticias. Por favor, inténtalo de nuevo.');
      }
    } catch (e) {
      setError('Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Ghost className="text-primary" />
          Campañas y Eventos de Habbo (IA)
        </CardTitle>
        <CardDescription>
          Pulsa el botón para obtener un resumen de las últimas campañas y eventos en Habbo, generado por IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleFetchNews} disabled={isLoading}>
          {isLoading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Obtener Últimas Campañas
            </>
          )}
        </Button>
        {news && (
          <Alert>
            <AlertTitle className="font-headline">Última Actualización</AlertTitle>
            <AlertDescription>{news}</AlertDescription>
          </Alert>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}