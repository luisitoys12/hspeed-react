'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitSongRequest } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, LoaderCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from 'lucide-react';

const initialState = {
  message: '',
  isSuccess: false,
  isError: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
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
  const [state, formAction] = useFormState(submitSongRequest, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

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
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          name="songRequest"
          placeholder="Escribe el título de la canción y el artista"
          required
          className="flex-grow"
        />
        <SubmitButton />
      </div>
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
