"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '../ui/skeleton';

type Alliance = {
  id: string;
  name: string;
  imageUrl: string;
  imageHint: string;
};

export default function OfficialAlliances() {
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alliancesRef = ref(db, 'alliances');
    const unsubscribe = onValue(alliancesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const alliancesArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setAlliances(alliancesArray);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
