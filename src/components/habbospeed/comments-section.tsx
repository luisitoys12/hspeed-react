
"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { commentsApi } from '@/lib/api';
import { Comment as CommentType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoaderCircle, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface CommentsSectionProps {
  articleId: string;
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const fetchComments = async () => {
    try {
      const data: any = await commentsApi.getByArticle(articleId);
      const commentsArray: CommentType[] = data.map((comment: any) => ({
        id: comment._id,
        articleId: comment.articleId,
        authorUid: comment.authorUid,
        authorName: comment.authorName,
        comment: comment.comment,
        timestamp: new Date(comment.timestamp).getTime()
      })).reverse();
      setComments(commentsArray);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchComments();
      const interval = setInterval(fetchComments, 30000);
      return () => clearInterval(interval);
    }
  }, [articleId]);

  const handleCommentSubmit = async (formData: FormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para comentar.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await commentsApi.create({
        articleId,
        authorName: user.displayName || 'Anónimo',
        comment: formData.get('comment')
      });
      toast({ title: '¡Éxito!', description: 'Tu comentario ha sido publicado.' });
      formRef.current?.reset();
      await fetchComments();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'No se pudo publicar el comentario' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <MessageSquare className="text-primary" />
          Comentarios ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {authLoading ? (
            <div className="flex items-center justify-center p-4">
                <LoaderCircle className="animate-spin" />
            </div>
        ) : user ? (
          <form action={handleCommentSubmit} ref={formRef} className="mb-8 flex items-start gap-4">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${user.displayName}&headonly=1&size=m`} />
              <AvatarFallback>{user.displayName?.substring(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="w-full">
              <Textarea
                name="comment"
                placeholder={`Comentando como ${user.displayName}...`}
                required
                rows={3}
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting} className="mt-2">
                {isSubmitting ? (
                  <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Publicando...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Publicar</>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mb-8 text-center p-4 bg-muted/50 rounded-md">
            <p className="text-muted-foreground">
              <Link href="/login" className="text-primary font-bold hover:underline">Inicia sesión</Link> o <Link href="/register" className="text-primary font-bold hover:underline">regrístrate</Link> para dejar un comentario.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {dbLoading ? (
            <p className="text-muted-foreground">Cargando comentarios...</p>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} id={`comment-${comment.id}`} className="flex items-start gap-4 scroll-mt-20">
                <Link href={`/profile/${comment.authorName}`}>
                    <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${comment.authorName}&headonly=1&size=m`} />
                    <AvatarFallback>{comment.authorName.substring(0,1)}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="w-full">
                  <div className="flex items-baseline gap-2">
                    <Link href={`/profile/${comment.authorName}`} className="font-bold text-primary hover:underline">{comment.authorName}</Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <p className="text-foreground/90">{comment.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Aún no hay comentarios. ¡Sé el primero en comentar!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
