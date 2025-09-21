'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  Music,
  Calendar,
  Newspaper,
  Mail,
  Shield,
  Radio,
  Twitter,
  Instagram,
  Facebook,
  Users,
  BookOpen,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const links = [
  { href: '/', label: 'Inicio', icon: Home, auth: false },
  { href: '/schedule', label: 'Horarios', icon: Calendar, auth: false },
  { href: '/news', label: 'Noticias Habbo', icon: Newspaper, auth: false },
  { href: '/team', label: 'Equipo', icon: Users, auth: false },
  { href: '/request', label: 'Pide una canción', icon: Music, auth: false },
  { href: '/contact', label: 'Contacto', icon: Mail, auth: false },
  { href: '/admin', label: 'Panel Admin', icon: Shield, auth: true },
  { href: '/panel/config', label: 'Configuración', icon: Settings, auth: true },
  { href: '/docs', label: 'Documentación', icon: BookOpen, auth: true },
];

const socialLinks = [
    { href: '#', label: 'Twitter', icon: Twitter },
    { href: '#', label: 'Instagram', icon: Instagram },
    { href: '#', label: 'Facebook', icon: Facebook },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary">
                <Radio className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-headline font-bold text-primary">Ekus FM</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => {
            if (link.auth && !user?.isLoggedIn) {
              return null;
            }
            return (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === link.href}
                    tooltip={link.label}
                  >
                    <span>
                      <link.icon />
                      <span>{link.label}</span>
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-center gap-2">
            {socialLinks.map((link) => (
                <Button key={link.label} variant="ghost" size="icon" asChild>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                        <link.icon className="h-5 w-5" />
                    </a>
                </Button>
            ))}
        </div>
      </SidebarFooter>
    </>
  );
}
