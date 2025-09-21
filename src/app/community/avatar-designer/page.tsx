
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paintbrush, Shirt, Palette, Download, Redo, Undo, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

// Tipos
type FigurePart = { type: string; id: number; color?: number };
type FigureSet = { [key: string]: FigurePart };
type History = FigureSet[];

// Catálogo de ropa de ejemplo (type, id)
const CLOTHING_CATALOG: { [key: string]: { name: string; id: number }[] } = {
  hr: [ // Pelos
    { name: 'Pelo Corto', id: 100 },
    { name: 'Coleta Larga', id: 110 },
    { name: 'Pelo Rizado', id: 115 },
  ],
  ch: [ // Camisas
    { name: 'Camisa Básica', id: 210 },
    { name: 'Camisa HC', id: 220 },
    { name: 'Sudadera', id: 235 },
  ],
  lg: [ // Pantalones
    { name: 'Vaqueros', id: 275 },
    { name: 'Pantalón Ancho', id: 280 },
    { name: 'Falda Corta', id: 285 },
  ],
  sh: [ // Zapatos
    { name: 'Zapatillas', id: 290 },
    { name: 'Botas', id: 300 },
    { name: 'Tacones', id: 305 },
  ],
};

// Paleta de colores de ejemplo de Habbo (id, hex)
const HABBO_COLORS = [
    { id: 1, hex: '#FFFFFF' }, { id: 8, hex: '#C0C0C0' }, { id: 2, hex: '#F7E7BD' }, { id: 3, hex: '#EAEAEA' }, 
    { id: 4, hex: '#DCDCDC' }, { id: 5, hex: '#F4F3F3' }, { id: 6, hex: '#FDF0F0' }, { id: 7, hex: '#F0F5FD' },
    { id: 9, hex: '#C6C6C6' }, { id: 10, hex: '#B2B2B2' }, { id: 11, hex: '#B4B4B4' }, { id: 12, hex: '#525252' },
    { id: 13, hex: '#FFE8A1' }, { id: 14, hex: '#FFD763' }, { id: 15, hex: '#FFC82A' }, { id: 16, hex: '#DEAE00' },
    { id: 17, hex: '#FFB373' }, { id: 18, hex: '#F69431' }, { id: 19, hex: '#F27D00' }, { id: 20, hex: '#BC7321' },
    { id: 21, hex: '#F77051' }, { id: 22, hex: '#E35934' }, { id: 23, hex: '#C64823' }, { id: 24, hex: '#A33818' },
    { id: 25, hex: '#FF8888' }, { id: 26, hex: '#FF5454' }, { id: 27, hex: '#DA3131' }, { id: 28, hex: '#A81F1F' },
    { id: 29, hex: '#FFB4D9' }, { id: 30, hex: '#FF7EB9' }, { id: 31, hex: '#E7589B' }, { id: 32, hex: '#B83777' },
    { id: 33, hex: '#D5A4FE' }, { id: 34, hex: '#C182F9' }, { id: 35, hex: '#A653E3' }, { id: 36, hex: '#7E30B1' },
    { id: 37, hex: '#B1B1FE' }, { id: 38, hex: '#8787FF' }, { id: 39, hex: '#5F5FFF' }, { id: 40, hex: '#3B3BDB' },
    { id: 41, hex: '#97D5F9' }, { id: 42, hex: '#5CC2F7' }, { id: 43, hex: '#39A9E1' }, { id: 44, hex: '#1C82B1' },
    { id: 45, hex: '#A4F3F5' }, { id: 46, hex: '#68E4E7' }, { id: 47, hex: '#33CCCC' }, { id: 48, hex: '#1D989A' },
    { id: 49, hex: '#B3F5B3' }, { id: 50, hex: '#82F182' }, { id: 51, hex: '#50D750' }, { id: 52, hex: '#2B9E2B' },
];

const buildFigureString = (figure: FigureSet) => {
  return Object.values(figure)
    .map(p => `${p.type}-${p.id}${p.color ? `-${p.color}` : ''}`)
    .join('.');
};

export default function AvatarDesignerPage() {
  const [figure, setFigure] = useState<FigureSet>({
    hd: { type: 'hd', id: 209, color: 1 },
    hr: { type: 'hr', id: 100, color: 12 },
    ch: { type: 'ch', id: 210, color: 38 },
    lg: { type: 'lg', id: 275, color: 38 },
    sh: { type: 'sh', id: 290, color: 1 },
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [history, setHistory] = useState<History>([figure]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedPart, setSelectedPart] = useState('ch');

  useEffect(() => {
    const figureString = buildFigureString(figure);
    setAvatarUrl(`https://www.habbo.es/habbo-imaging/avatarimage?figure=${figureString}&direction=3&head_direction=3&action=wav&gesture=sml&size=l`);
  }, [figure]);

  const updateFigure = (newPart: FigurePart) => {
    const newFigure = { ...figure, [newPart.type]: newPart };
    setFigure(newFigure);
    
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newFigure]);
    setHistoryIndex(newHistory.length);
  };

  const handlePartChange = (partType: string, partId: number) => {
    const currentColor = figure[partType]?.color || 1;
    updateFigure({ type: partType, id: partId, color: currentColor });
  };
  
  const handleColorChange = (colorId: number) => {
    const currentPart = figure[selectedPart];
    if (currentPart) {
      updateFigure({ ...currentPart, color: colorId });
    }
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setFigure(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setFigure(history[newIndex]);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Paintbrush className="h-8 w-8 text-primary" />
          Diseñador de Avatares
        </h1>
        <p className="text-muted-foreground mt-2">
          Crea tu look ideal. Selecciona una prenda, elige un ítem y luego asígnale un color.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col items-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Vista Previa</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {avatarUrl && <Image src={avatarUrl} alt="Avatar Preview" width={150} height={250} unoptimized />}
                    </div>
                     <div className="flex justify-center gap-2 mt-4">
                        <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex === 0}><Undo/></Button>
                        <Button variant="outline" size="icon" onClick={handleRedo} disabled={historyIndex === history.length - 1}><Redo/></Button>
                        <Button disabled><Download className="mr-2"/> Guardar Look</Button>
                    </div>
                 </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Personalización</CardTitle>
              <CardDescription>Selecciona una prenda y luego un color.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-headline mb-2 flex items-center gap-2"><Shirt/> Prendas</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.keys(CLOTHING_CATALOG).map(partType => (
                    <Popover key={partType}>
                      <PopoverTrigger asChild>
                        <Button variant={selectedPart === partType ? 'default' : 'secondary'} onClick={() => setSelectedPart(partType)}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          {partType === 'hr' ? 'Pelo' : partType === 'ch' ? 'Camisa' : partType === 'lg' ? 'Pantalón' : 'Zapatos'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                         <ScrollArea className="h-48">
                            <div className="space-y-2">
                              {CLOTHING_CATALOG[partType].map(item => (
                                <Button key={item.id} variant="ghost" className="w-full justify-start" onClick={() => handlePartChange(partType, item.id)}>
                                  {item.name}
                                </Button>
                              ))}
                            </div>
                         </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-headline mb-2 flex items-center gap-2"><Palette/> Paleta de Colores</h3>
                <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                  {HABBO_COLORS.map(color => (
                    <button
                      key={color.id}
                      className={cn(
                        "w-full aspect-square rounded-full border-2 transition-all hover:scale-110",
                        figure[selectedPart]?.color === color.id ? 'border-primary scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => handleColorChange(color.id)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


    