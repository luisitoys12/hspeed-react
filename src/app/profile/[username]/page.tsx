
import { get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { ref } from 'firebase/database';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Home, Calendar, Award } from 'lucide-react';

async function getProfileData(username: string) {
    try {
        const userPromise = fetch(`https://www.habbo.es/api/public/users?name=${username}`);
        const teamPromise = get(ref(db, `team/${username}`));

        const [userResponse, teamSnapshot] = await Promise.all([userPromise, teamPromise]);

        if (!userResponse.ok) {
            return { error: 'Este usuario no existe en Habbo.' };
        }
        const userData = await userResponse.json();

        const roles = teamSnapshot.exists() ? teamSnapshot.val().roles : [];
        const isVerified = teamSnapshot.exists();

        return {
            name: userData.name,
            motto: userData.motto,
            online: userData.online,
            avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${userData.name}&direction=2&head_direction=3&size=l`,
            roles,
            isVerified,
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
        return (
            <div className="container mx-auto p-4 md:p-8">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-destructive font-bold">{profile.error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="overflow-hidden">
                <div className="bg-muted h-32 md:h-40 relative">
                     <Image
                        src="https://picsum.photos/seed/profilebg/1200/400"
                        alt="Profile background"
                        fill
                        className="object-cover"
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
        </div>
    );
}

