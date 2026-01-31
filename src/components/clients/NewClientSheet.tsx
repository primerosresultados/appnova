"use client";

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
import { Plus } from "lucide-react";
import { useActionState } from "react";
import { createClient } from "@/app/clients/actions";
import { useEffect, useState } from "react";

// Define the state type to match action return type
type ActionState = {
    message: string;
    errors?: {
        name?: string[];
        website?: string[];
        industry?: string[];
        status?: string[];
    };
    success?: boolean;
};

const initialState: ActionState = {
    message: "",
    errors: {},
    success: false
};

export function NewClientSheet() {
    const [state, formAction] = useActionState(createClient, initialState);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (state?.success) {
            setOpen(false);
            // Toast could go here
        }
    }, [state]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[540px]">
                <SheetHeader>
                    <SheetTitle>Agregar Nuevo Cliente</SheetTitle>
                    <SheetDescription>
                        Crea un nuevo perfil de cliente para comenzar a gestionar proyectos y facturación.
                    </SheetDescription>
                </SheetHeader>
                <form action={formAction} className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre del Cliente</Label>
                        <Input id="name" name="name" placeholder="Acme Corp" required />
                        {state?.errors?.name && <p className="text-red-500 text-sm">{state.errors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="industry">Industria</Label>
                        <Input id="industry" name="industry" placeholder="Technology, Retail, etc." />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="website">Sitio Web</Label>
                        <Input id="website" name="website" placeholder="https://example.com" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="taxId">RUT de Facturación</Label>
                        <Input id="taxId" name="taxId" placeholder="12.345.678-9" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select name="status" defaultValue="ACTIVE">
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Activo</SelectItem>
                                <SelectItem value="LEAD">Lead</SelectItem>
                                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button variant="outline" type="button">Cancelar</Button>
                        </SheetClose>
                        <Button type="submit">Crear Cliente</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
