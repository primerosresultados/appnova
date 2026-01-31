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
import { deleteClient } from "@/app/clients/actions";
import { toast } from "react-hot-toast";
import Link from "next/link";

// ... imports
import { EditClientDialog } from "./EditClientDialog";
import { ClientAccessDialog } from "./ClientAccessDialog";

interface ClientActionsProps {
    client: any; // Changed from clientId to client object to pass full data for edit
}

export function ClientActions({ client }: ClientActionsProps) {
    const [open, setOpen] = useState(false);

    // Dialog States
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showAccessDialog, setShowAccessDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteClient(client.id);
            if (result.success) {
                toast.success("Cliente eliminado.");
            } else {
                toast.error("Error al eliminar cliente.");
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
                    <DropdownMenuItem asChild>
                        <Link href={`/clients/${client.id}`}>Ver Detalles</Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        setShowEditDialog(true);
                        setOpen(false);
                    }}>
                        Editar Cliente
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        setShowAccessDialog(true);
                        setOpen(false);
                    }}>
                        Dar Acceso (Plataforma)
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => {
                            e.preventDefault();
                            setShowDeleteDialog(true);
                            setOpen(false);
                        }}
                    >
                        Eliminar Cliente
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {showEditDialog && (
                <EditClientDialog
                    client={client}
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                />
            )}

            {showAccessDialog && (
                <ClientAccessDialog
                    client={client}
                    open={showAccessDialog}
                    onOpenChange={setShowAccessDialog}
                />
            )}

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Cliente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará al cliente y POSIBLEMENTE sus proyectos asociados si no se han reasignado.
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
