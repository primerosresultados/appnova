"use client";

import { useState, useEffect, useTransition } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, FileIcon, Plus, Trash2, Megaphone, ListTodo, ChevronLeft, ChevronRight, Clock, UserIcon, Pencil } from "lucide-react";
import { createMilestone, deleteMilestone, updateMilestone } from "@/app/projects/milestone-actions";
import { createTask } from "@/app/projects/task-actions";
import { createContent, updateContent, deleteContent } from "@/app/projects/content-actions";
import { moveCalendarEvent } from "@/app/projects/calendar-actions";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
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
    assigneeId?: string | null;
    assignee?: { id: string; name: string; avatar?: string | null } | null;
}

interface Content {
    id: string;
    title: string;
    publishDate: Date | null;
    type: string;
    description: string | null;
    status: string;
    mediaUrl: string | null;
    creator?: { id: string; name: string; avatar?: string | null } | null;
}

interface ProjectCalendarProps {
    projectId: string;
    milestones: Milestone[];
    contents: Content[];
    tasks: any[];
    users?: { id: string; name: string }[];
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

const WEEKDAYS_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKDAYS_FULL = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];

type EventType = 'MILESTONE' | 'TASK' | 'CONTENT';

export function ProjectCalendar({ projectId, milestones, contents, tasks, users = [], isClient = false }: ProjectCalendarProps) {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [eventType, setEventType] = useState<EventType>('MILESTONE');
    const [formKey, setFormKey] = useState(0);
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);

    // useTransition for all form submissions
    const [isMilestonePending, startMilestoneTransition] = useTransition();
    const [isTaskPending, startTaskTransition] = useTransition();
    const [isContentPending, startContentTransition] = useTransition();
    const [contentError, setContentError] = useState<string | null>(null);

    // Edit transitions
    const [isEditPending, startEditTransition] = useTransition();
    const [editError, setEditError] = useState<string | null>(null);

    const handleMilestoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startMilestoneTransition(async () => {
            try {
                const result = await createMilestone(null, formData) as { message: string; success: boolean };
                if (result.success) {
                    setIsDialogOpen(false);
                    setFormKey(k => k + 1);
                    router.refresh();
                } else {
                    toast.error(result.message || "Error al crear hito");
                }
            } catch {
                toast.error("Error inesperado");
            }
        });
    };

    const handleTaskSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTaskTransition(async () => {
            try {
                const result = await createTask(null, formData);
                if (result.success) {
                    setIsDialogOpen(false);
                    setFormKey(k => k + 1);
                    router.refresh();
                } else {
                    toast.error(result.message || "Error al crear tarea");
                }
            } catch {
                toast.error("Error inesperado");
            }
        });
    };

    const handleContentSubmit = async (formData: FormData) => {
        setContentError(null);
        startContentTransition(async () => {
            const result = await createContent(projectId, formData);
            if (result.success) {
                setIsDialogOpen(false);
            } else {
                setContentError("Error al crear el contenido.");
            }
        });
    };

    const handleDelete = async (id: string, kind: string) => {
        const label = kind === 'MILESTONE' ? 'hito' : kind === 'CONTENT' ? 'contenido' : 'evento';
        if (confirm(`¿Eliminar este ${label} permanentemente?`)) {
            if (kind === 'MILESTONE') {
                await deleteMilestone(id, projectId);
            } else if (kind === 'CONTENT') {
                await deleteContent(id, projectId);
            }
            setSelectedEvent(null);
            setIsEditing(false);
        }
    };

    const handleEditSubmit = async (formData: FormData) => {
        if (!selectedEvent) return;
        setEditError(null);

        startEditTransition(async () => {
            let result;
            if (selectedEvent._kind === 'MILESTONE') {
                result = await updateMilestone(selectedEvent.id, projectId, formData);
            } else if (selectedEvent._kind === 'CONTENT') {
                result = await updateContent(selectedEvent.id, projectId, formData);
            }

            if (result?.success) {
                setSelectedEvent(null);
                setIsEditing(false);
            } else {
                setEditError((result as any)?.message || "Error al guardar los cambios.");
            }
        });
    };

    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    const handleDateClick = (date: Date) => {
        if (isClient) return;
        setSelectedDate(date);
        setEventType('MILESTONE');
        setContentError(null);
        setIsDialogOpen(true);
    };

    // Helper to get assignee display name for any event type
    const getAssigneeName = (event: any): string | null => {
        if (event._kind === 'TASK' && event.assignee) return event.assignee.name;
        if (event._kind === 'MILESTONE' && event.assignee) return event.assignee.name;
        if (event._kind === 'CONTENT' && event.creator) return event.creator.name;
        return null;
    };

    const getAssigneeInitials = (name: string): string => {
        return name.substring(0, 2).toUpperCase();
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

    const isPending = isMilestonePending || isTaskPending || isContentPending;

    return (
        <div className="flex flex-col bg-background/50 rounded-xl border border-border/50 shadow-sm">
            {/* Calendar Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-4">
                    <h2 className="text-sm sm:text-lg font-bold capitalize flex items-center gap-2">
                        {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </h2>
                    <div className="flex items-center rounded-md border border-border/50 bg-background/50 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none rounded-l-md hover:bg-accent" onClick={handlePreviousMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 sm:px-3 rounded-none border-x border-border/50 font-normal hover:bg-accent text-xs" onClick={handleToday}>
                            Hoy
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none rounded-r-md hover:bg-accent" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {!isClient && (
                    <Button size="sm" className="text-xs sm:text-sm" onClick={() => handleDateClick(new Date())}>
                        <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Nuevo Evento</span>
                        <span className="sm:hidden">Nuevo</span>
                    </Button>
                )}
            </div>

            {/* Calendar Grid */}
            <div>
                <div className="w-full flex flex-col">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-border/50 bg-muted/20">
                        {WEEKDAYS_FULL.map((day, i) => (
                            <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                                <span className="hidden sm:inline">{day}</span>
                                <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 bg-border/20 gap-px">
                        {calendarDays.map((day) => {
                            const events = getEventsForDay(day);
                            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                            const isTodayDate = isToday(day);

                            const dayIso = day.toISOString();
                            const isDragOver = dragOverDate === dayIso;

                            return (
                                <div
                                    key={dayIso}
                                    className={cn(
                                        "min-h-[70px] sm:min-h-[100px] md:min-h-[120px] bg-card p-1 sm:p-2 flex flex-col gap-0.5 sm:gap-1 transition-colors hover:bg-accent/5 group relative cursor-pointer",
                                        !isCurrentMonth && "bg-muted/10 text-muted-foreground/50",
                                        isTodayDate && "bg-primary/5",
                                        isDragOver && "ring-2 ring-primary/50 ring-inset bg-primary/10"
                                    )}
                                    onClick={() => handleDateClick(day)}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = "move";
                                        setDragOverDate(dayIso);
                                    }}
                                    onDragLeave={() => setDragOverDate(null)}
                                    onDrop={async (e) => {
                                        e.preventDefault();
                                        setDragOverDate(null);
                                        const eventId = e.dataTransfer.getData("eventId");
                                        const eventKind = e.dataTransfer.getData("eventKind") as "MILESTONE" | "TASK" | "CONTENT";
                                        if (!eventId || !eventKind) return;
                                        const result = await moveCalendarEvent(eventId, eventKind, day.toISOString(), projectId);
                                        if (result.success) {
                                            toast.success("Evento movido");
                                            router.refresh();
                                        } else {
                                            toast.error("Error al mover");
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={cn(
                                            "text-xs sm:text-sm font-medium h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full",
                                            isTodayDate ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                                            !isCurrentMonth && "opacity-50"
                                        )}>
                                            {format(day, "d")}
                                        </span>
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            {events.length > 0 && (
                                                <span className="text-[8px] sm:text-[9px] text-muted-foreground font-medium">
                                                    {events.length}
                                                </span>
                                            )}
                                            {!isClient && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-4 w-4 sm:h-5 sm:w-5 opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5 sm:-mt-1 -mr-0.5 sm:-mr-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDateClick(day);
                                                    }}
                                                >
                                                    <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Events List — modern cards */}
                                    <div className="flex flex-col gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 overflow-y-auto max-h-[60px] sm:max-h-[100px] md:max-h-[150px] scrollbar-none">
                                        {events.map((event: any) => {
                                            const config = kindConfig[event._kind];
                                            const Icon = config?.icon;
                                            const assigneeName = getAssigneeName(event);
                                            return (
                                                <div
                                                    key={`${event._kind}-${event.id}`}
                                                    draggable={!isClient}
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData("eventId", event.id);
                                                        e.dataTransfer.setData("eventKind", event._kind);
                                                        e.dataTransfer.effectAllowed = "move";
                                                    }}
                                                    className={cn(
                                                        "group/event text-[9px] sm:text-[11px] px-1 sm:px-2 py-0.5 sm:py-1.5 rounded-md border cursor-pointer transition-all duration-200",
                                                        "hover:shadow-md hover:scale-[1.02] hover:-translate-y-px",
                                                        !isClient && "cursor-grab active:cursor-grabbing",
                                                        config?.accent
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedEvent(event);
                                                        setIsEditing(false);
                                                    }}
                                                    title={event.title}
                                                >
                                                    <div className="flex items-center gap-1 sm:gap-1.5">
                                                        <span className={cn("h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full shrink-0", config?.dot)} />
                                                        <span className={cn("truncate font-medium flex-1", config?.color)}>{event.title}</span>
                                                    </div>
                                                    {assigneeName && (
                                                        <div className="flex items-center gap-1 mt-0.5 ml-2.5 sm:ml-3">
                                                            <UserIcon className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                                                            <span className="text-[8px] sm:text-[9px] text-muted-foreground truncate">{assigneeName}</span>
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

            {/* Add Event Dialog — Multi-type */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Nuevo Evento</DialogTitle>
                        <DialogDescription>
                            {selectedDate && `Para el ${format(selectedDate, "PPP", { locale: es })}`}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Event Type Tabs */}
                    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                        {(['MILESTONE', 'TASK', 'CONTENT'] as EventType[]).map((type) => {
                            const config = kindConfig[type];
                            const Icon = config.icon;
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setEventType(type)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                                        eventType === type
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Milestone Form */}
                    {eventType === 'MILESTONE' && (
                        <form key={`m-${formKey}`} onSubmit={handleMilestoneSubmit} className="space-y-4">
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
                                <Label>Asignar a</Label>
                                <Select name="assigneeId">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar responsable" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Sin asignar</SelectItem>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Adjuntar Archivo</Label>
                                <Input type="file" name="file" />
                            </div>

                            <div className="space-y-2">
                                <Label>Multimedia (URL Opcional)</Label>
                                <Input name="mediaUrl" placeholder="https://..." />
                            </div>



                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isMilestonePending ? "Guardando..." : "Guardar Hito"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}

                    {/* Task Form */}
                    {eventType === 'TASK' && (
                        <form key={`t-${formKey}`} onSubmit={handleTaskSubmit} className="space-y-4">
                            <input type="hidden" name="projectId" value={projectId} />
                            {selectedDate && <input type="hidden" name="dueDate" value={format(selectedDate, "yyyy-MM-dd")} />}
                            <input type="hidden" name="status" value="TODO" />

                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input name="title" required placeholder="Ej: Diseñar landing page" />
                            </div>

                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea name="description" placeholder="Detalles de la tarea..." />
                            </div>

                            <div className="space-y-2">
                                <Label>Prioridad</Label>
                                <Select name="priority" defaultValue="MEDIUM">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar prioridad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Baja</SelectItem>
                                        <SelectItem value="MEDIUM">Media</SelectItem>
                                        <SelectItem value="HIGH">Alta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Asignar a</Label>
                                <Select name="assigneeId">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar responsable" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Sin asignar</SelectItem>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>



                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isTaskPending ? "Guardando..." : "Guardar Tarea"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}

                    {/* Content Form */}
                    {eventType === 'CONTENT' && (
                        <form action={handleContentSubmit} className="space-y-4">
                            {selectedDate && <input type="hidden" name="publishDate" value={selectedDate.toISOString()} />}

                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input name="title" required placeholder="Ej: Post para Instagram" />
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo de Contenido</Label>
                                <Select name="type" defaultValue="POST">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="POST">Post</SelectItem>
                                        <SelectItem value="REEL">Reel</SelectItem>
                                        <SelectItem value="STORY">Story</SelectItem>
                                        <SelectItem value="VIDEO">Video</SelectItem>
                                        <SelectItem value="BLOG">Blog</SelectItem>
                                        <SelectItem value="EMAIL">Email</SelectItem>
                                        <SelectItem value="OTHER">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea name="description" placeholder="Detalles del contenido..." />
                            </div>

                            <div className="space-y-2">
                                <Label>Asignar a</Label>
                                <Select name="assigneeId">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar responsable" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Sin asignar</SelectItem>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>URL de Media (Opcional)</Label>
                                <Input name="mediaUrl" placeholder="https://..." />
                            </div>

                            {contentError && (
                                <p className="text-xs text-red-500">{contentError}</p>
                            )}

                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isContentPending ? "Guardando..." : "Guardar Contenido"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Event Details / Edit Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) { setSelectedEvent(null); setIsEditing(false); } }}>
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
                            <div className="flex-1">
                                <DialogTitle className="text-lg">
                                    {isEditing ? `Editar ${kindConfig[selectedEvent?._kind]?.label || 'Evento'}` : selectedEvent?.title}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-1.5 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    {selectedEvent?.date && format(new Date(selectedEvent.date), "PPP", { locale: es })}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* VIEW MODE */}
                    {!isEditing && selectedEvent && (
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
                            {(() => {
                                const name = getAssigneeName(selectedEvent);
                                if (!name) return null;
                                return (
                                    <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 border border-border/30">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                                {getAssigneeInitials(name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Asignado a</p>
                                            <p className="text-sm font-medium">{name}</p>
                                        </div>
                                    </div>
                                );
                            })()}

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
                    )}

                    {/* EDIT MODE — Milestone */}
                    {isEditing && selectedEvent?._kind === 'MILESTONE' && (
                        <form action={handleEditSubmit} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input name="title" required defaultValue={selectedEvent.title} />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea name="description" defaultValue={selectedEvent.description || ""} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input type="date" name="date" defaultValue={format(new Date(selectedEvent.date), "yyyy-MM-dd")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Asignar a</Label>
                                <Select name="assigneeId" defaultValue={selectedEvent.assigneeId || "unassigned"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar responsable" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Sin asignar</SelectItem>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Multimedia (URL Opcional)</Label>
                                <Input name="mediaUrl" defaultValue={selectedEvent.mediaUrl || ""} placeholder="https://..." />
                            </div>

                            {editError && <p className="text-xs text-red-500">{editError}</p>}

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                                <Button type="submit" disabled={isEditPending}>
                                    {isEditPending ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}

                    {/* EDIT MODE — Content */}
                    {isEditing && selectedEvent?._kind === 'CONTENT' && (
                        <form action={handleEditSubmit} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input name="title" required defaultValue={selectedEvent.title} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Contenido</Label>
                                <Select name="type" defaultValue={selectedEvent.type || "POST"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="POST">Post</SelectItem>
                                        <SelectItem value="REEL">Reel</SelectItem>
                                        <SelectItem value="STORY">Story</SelectItem>
                                        <SelectItem value="VIDEO">Video</SelectItem>
                                        <SelectItem value="BLOG">Blog</SelectItem>
                                        <SelectItem value="EMAIL">Email</SelectItem>
                                        <SelectItem value="OTHER">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea name="description" defaultValue={selectedEvent.description || ""} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de publicación</Label>
                                <Input type="date" name="publishDate" defaultValue={selectedEvent.date ? format(new Date(selectedEvent.date), "yyyy-MM-dd") : ""} />
                            </div>
                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <Select name="status" defaultValue={selectedEvent.status || "DRAFT"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Borrador</SelectItem>
                                        <SelectItem value="REVIEW">Revisión</SelectItem>
                                        <SelectItem value="APPROVED">Aprobado</SelectItem>
                                        <SelectItem value="SCHEDULED">Programado</SelectItem>
                                        <SelectItem value="PUBLISHED">Publicado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>URL de Media (Opcional)</Label>
                                <Input name="mediaUrl" defaultValue={selectedEvent.mediaUrl || ""} placeholder="https://..." />
                            </div>

                            {editError && <p className="text-xs text-red-500">{editError}</p>}

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                                <Button type="submit" disabled={isEditPending}>
                                    {isEditPending ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}

                    {/* Footer — View Mode */}
                    {!isEditing && (
                        <DialogFooter className="gap-2 sm:justify-between">
                            <div className="flex items-center gap-2">
                                {/* Edit button for milestones and content (not client) */}
                                {!isClient && selectedEvent?._kind !== 'TASK' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Editar
                                    </Button>
                                )}

                                {/* Link to task detail page */}
                                {selectedEvent?._kind === 'TASK' && (
                                    <Link href={`/tasks/${selectedEvent.id}`}>
                                        <Button variant="outline" size="sm" className="gap-1.5">
                                            <Pencil className="h-3.5 w-3.5" />
                                            Editar tarea
                                        </Button>
                                    </Link>
                                )}

                                {/* Delete button for milestones and content */}
                                {!isClient && (selectedEvent?._kind === 'MILESTONE' || selectedEvent?._kind === 'CONTENT') && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(selectedEvent.id, selectedEvent._kind)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Eliminar
                                    </Button>
                                )}
                            </div>

                            <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                                Cerrar
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
