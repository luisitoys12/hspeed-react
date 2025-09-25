import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import AppSidebar from '@/components/layout/app-sidebar';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AuthProvider } from '@/hooks/use-auth';
import Footer from '@/components/layout/footer';
import FloatingPlayer from '@/components/layout/floating-player';


export const metadata: Metadata = {
  title: 'Habbospeed',
  description: 'Tu comunidad de Habbo Hotel.',
  manifest: '/manifest.json',
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
        <meta name="theme-color" content="#26224C" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
            <SidebarProvider>
            <Sidebar>
                <AppSidebar />
            </Sidebar>
            <SidebarInset>
                <div className="flex flex-col min-h-screen">
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                </div>
            </SidebarInset>
            </SidebarProvider>
            <FloatingPlayer />
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
