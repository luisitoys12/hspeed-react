'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Rewind, FastForward, Volume2 } from 'lucide-react';
import { djInfo } from '@/lib/data';
import { Slider } from '@/components/ui/slider';

export default function Player() {
  return (
    <Card className="overflow-hidden shadow-lg border-primary/20">
      <div className="relative h-48 w-full">
         <Image
          src="https://picsum.photos/seed/playerbg/1200/400"
          alt="Radio background"
          fill
          className="object-cover"
          data-ai-hint="abstract soundwave"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <div className="relative h-24 w-24 border-4 border-background rounded-lg overflow-hidden">
             <Image
                src={djInfo.avatarUrl}
                alt={djInfo.habboName}
                width={96}
                height={96}
                className="object-contain"
              />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold text-white shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{djInfo.name}</h2>
            <p className="text-primary font-bold">{djInfo.habboName}</p>
            <div className="flex gap-2 mt-1">
              {djInfo.roles.map((role) => (
                <Badge key={role} variant="secondary">{role}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-6 bg-card">
        <div className="flex flex-col gap-4">
            <div className="text-center">
                <p className="text-sm text-muted-foreground">Now Playing</p>
                <h3 className="text-lg font-semibold font-headline">Habbospeed Anthem - DJ-Pixel</h3>
            </div>
            <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Rewind />
                </Button>
                <Button variant="default" size="icon" className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90">
                    <Play className="h-6 w-6 fill-primary-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <FastForward />
                </Button>
            </div>
            <div className="flex items-center gap-4">
                <Volume2 className="text-muted-foreground" />
                <Slider defaultValue={[50]} max={100} step={1} />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
