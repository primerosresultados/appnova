"use client";

import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag, FileIcon, Plus, Trash2, Megaphone, ListTodo, ChevronLeft, ChevronRight, Clock, UserIcon } from "lucide-react";
import { createMilestone, deleteMilestone } from "@/app/projects/milestone-actions";
import { useActionState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Milestone {
    id: string;
    title: string;
    description: string | null;
    date: Date;
    mediaUrl: string | null;
    filePath: string | null;
    type: string;
}

interface Content {
    id: string;
    title: string;
    publishDate: Date | null;
    type: string;
    description: string | null;
    status: string;
    mediaUrl: string | null;
}

interface ProjectCalendarProps {
    projectId: string;
    milestones: Milestone[];
    contents: Content[];
    tasks: any[];
    isClient?: boolean;
}

const initialState = {
    message: "",
    success: false
};

const kindConfig: Record<string, { label: string; color: string; accent: string; dot: string; icon: React.ElementType }> = {
    MILESTONE: { label: 'Hito', color: 'text-primary', accent: 'bg-primary/10 border-primary/20', dot: 'bg-primary', icon: Flag },
    CONTENT: { label: 'Contenido', color: 'text-purple-600 dark:text-purple-400', accent: 'bg-purple-500/10 border-purple-500/20', dot: 'bg-purple-500', icon: Megaphone },
    TASK: { label: 'Tarea', color: 'text-amber-600 dark:text-amber-400', accent: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500', icon: ListTodo },
};

const statusLabels: Record<string, string> = {
    TODO: 'Pendiente',
    IN_PROGRESS: 'En Progreso',
    REVIEW: 'Revisión',
    DONE: 'Completado',
    DRAFT: 'Borrador',
    PUBLISHED: 'Publicado',
    SCHEDULED: 'Programado',
};

const WEEKDAYS = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];

export function ProjectCalendar({ projectId, milestones, contents, tasks, isClient = false }: ProjectCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    // Dialog handling for creating milestones
    const [state, formAction, isPending] = useActionState(createMilestone, initialState);

    useEffect(() => {
        if (state.success && isDialogOpen) {
            setIsDialogOpen(false);
        }
    }, [state.success, isDialogOpen]);

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este hito?")) {
            await deleteMilestone(id, projectId);
        }
    };

    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    const handleDateClick = (date: Date) => {
        if (isClient) return;
        setSelectedDate(date);
        setIsDialogOpen(true);
    };

    // Calculate grid days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Combine all events
    const getEventsForDay = (date: Date) => {
        const ms = milestones.filter(m => isSameDay(new Date(m.date), date)).map(m => ({ ...m, _kind: 'MILESTONE' }));
        const cs = contents.filter(c => c.publishDate && isSameDay(new Date(c.publishDate), date)).map(c => ({ ...c, _kind: 'CONTENT', date: c.publishDate }));
        const ts = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), date)).map(t => ({ ...t, _kind: 'TASK', date: t.dueDate }));
        return [...ms, ...cs, ...ts];
    };

    return (
        <div className="flex flex-col h-full bg-background/50 rounded-xl overflow-hidden border border-border/50 shadow-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold capitalize flex items-center gap-2">
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
                {!isClient && (
                    <Button size="sm" onClick={() => handleDateClick(new Date())}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Hito
                    </Button>
                )}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto min-h-[600px]">
                <div className="w-full h-full min-w-[800px] flex flex-col">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-border/50 bg-muted/20">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-border/20 gap-px">
                        {calendarDays.map((day) => {
                            const events = getEventsForDay(day);
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
                                    onClick={() => handleDateClick(day)}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={cn(
                                            "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                                            isTodayDate ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                                            !isCurrentMonth && "opacity-50"
                                        )}>
                                            {format(day, "d")}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {events.length > 0 && (
                                                <span className="text-[9px] text-muted-foreground font-medium">
                                                    {events.length}
                                                </span>
                                            )}
                                            {!isClient && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDateClick(day);
                                                    }}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Events List — modern cards */}
                                    <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[150px] scrollbar-none">
                                        {events.map((event: any) => {
                                            const config = kindConfig[event._kind];
                                            const Icon = config?.icon;
                                            return (
                                                <div
                                                    key={`${event._kind}-${event.id}`}
                                                    className={cn(
                                                        "group/event text-[11px] px-2 py-1.5 rounded-md border cursor-pointer transition-all duration-200",
                                                        "hover:shadow-md hover:scale-[1.02] hover:-translate-y-px",
                                                        config?.accent
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedEvent(event);
                                                    }}
                                                    title={event.title}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config?.dot)} />
                                                        <span className={cn("truncate font-medium flex-1", config?.color)}>{event.title}</span>
                                                    </div>
                                                    {event.assignee && (
                                                        <div className="flex items-center gap-1 mt-0.5 ml-3 text-[9px] text-muted-foreground">
                                                            <span className="truncate">{event.assignee.name}</span>
                                                        </div>
                                                    )}
                                                    {event.status && (
                                                        <div className="ml-3 mt-0.5">
                                                            <span className="text-[9px] text-muted-foreground">{statusLabels[event.status] || event.status}</span>
                                                        </div>
                                                    )}
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

            {/* Add Milestone Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Hito</DialogTitle>
                        <DialogDescription>
                            {selectedDate && `Para el ${format(selectedDate, "PPP", { locale: es })}`}
                        </DialogDescription>
                    </DialogHeader>
                    <form action={formAction} className="space-y-4">
                        <input type="hidden" name="projectId" value={projectId} />
                        {selectedDate && <input type="hidden" name="date" value={selectedDate.toISOString()} />}
                        <input type="hidden" name="type" value="MILESTONE" />

                        <div className="space-y-2">
                            <Label>Título</Label>
                            <Input name="title" required placeholder="Ej: Entrega de Mockups" />
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea name="description" placeholder="Detalles del hito..." />
                        </div>

                        <div className="space-y-2">
                            <Label>Adjuntar Archivo</Label>
                            <Input type="file" name="file" />
                        </div>

                        <div className="space-y-2">
                            <Label>Multimedia (URL Opcional)</Label>
                            <Input name="mediaUrl" placeholder="https://..." />
                        </div>

                        {state.message && !state.success && (
                            <p className="text-xs text-red-500">{state.message}</p>
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Guardando..." : "Guardar Hito"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Event Details Dialog — richer info */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            {selectedEvent && kindConfig[selectedEvent._kind] && (() => {
                                const config = kindConfig[selectedEvent._kind];
                                const Icon = config.icon;
                                return (
                                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", config.accent)}>
                                        <Icon className={cn("h-5 w-5", config.color)} />
                                    </div>
                                );
                            })()}
                            <div>
                                <DialogTitle className="text-lg">{selectedEvent?.title}</DialogTitle>
                                <DialogDescription className="flex items-center gap-1.5 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    {selectedEvent?.date && format(new Date(selectedEvent.date), "PPP", { locale: es })}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Type & Status */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {selectedEvent && kindConfig[selectedEvent._kind] && (
                                <Badge variant="outline" className={cn("text-xs", kindConfig[selectedEvent._kind].accent, kindConfig[selectedEvent._kind].color)}>
                                    {kindConfig[selectedEvent._kind].label}
                                </Badge>
                            )}
                            {selectedEvent?.status && (
                                <Badge variant="secondary" className="text-xs">
                                    {statusLabels[selectedEvent.status] || selectedEvent.status}
                                </Badge>
                            )}
                        </div>

                        {/* Description */}
                        {selectedEvent?.description && (
                            <div
                                className="bg-muted/30 p-3 rounded-lg text-sm prose prose-sm dark:prose-invert max-w-none text-muted-foreground border border-border/30"
                                dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
                            />
                        )}

                        {/* Assignee */}
                        {selectedEvent?.assignee && (
                            <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 border border-border/30">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                        {selectedEvent.assignee.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs text-muted-foreground">Asignado a</p>
                                    <p className="text-sm font-medium">{selectedEvent.assignee.name}</p>
                                </div>
                            </div>
                        )}

                        {/* Media */}
                        {selectedEvent?.mediaUrl && (
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Multimedia</Label>
                                {selectedEvent.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <div className="rounded-lg overflow-hidden border border-border/50">
                                        <img src={selectedEvent.mediaUrl} alt="Media" className="w-full h-auto max-h-[300px] object-cover" />
                                    </div>
                                ) : (
                                    <a href={selectedEvent.mediaUrl} target="_blank" rel="noreferrer" className="block text-sm text-primary hover:underline truncate">
                                        {selectedEvent.mediaUrl}
                                    </a>
                                )}
                            </div>
                        )}

                        {/* File */}
                        {selectedEvent?.filePath && (
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Archivo Adjunto</Label>
                                <a href={selectedEvent.filePath} target="_blank" className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                                    <FileIcon className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Ver archivo</span>
                                </a>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between">
                        {selectedEvent?._kind === 'TASK' && (
                            <Link href={`/tasks/${selectedEvent.id}`}>
                                <Button variant="outline" size="sm" className="gap-1.5">
                                    Ver tarea
                                </Button>
                            </Link>
                        )}
                        {selectedEvent?._kind === 'MILESTONE' && !isClient ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (confirm("¿Eliminar este hito permanentemente?")) {
                                        handleDelete(selectedEvent.id);
                                        setSelectedEvent(null);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                            </Button>
                        ) : selectedEvent?._kind !== 'TASK' ? <div /> : null}

                        <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
