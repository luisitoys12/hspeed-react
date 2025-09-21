'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Users, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useEffect, useRef, useState } from 'react';

// Mock data, in a real app this would come from Azuracast API
const azuracastData = {
  "station": {
    "listen_url": "http://radio.kusmedios.lat/listen/ekus-fm/radio.mp3",
  },
  "listeners": {
    "total": 123,
    "unique": 98,
    "current": 123
  },
  "now_playing": {
    "elapsed": 95,
    "remaining": 110,
    "sh_id": 122,
    "played_at": 1678886400,
    "duration": 205,
    "playlist": "default",
    "streamer": "",
    "is_request": false,
    "song": {
      "id": "8f2d5b4d7c5b",
      "text": "Artista de Ejemplo - Canción de Ejemplo",
      "artist": "Artista de Ejemplo",
      "title": "Canción de Ejemplo",
      "album": "Álbum de Ejemplo",
      "genre": "Pop",
      "lyrics": "",
      "art": "https://picsum.photos/seed/songart/300/300",
      "custom_fields": []
    }
  },
  "playing_next": {
    "cued_at": 1678886605,
    "played_at": 1678886605,
    "duration": 220,
    "playlist": "default",
    "is_request": false,
    "song": {
      "id": "3a1b6c5e2d4f",
      "text": "Otro Artista - Otra Canción",
      "artist": "Otro Artista",
      "title": "Otra Canción",
      "album": "Otro Álbum",
      "genre": "Rock",
      "lyrics": "",
      "art": "https://picsum.photos/seed/nextsongart/300/300",
      "custom_fields": []
    }
  },
  "live": {
    "is_live": true,
    "streamer_name": "hspeed",
    "broadcast_start": 1678882800,
    "art": ""
  },
  "cache": "success"
};

const djInfo = {
    name: 'hspeed',
    habboName: 'hspeed',
    avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=hspeed&action=std&direction=2&head_direction=2&gesture=sml&size=l`,
    roles: ['AutoDJ'],
};


export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const currentDj = azuracastData.live.is_live && azuracastData.live.streamer_name ? {
    name: azuracastData.live.streamer_name,
    avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${azuracastData.live.streamer_name}&action=std&direction=2&head_direction=2&gesture=sml&size=l`,
    roles: ['En Vivo']
  } : djInfo;
  
  const songArt = azuracastData.now_playing.song.art;

  return (
    <Card className="overflow-hidden shadow-lg border-primary/20">
      <audio ref={audioRef} src={azuracastData.station.listen_url} preload="none" />
      <div className="relative h-48 w-full">
         <Image
          src="https://picsum.photos/seed/playerbg/1200/400"
          alt="Fondo de radio con temática de Halloween"
          fill
          className="object-cover"
          data-ai-hint="halloween party"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 p-2 rounded-lg">
          <Users className="text-primary h-5 w-5" />
          <span className="font-bold text-white">{azuracastData.listeners.current}</span>
          <span className="text-sm text-muted-foreground">Oyentes</span>
        </div>

        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <div className="relative h-24 w-24 border-4 border-background rounded-lg overflow-hidden shadow-lg">
             <Image
                src={currentDj.avatarUrl}
                alt={currentDj.name}
                width={96}
                height={96}
                className="object-contain"
              />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Al Aire:</p>
            <h2 className="text-3xl font-headline font-bold text-white shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{currentDj.name}</h2>
            <div className="flex gap-2 mt-1">
              {currentDj.roles.map((role) => (
                <Badge key={role} variant="secondary">{role}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-6 bg-card flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
            <Image src={songArt} alt={azuracastData.now_playing.song.text} width={64} height={64} className="rounded-md" />
            <div className="flex-grow">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Music size={14}/> Sonando Ahora</p>
                <h3 className="text-md font-semibold font-headline truncate">{azuracastData.now_playing.song.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{azuracastData.now_playing.song.artist}</p>
            </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 flex-grow">
            <Button variant="default" size="icon" className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-6 w-6 fill-primary-foreground" /> : <Play className="h-6 w-6 fill-primary-foreground" />}
            </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-48">
            <Volume2 className="text-muted-foreground" />
            <Slider defaultValue={[volume]} max={100} step={1} onValueChange={(value) => setVolume(value[0])} />
        </div>
      </CardContent>
    </Card>
  );
}