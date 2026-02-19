"use client";

import { createTask } from "@/app/projects/task-actions";
import { getUsers } from "@/app/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Link as LinkIcon, CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface NewTaskSheetProps {
    projectId: string;
}

interface User {
    id: string;
    name: string;
}

import dynamic from "next/dynamic";

// Lazy-load RichTextEditor to defer TipTap from the initial bundle
const RichTextEditor = dynamic(
    () => import("@/components/ui/rich-text-editor").then(m => ({ default: m.RichTextEditor })),
    { ssr: false, loading: () => <div className="min-h-[150px] border rounded-md bg-muted/20 animate-pulse" /> }
);

export function NewTaskSheet({ projectId }: NewTaskSheetProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [formKey, setFormKey] = useState(0);
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    // Reset all fields when sheet closes
    useEffect(() => {
        if (!open) { setDescription(""); setDueDate(undefined); }
    }, [open]);

    useEffect(() => {
        if (open) {
            getUsers().then(setUsers);
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const result = await createTask(null, formData);
                if (result.success) {
                    toast.success("Tarea creada exitosamente");
                    setOpen(false);
                    setFormKey(k => k + 1);
                    router.refresh();
                } else {
                    toast.error(result.message || "Error al crear la tarea");
                }
            } catch (error) {
                console.error("Error creating task:", error);
                toast.error("Error inesperado al crear la tarea");
            }
        });
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>Agregar Tarea</Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-[400px] sm:w-[480px] p-5 gap-0">
                <SheetHeader className="mb-0 pb-3 border-b border-border/40 p-0">
                    <SheetTitle className="text-lg">Nueva Tarea</SheetTitle>
                    <SheetDescription className="text-xs">
                        Completa los campos para crear una tarea.
                    </SheetDescription>
                </SheetHeader>
                <form key={formKey} ref={formRef} onSubmit={handleSubmit} className="grid gap-4 pt-3 pb-2">
                    <input type="hidden" name="projectId" value={projectId} />

                    <div className="grid gap-1.5">
                        <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground uppercase">Título</Label>
                        <Input id="title" name="title" placeholder="Ej: Diseñar Mockups" required className="h-9" />
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Asignar a</Label>
                        <Select name="assigneeId">
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Seleccionar miembro" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Sin asignar</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase">Estado</Label>
                            <Select name="status" defaultValue="TODO">
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">Pendiente</SelectItem>
                                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                                    <SelectItem value="REVIEW">Revisión</SelectItem>
                                    <SelectItem value="DONE">Completado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase">Prioridad</Label>
                            <Select name="priority" defaultValue="MEDIUM">
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Prioridad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Baja</SelectItem>
                                    <SelectItem value="MEDIUM">Media</SelectItem>
                                    <SelectItem value="HIGH">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Fecha de Vencimiento</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    type="button"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-9",
                                        !dueDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                    {dueDate ? format(dueDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dueDate}
                                    onSelect={setDueDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <input type="hidden" name="dueDate" value={dueDate ? dueDate.toISOString() : ""} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Descripción</Label>
                        <RichTextEditor
                            value={description}
                            onChange={setDescription}
                            placeholder="Detalles, instrucciones..."
                            className="min-h-[100px]"
                        />
                        <input type="hidden" name="description" value={description} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="links" className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                            <LinkIcon className="h-3 w-3" /> Enlaces
                        </Label>
                        <Input id="links" name="links" placeholder="https://..." className="h-9" />
                        <p className="text-[10px] text-muted-foreground">Separa múltiples enlaces con comas.</p>
                    </div>

                    <SheetFooter className="pt-2 border-t border-border/40">
                        <SheetClose asChild>
                            <Button variant="outline" type="button" size="sm">Cancelar</Button>
                        </SheetClose>
                        <Button type="submit" disabled={isPending} size="sm">
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                "Crear Tarea"
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
