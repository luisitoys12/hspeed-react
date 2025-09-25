
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gem, LoaderCircle, Store, ShoppingCart, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CatalogItem {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    stock: number;
}

export default function CatalogPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const itemsRef = ref(db, 'catalogItems');
        const unsubscribe = onValue(itemsRef, (snapshot) => {
            const data = snapshot.val();
            const itemsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            setItems(itemsArray);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handlePurchase = (item: CatalogItem) => {
        // Lógica de compra aquí
        alert(`Has intentado comprar ${item.name} por ${item.price} Speed Points.`);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-8">
                <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
                    <Store className="h-8 w-8 text-primary" />
                    Catálogo de Recompensas
                </h1>
                <p className="text-muted-foreground mt-2">
                    ¡Gasta tus Speed Points en recompensas exclusivas!
                </p>
            </div>

            {user && (
                 <Card className="mb-8 max-w-sm mx-auto">
                    <CardHeader className='text-center'>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Gem className="h-6 w-6 text-yellow-400" />
                            Mis Speed Points
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-4xl font-bold">{user.speedPoints}</p>
                    </CardContent>
                </Card>
            )}

            <Alert variant="destructive" className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Función en Desarrollo</AlertTitle>
                <AlertDescription>
                   El sistema de Speed Points y el catálogo están en construcción. La función de compra no está habilitada.
                </AlertDescription>
            </Alert>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-4"><Skeleton className="w-full h-64" /></CardContent></Card>
                    ))
                ) : items.length > 0 ? (
                    items.map(item => (
                        <Card key={item.id} className="flex flex-col">
                            <CardHeader>
                                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center p-4">
                                    <Image src={item.imageUrl} alt={item.name} width={100} height={100} unoptimized/>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                                <CardTitle className="font-headline text-lg">{item.name}</CardTitle>
                                <CardDescription className="text-xs flex-grow mt-1">{item.description}</CardDescription>
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground">{item.stock} en stock</p>
                                    <div className="flex items-center gap-1 font-bold text-lg text-yellow-400">
                                        <Gem className="h-4 w-4"/> {item.price}
                                    </div>
                                    <Button className="w-full mt-2" onClick={() => handlePurchase(item)} disabled>
                                        <ShoppingCart className="mr-2"/> Comprar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="col-span-full text-center text-muted-foreground py-16">No hay artículos en el catálogo en este momento.</p>
                )}
            </div>
        </div>
    );
}
