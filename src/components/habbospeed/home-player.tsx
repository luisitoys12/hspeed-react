
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, Users, Music, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { RadioConfig, OnAirData, SongInfo } from '@/lib/types';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';

export default function HomePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [radioConfig, setRadioConfig] = useState<RadioConfig | null>(null);
  const [songInfo, setSongInfo] = useState<SongInfo>({ art: "", title: 'Cargando...', artist: 'Por favor espera', listeners: 0 });
  const [onAirData, setOnAirData] = useState<OnAirData | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const configRef = ref(db, 'config');
    const unsubscribe = onValue(configRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setRadioConfig(data);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!radioConfig) return;
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/nowplaying`);
        if (!response.ok) throw new Error('Network response was not ok');
        const apiData = await response.json();
        
        const newSongInfo: SongInfo = { art: '', title: 'Música Programada', artist: 'Habbospeed', listeners: 0 };
        let liveDjFromApi = 'AutoDJ';

        if (radioConfig.radioService === 'zenofm' && apiData?.data?.[0]) {
            const song = apiData.data[0];
            const [artist, title] = song.title.split(' - ') || ['Artista desconocido', 'Canción desconocida'];
            newSongInfo.title = title.trim();
            newSongInfo.artist = artist.trim();
            newSongInfo.art = song.image_url;
            newSongInfo.listeners = parseInt(song.listeners || '0');
        } else if (radioConfig.radioService === 'azuracast' && apiData?.now_playing) {
            newSongInfo.title = apiData.now_playing.song.title;
            newSongInfo.artist = apiData.now_playing.song.artist;
            newSongInfo.art = apiData.now_playing.song.art;
            newSongInfo.listeners = apiData.listeners.current;
            if (apiData.live.is_live && apiData.live.streamer_name) {
                liveDjFromApi = apiData.live.streamer_name;
            }
        }
        setSongInfo(newSongInfo);

        onValue(ref(db, 'onAir'), (snapshot) => {
            const override = snapshot.val();
            setOnAirData({
                currentDj: override?.currentDj || liveDjFromApi || 'AutoDJ',
                nextDj: override?.nextDj || 'N/A',
                isEvent: override?.isEvent || false
            });
        }, { onlyOnce: true });

      } catch (error) {
        console.error("Error fetching radio data:", error);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, [radioConfig]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);
  
  const togglePlayPause = () => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            if(radioConfig?.listenUrl) {
                audioRef.current.src = radioConfig.listenUrl;
                audioRef.current.load();
                audioRef.current.play().catch(e => toast({ variant: 'destructive', title: 'Error de reproducción', description: 'No se pudo iniciar el audio.'}));
            }
        }
    }
  };
  
  useEffect(() => {
    const audioEl = audioRef.current;
    if(audioEl) {
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        audioEl.addEventListener('play', handlePlay);
        audioEl.addEventListener('pause', handlePause);
        return () => {
            audioEl.removeEventListener('play', handlePlay);
            audioEl.removeEventListener('pause', handlePause);
        }
    }
  }, [audioRef]);

  const currentDjName = onAirData?.currentDj || 'AutoDJ';

  return (
    <div className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#1e5c8e] p-2 mt-8">
      <audio ref={audioRef} preload="none" />
      <div 
        className="bg-[#0e2439] rounded-lg p-2 bg-center bg-no-repeat"
        style={{backgroundImage: "url('https://i.imgur.com/uGg0a21.png')"}}
      >
        <div className="flex justify-between items-start">
            {/* Left Section: Avatar & Likes */}
            <div className="flex flex-col items-center gap-1">
                <Image 
                    src={`https://www.habbo.es/habbo-imaging/avatarimage?user=${currentDjName}&direction=2&head_direction=3&size=m`}
                    alt={currentDjName}
                    width={55}
                    height={110}
                    unoptimized
                    className="drop-shadow-lg"
                />
                <div className="flex items-center gap-1 text-red-500 font-bold">
                    <Heart size={16} fill="currentColor" />
                    <span>{songInfo.listeners}</span>
                </div>
            </div>

            {/* Center Section: Controls */}
            <div className="flex flex-col gap-1 w-full max-w-[200px]">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlayPause}>
                        {isPlaying ? <Pause className="text-white"/> : <Play className="text-white"/>}
                    </Button>
                    <div className="flex-grow bg-black/30 rounded-full p-1 flex items-center gap-1">
                        <Volume2 size={16} className="text-white/80" />
                        <Slider 
                            value={[volume]} 
                            onValueChange={(v) => setVolume(v[0])} 
                            max={100} 
                            step={1}
                            className="[&>span:first-child]:h-1.5 [&>span:first-child>span]:bg-white [&>span:last-child]:h-3 [&>span:last-child]:w-3 [&>span:last-child]:border-white/50"
                        />
                    </div>
                </div>
                <Button variant="outline" className="h-8 bg-[#093e6c] border-[#1567a5] text-white/90 hover:bg-[#1567a5]">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    {currentDjName}
                    <ExternalLink size={14} className="ml-auto" />
                </Button>
                <Button variant="outline" className="h-8 bg-[#093e6c] border-[#1567a5] text-white/90 hover:bg-[#1567a5] justify-start truncate">
                    <Music size={14} className="mr-2" />
                    {songInfo.title} - {songInfo.artist}
                </Button>
            </div>

            {/* Right Section: Listeners Badge */}
            <div className="relative w-12 h-12">
                 <Image src="https://i.imgur.com/vHqPjUn.png" alt="Listeners Badge" width={48} height={48} unoptimized />
                 <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm drop-shadow-lg">{songInfo.listeners}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
