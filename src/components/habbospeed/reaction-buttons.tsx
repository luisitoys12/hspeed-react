
"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { addReaction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface ReactionButtonsProps {
  articleId: string;
  reactions: { [key: string]: number };
  userId?: string;
}

const availableReactions = ['❤️', '🎉', '🤔', '👍'];

export default function ReactionButtons({ articleId, reactions, userId }: ReactionButtonsProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const handleReaction = (reaction: string) => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Acción Requerida',
        description: 'Debes iniciar sesión para poder reaccionar.',
      });
      return;
    }

    startTransition(async () => {
      const result = await addReaction(articleId, reaction, userId);
      if (!result.success && result.message) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  };

  return (
    <div className="mt-8 pt-4 border-t">
      <h3 className="text-sm font-semibold mb-2 text-center text-muted-foreground">¿Qué te pareció este artículo?</h3>
      <div className="flex justify-center items-center gap-2">
        {availableReactions.map((reaction) => (
          <Button
            key={reaction}
            variant="outline"
            size="sm"
            onClick={() => handleReaction(reaction)}
            disabled={isPending || !user}
            className={cn(
                "transition-all duration-200",
                reactions[reaction] > 0 ? "border-primary" : ""
            )}
          >
            <span className="text-lg mr-2">{reaction}</span>
            <span className="font-bold text-sm">{reactions[reaction] || 0}</span>
          </Button>
        ))}
         {isPending && <LoaderCircle className="h-5 w-5 animate-spin text-primary" />}
      </div>
    </div>
  );
}
