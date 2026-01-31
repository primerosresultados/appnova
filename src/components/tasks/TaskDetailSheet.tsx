"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, AlertCircle, FileText, CheckCircle2, Circle, Paperclip, Send, Download, Archive, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useTransition } from "react";
import { createTaskLog, deleteTask, archiveTask } from "@/app/tasks/actions";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";

interface TaskDetailSheetProps {
    task: any; // Full task object with logs and assignee
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({ task, open, onOpenChange }: TaskDetailSheetProps) {
    const [logContent, setLogContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSendLog = () => {
        if (!logContent.trim()) return;

        startTransition(async () => {
            await createTaskLog(task.id, logContent, "NOTE");
            setLogContent("");
        });
    };

    const handleArchive = async () => {
        setIsArchiving(true);
        try {
            const result = await archiveTask(task.id);
            if (result.success) {
                toast.success("Tarea archivada.");
                onOpenChange(false);
            } else {
                toast.error("Error al archivar.");
            }
        } catch {
            toast.error("Error inesperado.");
        } finally {
            setIsArchiving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteTask(task.id);
            if (result.success) {
                toast.success("Tarea eliminada.");
                onOpenChange(false);
            } else {
                toast.error("Error al eliminar.");
            }
        } catch {
            toast.error("Error inesperado.");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    if (!task) return null;

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-[400px] sm:w-[540px] flex flex-col gap-0 p-0 border-l border-border/40 bg-background/95 backdrop-blur-xl">
                    <div className="p-6 border-b border-border/40">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}>
                                    {task.status}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {task.priority}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={handleArchive}
                                    disabled={isArchiving}
                                    title="Archivar tarea"
                                >
                                    <Archive className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    title="Eliminar tarea"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <SheetTitle className="text-xl font-bold">{task.title}</SheetTitle>
                        <SheetDescription className="line-clamp-2 mt-1">
                            {task.description || "Sin descripción"}
                        </SheetDescription>
                    </div>

                    <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 py-2 border-b border-border/40 bg-muted/20">
                            <TabsList className="bg-transparent h-9 p-0 gap-4">
                                <TabsTrigger value="general" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-9 px-1">General</TabsTrigger>
                                <TabsTrigger value="bitacora" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-9 px-1">Bitácora</TabsTrigger>
                                <TabsTrigger value="entregables" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-9 px-1">Entregables</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="general" className="flex-1 overflow-y-auto p-6 m-0 space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground uppercase font-semibold">Asignado a</Label>
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20 border border-border/30">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-[10px]">
                                                    {task.assignee?.name?.substring(0, 2).toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{task.assignee?.name || "Sin asignar"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground uppercase font-semibold">Fecha de Entrega</Label>
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20 border border-border/30">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {task.dueDate ? format(new Date(task.dueDate), 'PPP', { locale: es }) : "Sin fecha"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground uppercase font-semibold">Descripción Completa</Label>
                                    <div className="p-3 rounded-md bg-secondary/10 border border-border/30 min-h-[100px] text-sm leading-relaxed whitespace-pre-wrap">
                                        {task.description || "No hay descripción detallada."}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="bitacora" className="flex-1 flex flex-col m-0 overflow-hidden">
                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                    {task.actionLogs?.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground text-sm">
                                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                            No hay registros en la bitácora.
                                        </div>
                                    ) : (
                                        task.actionLogs?.map((log: any) => (
                                            <div key={log.id} className="flex gap-3 text-sm">
                                                <div className="mt-0.5">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                                        {log.user?.name?.substring(0, 1) || "S"}
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-xs">{log.user?.name || "Sistema"}</span>
                                                        <span className="text-[10px] text-muted-foreground">{format(new Date(log.createdAt), 'p', { locale: es })}</span>
                                                    </div>
                                                    <div className="p-3 rounded-lg bg-secondary/30 text-foreground/90 leading-relaxed border border-border/20">
                                                        {log.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                            <div className="p-4 bg-background border-t border-border/40">
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Registrar avance o inconveniente..."
                                        className="min-h-[40px] max-h-[120px] resize-none text-sm"
                                        value={logContent}
                                        onChange={(e) => setLogContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendLog();
                                            }
                                        }}
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSendLog}
                                        disabled={isPending || !logContent.trim()}
                                        className={isPending ? "opacity-50" : ""}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 text-right">Presiona Enter para enviar</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="entregables" className="flex-1 overflow-y-auto p-6 m-0">
                            <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border/30 rounded-xl bg-secondary/5">
                                <Paperclip className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <h3 className="font-medium mb-1">Cargar Entregables</h3>
                                <p className="text-xs mb-4 max-w-[200px] mx-auto">Arrastra archivos aquí o haz clic para subir documentos relacionados.</p>
                                <Button variant="outline" size="sm" disabled>Proximamente</Button>
                            </div>

                            <div className="mt-6 space-y-2">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Archivos Adjuntos</Label>
                                {(!task.attachments || JSON.parse(task.attachments || "[]").length === 0) && (
                                    <p className="text-sm text-muted-foreground italic">No hay archivos adjuntos.</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </SheetContent>
            </Sheet>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la tarea permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
