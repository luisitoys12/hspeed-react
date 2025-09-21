import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Users, BarChart, Settings, Calendar, Newspaper } from 'lucide-react';
import Link from 'next/link';

const panelLinks = [
    { href: '/panel/team', title: 'Gestión de Equipo', description: 'Añadir o quitar miembros del equipo.', icon: Users },
    { href: '/panel/schedule', title: 'Gestión de Horarios', description: 'Actualizar la programación semanal.', icon: Calendar },
    { href: '#', title: 'Gestión de Noticias', description: 'Publicar y editar artículos de noticias.', icon: Newspaper },
    { href: '/panel/config', title: 'Ajustes Generales', description: 'Configurar URLs de la radio y redes.', icon: Settings },
    { href: '#', title: 'Analíticas', description: 'Ver estadísticas de oyentes y web.', icon: BarChart },
]

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Shield className="h-8 w-8 text-primary" />
          Panel de Administración
        </h1>
        <p className="text-muted-foreground mt-2">
            Gestiona el contenido y la configuración de Ekus FM.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {panelLinks.map(link => (
            <Link href={link.href} key={link.title}>
                <Card className="hover:border-primary transition-colors h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-base md:text-lg">
                        <link.icon /> {link.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                        {link.description}
                        </p>
                    </CardContent>
                </Card>
            </Link>
        ))}
      </div>
       <div className="mt-8 text-center p-8 bg-card rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Este es el centro de control de tu sitio. Las funcionalidades se conectarán a Firebase para gestionar datos en tiempo real.</p>
       </div>
    </div>
  );
}
