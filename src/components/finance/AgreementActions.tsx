"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteContract, updateContractStatus } from "@/app/actions/finance-actions";
import toast from "react-hot-toast";
import { EditAgreementDialog } from "./EditAgreementDialog";
import { Pencil } from "lucide-react";

interface AgreementActionsProps {
    contract: any;
    clients: { id: string, name: string }[];
}

export function AgreementActions({ contract, clients }: AgreementActionsProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        const result = await deleteContract(contract.id);
        if (result.success) {
            toast.success("Acuerdo eliminado");
        } else {
            toast.error(result.message || "Error al eliminar");
        }
        setLoading(false);
        setIsDeleteDialogOpen(false);
    };

    const handleToggleStatus = async () => {
        const newStatus = contract.status === "ACTIVE" ? "TERMINATED" : "ACTIVE";
        setLoading(true);
        const result = await updateContractStatus(contract.id, newStatus);
        if (result.success) {
            toast.success(newStatus === "TERMINATED" ? "Acuerdo terminado" : "Acuerdo reactivado");
        } else {
            toast.error(result.message || "Error al actualizar");
        }
        setLoading(false);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} disabled={loading}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Acuerdo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleStatus} disabled={loading}>
                        {contract.status === "ACTIVE" ? (
                            <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Terminar Acuerdo
                            </>
                        ) : (
                            <>
                                <Power className="mr-2 h-4 w-4" />
                                Reactivar Acuerdo
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        disabled={loading}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar definitivamene
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el acuerdo
                            "<strong>{contract.title}</strong>" y todos sus registros asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={loading}
                        >
                            {loading ? "Eliminando..." : "Eliminar Acuerdo"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EditAgreementDialog
                contract={contract}
                clients={clients}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
        </>
    );
}
