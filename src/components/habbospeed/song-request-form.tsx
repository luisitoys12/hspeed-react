
'use client';

import { useEffect, useRef, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitRequest } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

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
  const [state, formAction] = useActionState(submitRequest, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [requestType, setRequestType] = useState<RequestType | undefined>(undefined);

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
      setRequestType(undefined); // Reset select as well
    }
  }, [state, toast]);
  
  return (
    <form ref={formRef} action={formAction} className="space-y-6">
       <div className="space-y-2">
            <Label htmlFor="username">Tu nombre de usuario</Label>
            <Input id="username" name="username" placeholder="Tu nombre en Habbo" required />
       </div>

      <div className="space-y-2">
        <Label>Tipo de Petición</Label>
        <Select name="requestType" onValueChange={(value: RequestType) => setRequestType(value)} value={requestType} required>
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

       <div className="space-y-2">
        <Label htmlFor="details">Detalles de tu Petición</Label>
        <Textarea 
            id="details" 
            name="details" 
            placeholder="Escribe el nombre de la canción, tu saludo, la respuesta del concurso, etc." 
            required 
            rows={4}
        />
       </div>

      <SubmitButton disabled={!requestType} />

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
