"use client";

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
import { Plus } from "lucide-react";
import { useActionState } from "react";
import { createProject } from "@/app/projects/actions";
import { useEffect, useState } from "react";
import { getClientsForSelect } from "@/app/projects/data";

// Define the state type
type ActionState = {
    message: string;
    errors?: {
        name?: string[];
        clientId?: string[];
        description?: string[];
        status?: string[];
        budget?: string[];
    };
    success?: boolean;
};

const initialState: ActionState = {
    message: "",
    errors: {},
    success: false
};

export function NewProjectSheet() {
    const [state, formAction] = useActionState(createProject, initialState);
    const [open, setOpen] = useState(false);
    const [clients, setClients] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        if (open) {
            getClientsForSelect().then(setClients);
        }
    }, [open]);

    useEffect(() => {
        if (state?.success) {
            setOpen(false);
        }
    }, [state]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Crear Nuevo Proyecto</SheetTitle>
                    <SheetDescription>
                        Define los detalles del proyecto y asígnalo a un cliente.
                    </SheetDescription>
                </SheetHeader>
                <form action={formAction} className="grid gap-6 py-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 grid gap-2">
                            <Label htmlFor="name">Nombre del Proyecto *</Label>
                            <Input id="name" name="name" placeholder="Ej: Campaña Verano 2024" required />
                            {state?.errors?.name && <p className="text-red-500 text-sm">{state.errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code">Código</Label>
                            <Input id="code" name="code" placeholder="Ej: MO239" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="clientId">Cliente</Label>
                        <Select name="clientId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar Cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {state?.errors?.clientId && <p className="text-red-500 text-sm">{state.errors.clientId}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" placeholder="Objetivos y alcance del proyecto..." rows={3} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select name="status" defaultValue="PLANNING">
                                <SelectTrigger>
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PLANNING">Planificación</SelectItem>
                                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                                    <SelectItem value="REVIEW">Revisión</SelectItem>
                                    <SelectItem value="ON_HOLD">En Pausa</SelectItem>
                                    <SelectItem value="COMPLETED">Completado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="budget">Presupuesto</Label>
                            <Input id="budget" name="budget" type="number" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="dueDate">Fecha de Entrega</Label>
                        <Input id="dueDate" name="dueDate" type="date" />
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button variant="outline" type="button">Cancelar</Button>
                        </SheetClose>
                        <Button type="submit">Crear Proyecto</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
