import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Radio } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeaderCard } from "@/components/PageHeaderCard";
import type { Schedule } from "@shared/schema";

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const DAY_COLORS: Record<string, string> = {
  Lunes: "border-blue-500/30 bg-blue-500/5",
  Martes: "border-green-500/30 bg-green-500/5",
  Miércoles: "border-yellow-500/30 bg-yellow-500/5",
  Jueves: "border-orange-500/30 bg-orange-500/5",
  Viernes: "border-pink-500/30 bg-pink-500/5",
  Sábado: "border-purple-500/30 bg-purple-500/5",
  Domingo: "border-red-500/30 bg-red-500/5",
};

export default function SchedulePage() {
  const { data: schedule, isLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/schedule"],
  });

  const byDay: Record<string, Schedule[]> = {};
  (schedule || []).forEach((s) => {
    if (!byDay[s.day]) byDay[s.day] = [];
    byDay[s.day].push(s);
    byDay[s.day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return (
    <PageContainer>
      <PageHeaderCard
        title="Horarios de DJ"
        description="Consulta la programación semanal de radio y programas en vivo de HabboSpeed."
        icon={<Clock className="w-5 h-5 text-amber-500" />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-14" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAYS.map((day) => {
            const slots = byDay[day] || [];
            return (
              <Card
                key={day}
                className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden ${DAY_COLORS[day] || ""}`}
                data-testid={`card-day-${day}`}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    {day}
                    <Badge
                      variant="outline"
                      className="text-[9px] border-slate-200 dark:border-slate-800"
                    >
                      {slots.length} shows
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  {slots.length > 0 ? (
                    slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-800"
                        data-testid={`slot-${slot.id}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Radio className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 truncate">
                            {slot.showName}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                          {slot.djName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {slot.startTime} – {slot.endTime}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-[11px] text-slate-400">
                        Sin programación
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && Object.keys(byDay).length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay horarios configurados aún</p>
        </div>
      )}
    </PageContainer>
  );
}
