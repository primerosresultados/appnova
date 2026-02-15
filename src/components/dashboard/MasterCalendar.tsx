"use client";

import { useState, useMemo } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    User as UserIcon,
    Clock,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CalendarEvent {
    id: string;
    title: string;
    description?: string | null;
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

const typeConfig: Record<string, { label: string; color: string; bg: string; accent: string; dot: string; icon: React.ElementType; borderColor: string }> = {
    TASK: { label: 'Tarea', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500/8 dark:bg-emerald-500/15', accent: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500', icon: CheckSquare, borderColor: '#10b981' },
    PROJECT: { label: 'Proyecto', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-500/8 dark:bg-blue-500/15', accent: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-500', icon: FolderKanban, borderColor: '#3b82f6' },
    CONTRACT: { label: 'Acuerdo', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-500/8 dark:bg-amber-500/15', accent: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500', icon: Handshake, borderColor: '#f59e0b' },
    CONTENT: { label: 'Contenido', color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-500/8 dark:bg-violet-500/15', accent: 'bg-violet-500/10 border-violet-500/20', dot: 'bg-violet-500', icon: Megaphone, borderColor: '#8b5cf6' },
    MILESTONE: { label: 'Hito', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-500/8 dark:bg-rose-500/15', accent: 'bg-rose-500/10 border-rose-500/20', dot: 'bg-rose-500', icon: FileText, borderColor: '#f43f5e' },
};

const statusLabels: Record<string, string> = {
    TODO: 'Pendiente',
    IN_PROGRESS: 'En Progreso',
    REVIEW: 'Revisión',
    DONE: 'Completado',
};

const WEEKDAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const WEEKDAYS_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

export function MasterCalendar({ events, users }: MasterCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<string>("all");
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedDay, setSelectedDay] = useState<Date>(new Date());
    const [showExpandedDay, setShowExpandedDay] = useState(false);

    // Filter events
    const filteredEvents = useMemo(() => events.filter(event => {
        const typeMatch = selectedType === "all" || event.type === selectedType;
        const userMatch = selectedUser === "all" || event.assignee?.id === selectedUser;
        return typeMatch && userMatch;
    }), [events, selectedType, selectedUser]);

    // Navigation
    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    // Calculate grid days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Get events for a specific day
    const getEventsForDay = (date: Date) => {
        return filteredEvents.filter(e => isSameDay(new Date(e.date), date));
    };

    // Summary counts for header
    const monthEvents = useMemo(() => {
        return filteredEvents.filter(e => {
            const date = new Date(e.date);
            return date >= monthStart && date <= monthEnd;
        });
    }, [filteredEvents, monthStart, monthEnd]);

    return (
        <Card className="bg-card border border-border/50 shadow-lg overflow-hidden rounded-xl">
            {/* Header */}
            <div className="px-4 py-3 md:px-5 md:py-4 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Title + Nav */}
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <CalendarIcon className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold capitalize leading-tight">
                                {format(currentMonth, "MMMM yyyy", { locale: es })}
                            </h2>
                            <p className="text-[11px] text-muted-foreground">
                                {monthEvents.length} evento{monthEvents.length !== 1 ? 's' : ''} este mes
                            </p>
                        </div>
                        <div className="flex items-center rounded-lg border border-border/50 bg-muted/30 ml-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-l-lg rounded-r-none" onClick={handlePreviousMonth}>
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-3 rounded-none border-x border-border/40 text-[11px] font-medium" onClick={handleToday}>
                                Hoy
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-r-lg rounded-l-none" onClick={handleNextMonth}>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Right: Filters */}
                    <div className="flex items-center gap-2">
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-[120px] h-8 text-xs border-border/40">
                                <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
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
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger className="w-[120px] h-8 text-xs border-border/40">
                                <UserIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                                <SelectValue placeholder="Usuario" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <CardContent className="p-0">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 bg-muted/20 border-b border-border/30">
                    {WEEKDAYS.map((day, i) => (
                        <div key={day} className={cn(
                            "py-2 text-center text-[10px] font-semibold uppercase tracking-widest",
                            i >= 5 ? "text-muted-foreground/50" : "text-muted-foreground/70"
                        )}>
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                        const dayEvents = getEventsForDay(day);
                        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                        const isTodayDate = isToday(day);
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        const isSelected = isSameDay(day, selectedDay);

                        // Add borders: right border except last col, bottom border except last row
                        const col = idx % 7;
                        const row = Math.floor(idx / 7);
                        const totalRows = Math.ceil(calendarDays.length / 7);

                        return (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "min-h-[50px] md:min-h-[120px] p-1 md:p-1.5 flex flex-col transition-colors cursor-pointer group",
                                    // Borders
                                    col < 6 && "border-r border-border/20",
                                    row < totalRows - 1 && "border-b border-border/20",
                                    // Background
                                    !isCurrentMonth && "bg-muted/5",
                                    isWeekend && isCurrentMonth && "bg-muted/8",
                                    isTodayDate && "bg-primary/[0.06]",
                                    isSelected && "bg-primary/[0.04]",
                                    // Hover
                                    "hover:bg-accent/10"
                                )}
                                onClick={() => setSelectedDay(day)}
                            >
                                {/* Day number */}
                                <div className="flex items-center justify-between mb-0.5 px-0.5">
                                    <span className={cn(
                                        "text-[11px] md:text-xs font-medium h-5 w-5 md:h-6 md:w-6 flex items-center justify-center rounded-full transition-colors",
                                        isTodayDate
                                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                                            : isCurrentMonth
                                                ? "text-foreground/70"
                                                : "text-muted-foreground/30"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                    {dayEvents.length > 3 && (
                                        <span className="text-[9px] text-muted-foreground/50 hidden md:block">
                                            +{dayEvents.length - 3}
                                        </span>
                                    )}
                                </div>

                                {/* Mobile: dots */}
                                {dayEvents.length > 0 && (
                                    <div className="flex flex-wrap gap-[3px] mt-0.5 px-0.5 md:hidden">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <span key={`${event.type}-${event.id}`} className={cn("h-[5px] w-[5px] rounded-full", typeConfig[event.type]?.dot)} />
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <span className="text-[7px] text-muted-foreground/50">+{dayEvents.length - 3}</span>
                                        )}
                                    </div>
                                )}

                                {/* Desktop: clean event pills */}
                                <div className="hidden md:flex flex-col gap-[2px] overflow-hidden flex-1">
                                    {dayEvents.slice(0, 3).map((event) => {
                                        const config = typeConfig[event.type];
                                        return (
                                            <button
                                                key={`${event.type}-${event.id}`}
                                                className={cn(
                                                    "w-full text-left text-[10px] leading-tight px-1.5 py-[3px] rounded-[4px] font-medium transition-all",
                                                    "hover:opacity-80 hover:shadow-sm",
                                                    config?.bg,
                                                    config?.color,
                                                )}
                                                style={{ borderLeft: `2.5px solid ${config?.borderColor}` }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedEvent(event);
                                                }}
                                                title={`${event.project?.name || ''} — ${event.title}`}
                                            >
                                                {event.project ? (
                                                    <>
                                                        <span className="block truncate font-bold">{event.project.name}</span>
                                                        <span className="block truncate text-[9px] opacity-70 font-normal">{event.title}</span>
                                                    </>
                                                ) : (
                                                    <span className="truncate block">{event.title}</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                    {dayEvents.length > 3 && (
                                        <button
                                            className="text-[9px] text-muted-foreground/60 font-medium text-center hover:text-primary transition-colors py-[2px]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDay(day);
                                                setShowExpandedDay(true);
                                            }}
                                        >
                                            +{dayEvents.length - 3} más
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Selected day panel (mobile always, desktop when +N más clicked) */}
                {(() => {
                    const dayEvents = getEventsForDay(selectedDay);
                    if (dayEvents.length === 0) return null;
                    return (
                        <div className={cn(
                            "border-t border-border/30 p-3 bg-muted/5",
                            showExpandedDay ? "block" : "md:hidden"
                        )}>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold capitalize text-muted-foreground">
                                    {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
                                </h4>
                                {showExpandedDay && (
                                    <button
                                        onClick={() => setShowExpandedDay(false)}
                                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        ✕ Cerrar
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                {dayEvents.map((event) => {
                                    const config = typeConfig[event.type];
                                    const Icon = config?.icon;
                                    return (
                                        <div
                                            key={`mobile-${event.type}-${event.id}`}
                                            className={cn(
                                                "p-2.5 rounded-lg flex items-center gap-2.5 cursor-pointer active:scale-[0.98] transition-all",
                                                config?.bg,
                                            )}
                                            style={{ borderLeft: `3px solid ${config?.borderColor}` }}
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-xs font-semibold truncate", config?.color)}>{event.title}</p>
                                                {event.project && (
                                                    <p className="text-[10px] text-muted-foreground truncate">{event.project.name}</p>
                                                )}
                                            </div>
                                            <Badge variant="outline" className={cn("text-[8px] h-4 shrink-0")}>{config?.label}</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
            </CardContent>

            {/* Event Detail Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            {selectedEvent && typeConfig[selectedEvent.type] && (() => {
                                const config = typeConfig[selectedEvent.type];
                                const Icon = config.icon;
                                return (
                                    <div
                                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${config.borderColor}15`, border: `1px solid ${config.borderColor}30` }}
                                    >
                                        <Icon className="h-5 w-5" style={{ color: config.borderColor }} />
                                    </div>
                                );
                            })()}
                            <div className="min-w-0">
                                <DialogTitle className="text-base leading-tight">{selectedEvent?.title}</DialogTitle>
                                <DialogDescription className="flex items-center gap-1.5 mt-1 text-xs">
                                    <Clock className="h-3 w-3" />
                                    {selectedEvent?.date && format(new Date(selectedEvent.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3 pt-2">
                        {/* Type & Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {selectedEvent && typeConfig[selectedEvent.type] && (
                                <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                    style={{
                                        borderColor: `${typeConfig[selectedEvent.type].borderColor}40`,
                                        backgroundColor: `${typeConfig[selectedEvent.type].borderColor}10`,
                                        color: typeConfig[selectedEvent.type].borderColor,
                                    }}
                                >
                                    {typeConfig[selectedEvent.type].label}
                                </Badge>
                            )}
                            {selectedEvent?.status && (
                                <Badge variant="secondary" className="text-[10px]">
                                    {statusLabels[selectedEvent.status] || selectedEvent.status}
                                </Badge>
                            )}
                        </div>

                        {/* Project / Client */}
                        {(selectedEvent?.project || selectedEvent?.client) && (
                            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/25">
                                <FolderKanban className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-muted-foreground">{selectedEvent?.project ? "Proyecto" : "Cliente"}</p>
                                    <p className="text-sm font-medium truncate">{selectedEvent?.project?.name || selectedEvent?.client?.name}</p>
                                </div>
                            </div>
                        )}

                        {/* Assignee */}
                        {selectedEvent?.assignee && (
                            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/25">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                        {selectedEvent.assignee.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Asignado a</p>
                                    <p className="text-sm font-medium">{selectedEvent.assignee.name}</p>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {selectedEvent?.description && (
                            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/25">
                                <p className="text-[10px] text-muted-foreground mb-1">Descripción</p>
                                <p className="text-sm text-foreground leading-relaxed">{selectedEvent.description}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between pt-2">
                        {selectedEvent?.type === 'TASK' && (
                            <Link href={`/tasks/${selectedEvent.id}`}>
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                    Ver tarea <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        )}
                        {selectedEvent?.type === 'PROJECT' && (
                            <Link href={`/projects/${selectedEvent.id}`}>
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                    Ver proyecto <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        )}
                        {!['TASK', 'PROJECT'].includes(selectedEvent?.type || '') && <div />}
                        <Button variant="secondary" size="sm" onClick={() => setSelectedEvent(null)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
