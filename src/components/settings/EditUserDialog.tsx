"use client";

import { useActionState, useState, useEffect } from "react";
import { updateUser } from "@/app/actions/user-actions";
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
import { Pencil, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface EditUserDialogProps {
    user: User;
}

const initialState = {
    success: false,
    message: ""
};

export function EditUserDialog({ user }: EditUserDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(updateUser, initialState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (state?.success) {
            toast.success("Usuario actualizado correctamente");
            setOpen(false);
            setLoading(false);
            router.refresh();
        } else if (state?.message && !state.success) {
            toast.error(state.message);
            setLoading(false);
        }
    }, [state, router]);

    const handleSubmit = (formData: FormData) => {
        setLoading(true);
        formAction(formData);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    <span className="sr-only">Editar</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del usuario aquí. Haz clic en guardar cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="currentEmail" value={user.email} />

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input id="name" name="name" defaultValue={user.name} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input id="email" name="email" type="email" defaultValue={user.email} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select name="role" defaultValue={user.role}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                                <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                                <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                                <SelectItem value="CLIENTE">Cliente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/50">
                        <Label>Contraseña</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                            Para cambiar la contraseña, solicita un restablecimiento.
                        </p>
                        <Button variant="outline" type="button" className="w-full" disabled>
                            Enviar correo de restablecimiento (Próximamente)
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
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
