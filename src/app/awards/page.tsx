
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gift, LoaderCircle, Check } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useTransition } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { submitAwardVote } from '@/lib/actions';
import { Badge } from '@/components/ui/badge';

interface Nominee {
  id: string;
  name: string;
  motto?: string;
  votes: number;
}

interface AwardCategory {
  id: string;
  title: string;
  nominations: Nominee[];
}

export default function AwardsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<AwardCategory[]>([]);
  const [userVotes, setUserVotes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const categoriesRef = ref(db, 'award_categories');
    const nominationsRef = ref(db, 'award_nominations');
    const configRef = ref(db, 'config/awardVotingOpen');

    onValue(configRef, (snapshot) => {
        setIsVotingOpen(snapshot.val() === true);
    });

    onValue(categoriesRef, (catSnapshot) => {
      const categoriesData = catSnapshot.val() || {};
      
      onValue(nominationsRef, (nomSnapshot) => {
        const nominationsData = nomSnapshot.val() || {};
        const categoriesArray: AwardCategory[] = Object.keys(categoriesData).map(catId => {
          const category = categoriesData[catId];
          const nominations = nominationsData[catId] ? 
            Object.keys(nominationsData[catId]).map(nomId => ({
              id: nomId,
              ...nominationsData[catId][nomId]
            })) : [];
          
          return {
            id: catId,
            title: category.title,
            nominations: nominations,
          };
        });
        setCategories(categoriesArray);
        setLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    if (user) {
      const userVotesRef = ref(db, `award_votes/${user.uid}`);
      onValue(userVotesRef, (snapshot) => {
        setUserVotes(snapshot.val() || {});
      });
    }
  }, [user]);

  const handleVote = (categoryId: string, nomineeId: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Debes iniciar sesión para votar.' });
      return;
    }
    startTransition(async () => {
      await submitAwardVote({ categoryId, nomineeId, userId: user.uid });
      toast({ title: '¡Voto registrado!', description: 'Gracias por tu participación.' });
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="overflow-hidden mb-8">
        <div className="relative h-48 md:h-64 bg-black">
          <Image 
            src="https://picsum.photos/seed/awardsnight/1200/500"
            alt="Noche de Premios"
            layout="fill"
            objectFit="cover"
            className="opacity-40"
            data-ai-hint="awards ceremony"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 bg-gradient-to-t from-black/80 to-transparent">
            <Gift className="h-16 w-16 text-primary drop-shadow-lg" />
            <h1 className="text-3xl md:text-5xl font-headline font-bold mt-2 drop-shadow-lg">
              Habbospeed Awards
            </h1>
            <p className="mt-2 text-lg text-white/90">
              ¡Tú decides! Vota por tus favoritos en cada categoría.
            </p>
          </div>
        </div>
        {!isVotingOpen && (
            <div className="bg-yellow-400/20 text-yellow-200 text-center p-3 font-bold">
                Las votaciones se encuentran cerradas. ¡Gracias por participar!
            </div>
        )}
      </Card>
      
      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map(category => (
            <Card key={category.id}>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.nominations.map(nominee => {
                  const hasVotedForThis = userVotes[category.id] === nominee.id;
                  return (
                    <div key={nominee.id} className={`p-3 rounded-lg flex items-center justify-between transition-all ${hasVotedForThis ? 'bg-primary/20' : 'bg-muted'}`}>
                      <div className="flex items-center gap-3">
                        <Image src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${nominee.name}&headonly=1&size=s`} alt={nominee.name} width={40} height={40} className="rounded-full" unoptimized />
                        <div>
                            <p className="font-bold">{nominee.name}</p>
                            <p className="text-xs text-muted-foreground italic truncate max-w-[150px]">"{nominee.motto || '...'}"</p>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleVote(category.id, nominee.id)}
                        disabled={!isVotingOpen || !user || !!userVotes[category.id] || isPending}
                      >
                          {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                          {hasVotedForThis ? <Check className="h-4 w-4" /> : 'Votar'}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
          <p className="text-muted-foreground text-center py-8">No hay nominaciones activas en este momento.</p>
      )}
    </div>
  );
}
