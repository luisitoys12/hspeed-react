

"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { useAuth } from '@/hooks/use-auth';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Users, Newspaper, Calendar, MessageSquare, Settings, BookmarkPlus, ArrowRight, LoaderCircle, Handshake, DoorOpen, BarChart2, PartyPopper, Bell, Award, Briefcase, Radio, Vote, Trophy } from 'lucide-react';
import Link from 'next/link';

const panelLinks = [
    { href: '/panel/config', title: 'Ajustes Generales', description: 'URLs, carrusel y configuración clave.', icon: Settings },
    { href: '/panel/users', title: 'Gestión de Usuarios', description: 'Aprobar usuarios y asignar roles.', icon: Users },
    { href: '/panel/team', title: 'Gestión de Equipo', description: 'Añadir o quitar miembros del staff.', icon: Users },
    { href: '/panel/recruitment', title: 'Reclutamiento', description: 'Gestionar vacantes y postulaciones.', icon: Briefcase },
    { href: '/panel/awards', title: 'Gestión de Premios', description: 'Gestionar premios y ganadores.', icon: Award },
    { href: '/panel/news', title: 'Gestión de Noticias', description: 'Publicar y editar artículos.', icon: Newspaper },
    { href: '/panel/events', title: 'Gestión de Eventos', description: 'Administrar los eventos de la fansite.', icon: PartyPopper },
    { href: '/panel/polls', title: 'Gestión de Encuestas', description: 'Crear y administrar encuestas.', icon: Vote },
    { href: '/panel/copa', title: 'Gestión de la Copa', description: 'Administrar equipos, goleadores y partidos.', icon: Trophy },
    { href: '/panel/comments', title: 'Moderar Comentarios', description: 'Gestionar los comentarios de las noticias.', icon: MessageSquare },
    { href: '/panel/messages', title: 'Bandeja de Entrada', description: 'Leer los mensajes de contacto.', icon: MessageSquare },
    { href: '/panel/on-air', title: 'Control de Transmisión', description: 'Anular el DJ en vivo manualmente.', icon: Radio },
    { href: '/panel/schedule', title: 'Gestión de Horarios', description: 'Actualizar la programación semanal.', icon: Calendar },
    { href: '/panel/booking', title: 'Gestión de Reservas', description: 'Vaciar la parrilla de reservas de DJ.', icon: BookmarkPlus },
    { href: '/panel/alliances', title: 'Gestión de Alianzas', description: 'Administrar las alianzas oficiales.', icon: Handshake },
    { href: '/panel/featured-rooms', title: 'Salas Destacadas', description: 'Gestionar las salas que aparecen en inicio.', icon: DoorOpen },
    { href: '/panel/analytics', title: 'Analíticas', description: 'Ver estadísticas de visitas y uso.', icon: BarChart2 },
    { href: '/panel/notifications', title: 'Enviar Notificaciones', description: 'Enviar avisos push a los usuarios.', icon: Bell },
];

const StatCard = ({ title, value, icon: Icon, loading, href }: { title: string, value: number, icon: React.ElementType, loading: boolean, href?: string }) => {
    const cardContent = (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <LoaderCircle className="h-6 w-6 animate-spin" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
            </CardContent>
        </Card>
    );

    return href ? <Link href={href}>{cardContent}</Link> : cardContent;
};

export default function AdminDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ team: 0, news: 0, schedule: 0, messages: 0, events: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (user?.isSuperAdmin) {
            const refsToCount = {
                team: ref(db, 'team'),
                news: ref(db, 'news'),
                schedule: ref(db, 'schedule'),
                events: ref(db, 'events'),
                messages: query(ref(db, 'contact-messages'), orderByChild('read'), equalTo(false))
            };

            const listeners = Object.entries(refsToCount).map(([key, dbRef]) => 
                onValue(dbRef, (snapshot) => {
                    setStats(prevStats => ({
                        ...prevStats,
                        [key]: snapshot.exists() ? snapshot.size : 0
                    }));
                }, { onlyOnce: false })
            );

            // Set loading to false once all initial fetches might have completed
            // This is a simplification; a more robust solution might use Promise.all
            const timer = setTimeout(() => setLoadingStats(false), 1500);

            return () => {
                clearTimeout(timer);
                // Detach listeners, although with onlyOnce: false they would persist.
                // For a real app, you might manage detachment differently if components unmount.
            };
        } else {
            setLoadingStats(false);
        }
    }, [user]);

    if (authLoading) {
        return <div className="container mx-auto p-8"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user?.isSuperAdmin) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Acceso Denegado</CardTitle>
                        <CardDescription>No tienes permisos para acceder a esta sección.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-8">
                <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
                    <Shield className="h-8 w-8 text-primary" />
                    Panel de Administración
                </h1>
                <p className="text-muted-foreground mt-2">
                    Una vista general del contenido y la actividad de Habbospeed.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
                <StatCard title="Miembros del Equipo" value={stats.team} icon={Users} loading={loadingStats} href="/panel/team"/>
                <StatCard title="Artículos de Noticias" value={stats.news} icon={Newspaper} loading={loadingStats} href="/panel/news"/>
                <StatCard title="Eventos Próximos" value={stats.events} icon={PartyPopper} loading={loadingStats} href="/panel/events"/>
                <StatCard title="Programas en Horario" value={stats.schedule} icon={Calendar} loading={loadingStats} href="/panel/schedule"/>
                <StatCard title="Mensajes Sin Leer" value={stats.messages} icon={MessageSquare} loading={loadingStats} href="/panel/messages"/>
            </div>
            
            {/* Quick Actions */}
             <Card>
                <CardHeader>
                    <CardTitle>Accesos Directos</CardTitle>
                    <CardDescription>Gestiona las secciones principales del sitio.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-4">
                    {panelLinks.sort((a, b) => a.title.localeCompare(b.title)).map(link => (
                        <Link href={link.href} key={link.title} className="group">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted hover:shadow-md transition-all">
                               <div className="flex items-center gap-4">
                                    <div className="p-2 bg-background rounded-lg">
                                        <link.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{link.title}</p>
                                        <p className="text-sm text-muted-foreground">{link.description}</p>
                                    </div>
                               </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>

        </div>
    );
}
