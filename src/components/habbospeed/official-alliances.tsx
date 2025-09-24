
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

type Alliance = {
  id: string;
  name: string;
  imageUrl: string;
  imageHint: string;
};

type OfficialAlliancesProps = {
  initialAlliances: { [key: string]: Omit<Alliance, 'id'> };
};

export default function OfficialAlliances({ initialAlliances }: OfficialAlliancesProps) {
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialAlliances) {
      const alliancesArray = Object.keys(initialAlliances).map(key => ({ id: key, ...initialAlliances[key] }));
      setAlliances(alliancesArray);
    }
    setLoading(false);
  }, [initialAlliances]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Handshake className="text-primary" />
          Alianzas Oficiales
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : (
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
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
