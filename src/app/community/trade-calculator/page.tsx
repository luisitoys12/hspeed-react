
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator, ArrowRightLeft, Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const mockItems = [
  { id: '1', name: 'Trono de Dragón', value: 250, imageUrl: 'https://images.habbo.com/dcr/hof_furni/throne/throne.gif' },
  { id: '2', name: 'Sofá HC', value: 5, imageUrl: 'https://files.habboemotion.com/resources/images/furni/club_sofa.gif' },
  { id: '3', name: 'Ventilador Ocre', value: 40, imageUrl: 'https://habbo.es/images/catalogue/icon_38.png' },
  { id: '4', name: 'Heladera Roja', value: 20, imageUrl: 'https://habbo.es/images/catalogue/icon_14.png' },
  { id: '5', name: 'Lingote de Oro', value: 50, imageUrl: 'https://images.habbo.com/c_images/catalogue/icon_121.png' }
];

type TradeItem = { name: string; value: number; imageUrl: string; quantity: number };
type TradeSide = TradeItem[];

function TradeColumn({ side, setSide, title }: { side: TradeSide; setSide: (side: TradeSide) => void; title: string }) {
  const handleRemove = (index: number) => {
    const newSide = [...side];
    newSide.splice(index, 1);
    setSide(newSide);
  };

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {side.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted">
            <div className="flex items-center gap-2">
              <Image src={item.imageUrl} alt={item.name} width={32} height={32} unoptimized />
              <div>
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.value}c x {item.quantity}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleRemove(index)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {side.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">Añade ítems aquí.</p>}
      </CardContent>
    </Card>
  );
}

export default function TradeCalculatorPage() {
  const [yourSide, setYourSide] = useState<TradeSide>([]);
  const [theirSide, setTheirSide] = useState<TradeSide>([]);
  const [tradeResult, setTradeResult] = useState<string | null>(null);

  const addItem = (side: TradeSide, setSide: (s: TradeSide) => void) => {
    const randomItem = mockItems[Math.floor(Math.random() * mockItems.length)];
    const existingItemIndex = side.findIndex(i => i.name === randomItem.name);
    if (existingItemIndex > -1) {
      const newSide = [...side];
      newSide[existingItemIndex].quantity += 1;
      setSide(newSide);
    } else {
      setSide([...side, { ...randomItem, quantity: 1 }]);
    }
  };
  
  const calculateTrade = () => {
    const yourValue = yourSide.reduce((acc, item) => acc + item.value * item.quantity, 0);
    const theirValue = theirSide.reduce((acc, item) => acc + item.value * item.quantity, 0);
    
    if (yourValue > theirValue) {
      setTradeResult(`¡Ganancia! Ganas ${yourValue - theirValue} créditos en este tradeo.`);
    } else if (theirValue > yourValue) {
      setTradeResult(`¡Pérdida! Pierdes ${theirValue - yourValue} créditos en este tradeo.`);
    } else {
      setTradeResult('El tradeo es justo. El valor es igual en ambos lados.');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Calculator className="h-8 w-8 text-primary" />
          Calculadora de Tradeos
        </h1>
        <p className="text-muted-foreground mt-2">
          Añade ítems a cada lado para analizar el valor de tu tradeo.
        </p>
      </div>

       <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Función en Desarrollo</AlertTitle>
        <AlertDescription>
          Esta calculadora usa valores de ejemplo. Los precios reales de los furnis pueden variar.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col lg:flex-row items-start gap-4">
        <TradeColumn side={yourSide} setSide={setYourSide} title="Tu Oferta" />
        <div className="flex items-center justify-center p-4">
          <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
        </div>
        <TradeColumn side={theirSide} setSide={setTheirSide} title="Oferta del Otro" />
      </div>
      
       <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mt-4">
         <Button onClick={() => addItem(yourSide, setYourSide)}><PlusCircle className="mr-2"/> Añadir a tu oferta (ej.)</Button>
         <Button onClick={() => addItem(theirSide, setTheirSide)}><PlusCircle className="mr-2"/> Añadir a su oferta (ej.)</Button>
      </div>


      <div className="mt-8 text-center">
        <Button onClick={calculateTrade} size="lg">
          <Calculator className="mr-2" />
          Calcular Tradeo
        </Button>

        {tradeResult && (
          <Card className="mt-4 max-w-md mx-auto">
            <CardContent className="p-4">
              <p className="font-bold">{tradeResult}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
