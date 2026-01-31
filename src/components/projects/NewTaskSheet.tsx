"use client";

import { useActionState } from "react";
import { createTask } from "@/app/projects/task-actions";
import { getUsers } from "@/app/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Link as LinkIcon, CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

type ActionState = {
    message: string;
    errors?: {
        title?: string[];
        status?: string[];
        priority?: string[];
    };
    success?: boolean;
};

const initialState: ActionState = {
    message: "",
    errors: {},
    success: false
};

interface NewTaskSheetProps {
    projectId: string;
}

interface User {
    id: string;
    name: string;
}

import { RichTextEditor } from "@/components/ui/rich-text-editor";

// ... existing imports

export function NewTaskSheet({ projectId }: NewTaskSheetProps) {
    const [state, formAction] = useActionState(createTask, initialState);
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

    // Reset description when sheet closes or success
    useEffect(() => {
        if (!open) { setDescription(""); setDueDate(undefined); }
    }, [open]);

    useEffect(() => {
        if (state?.success) {
            setOpen(false);
        }
    }, [state]);

    useEffect(() => {
        if (open) {
            getUsers().then(setUsers);
        }
    }, [open]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>Agregar Tarea</Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Agregar Nueva Tarea</SheetTitle>
                    <SheetDescription>
                        Crea una tarea detallada para tu equipo.
                    </SheetDescription>
                </SheetHeader>
                <form action={formAction} className="grid gap-6 py-6">
                    <input type="hidden" name="projectId" value={projectId} />

                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" placeholder="Ej: Diseñar Mockups" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="assigneeId">Asignar a</Label>
                        <Select name="assigneeId">
                            <SelectTrigger>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select name="status" defaultValue="TODO">
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">Pendiente</SelectItem>
                                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                                    <SelectItem value="REVIEW">Revisión</SelectItem>
                                    <SelectItem value="DONE">Completado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="priority">Prioridad</Label>
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
                    </div>

                    <div className="grid gap-2">
                        <Label>Fecha de Vencimiento</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dueDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
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

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción / Detalles</Label>
                        <RichTextEditor
                            value={description}
                            onChange={setDescription}
                            placeholder="Detalles adicionales, instrucciones..."
                            className="min-h-[150px]"
                        />
                        <input type="hidden" name="description" value={description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="links" className="flex items-center gap-2">
                            <LinkIcon className="h-3 w-3" /> Enlaces / Documentos
                        </Label>
                        <Input id="links" name="links" placeholder="https://..." />
                        <p className="text-[10px] text-muted-foreground">Separa múltiples enlaces con comas.</p>
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button variant="outline" type="button">Cancelar</Button>
                        </SheetClose>
                        <Button type="submit">Crear Tarea</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
