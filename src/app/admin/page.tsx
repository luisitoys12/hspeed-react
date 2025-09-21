import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Users, BarChart, Settings } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl md:text-4xl font-headline font-bold">
          <Shield className="h-8 w-8 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-2">
            Manage your Habbospeed station and profile settings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Users /> User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage registered users and their roles.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <BarChart /> Station Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track listener statistics and song request trends.
            </p>
          </CardContent>
        </Card>
         <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Settings /> Content Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Update schedules, news articles, and other content.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Settings /> General Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure station settings and social media links.
            </p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8 text-center p-8 bg-card rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">This is a placeholder for the admin panel. Full functionality would require a backend and authentication.</p>
       </div>
    </div>
  );
}
