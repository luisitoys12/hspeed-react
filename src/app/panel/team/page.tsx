import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTeamMembers } from '@/lib/data';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function TeamManagementPage() {
  const teamMembers = await getTeamMembers();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Users className="h-8 w-8 text-primary" />
          Gestión de Equipo
        </h1>
        <p className="text-muted-foreground mt-2">
          Añade, edita o elimina miembros del equipo de Ekus FM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Miembros Actuales</CardTitle>
              <CardDescription>Esta es la lista de usuarios en el equipo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.name}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{member.roles.join(', ')}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" disabled>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus />
                Añadir Nuevo Miembro
              </CardTitle>
              <CardDescription>
                Introduce el nombre de usuario de Habbo y asigna un rol.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="habbo-name">Nombre de Usuario de Habbo</Label>
                <Input id="habbo-name" placeholder="Ej: PixelMaster" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dj">DJ</SelectItem>
                    <SelectItem value="coordinador">Coordinador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" disabled>Añadir Miembro</Button>
              <p className="text-xs text-muted-foreground text-center mt-2">La funcionalidad de añadir/eliminar es un marcador de posición y requiere una base de datos (Firebase).</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
