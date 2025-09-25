
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, runTransaction } from 'firebase/database';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Poll, PollOption } from '@/lib/types';
import { Vote, BarChartHorizontal, CheckCircle, LoaderCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PollsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const pollsRef = ref(db, 'polls');
    const unsubscribe = onValue(pollsRef, (snapshot) => {
      const allPolls = snapshot.val();
      if (allPolls) {
        const active = Object.values(allPolls).find((p: any) => p.isActive === true) as Poll;
        if (active) {
            const options = active.options ? Object.entries(active.options).map(([id, opt]: [string, any]) => ({ id, ...opt })) : [];
            setActivePoll({ ...active, id: Object.keys(allPolls).find(key => allPolls[key] === active) || ''});
            setPollOptions(options);
            setTotalVotes(options.reduce((acc, opt) => acc + (opt.votes || 0), 0));
        } else {
            setActivePoll(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && activePoll) {
      const userVoteRef = ref(db, `poll_votes/${user.uid}/${activePoll.id}`);
      onValue(userVoteRef, (snapshot) => {
        setUserVote(snapshot.val());
      });
    }
  }, [user, activePoll]);

  const handleVote = async () => {
    if (!selectedOption || !user || !activePoll) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes seleccionar una opción e iniciar sesión para votar.' });
      return;
    }
    setIsSubmitting(true);
    const voteRef = ref(db, `poll_votes/${user.uid}/${activePoll.id}`);
    const optionRef = ref(db, `polls/${activePoll.id}/options/${selectedOption}/votes`);

    try {
        await runTransaction(voteRef, (currentVote) => {
            if (currentVote === selectedOption) return; // already voted for this
            return selectedOption;
        });
        await runTransaction(optionRef, (currentVotes) => (currentVotes || 0) + 1);
        toast({ title: '¡Voto registrado!', description: 'Gracias por participar.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo registrar tu voto.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 md:p-8"><Skeleton className="w-full h-96" /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Vote className="h-8 w-8 text-primary" />
          Encuestas de la Comunidad
        </h1>
        <p className="text-muted-foreground mt-2">Tu opinión cuenta. ¡Participa en la encuesta de la semana!</p>
      </div>

      {activePoll ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{activePoll.title}</CardTitle>
            <CardDescription>
                {userVote ? "Ya has votado en esta encuesta. Estos son los resultados actuales." : "Selecciona tu opción favorita y haz clic en votar."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userVote ? (
              <div className="space-y-4">
                {pollOptions.map(option => (
                  <div key={option.id}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold flex items-center gap-2">
                        {option.name}
                        {userVote === option.id && <CheckCircle className="h-4 w-4 text-primary" />}
                      </p>
                      <p className="text-sm text-muted-foreground">{((option.votes || 0) / (totalVotes || 1) * 100).toFixed(0)}% ({option.votes || 0})</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-4">
                      <div 
                        className="bg-primary h-4 rounded-full" 
                        style={{ width: `${(option.votes || 0) / (totalVotes || 1) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ''}>
                  {pollOptions.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id}>{option.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button onClick={handleVote} disabled={!selectedOption || !user || isSubmitting} className="w-full">
                  {isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : <BarChartHorizontal className="mr-2" />}
                  Votar
                </Button>
                {!user && <p className="text-xs text-center text-muted-foreground">Debes iniciar sesión para poder votar.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No hay encuestas activas en este momento. ¡Vuelve pronto!</p>
        </div>
      )}
    </div>
  );
}
