"use client";

import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag, FileIcon, Plus, Trash2, Video, Megaphone, Instagram, FileText } from "lucide-react";
import { createMilestone, deleteMilestone } from "@/app/projects/milestone-actions";
import { useActionState } from "react";

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
}

const initialState = {
    message: "",
    success: false
};

export function ProjectCalendar({ projectId, milestones, contents }: ProjectCalendarProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // Unified events list
    const [selectedEvents, setSelectedEvents] = useState<(Milestone | Content | any)[]>([]);

    // Helper to distinguish types
    const isContent = (item: any): item is Content => 'publishDate' in item;

    // Update selected milestones when date changes
    // Sync selected events when date or data changes
    useEffect(() => {
        if (date) {
            const ms = milestones.filter(m => isSameDay(new Date(m.date), date)).map(m => ({ ...m, _kind: 'MILESTONE' }));
            const cs = contents.filter(c => c.publishDate && isSameDay(new Date(c.publishDate), date)).map(c => ({ ...c, _kind: 'CONTENT', date: c.publishDate }));
            setSelectedEvents([...ms, ...cs]);
        } else {
            setSelectedEvents([]);
        }
    }, [date, milestones, contents]);

    const handleSelectDate = (newDate: Date | undefined) => {
        setDate(newDate);
    };

    const [state, formAction, isPending] = useActionState(createMilestone, initialState);

    // Close dialog on success
    useEffect(() => {
        if (state.success && isDialogOpen) {
            setIsDialogOpen(false);
        }
    }, [state.success, isDialogOpen]);

    const handleDelete = async (id: string) => {
        await deleteMilestone(id, projectId);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex-1">
                <CardHeader>
                    <CardTitle>Calendario de Hitos</CardTitle>
                    <CardDescription>Selecciona un día para ver o agregar entregables.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelectDate}
                        className="rounded-md border bg-background/50 w-full"
                        classNames={{
                            root: "w-full", // Force root to full width
                            months: "w-full", // Force content wrapper to full width
                            month: "w-full space-y-4",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex w-full justify-between",
                            row: "flex w-full mt-2",
                            cell: "h-9 w-full text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/50 hover:text-accent-foreground rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 mx-auto"
                        }}
                        modifiers={{
                            hasMilestone: (d) => milestones.some(m => isSameDay(new Date(m.date), d)),
                            hasContent: (d) => contents.some(c => c.publishDate && isSameDay(new Date(c.publishDate), d))
                        }}
                        modifiersStyles={{
                            hasMilestone: {
                                fontWeight: 'bold',
                                textDecoration: 'underline',
                                textDecorationColor: 'hsl(var(--primary))',
                                textUnderlineOffset: '3px'
                            },
                            hasContent: {
                                border: '1px solid currentColor',
                                borderRadius: '50%'
                            }
                        }}
                    />
                </CardContent>
            </Card>

            <div className="w-full lg:w-[350px] space-y-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                    <CardHeader>
                        <CardTitle className="text-sm">
                            {date ? format(date, "d 'de' MMMM", { locale: es }) : "Selecciona una fecha"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {date && selectedEvents.length === 0 && (
                                <p className="text-sm text-muted-foreground">No hay eventos para este día.</p>
                            )}

                            {date && selectedEvents.map((item) => (
                                <div key={item.id} className={`p-3 border rounded-md space-y-2 ${item._kind === 'CONTENT' ? 'bg-primary/5 border-primary/20' : 'bg-accent/10'}`}>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm flex items-center gap-1">
                                            {item._kind === 'CONTENT' ? <Megaphone className="h-3 w-3 text-purple-500" /> : <Flag className="h-3 w-3 text-primary" />}
                                            {item.title}
                                        </h4>
                                        {item._kind === 'MILESTONE' && (
                                            <Button size="icon" variant="ghost" className="h-4 w-4 text-destructive" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                        {item._kind === 'CONTENT' && (
                                            <Badge variant="outline" className="text-[10px] h-5">{item.type}</Badge>
                                        )}
                                    </div>
                                    {/* Render description */}
                                    {item.description && <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-2">{item.description}</p>}

                                    {item._kind === 'MILESTONE' && item.mediaUrl && (
                                        <div className="mt-2">
                                            {item.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <img src={item.mediaUrl} alt="Adjunto" className="w-full h-32 object-cover rounded-md border border-border/50" />
                                            ) : (
                                                <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 flex items-center gap-1 hover:underline break-all">
                                                    <Flag className="h-3 w-3" /> {item.mediaUrl}
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {item._kind === 'MILESTONE' && item.filePath && (
                                        <div className="mt-2" key="filepath">
                                            <a href={item.filePath} target="_blank" className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
                                                <FileIcon className="h-3 w-3" /> Ver Archivo Adjunto
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {date && (
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="w-full mt-4" variant="outline">
                                            <Plus className="h-4 w-4 mr-2" /> Agregar Hito
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Agregar Hito</DialogTitle>
                                            <DialogDescription>
                                                Para el {format(date, "PPP", { locale: es })}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form action={formAction} className="space-y-4">
                                            <input type="hidden" name="projectId" value={projectId} />
                                            <input type="hidden" name="date" value={date.toISOString()} />
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
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
