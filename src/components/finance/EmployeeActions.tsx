"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
import { deleteEmployee } from "@/app/actions/hr-actions";
import { toast } from "react-hot-toast";
import { EditEmployeeDialog } from "./EditEmployeeDialog";

interface EmployeeActionsProps {
    employee: any;
}

export function EmployeeActions({ employee }: EmployeeActionsProps) {
    const [open, setOpen] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteEmployee(employee.id);
            if (result.success) {
                toast.success("Colaborador eliminado.");
            } else {
                toast.error("Error al eliminar colaborador.");
            }
        } catch (error) {
            toast.error("Error inesperado.");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        setShowEditDialog(true);
                        setOpen(false);
                    }}>
                        Editar Información
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => {
                            e.preventDefault();
                            setShowDeleteDialog(true);
                            setOpen(false);
                        }}
                    >
                        Eliminar Colaborador
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {showEditDialog && (
                <EditEmployeeDialog
                    employee={employee}
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                />
            )}

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Colaborador?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará al colaborador del registro. Histórico de sueldos pasados podría verse afectado si se recalcula.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
