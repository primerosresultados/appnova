"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Instagram,
    Facebook,
    Search,
    Plus,
    ExternalLink,
    MoreHorizontal,
    Image as ImageIcon,
    Video,
    FileText,
    Megaphone
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NewContentDialog } from "./NewContentDialog";
import { EditContentDialog } from "./EditContentDialog";
import { MediaPreview } from "./MediaPreview";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteContent } from "@/app/projects/content-actions";
import { toast } from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ContentsTabProps {
    projectId: string;
    contents: any[];
}

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
    SEO: { icon: Search, color: "text-blue-500 bg-blue-500/10", label: "Post SEO" },
    INSTAGRAM_POST: { icon: Instagram, color: "text-pink-500 bg-pink-500/10", label: "IG Post" },
    INSTAGRAM_STORY: { icon: Instagram, color: "text-rose-500 bg-rose-500/10", label: "IG Story" },
    INSTAGRAM_REEL: { icon: Instagram, color: "text-purple-500 bg-purple-500/10", label: "IG Reel" },
    FACEBOOK_POST: { icon: Facebook, color: "text-blue-600 bg-blue-600/10", label: "FB Post" },
    ADS_CAMPAIGN: { icon: Megaphone, color: "text-amber-500 bg-amber-500/10", label: "Campaña Ads" },
};

const statusMap: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Borrador", color: "bg-slate-500/10 text-slate-500" },
    REVIEW: { label: "En Revisión", color: "bg-amber-500/10 text-amber-500" },
    APPROVED: { label: "Aprobado", color: "bg-emerald-500/10 text-emerald-500" },
    SCHEDULED: { label: "Programado", color: "bg-blue-500/10 text-blue-500" },
    PUBLISHED: { label: "Publicado", color: "bg-indigo-500/10 text-indigo-500" },
};

export function ContentsTab({ projectId, contents }: ContentsTabProps) {
    const [editingItem, setEditingItem] = useState<any>(null);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        const result = await deleteContent(itemToDelete.id, projectId);
        if (result.success) {
            toast.success("Contenido eliminado");
        } else {
            toast.error("Error al eliminar");
        }
        setItemToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Gestión de Contenidos</h2>
                    <p className="text-sm text-muted-foreground text-balanced">Planificación visual de publicaciones y campañas.</p>
                </div>
                <NewContentDialog projectId={projectId} />
            </div>

            {contents.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-border/40 rounded-xl bg-card/30">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Aún no hay contenido programado</h3>
                    <p className="text-muted-foreground mb-6">Comienza a crear posts, reels o campañas para este proyecto.</p>
                    <NewContentDialog projectId={projectId} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contents.map((item) => {
                        const config = typeConfig[item.type] || { icon: FileText, color: "bg-primary/10", label: item.type };
                        const Icon = config.icon;
                        const status = statusMap[item.status] || { label: item.status, color: "bg-secondary" };

                        return (
                            <Card key={item.id} className="group overflow-hidden bg-card/40 border-border/50 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5">
                                <div className="aspect-video relative overflow-hidden bg-muted">
                                    <MediaPreview url={item.mediaUrl} type={item.type} />
                                    <div className="absolute top-2 left-2 flex gap-2">
                                        <Badge className={`${config.color} border-none backdrop-blur-md`}>
                                            <Icon className="h-3 w-3 mr-1" />
                                            {config.label}
                                        </Badge>
                                    </div>
                                    {item.publishDate && (
                                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] text-white font-medium border border-white/10">
                                            {format(new Date(item.publishDate), 'dd MMM', { locale: es })}
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-semibold text-sm line-clamp-2 min-h-[40px] leading-tight">
                                            {item.title}
                                        </h4>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingItem(item)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => setItemToDelete(item)}>
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                        {item.description || "Sin descripción."}
                                    </p>

                                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                        <Badge variant="secondary" className={`${status.color} border-none text-[10px] py-0 px-2 h-5`}>
                                            {status.label}
                                        </Badge>
                                        <div className="flex gap-1">
                                            {item.links && (
                                                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                    <a href={item.links} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Dialogs */}
            {editingItem && (
                <EditContentDialog
                    content={editingItem}
                    projectId={projectId}
                    open={!!editingItem}
                    onOpenChange={(open) => !open && setEditingItem(null)}
                />
            )}

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente la pieza de contenido "{itemToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
