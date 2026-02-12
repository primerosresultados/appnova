"use client";

import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";

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

const typeConfig: Record<string, { label: string; color: string; cellColor: string; icon: React.ElementType }> = {
    TASK: { label: 'Tarea', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30', cellColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300', icon: CheckSquare },
    PROJECT: { label: 'Proyecto', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', cellColor: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300', icon: FolderKanban },
    CONTRACT: { label: 'Acuerdo', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', cellColor: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300', icon: Handshake },
    CONTENT: { label: 'Contenido', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30', cellColor: 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300', icon: Megaphone },
    MILESTONE: { label: 'Hito', color: 'bg-rose-500/20 text-rose-500 border-rose-500/30', cellColor: 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300', icon: FileText },
};

const WEEKDAYS = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

export function MasterCalendar({ events, users }: MasterCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<string>("all");
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    // Filter events
    const filteredEvents = events.filter(event => {
        const typeMatch = selectedType === "all" || event.type === selectedType;
        const userMatch = selectedUser === "all" || event.assignee?.id === selectedUser;
        return typeMatch && userMatch;
    });

    // Navigation
    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    // Calculate grid days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Get events for a specific day
    const getEventsForDay = (date: Date) => {
        return filteredEvents.filter(e => isSameDay(new Date(e.date), date));
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
                {/* Calendar Header with navigation */}
                <div className="flex items-center justify-between p-4 border-b border-border/30 bg-card/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold capitalize">
                            {format(currentMonth, "MMMM yyyy", { locale: es })}
                        </h2>
                        <div className="flex items-center rounded-md border border-border/50 bg-background/50 shadow-sm">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none rounded-l-md hover:bg-accent" onClick={handlePreviousMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-3 rounded-none border-x border-border/50 font-normal hover:bg-accent text-xs" onClick={handleToday}>
                                Hoy
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none rounded-r-md hover:bg-accent" onClick={handleNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="overflow-auto">
                    <div className="w-full min-w-[800px] flex flex-col">
                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 border-b border-border/50 bg-muted/20">
                            {WEEKDAYS.map((day) => (
                                <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 bg-border/20 gap-px">
                            {calendarDays.map((day) => {
                                const dayEvents = getEventsForDay(day);
                                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                                const isTodayDate = isToday(day);

                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={cn(
                                            "min-h-[120px] bg-card p-2 flex flex-col gap-1 transition-colors hover:bg-accent/5 group relative",
                                            !isCurrentMonth && "bg-muted/10 text-muted-foreground/50",
                                            isTodayDate && "bg-primary/5"
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={cn(
                                                "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                                                isTodayDate ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                                                !isCurrentMonth && "opacity-50"
                                            )}>
                                                {format(day, "d")}
                                            </span>
                                        </div>

                                        {/* Events List */}
                                        <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[150px] scrollbar-none">
                                            {dayEvents.map((event) => {
                                                const config = typeConfig[event.type];
                                                const Icon = config?.icon;
                                                return (
                                                    <div
                                                        key={`${event.type}-${event.id}`}
                                                        className={cn(
                                                            "text-[10px] px-1.5 py-1 rounded border truncate flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-80 transition-opacity",
                                                            config?.cellColor
                                                        )}
                                                        onClick={() => setSelectedEvent(event)}
                                                        title={event.title}
                                                    >
                                                        {Icon && <Icon className="h-3 w-3 shrink-0" />}
                                                        <span className="truncate flex-1">{event.title}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* Event Details Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            {selectedEvent && typeConfig[selectedEvent.type] && (() => {
                                const Icon = typeConfig[selectedEvent.type].icon;
                                const colorClass = selectedEvent.type === 'TASK' ? 'text-emerald-500' :
                                    selectedEvent.type === 'PROJECT' ? 'text-blue-500' :
                                        selectedEvent.type === 'CONTRACT' ? 'text-amber-500' :
                                            selectedEvent.type === 'CONTENT' ? 'text-purple-500' :
                                                'text-rose-500';
                                return <Icon className={`h-5 w-5 ${colorClass}`} />;
                            })()}
                            <DialogTitle>{selectedEvent?.title}</DialogTitle>
                        </div>
                        <DialogDescription>
                            {selectedEvent?.date && format(new Date(selectedEvent.date), "PPP", { locale: es })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                        {selectedEvent && typeConfig[selectedEvent.type] && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Tipo:</span>
                                <Badge variant="outline" className={`text-xs ${typeConfig[selectedEvent.type].color}`}>
                                    {typeConfig[selectedEvent.type].label}
                                </Badge>
                            </div>
                        )}

                        {selectedEvent?.status && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Estado:</span>
                                <Badge variant="secondary">{selectedEvent.status}</Badge>
                            </div>
                        )}

                        {(selectedEvent?.project || selectedEvent?.client) && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {selectedEvent.project ? "Proyecto:" : "Cliente:"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {selectedEvent.project?.name || selectedEvent.client?.name}
                                </span>
                            </div>
                        )}

                        {selectedEvent?.assignee && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Asignado:</span>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <UserIcon className="h-3 w-3" />
                                    {selectedEvent.assignee.name}
                                </span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
