import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import AppSidebar from '@/components/layout/app-sidebar';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import FloatingPlayer from '@/components/layout/floating-player';
import { Sheet } from '@/components/ui/sheet';

export const metadata: Metadata = {
  title: 'Ekus FM',
  description: 'Tu Radio Oficial de Habbo.es',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar>
            <AppSidebar />
          </Sidebar>
          <SidebarInset>
            <div className="pb-48 md:pb-24">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
        <FloatingPlayer />
        <Toaster />
      </body>
    </html>
  );
}
