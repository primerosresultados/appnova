"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Pencil, Archive } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { deleteProject, archiveProject } from "@/app/projects/actions";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface ProjectActionsProps {
    projectId: string;
}

export function ProjectActions({ projectId }: ProjectActionsProps) {
    const [open, setOpen] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    const handleArchive = async () => {
        setIsArchiving(true);
        try {
            const result = await archiveProject(projectId);
            if (result.success) {
                toast.success("Proyecto archivado.");
                setOpen(false);
            } else {
                toast.error("Error al archivar el proyecto.");
            }
        } catch (error) {
            toast.error("Error inesperado.");
        } finally {
            setIsArchiving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteProject(projectId);
            if (result.success) {
                toast.success("Proyecto eliminado.");
            } else {
                toast.error("Error al eliminar el proyecto.");
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/projects/${projectId}`}>Ver Detalles</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        // TODO: Implement Edit
                        toast.error("Edición próximamente");
                    }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleArchive}
                        disabled={isArchiving}
                    >
                        <Archive className="h-4 w-4 mr-2" />
                        {isArchiving ? "Archivando..." : "Archivar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => {
                            e.preventDefault();
                            setShowDeleteDialog(true);
                            setOpen(false);
                        }}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el proyecto y todas sus tareas asociadas.
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
