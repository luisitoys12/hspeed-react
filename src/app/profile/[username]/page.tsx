
import { get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageSquare } from 'lucide-react';
import type { Comment } from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getProfileData(username: string) {
    try {
        const userPromise = fetch(`https://www.habbo.es/api/public/users?name=${username}`);
        const teamPromise = get(ref(db, `team/${username}`));
        
        // Fetch user's latest comments
        const commentsQuery = query(ref(db, 'comments'), orderByChild('authorName'), equalTo(username), limitToLast(5));
        const commentsPromise = get(commentsQuery);


        const [userResponse, teamSnapshot, commentsSnapshot] = await Promise.all([userPromise, teamPromise, commentsPromise]);

        if (!userResponse.ok) {
           return { error: 'Este usuario no existe en Habbo.' };
        }
        const userData = await userResponse.json();
         if (!userData.uniqueId) {
             return { error: 'Este usuario no existe en Habbo.' };
        }

        const roles = teamSnapshot.exists() ? teamSnapshot.val().roles : [];
        const isVerified = teamSnapshot.exists();

        const comments: Comment[] = [];
        if (commentsSnapshot.exists()) {
            commentsSnapshot.forEach((articleCommentsSnapshot) => {
                 const articleId = articleCommentsSnapshot.key;
                 const articleComments = articleCommentsSnapshot.val();
                 Object.keys(articleComments).forEach(commentKey => {
                    if (articleComments[commentKey].authorName === username) {
                        comments.push({
                            id: commentKey,
                            articleId: articleId,
                            ...articleComments[commentKey]
                        });
                    }
                 });
            });
        }


        return {
            name: userData.name,
            motto: userData.motto,
            online: userData.online,
            avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${userData.name}&direction=2&head_direction=3&size=l`,
            roles,
            isVerified,
            comments: comments.sort((a, b) => b.timestamp - a.timestamp),
            error: null,
        };

    } catch (error) {
        console.error("Error fetching profile data:", error);
        return { error: 'No se pudo cargar el perfil.' };
    }
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
    const profile = await getProfileData(params.username);

    if (profile.error) {
        return notFound();
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
            <Card className="overflow-hidden">
                <div className="bg-muted h-32 md:h-40 relative">
                     <Image
                        src="https://picsum.photos/seed/profilebg/1200/400"
                        alt="Profile background"
                        fill
                        className="object-cover"
                        data-ai-hint="abstract background"
                        unoptimized
                     />
                </div>
                <CardContent className="p-6 relative">
                    <div className="absolute left-6 -top-16">
                        <div className="relative w-28 h-28 md:w-32 md:h-32 border-4 border-background rounded-full overflow-hidden">
                             <Image
                                src={profile.avatarUrl.replace('size=l','size=l&headonly=1')}
                                alt={profile.name}
                                width={128}
                                height={128}
                                className="bg-background"
                                unoptimized
                            />
                        </div>
                    </div>
                    
                    <div className="pt-16">
                        <CardTitle className="font-headline text-3xl flex items-center gap-2">
                            {profile.name}
                            {profile.isVerified && (
                                <CheckCircle className="h-6 w-6 text-blue-500" title="Miembro verificado del equipo"/>
                            )}
                        </CardTitle>
                        <CardDescription className="italic text-base">"{profile.motto}"</CardDescription>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {profile.roles.map((role: string) => (
                                <Badge key={role} variant="secondary">{role}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <MessageSquare className="text-primary" />
                        Actividad Reciente
                    </CardTitle>
                    <CardDescription>Últimos comentarios realizados por {profile.name} en el sitio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {profile.comments && profile.comments.length > 0 ? (
                        profile.comments.map((comment) => (
                            <Link href={`/news/${comment.articleId}#comment-${comment.id}`} key={comment.id} className="block p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <p className="text-sm text-foreground/90">"{comment.comment}"</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Comentado el {new Date(comment.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </Link>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">Este usuario aún no ha comentado.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
