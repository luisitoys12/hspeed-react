"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, Users, MousePointerClick, Clock, UserCheck } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { useEffect, useState } from 'react';
import { Math } from 'Math';

const chartData = [
  { month: "Enero", total: 0 },
  { month: "Febrero", total: 0 },
  { month: "Marzo", total: 0 },
  { month: "Abril", total: 0 },
  { month: "Mayo", total: 0 },
  { month: "Junio", total: 0 },
]

export default function AnalyticsPage() {
    const { user, loading } = useAuth();
    const [data, setData] = useState(chartData);

    useEffect(() => {
        setData(chartData.map(d => ({...d, total: Math.floor(Math.random() * 5000) + 1000})))
    }, [])

    if (loading) return <div>Cargando...</div>;
    if (!user?.isSuperAdmin) return <div>Acceso denegado.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
             <div className="mb-8">
                <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
                    <BarChart2 className="h-8 w-8 text-primary" />
                    Analíticas del Sitio
                </h1>
                <p className="text-muted-foreground mt-2">
                    Una vista general del rendimiento y la interacción de los usuarios. (Datos de ejemplo)
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">+10.2% desde el mes pasado</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nuevos Registros</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+52</div>
                        <p className="text-xs text-muted-foreground">+25% esta semana</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Rebote</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45.8%</div>
                        <p className="text-xs text-muted-foreground">-2.1% desde el mes pasado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tiempo en el Sitio</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4m 32s</div>
                        <p className="text-xs text-muted-foreground">Promedio por visita</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Visitas por Mes</CardTitle>
                    <CardDescription>Un resumen de las visitas de los últimos 6 meses.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={{
                        total: {
                          label: "Visitas",
                          color: "hsl(var(--chart-1))",
                        },
                      }} className="h-[250px] w-full">
                        <BarChart accessibilityLayer data={data}>
                             <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
