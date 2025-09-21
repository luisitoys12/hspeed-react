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
  LogIn,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const publicLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/schedule', label: 'Horarios', icon: Calendar },
  { href: '/news', label: 'Noticias Habbo', icon: Newspaper },
  { href: '/team', label: 'Equipo', icon: Users },
  { href: '/request', label: 'Pide una canción', icon: Music },
  { href: '/contact', label: 'Contacto', icon: Mail },
];

const authLinks = [
  { href: '/admin', label: 'Panel Admin', icon: Shield },
  { href: '/panel/config', label: 'Configuración', icon: Settings },
  { href: '/docs', label: 'Documentación', icon: BookOpen },
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
          {publicLinks.map((link) => (
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
          ))}

          {user?.isLoggedIn ? (
            authLinks.map((link) => (
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
            ))
          ) : (
            <>
                <SidebarMenuItem>
                    <Link href="#">
                        <SidebarMenuButton tooltip="Iniciar Sesión">
                            <span>
                                <LogIn />
                                <span>Iniciar Sesión</span>
                            </span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="#">
                        <SidebarMenuButton tooltip="Registrarse con código admin">
                            <span>
                                <UserPlus />
                                <span>Registrarse</span>
                            </span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </>
          )}

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
