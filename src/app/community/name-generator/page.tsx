
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateNamesAction } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderCircle, BrainCircuit, Sparkles, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const initialState = {
  names: [],
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generar Nombres
        </>
      )}
    </Button>
  );
}

export default function NameGeneratorPage() {
  const [state, formAction] = useActionState(generateNamesAction, initialState);
  const { toast } = useToast();

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    toast({
      title: '¡Copiado!',
      description: `El nombre "${name}" ha sido copiado al portapapeles.`,
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
            <BrainCircuit className="text-primary" />
            Generador de Nombres de Habbo
          </CardTitle>
          <CardDescription>
            Introduce una palabra clave o un tema y nuestra IA creará nombres de usuario únicos y creativos para ti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex items-center gap-2 mb-6">
            <Input
              name="keyword"
              placeholder="Ej: pixel, star, retro..."
              required
              className="flex-grow"
            />
            <SubmitButton />
          </form>

          {state.error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.names.length > 0 && (
            <div>
              <h3 className="font-headline font-bold mb-4 text-center text-lg">Nombres Sugeridos:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {state.names.map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="font-mono font-semibold">{name}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(name)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
