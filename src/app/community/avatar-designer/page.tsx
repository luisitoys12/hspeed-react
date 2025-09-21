
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paintbrush, Shirt, Palette, Download, Redo, Undo } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const clothingItems = [
  { id: 'h', name: 'Pelo' },
  { id: 'c', name: 'Camisa' },
  { id: 'l', name: 'Pantalón' },
  { id: 's', name: 'Zapatos' },
  { id: 'a', name: 'Accesorio' },
];

const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#ffffff', '#000000'];

export default function AvatarDesignerPage() {
  const [selectedClothing, setSelectedClothing] = useState('c');
  const [selectedColor, setSelectedColor] = useState('#3f51b5');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Paintbrush className="h-8 w-8 text-primary" />
          Diseñador de Avatares
        </h1>
        <p className="text-muted-foreground mt-2">
          Prueba combinaciones de ropa y accesorios. (Función en desarrollo)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Preview */}
        <div className="lg:col-span-1 flex flex-col items-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Vista Previa</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <Image src="https://www.habbo.es/habbo-imaging/avatarimage?figure=hr-100-61.hd-209-1.ch-215-66.lg-275-82.sh-290-81&direction=3&head_direction=3&action=wav&gesture=sml&size=l" alt="Avatar Preview" width={150} height={250} unoptimized />
                    </div>
                     <div className="flex justify-center gap-2 mt-4">
                        <Button variant="outline" size="icon" disabled><Undo/></Button>
                        <Button variant="outline" size="icon" disabled><Redo/></Button>
                        <Button className="flex-grow" disabled><Download className="mr-2"/> Guardar Look</Button>
                    </div>
                 </CardContent>
            </Card>
        </div>

        {/* Customization Options */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Personalización</CardTitle>
              <CardDescription>Selecciona una prenda y luego un color.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-headline mb-2 flex items-center gap-2"><Shirt/> Prendas</h3>
                <div className="flex flex-wrap gap-2">
                  {clothingItems.map(item => (
                    <Button key={item.id} variant={selectedClothing === item.id ? 'default' : 'secondary'} onClick={() => setSelectedClothing(item.id)} disabled>
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-headline mb-2 flex items-center gap-2"><Palette/> Paleta de Colores</h3>
                <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={cn("w-full aspect-square rounded-full border-2 transition-all", selectedColor === color ? 'border-primary scale-110' : 'border-transparent')}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      disabled
                    />
                  ))}
                </div>
              </div>
               <p className="text-sm text-center text-muted-foreground pt-4">Esta es una demostración visual. La funcionalidad completa llegará pronto.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
