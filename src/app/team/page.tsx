import { Users } from 'lucide-react';
import { teamMembers } from '@/lib/data';
import TeamMemberCard from '@/components/habbospeed/team-member-card';

export default function TeamPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl md:text-4xl font-headline font-bold">
          <Users className="h-8 w-8 text-primary" />
          Nuestro Equipo
        </h1>
        <p className="text-muted-foreground mt-2">
            Conoce a los DJs y al staff que hacen posible Ekus FM.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <TeamMemberCard key={member.name} member={member} />
        ))}
      </div>
    </div>
  );
}