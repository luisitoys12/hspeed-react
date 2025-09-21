'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockRequests = [
  { id: 1, song: 'Dua Lipa - Houdini', user: 'DJ-Pixel', time: 'Hace 2 minutos' },
  { id: 2, song: 'The Weeknd - Blinding Lights', user: 'luisalegre', time: 'Hace 5 minutos' },
  { id: 3, song: 'Shakira - Bzrp Music Sessions, Vol. 53', user: 'FanDeHabbo', time: 'Hace 10 minutos' },
  { id: 4, song: 'Bad Bunny - Monaco', user: 'HabboFan2024', time: 'Hace 15 minutos' },
];

export default function SongRequests() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Peticiones de Canciones</CardTitle>
        <CardDescription>
          Aquí puedes ver las últimas peticiones de los oyentes. (Datos de ejemplo)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canción y Artista</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.song}</TableCell>
                  <TableCell>{request.user}</TableCell>
                  <TableCell className="text-muted-foreground">{request.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
