
'use client';

import { Users, LoaderCircle } from 'lucide-react';
import TeamMemberCard from '@/components/habbospeed/team-member-card';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';

type TeamMemberConfig = {
    name: string;
    roles: string[];
};

type HabboUser = {
    name: string;
    motto: string;
    online: boolean;
    avatarUrl: string;
    roles: string[];
}

async function fetchMemberDetails(memberConfig: TeamMemberConfig): Promise<HabboUser> {
    try {
        const response = await fetch(`https://www.habbo.es/api/public/users?name=${memberConfig.name}`, { next: { revalidate: 300 } });
        if (!response.ok) throw new Error('Habbo API fetch failed');
        const data = await response.json();
        return {
            name: data.name,
            motto: data.motto,
            roles: memberConfig.roles,
            avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${data.name}&direction=2&head_direction=3&size=l`,
            online: data.online,
        };
    } catch (apiError) {
        return {
            name: memberConfig.name,
            motto: 'Lema no disponible',
            roles: memberConfig.roles,
            avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${memberConfig.name}&direction=2&head_direction=3&size=l`,
            online: false,
        };
    }
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<HabboUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teamRef = ref(db, 'team');
    const unsubscribe = onValue(teamRef, async (snapshot) => {
        setLoading(true);
        if (snapshot.exists()) {
            const teamData = snapshot.val();
            const teamConfig: TeamMemberConfig[] = Object.keys(teamData).map(name => ({
                name: name,
                roles: teamData[name].roles || ['Miembro'],
            }));
            
            const memberPromises = teamConfig.map(fetchMemberDetails);
            const members = await Promise.all(memberPromises);
            setTeamMembers(members);
        } else {
            setTeamMembers([]);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Users className="h-8 w-8 text-primary" />
          Nuestro Equipo
        </h1>
        <p className="text-muted-foreground mt-2">
            Conoce a los DJs y al staff que hacen posible Habbospeed.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)
        ) : teamMembers.length > 0 ? (
          teamMembers.map((member) => (
            <TeamMemberCard key={member.name} member={member} />
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">El equipo se está formando. ¡Vuelve pronto!</p>
        )}
      </div>
    </div>
  );
}
