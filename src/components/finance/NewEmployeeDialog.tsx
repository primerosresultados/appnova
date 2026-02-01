"use client";

import { useActionState, useState, useEffect } from "react";
import { createEmployee } from "@/app/actions/hr-actions";
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
import { Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";

const initialState = {
    success: false,
    message: ""
};

export function NewEmployeeDialog() {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(createEmployee, initialState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (state?.success) {
            toast.success("Colaborador agregado correctamente");
            setOpen(false);
            setLoading(false);
        } else if (state?.message && !state.success) {
            toast.error(state.message);
            setLoading(false);
        }
    }, [state]);

    const handleSubmit = (formData: FormData) => {
        setLoading(true);
        formAction(formData);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Colaborador
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Colaborador</DialogTitle>
                    <DialogDescription>
                        Agrega un nuevo miembro al equipo para la gestión de nómina.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" name="name" required placeholder="Ej: Juan Pérez" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="position">Cargo</Label>
                            <Input id="position" name="position" required placeholder="Ej: Diseñador" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="salary">Sueldo Líquido</Label>
                            <Input id="salary" name="salary" type="number" required placeholder="0" min="0" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">Fecha de Inicio</Label>
                            <Input id="startDate" name="startDate" type="date" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email (Opcional)</Label>
                            <Input id="email" name="email" type="email" placeholder="juan@empresa.com" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Teléfono (Opcional)</Label>
                            <Input id="phone" name="phone" placeholder="+56 9..." />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
