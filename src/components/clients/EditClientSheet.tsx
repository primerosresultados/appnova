"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this, otherwise Input
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
import { useActionState, useEffect, useState } from "react";
import { updateClient } from "@/app/clients/actions";
import { Separator } from "@/components/ui/separator";

type ActionState = {
    message: string;
    errors?: {
        name?: string[];
        company?: string[];
        website?: string[];
        industry?: string[];
        status?: string[];
        phone?: string[];
        email?: string[];
        taxId?: string[];
        billingAddress?: string[];
        billingEmail?: string[];
    };
    success?: boolean;
};

const initialState: ActionState = {
    message: "",
    errors: {},
    success: false
};

interface EditClientSheetProps {
    client: {
        id: string;
        name: string;
        company?: string | null;
        website?: string | null;
        industry?: string | null;
        status: string;
        phone?: string | null;
        email?: string | null;
        taxId?: string | null;
        billingAddress?: string | null;
        billingEmail?: string | null;
    };
}

export function EditClientSheet({ client }: EditClientSheetProps) {
    const [state, formAction] = useActionState(updateClient, initialState);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (state?.success) {
            setOpen(false);
            // Optional: Toast message
        }
    }, [state]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    Editar Cliente
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Editar Cliente</SheetTitle>
                    <SheetDescription>
                        Modifica los detalles del cliente, información de facturación y contacto.
                    </SheetDescription>
                </SheetHeader>
                <form action={formAction} className="grid gap-6 py-6">
                    <input type="hidden" name="id" value={client.id} />

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium leading-none text-muted-foreground uppercase tracking-wider">Información General</h3>
                        <Separator />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre Cliente (Interno)</Label>
                                <Input id="name" name="name" defaultValue={client.name} required />
                                {state?.errors?.name && <p className="text-red-500 text-sm">{state.errors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="company">Nombre Empresa (Legal)</Label>
                                <Input id="company" name="company" defaultValue={client.company || ""} placeholder="Razón Social o Fantasía" />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select name="status" defaultValue={client.status}>
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
                            <div className="grid gap-2">
                                <Label htmlFor="industry">Industria</Label>
                                <Input id="industry" name="industry" defaultValue={client.industry || ""} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="website">Sitio Web</Label>
                                <Input id="website" name="website" defaultValue={client.website || ""} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium leading-none text-muted-foreground uppercase tracking-wider">Contacto</h3>
                        <Separator />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={client.email || ""} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" name="phone" defaultValue={client.phone || ""} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium leading-none text-muted-foreground uppercase tracking-wider">Facturación</h3>
                        <Separator />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="taxId">Tax ID / RUT / NIF</Label>
                                <Input id="taxId" name="taxId" defaultValue={client.taxId || ""} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="billingEmail">Email de Facturación</Label>
                                <Input id="billingEmail" name="billingEmail" type="email" defaultValue={client.billingEmail || ""} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="billingAddress">Dirección de Facturación</Label>
                            <Input id="billingAddress" name="billingAddress" defaultValue={client.billingAddress || ""} />
                        </div>
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button variant="outline" type="button">Cancelar</Button>
                        </SheetClose>
                        <Button type="submit">Guardar Cambios</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
