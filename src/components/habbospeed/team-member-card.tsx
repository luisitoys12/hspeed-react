import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
      <CardHeader className="items-center text-center p-6">
        <div className="relative h-24 w-24 mb-4">
          <Image
            src={member.avatarUrl}
            alt={member.name}
            width={96}
            height={96}
            className="rounded-full border-4 border-primary"
          />
           <div className={cn(
               "absolute bottom-0 right-1 h-5 w-5 rounded-full border-2 border-background",
               member.online ? 'bg-green-500' : 'bg-gray-500'
           )} />
        </div>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
            {member.name}
        </CardTitle>
        <CardDescription className="italic">"{member.motto}"</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center items-center">
        <div className="flex flex-wrap gap-2 justify-center">
            {member.roles.map(role => (
                <Badge key={role} variant="secondary">{role}</Badge>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
