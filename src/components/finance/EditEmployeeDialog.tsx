"use client";

import { useActionState, useState, useEffect } from "react";
import { updateEmployee } from "@/app/actions/hr-actions";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

const initialState = {
    success: false,
    message: ""
};

interface EditEmployeeDialogProps {
    employee: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditEmployeeDialog({ employee, open, onOpenChange }: EditEmployeeDialogProps) {
    const [state, formAction] = useActionState(updateEmployee, initialState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (state?.success) {
            toast.success("Colaborador actualizado correctamente");
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Colaborador</DialogTitle>
                    <DialogDescription>
                        Actualiza la información del colaborador.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <input type="hidden" name="id" value={employee.id} />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" name="name" required defaultValue={employee.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="position">Cargo</Label>
                            <Input id="position" name="position" required defaultValue={employee.position} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="salary">Sueldo Líquido</Label>
                            <Input id="salary" name="salary" type="number" required defaultValue={employee.salary} min="0" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select name="status" defaultValue={employee.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Activo</SelectItem>
                                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                    <SelectItem value="LEAVE">Licencia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">Fecha de Inicio</Label>
                            <Input id="startDate" name="startDate" type="date" required defaultValue={employee.startDate ? format(new Date(employee.startDate), "yyyy-MM-dd") : ""} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endDate">Fecha de Término (Opcional)</Label>
                            <Input id="endDate" name="endDate" type="date" defaultValue={employee.endDate ? format(new Date(employee.endDate), "yyyy-MM-dd") : ""} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email (Opcional)</Label>
                            <Input id="email" name="email" type="email" defaultValue={employee.email || ""} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Teléfono (Opcional)</Label>
                            <Input id="phone" name="phone" defaultValue={employee.phone || ""} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
