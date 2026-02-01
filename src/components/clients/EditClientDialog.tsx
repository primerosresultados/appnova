"use client";

import { useActionState, useState, useEffect } from "react";
import { updateClient } from "@/app/clients/actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil } from "lucide-react";
import toast from "react-hot-toast";

const initialState = {
    success: false,
    message: ""
};

interface EditClientDialogProps {
    client: any; // Using any for simplicity in this context, ideally would be the Client type
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
    const [state, formAction] = useActionState(updateClient, initialState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (state?.success) {
            toast.success("Cliente actualizado correctamente");
            onOpenChange(false);
            setLoading(false);
        } else if (state?.message && !state.success) {
            toast.error(state.message);
            setLoading(false);
        }
    }, [state, onOpenChange]);

    const handleSubmit = (formData: FormData) => {
        setLoading(true);
        formAction(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-10">
                <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del cliente.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <input type="hidden" name="id" value={client.id} />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" name="name" defaultValue={client.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Empresa / Razón Social</Label>
                            <Input id="company" name="company" defaultValue={client.company || ""} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="taxId">RUT</Label>
                            <Input id="taxId" name="taxId" defaultValue={client.taxId || ""} placeholder="XX.XXX.XXX-X" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo de Contacto</Label>
                            <Input id="email" name="email" type="email" defaultValue={client.email || ""} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industria</Label>
                            <Input id="industry" name="industry" defaultValue={client.industry || ""} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select name="status" defaultValue={client.status}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Activo</SelectItem>
                                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                    <SelectItem value="LEAD">Prospecto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Sitio Web</Label>
                        <Input id="website" name="website" defaultValue={client.website || ""} placeholder="https://..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
