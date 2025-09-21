
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
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

const HabboUserIcon = () => (
    <Image 
        src="https://habbofont.net/img/habbo/tool.gif" 
        alt="User Icon"
        width={15} 
        height={19}
        className="inline-block mr-2"
        unoptimized
    />
)

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card className="transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <Image
            src={member.avatarUrl}
            alt={member.name}
            width={64}
            height={110}
            className="bg-card"
            unoptimized
          />
           <div className={cn(
            "absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-background",
            member.online ? 'bg-green-500' : 'bg-gray-500'
          )} title={member.online ? 'Conectado' : 'Desconectado'} />
        </div>
        <div className="flex flex-col gap-2">
            <h3 className="font-headline text-lg font-bold flex items-center">
                <HabboUserIcon />
                {member.name}
            </h3>
            <div className="flex flex-wrap gap-2">
            {member.roles.map(role => (
                <Badge key={role} variant="secondary">{role}</Badge>
            ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
