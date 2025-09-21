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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/news', label: 'Habbo News', icon: Newspaper },
  { href: '/request', label: 'Request Song', icon: Music },
  { href: '/contact', label: 'Contact', icon: Mail },
  { href: '/admin', label: 'Admin Panel', icon: Shield },
];

const socialLinks = [
    { href: '#', label: 'Twitter', icon: Twitter },
    { href: '#', label: 'Instagram', icon: Instagram },
    { href: '#', label: 'Facebook', icon: Facebook },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary">
                <Radio className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-headline font-bold text-primary">Habbospeed</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  tooltip={link.label}
                >
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
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
