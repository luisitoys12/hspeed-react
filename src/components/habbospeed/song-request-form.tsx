
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitRequest } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import Link from 'next/link';

const initialState = {
  message: '',
  isSuccess: false,
  isError: false,
};

type RequestType = "saludo" | "grito" | "concurso" | "cancion" | "declaracion";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Enviar Petición
        </>
      )}
    </Button>
  );
}

export default function SongRequestForm() {
  const { user } = useAuth();
  const [state, formAction] = useActionState(submitRequest, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [requestType, setRequestType] = useState<RequestType | null>(null);

  useEffect(() => {
    if (state.isError && state.message) {
      toast({
        variant: 'destructive',
        title: 'Petición Fallida',
        description: state.message,
      });
    }
    if (state.isSuccess) {
      formRef.current?.reset();
      setRequestType(null); // Reset select as well
    }
  }, [state, toast]);

  const action = (formData: FormData) => {
    if (user?.displayName) {
      formData.set('authorName', user.displayName);
    }
    if (requestType) {
        formData.set('requestType', requestType);
    }
    formAction(formData);
  };
  
  const renderFields = () => {
    switch (requestType) {
        case 'saludo':
            return (
                <>
                    <div className="space-y-2"><Label htmlFor="saludoTo">¿Para quién es el saludo?</Label><Input id="saludoTo" name="saludoTo" required /></div>
                    <div className="space-y-2"><Label htmlFor="saludoMessage">Tu mensaje</Label><Textarea id="saludoMessage" name="saludoMessage" required /></div>
                </>
            );
        case 'grito':
             return <div className="space-y-2"><Label htmlFor="gritoMessage">¿Qué quieres gritar?</Label><Textarea id="gritoMessage" name="gritoMessage" required /></div>;
        case 'concurso':
             return (
                <>
                    <div className="space-y-2"><Label htmlFor="concursoName">Nombre del concurso</Label><Input id="concursoName" name="concursoName" required /></div>
                    <div className="space-y-2"><Label htmlFor="concursoAnswer">Tu respuesta</Label><Textarea id="concursoAnswer" name="concursoAnswer" required /></div>
                </>
            );
        case 'cancion':
            return <div className="space-y-2"><Label htmlFor="cancionName">Nombre de la canción y artista</Label><Input id="cancionName" name="cancionName" required /></div>;
        case 'declaracion':
            return (
                <>
                    <div className="space-y-2"><Label htmlFor="declaracionTo">¿A quién te le declaras?</Label><Input id="declaracionTo" name="declaracionTo" required /></div>
                    <div className="space-y-2"><Label htmlFor="declaracionMessage">Tu mensaje de amor</Label><Textarea id="declaracionMessage" name="declaracionMessage" required /></div>
                </>
            );
        default:
            return null;
    }
  }

  if (!user) {
    return (
        <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">
                Debes <Link href="/login" className="font-bold text-primary underline">iniciar sesión</Link> para enviar una petición.
            </p>
        </div>
    )
  }

  return (
    <form ref={formRef} action={action} className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de Petición</Label>
        <Select onValueChange={(value: RequestType) => setRequestType(value)} required>
          <SelectTrigger><SelectValue placeholder="Elige una opción..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="saludo">Enviar un Saludo</SelectItem>
            <SelectItem value="cancion">Pedir una Canción</SelectItem>
            <SelectItem value="grito">Mandar un Grito</SelectItem>
            <SelectItem value="concurso">Responder a un Concurso</SelectItem>
            <SelectItem value="declaracion">¡Declarársele a alguien!</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {requestType && (
        <div className="space-y-4 border-t pt-4">
            {renderFields()}
            <SubmitButton disabled={!user} />
        </div>
      )}

      {state.isSuccess && !state.isError && state.message && (
        <Alert className="mt-4 border-green-500 text-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>¡Éxito!</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
