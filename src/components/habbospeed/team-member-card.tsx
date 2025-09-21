
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TeamMember = {
  name: string;
  motto: string;
  roles: string[];
  avatarUrl: string;
  online: boolean;
};

type TeamMemberCardProps = {
  member: TeamMember;
};

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card className="relative pt-12 overflow-visible transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 mt-12 h-56">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-24 w-24">
          <Image
            src={member.avatarUrl}
            alt={member.name}
            width={96}
            height={96}
            className="rounded-full border-4 border-primary bg-card"
            unoptimized
          />
          <div className={cn(
            "absolute bottom-0 right-1 h-5 w-5 rounded-full border-2 border-background",
            member.online ? 'bg-green-500' : 'bg-gray-500'
          )} title={member.online ? 'Conectado' : 'Desconectado'} />
        </div>
      </div>
      <CardContent className="p-6 text-center h-full flex flex-col justify-end">
        <div>
            <CardTitle className="font-headline text-xl">{member.name}</CardTitle>
            <CardDescription className="italic mt-1">"{member.motto}"</CardDescription>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
            {member.roles.map(role => (
                <Badge key={role} variant="secondary">{role}</Badge>
            ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
