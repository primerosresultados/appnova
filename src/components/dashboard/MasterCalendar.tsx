"use client";

import { useState, useEffect } from "react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Filter,
    CheckSquare,
    FolderKanban,
    FileText,
    Megaphone,
    Handshake,
    User as UserIcon
} from "lucide-react";

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'TASK' | 'PROJECT' | 'CONTRACT' | 'CONTENT' | 'MILESTONE';
    status?: string;
    assignee?: { id: string; name: string } | null;
    client?: { name: string } | null;
    project?: { name: string } | null;
}

interface MasterCalendarProps {
    events: CalendarEvent[];
    users: { id: string; name: string }[];
}

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    TASK: { label: 'Tarea', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30', icon: CheckSquare },
    PROJECT: { label: 'Proyecto', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: FolderKanban },
    CONTRACT: { label: 'Acuerdo', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', icon: Handshake },
    CONTENT: { label: 'Contenido', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30', icon: Megaphone },
    MILESTONE: { label: 'Hito', color: 'bg-rose-500/20 text-rose-500 border-rose-500/30', icon: FileText },
};

export function MasterCalendar({ events, users }: MasterCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<string>("all");

    // Filter events
    const filteredEvents = events.filter(event => {
        const typeMatch = selectedType === "all" || event.type === selectedType;
        const userMatch = selectedUser === "all" || event.assignee?.id === selectedUser;
        return typeMatch && userMatch;
    });

    // Events for selected date
    const selectedDateEvents = selectedDate
        ? filteredEvents.filter(e => isSameDay(new Date(e.date), selectedDate))
        : [];

    // Function to check if a day has events
    const hasEventsOnDay = (day: Date) => {
        return filteredEvents.some(e => isSameDay(new Date(e.date), day));
    };

    // Get event types for a day (for multi-color dots)
    const getEventTypesForDay = (day: Date): string[] => {
        return [...new Set(filteredEvents
            .filter(e => isSameDay(new Date(e.date), day))
            .map(e => e.type)
        )];
    };

    return (
        <Card className="bg-card backdrop-blur-md border border-border/40 shadow-xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle className="text-lg font-bold">Calendario Maestro</CardTitle>
                            <CardDescription className="text-xs">
                                Todas las tareas, proyectos, acuerdos y contenidos programados.
                            </CardDescription>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex">
                        {/* Type Filter */}
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-full md:w-[140px] h-9 text-xs">
                                <Filter className="h-3 w-3 mr-1" />
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="TASK">Tareas</SelectItem>
                                <SelectItem value="PROJECT">Proyectos</SelectItem>
                                <SelectItem value="CONTRACT">Acuerdos</SelectItem>
                                <SelectItem value="CONTENT">Contenido</SelectItem>
                                <SelectItem value="MILESTONE">Hitos</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* User Filter */}
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger className="w-full md:w-[140px] h-9 text-xs">
                                <UserIcon className="h-3 w-3 mr-1" />
                                <SelectValue placeholder="Usuario" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                    {/* Calendar */}
                    <div className="p-5 md:p-6 flex-1 border-b lg:border-b-0 lg:border-r border-border/30">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <h3 className="text-sm font-bold uppercase tracking-wider">
                                {format(currentMonth, 'MMMM yyyy', { locale: es })}
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            locale={es}
                            className="rounded-md w-full"
                            classNames={{
                                root: "w-full",
                                months: "w-full",
                                month: "w-full space-y-4",
                                caption: "hidden",
                                caption_label: "hidden",
                                nav: "hidden",
                                table: "w-full border-collapse",
                                head_row: "flex w-full mb-2",
                                head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "h-9 w-full text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/50 hover:text-accent-foreground rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 mx-auto",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm",
                                day_today: "bg-accent/40 text-accent-foreground font-bold border border-primary/20",
                                day_outside: "text-muted-foreground/30 opacity-50",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_hidden: "invisible",
                            }}
                            modifiers={{
                                hasEvents: (day) => hasEventsOnDay(day)
                            }}
                            modifiersStyles={{
                                hasEvents: {
                                    fontWeight: 'bold',
                                    textDecoration: 'underline',
                                    textDecorationColor: 'var(--primary)',
                                    textUnderlineOffset: '3px'
                                }
                            }}
                        />
                    </div>

                    {/* Events List */}
                    <div className="w-full lg:w-[350px] p-5 md:p-6">
                        <h4 className="text-sm font-bold mb-4">
                            {selectedDate
                                ? format(selectedDate, "d 'de' MMMM", { locale: es })
                                : "Selecciona una fecha"}
                        </h4>
                        <ScrollArea className="h-[300px]">
                            {selectedDateEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <CalendarIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-xs text-muted-foreground">
                                        No hay eventos para este día.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedDateEvents.map((event) => {
                                        const config = typeConfig[event.type];
                                        const Icon = config.icon;
                                        return (
                                            <div
                                                key={event.id}
                                                className={`p-3 rounded-lg border ${config.color}`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-medium text-sm truncate">{event.title}</h5>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            <Badge variant="outline" className="text-[9px] h-4">
                                                                {config.label}
                                                            </Badge>
                                                            {event.status && (
                                                                <Badge variant="secondary" className="text-[9px] h-4">
                                                                    {event.status}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {(event.project || event.client) && (
                                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                                {event.project?.name || event.client?.name}
                                                            </p>
                                                        )}
                                                        {event.assignee && (
                                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                                                <UserIcon className="h-2.5 w-2.5" />
                                                                {event.assignee.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
