import { get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, limitToLast, getDatabase, onValue } from 'firebase/database';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageSquare, Calendar, Award } from 'lucide-react';
import type { Comment } from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

async function getProfileData(username: string) {
    try {
        const nameForQuery = username.toLowerCase();

        // 1. Find user UID from Habbospeed DB by fetching all users and filtering
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);

        let habbospeedUser = null;
        if (usersSnapshot.exists()) {
            const usersData = usersSnapshot.val();
            const userFound = Object.values(usersData).find(
                (user: any) => user.displayName.toLowerCase() === nameForQuery
            );
            if (userFound) {
                habbospeedUser = userFound;
            }
        }
        
        // 2. Fetch data from Habbo API
        const userPromise = fetch(`https://www.habbo.es/api/public/users?name=${username}`);
        
        // 3. Fetch team roles
        const teamPromise = get(ref(db, `team/${username}`));

        // 4. Fetch assigned badges
        const assignedBadgesPromise = habbospeedUser ? get(ref(db, `user_badges_assigned/${(habbospeedUser as any).uid}`)) : Promise.resolve(null);
        
        // 5. Fetch custom badge definitions
        const customBadgesPromise = get(ref(db, `custom_badges`));
        
        // 6. Fetch user's latest comments
        const commentsQuery = query(ref(db, 'comments'), orderByChild('authorName'), equalTo(username), limitToLast(5));
        const commentsPromise = get(commentsQuery);
        
        const [userResponse, teamSnapshot, commentsSnapshot, assignedBadgesSnapshot, customBadgesSnapshot] = await Promise.all([userPromise, teamPromise, commentsPromise, assignedBadgesPromise, customBadgesPromise]);

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
        
        const assignedBadges = assignedBadgesSnapshot?.exists() ? assignedBadgesSnapshot.val() : {};
        const customBadges = customBadgesSnapshot?.exists() ? customBadgesSnapshot.val() : {};
        const userBadges = Object.keys(assignedBadges).map(badgeId => {
            return customBadges[badgeId] ? { id: badgeId, ...customBadges[badgeId] } : null;
        }).filter(Boolean);


        return {
            name: userData.name,
            motto: userData.motto,
            online: userData.online,
            registrationDate: userData.memberSince,
            rewards: userData.achievementScore,
            avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${userData.name}&direction=2&head_direction=3&size=l`,
            roles,
            isVerified,
            comments: comments.sort((a, b) => b.timestamp - a.timestamp),
            userBadges,
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
                     <div className="absolute left-6 -bottom-12">
                        <div className="relative w-28 h-28 md:w-32 md:h-32 border-4 border-background rounded-full overflow-hidden bg-background">
                             <Image
                                src={profile.avatarUrl}
                                alt={profile.name}
                                width={128}
                                height={200}
                                className="drop-shadow-lg"
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
                <CardHeader className="pt-16 pb-4">
                    <CardTitle className="font-headline text-3xl flex items-center gap-2">
                        {profile.name}
                        {profile.isVerified && (
                            <CheckCircle className="h-6 w-6 text-blue-500" title="Miembro verificado del equipo"/>
                        )}
                    </CardTitle>
                    <CardDescription className="italic text-base">"{profile.motto}"</CardDescription>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {profile.roles.map((role: string) => (
                            <Badge key={role} variant="secondary">{role}</Badge>
                        ))}
                    </div>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Estadísticas</CardTitle>
                    </CardHeader>
                     <CardContent className="text-sm text-muted-foreground space-y-3">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-bold text-foreground">{new Date(profile.registrationDate).toLocaleDateString('es-ES')}</p>
                                <p>En Habbo desde</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Award className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-bold text-foreground">{profile.rewards}</p>
                                <p>Puntos de Logro</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card className="md:col-span-2">
                     <CardHeader>
                        <CardTitle className="text-lg">Placas Habbospeed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profile.userBadges && profile.userBadges.length > 0 ? (
                            <TooltipProvider>
                                <div className="flex flex-wrap gap-4">
                                {profile.userBadges.map((badge: any) => (
                                    <Tooltip key={badge.id}>
                                        <TooltipTrigger>
                                            <Image src={badge.imageUrl} alt={badge.name} width={48} height={48} className="rounded-md" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-bold">{badge.name}</p>
                                            <p>{badge.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                                </div>
                            </TooltipProvider>
                        ) : (
                            <p className="text-sm text-muted-foreground">Este usuario no tiene placas de Habbospeed.</p>
                        )}
                    </CardContent>
                 </Card>
            </div>


            <Card className="mt-6">
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
