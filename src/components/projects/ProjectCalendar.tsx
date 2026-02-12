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
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag, FileIcon, Plus, Trash2, Megaphone, ListTodo, ChevronLeft, ChevronRight, X } from "lucide-react";
import { createMilestone, deleteMilestone } from "@/app/projects/milestone-actions";
import { useActionState } from "react";
import { cn } from "@/lib/utils";

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

const WEEKDAYS = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

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
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
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
                        {calendarDays.map((day, dayIdx) => {
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

                                    {/* Events List */}
                                    <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[150px] scrollbar-none">
                                        {events.map((event: any) => (
                                            <div
                                                key={`${event._kind}-${event.id}`}
                                                className={cn(
                                                    "text-[10px] px-1.5 py-1 rounded border truncate flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-80 transition-opacity",
                                                    event._kind === 'MILESTONE' && "bg-primary/10 border-primary/20 text-primary-foreground/90 dark:text-primary-foreground",
                                                    event._kind === 'CONTENT' && "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300",
                                                    event._kind === 'TASK' && "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedEvent(event);
                                                }}
                                                title={event.title}
                                            >
                                                {event._kind === 'MILESTONE' && <Flag className="h-3 w-3 shrink-0" />}
                                                {event._kind === 'CONTENT' && <Megaphone className="h-3 w-3 shrink-0" />}
                                                {event._kind === 'TASK' && <ListTodo className="h-3 w-3 shrink-0" />}
                                                <span className="truncate flex-1">{event.title}</span>
                                            </div>
                                        ))}
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

            {/* Event Details Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            {selectedEvent?._kind === 'MILESTONE' && <Flag className="h-5 w-5 text-primary" />}
                            {selectedEvent?._kind === 'CONTENT' && <Megaphone className="h-5 w-5 text-purple-500" />}
                            {selectedEvent?._kind === 'TASK' && <ListTodo className="h-5 w-5 text-amber-500" />}
                            <DialogTitle>{selectedEvent?.title}</DialogTitle>
                        </div>
                        <DialogDescription>
                            {selectedEvent?.date && format(new Date(selectedEvent.date), "PPP", { locale: es })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {selectedEvent?.description && (
                            <div
                                className="bg-muted/30 p-3 rounded-md text-sm prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
                            />
                        )}

                        {selectedEvent?.status && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Estado:</span>
                                <Badge variant="secondary">{selectedEvent.status}</Badge>
                            </div>
                        )}

                        {selectedEvent?.mediaUrl && (
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Multimedia</Label>
                                {selectedEvent.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <div className="rounded-md overflow-hidden border border-border/50">
                                        <img src={selectedEvent.mediaUrl} alt="Media" className="w-full h-auto max-h-[300px] object-cover" />
                                    </div>
                                ) : (
                                    <a href={selectedEvent.mediaUrl} target="_blank" rel="noreferrer" className="block text-sm text-primary hover:underline truncate">
                                        {selectedEvent.mediaUrl}
                                    </a>
                                )}
                            </div>
                        )}

                        {selectedEvent?.filePath && (
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Archivo Adjunto</Label>
                                <a href={selectedEvent.filePath} target="_blank" className="flex items-center gap-2 p-2 rounded-md border border-border/50 hover:bg-accent/50 transition-colors">
                                    <FileIcon className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Ver archivo</span>
                                </a>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between">
                        {/* Only allow deleting milestones for now */}
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
                        ) : <div />}

                        <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
