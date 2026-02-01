"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { createResource, deleteResource } from "@/app/projects/resource-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, Key, Link as LinkIcon, FileText, Plus, Trash2, ExternalLink, HardDrive, File as FileIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Resource {
    id: string;
    name: string;
    type: string; // DRIVE, LINK, FILE, CREDENTIAL
    url: string | null;
    content: string | null;
}

interface ResourcesTabProps {
    projectId: string;
    resources: Resource[];
}

const initialState = {
    message: "",
    success: false
};

export function ResourcesTab({ projectId, resources }: ResourcesTabProps) {
    const [state, formAction] = useActionState(createResource, initialState);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState("LINK");
    const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (state.success) {
            toast.success("Recurso agregado correctamente");
            setIsDialogOpen(false);
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state]);

    const confirmDelete = async () => {
        if (resourceToDelete) {
            await deleteResource(resourceToDelete, projectId);
            toast.success("Recurso eliminado");
            setResourceToDelete(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'DRIVE': return <HardDrive className="h-5 w-5 text-blue-500" />;
            case 'CREDENTIAL': return <Key className="h-5 w-5 text-amber-500" />;
            case 'FILE': return <FileIcon className="h-5 w-5 text-emerald-500" />;
            default: return <LinkIcon className="h-5 w-5 text-purple-500" />;
        }
    };

    const filteredResources = (type: string) => resources.filter(r => r.type === type);

    // Group "Other" links if needed, or just show all
    const driveResources = filteredResources("DRIVE");
    const credentials = filteredResources("CREDENTIAL");
    const files = filteredResources("FILE");
    const links = filteredResources("LINK");

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Recursos del Proyecto</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Nuevo Recurso
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Recurso</DialogTitle>
                            <DialogDescription>Añade un enlace, archivo o credencial.</DialogDescription>
                        </DialogHeader>
                        <form action={formAction} className="space-y-4">
                            <input type="hidden" name="projectId" value={projectId} />

                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input name="name" required placeholder="Ej: Carpeta de Diseño" />
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select name="type" value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LINK">Enlace Web</SelectItem>
                                        <SelectItem value="DRIVE">Google Drive</SelectItem>
                                        <SelectItem value="FILE">Archivo Adjunto</SelectItem>
                                        <SelectItem value="CREDENTIAL">Credencial / Acceso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedType === 'FILE' ? (
                                <div className="space-y-2">
                                    <Label>Archivo</Label>
                                    <Input type="file" name="file" required />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>URL</Label>
                                    <Input name="url" placeholder="https://..." />
                                </div>
                            )}

                            {selectedType === 'CREDENTIAL' && (
                                <div className="space-y-2">
                                    <Label>Detalles (Usuario/Contraseña/Notas)</Label>
                                    <Textarea name="content" placeholder="Usuario: admin..." />
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="submit" onClick={() => setIsDialogOpen(false)}>Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Google Drive & Storage */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <HardDrive className="h-4 w-4" /> Almacenamiento & Drive
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {driveResources.length === 0 && <p className="text-xs text-muted-foreground">Sin carpetas vinculadas.</p>}
                        {driveResources.map(r => (
                            <div key={r.id} className="flex items-center justify-between p-2 rounded-md bg-accent/10 border border-border/30">
                                <a href={r.url || '#'} target="_blank" className="flex items-center gap-2 hover:underline truncate">
                                    <Folder className="h-4 w-4 text-blue-400" />
                                    <span className="text-sm font-medium">{r.name}</span>
                                </a>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setResourceToDelete(r.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Credentials */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Key className="h-4 w-4" /> Accesos & Credenciales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {credentials.length === 0 && <p className="text-xs text-muted-foreground">Sin credenciales guardadas.</p>}
                        {credentials.map(r => (
                            <div key={r.id} className="p-3 rounded-md bg-accent/10 border border-border/30 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        <Key className="h-3 w-3 text-amber-500" /> {r.name}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {r.url && (
                                            <a href={r.url} target="_blank" className="p-1 hover:bg-accent rounded">
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                        <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => setResourceToDelete(r.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                {r.content && (
                                    <div className="text-xs bg-background/50 p-2 rounded border border-border/20 font-mono">
                                        {r.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Files */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileIcon className="h-4 w-4" /> Archivos & Presupuestos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {files.length === 0 && <p className="text-xs text-muted-foreground">Sin archivos adjuntos.</p>}
                        {files.map(r => (
                            <div key={r.id} className="flex items-center justify-between p-2 rounded-md bg-accent/10 border border-border/30">
                                <a href={r.url || '#'} target="_blank" className="flex items-center gap-2 hover:underline truncate">
                                    <FileText className="h-4 w-4 text-emerald-400" />
                                    <span className="text-sm font-medium">{r.name}</span>
                                </a>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setResourceToDelete(r.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Links */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" /> Enlaces de Interés
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {links.length === 0 && <p className="text-xs text-muted-foreground">Sin enlaces guardados.</p>}
                        {links.map(r => (
                            <div key={r.id} className="flex items-center justify-between p-2 rounded-md bg-accent/10 border border-border/30">
                                <a href={r.url || '#'} target="_blank" className="flex items-center gap-2 hover:underline truncate">
                                    <ExternalLink className="h-4 w-4 text-purple-400" />
                                    <span className="text-sm font-medium">{r.name}</span>
                                </a>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setResourceToDelete(r.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={!!resourceToDelete} onOpenChange={() => setResourceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El recurso será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
