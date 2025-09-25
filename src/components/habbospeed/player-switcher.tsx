
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import HomePlayer from './home-player';
import { Headphones, Radio } from 'lucide-react';

type PlayerPreference = 'classic' | 'modern';

export default function PlayerSwitcher() {
  const [preference, setPreference] = useState<PlayerPreference>('classic');

  useEffect(() => {
    const storedPreference = localStorage.getItem('player-preference') as PlayerPreference;
    if (storedPreference) {
      setPreference(storedPreference);
    }
  }, []);

  const handlePreferenceChange = (value: PlayerPreference) => {
    setPreference(value);
    localStorage.setItem('player-preference', value);
    // Force a re-render or notify other components.
    // A simple way is to dispatch a custom event.
    window.dispatchEvent(new Event('player-preference-change'));
    window.location.reload(); // Simple solution to force FloatingPlayer to re-evaluate
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><Headphones /> Reproductor de Radio</CardTitle>
        <CardDescription>Elige cómo quieres escuchar.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={preference} onValueChange={handlePreferenceChange} className="mb-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="classic" id="classic" />
            <Label htmlFor="classic">Clásico</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="modern" id="modern" />
            <Label htmlFor="modern">Moderno</Label>
          </div>
        </RadioGroup>
        
        {preference === 'classic' && <HomePlayer />}
        
        {preference === 'modern' && (
          <div className="text-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
            El reproductor moderno aparecerá en la parte inferior de la pantalla al navegar fuera de la página de inicio.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
