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
  Store,
  LogOut,
  BookmarkPlus,
  HeartHandshake,
  BarChart2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';

const publicLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/schedule', label: 'Horarios', icon: Calendar },
  { href: '/news', label: 'Noticias Habbo', icon: Newspaper },
  { href: '/team', label: 'Equipo', icon: Users },
  { href: '/marketplace', label: 'Mercado', icon: Store },
  { href: '/community', label: 'Comunidad', icon: HeartHandshake },
  { href: '/contact', label: 'Contacto', icon: Mail },
];

const authLinks = [
  { href: '/booking', label: 'Reservar Horario', icon: BookmarkPlus },
];

const adminLinks = [
  { href: '/panel', label: 'Panel Admin', icon: Shield },
  { href: '/panel/analytics', label: 'Analíticas', icon: BarChart2 },
  { href: '/docs', label: 'Documentación', icon: BookOpen },
]

const socialLinks = [
    { href: '#', label: 'Twitter', icon: Twitter },
    { href: '#', label: 'Instagram', icon: Instagram },
    { href: '#', label: 'Facebook', icon: Facebook },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  }

  const isLinkActive = (href: string) => {
    return href === '/' ? pathname === href : pathname.startsWith(href);
  }

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
                    isActive={isLinkActive(link.href)}
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
           <SidebarMenuItem>
              <Link href="/request">
                <SidebarMenuButton
                  asChild
                  isActive={isLinkActive('/request')}
                  tooltip="Pide una canción"
                  className="lg:hidden"
                >
                  <span>
                    <Music />
                    <span>Pide una canción</span>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

          {loading ? (
             <div className='p-2 flex flex-col gap-2'>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
             </div>
          ) : user ? (
            <>
            {authLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                    <Link href={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={isLinkActive(link.href)}
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
            {user.isSuperAdmin && adminLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                    <Link href={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={isLinkActive(link.href)}
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
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Cerrar Sesión" onClick={handleLogout}>
                    <span>
                        <LogOut />
                        <span>Cerrar Sesión</span>
                    </span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            </>
          ) : (
            <>
                <SidebarMenuItem>
                    <Link href="/login">
                        <SidebarMenuButton tooltip="Iniciar Sesión" isActive={pathname === '/login'}>
                            <span>
                                <LogIn />
                                <span>Iniciar Sesión</span>
                            </span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/register">
                        <SidebarMenuButton tooltip="Registrarse" isActive={pathname === '/register'}>
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
