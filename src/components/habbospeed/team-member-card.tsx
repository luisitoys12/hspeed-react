
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
    <Card className="relative pt-8 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[30%]">
             <div className="relative">
                 <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    width={64}
                    height={110}
                    className="drop-shadow-lg"
                    unoptimized
                />
                 <div className={cn(
                    "absolute bottom-4 right-0 h-3 w-3 rounded-full border-2 border-background",
                    member.online ? 'bg-green-500' : 'bg-gray-500'
                )} title={member.online ? 'Conectado' : 'Desconectado'} />
            </div>
        </div>
      <CardContent className="flex flex-col items-center justify-end text-center p-4 h-full">
            <h3 className="font-headline text-lg font-bold flex items-center mt-2">
                <HabboUserIcon />
                {member.name}
            </h3>
            <p className="text-xs text-muted-foreground italic mb-2">"{member.motto}"</p>
            <div className="flex flex-wrap gap-2 justify-center">
            {member.roles.map(role => (
                <Badge key={role} variant="secondary">{role}</Badge>
            ))}
            </div>
      </CardContent>
    </Card>
  );
}
