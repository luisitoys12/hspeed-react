

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
  LogIn,
  UserPlus,
  Store,
  LogOut,
  LayoutDashboard,
  HeartHandshake,
  Info,
  Library,
  Gem,
  Award,
  Sprout,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';

const publicLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/schedule', label: 'Horarios', icon: Calendar },
  { href: '/news', label: 'Noticias Habbo', icon: Newspaper },
  { href: '/origins', label: 'Origins', icon: Sprout },
  { href: '/team', label: 'Equipo', icon: Users },
  { href: '/community', label: 'Comunidad', icon: HeartHandshake },
  { href: '/awards', label: 'Premios', icon: Award },
  { href: '/catalog', label: 'Catálogo', icon: Store },
  { href: '/contact', label: 'Contacto', icon: Mail },
];

const authLinks = [
  { href: '/dj-panel', label: 'Panel de DJ', icon: LayoutDashboard },
];

const adminLinks = [
  { href: '/panel', label: 'Panel Admin', icon: Shield },
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
  const [logoUrl, setLogoUrl] = useState("https://i.imgur.com/u31XFxN.png");

  useEffect(() => {
    const logoRef = ref(db, 'config/logoUrl');
    const unsubscribe = onValue(logoRef, (snapshot) => {
        const url = snapshot.val();
        if (url) {
            setLogoUrl(url);
        }
    });
    return () => unsubscribe();
  }, [])

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
            <Link href="/" className="flex items-center gap-2">
                 <Image src={logoUrl} alt="Habbospeed Logo" width={160} height={40} unoptimized />
            </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {user && (
             <div className='px-4 py-2 mb-2'>
                <Link href={`/profile/${user.displayName}`}>
                    <div className='p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80'>
                        <p className='text-sm font-bold'>{user.displayName}</p>
                        <div className='flex items-center gap-2 text-xs text-yellow-400'>
                            <Gem className='h-3 w-3'/>
                            <span>{user.speedPoints} Speed Points</span>
                        </div>
                    </div>
                </Link>
             </div>
          )}

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
