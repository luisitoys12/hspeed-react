import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake } from 'lucide-react';
import Image from 'next/image';

const alliances = [
  { id: 1, name: 'HabboSecurity', imageUrl: 'https://picsum.photos/seed/alliance1/200/100', imageHint: 'security logo' },
  { id: 2, name: 'Habbo University', imageUrl: 'https://picsum.photos/seed/alliance2/200/100', imageHint: 'university logo' },
  { id: 3, name: 'Habbo RPG', imageUrl: 'https://picsum.photos/seed/alliance3/200/100', imageHint: 'gaming logo' },
  { id: 4, name: 'Habbo Fashion', imageUrl: 'https://picsum.photos/seed/alliance4/200/100', imageHint: 'fashion logo' },
];

export default function OfficialAlliances() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Handshake className="text-primary" />
          Alianzas Oficiales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {alliances.map(alliance => (
            <div key={alliance.id} className="p-2 border rounded-lg flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
              <Image 
                src={alliance.imageUrl} 
                alt={alliance.name} 
                width={150} 
                height={75} 
                className="object-contain"
                data-ai-hint={alliance.imageHint}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
