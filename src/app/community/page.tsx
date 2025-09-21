import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge, BrainCircuit, Calculator, Dice5, Paintbrush, Pickaxe, BookHeart, Users } from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    title: 'Calculadora de Tradeos',
    description: 'Calcula el valor de tus tradeos para asegurarte de que son justos.',
    icon: Calculator,
    isNew: true,
    href: '#',
    disabled: true
  },
  {
    title: 'Generador de Nombres',
    description: '¿Sin inspiración? Genera nombres de usuario únicos al estilo Habbo.',
    icon: BrainCircuit,
    isNew: false,
    href: '#',
    disabled: true
  },
  {
    title: 'Sorteos y Loterías',
    description: 'Participa en sorteos automáticos para ganar premios exclusivos.',
    icon: Dice5,
    isNew: false,
    href: '#',
    disabled: true
  },
  {
    title: 'Diseñador de Avatares',
    description: 'Prueba combinaciones de ropa y accesorios antes de comprarlos.',
    icon: Paintbrush,
    isNew: false,
    href: '#',
    disabled: true
  },
    {
    title: 'Guías de Wired',
    description: 'Consulta guías y tutoriales para dominar el arte del Wired.',
    icon: BookHeart,
    isNew: false,
    href: '/news',
    disabled: false
  },
  {
    title: 'Valor de Raros',
    description: 'Consulta una lista actualizada del valor de los furnis raros.',
    icon: Pickaxe,
    isNew: false,
    href: '/marketplace',
    disabled: false
  },
];

export default function CommunityPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Users className="h-8 w-8 text-primary" />
          Comunidad y Utilidades
        </h1>
        <p className="text-muted-foreground mt-2">
          Herramientas, guías y funciones para enriquecer tu experiencia en Habbo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
            <Card key={tool.title} className={`flex flex-col ${tool.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:shadow-lg transition-all'}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="p-3 bg-muted rounded-lg">
                        <tool.icon className="h-6 w-6 text-primary" />
                    </div>
                    {tool.isNew && <Badge>Nuevo</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardTitle className="font-headline text-lg mb-2">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
              {tool.disabled && (
                  <div className="p-6 pt-0">
                      <Badge variant="outline">Próximamente</Badge>
                  </div>
              )}
            </Card>
        ))}
      </div>
    </div>
  );
}
