"use client";

import { useActionState, useState, useEffect } from "react";
import { createAccount } from "@/app/actions/finance-actions";
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
import { Plus, Wallet, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const initialState = {
    success: false,
    message: ""
};

export function NewAccountDialog() {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(createAccount, initialState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (state?.success) {
            toast.success("Cuenta creada correctamente");
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
                <Button variant="outline" className="w-full text-xs" size="sm">
                    <Plus className="mr-2 h-3 w-3" /> Añadir Cuenta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nueva Cuenta</DialogTitle>
                    <DialogDescription>
                        Registra una nueva cuenta bancaria o caja chica para gestionar tus finanzas.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Cuenta</Label>
                        <Input id="name" name="name" placeholder="Ej: Banco Chileno - Corriente" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Cuenta</Label>
                        <Select name="type" defaultValue="BANK">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BANK">Cuenta Bancaria</SelectItem>
                                <SelectItem value="CASH">Efectivo / Caja Chica</SelectItem>
                                <SelectItem value="WALLET">Billetera Digital</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="balance">Saldo Inicial</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                                id="balance"
                                name="balance"
                                type="number"
                                placeholder="0"
                                className="pl-7"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Cuenta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
