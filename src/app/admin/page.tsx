import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Users, BarChart, Settings } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl md:text-4xl font-headline font-bold">
          <Shield className="h-8 w-8 text-primary" />
          Panel de Administración
        </h1>
        <p className="text-muted-foreground mt-2">
            Gestiona tu estación Ekus FM y la configuración de perfiles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Users /> Gestión de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ver y gestionar usuarios registrados y sus roles.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <BarChart /> Analíticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Rastrea estadísticas de oyentes y tendencias de canciones.
            </p>
          </CardContent>
        </Card>
         <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Settings /> Gestión de Contenido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Actualiza horarios, noticias y otro contenido.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Settings /> Ajustes Generales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configura los ajustes de la estación y redes sociales.
            </p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8 text-center p-8 bg-card rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Este es un marcador de posición para el panel de administración. La funcionalidad completa requeriría un backend y autenticación (Firebase).</p>
       </div>
    </div>
  );
}