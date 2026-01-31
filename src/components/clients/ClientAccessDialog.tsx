"use client";

import { useActionState, useState, useEffect } from "react";
import { grantClientAccess } from "@/app/clients/actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

const initialState = {
    success: false,
    message: ""
};

interface ClientAccessDialogProps {
    client: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClientAccessDialog({ client, open, onOpenChange }: ClientAccessDialogProps) {
    const [state, formAction] = useActionState(grantClientAccess, initialState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (state?.success) {
            toast.success(`Acceso concedido a ${client.name}`);
            onOpenChange(false);
            setLoading(false);
        } else if (state?.message && !state.success) {
            toast.error(state.message);
            setLoading(false);
        }
    }, [state, onOpenChange, client.name]);

    const handleSubmit = (formData: FormData) => {
        setLoading(true);
        formAction(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Dar Acceso a Plataforma</DialogTitle>
                    <DialogDescription>
                        Crea una cuenta de usuario para este cliente. Se le enviará un correo con instrucciones (simulado).
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <input type="hidden" name="clientId" value={client.id} />

                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-md flex gap-2 text-amber-600 text-xs mb-2">
                        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>El usuario tendrá rol de CLIENTE y solo verá proyectos asociados a esta cuenta.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de Usuario</Label>
                        <Input id="name" name="name" defaultValue={client.name} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico (Login)</Label>
                        <Input id="email" name="email" type="email" defaultValue={client.email || ""} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña Inicial</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type="text"
                                required
                                minLength={6}
                                placeholder="Ej: Client123!"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">Mínimo 6 caracteres.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Mail className="mr-2 h-4 w-4" />
                            Crear y Enviar Accesos
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
