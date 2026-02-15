"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2, Upload, X, FileIcon } from "lucide-react";
import { updateContent } from "@/app/projects/content-actions";
import { uploadFile } from "@/app/actions/upload-actions";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MediaPreview } from "./MediaPreview";

interface EditContentDialogProps {
    content: any;
    projectId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditContentDialog({ content, projectId, open, onOpenChange }: EditContentDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState<Date | undefined>(content.publishDate ? new Date(content.publishDate) : undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(content.mediaUrl);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPreviewUrl(e.target.value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        if (date) {
            formData.set("publishDate", date.toISOString());
        }

        // Preserve existing fileUrl if not uploading a new file
        if (!selectedFile && content.fileUrl) {
            formData.set("fileUrl", content.fileUrl);
        }

        // Handle new file upload
        if (selectedFile) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", selectedFile);
            const uploadResult = await uploadFile(uploadFormData);

            if (uploadResult.success && uploadResult.url) {
                formData.set("fileUrl", uploadResult.url);
                // If the uploaded file is an image and user didn't manually set a mediaUrl, use the uploaded image
                if (selectedFile.type.startsWith('image/')) {
                    formData.set("mediaUrl", uploadResult.url);
                }
            } else {
                toast.error("Error al subir archivo");
                setIsSubmitting(false);
                return;
            }
        }

        const result = await updateContent(content.id, projectId, formData);

        if (result.success) {
            toast.success("Contenido actualizado");
            onOpenChange(false);
        } else {
            toast.error("Error al actualizar contenido");
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Contenido</DialogTitle>
                    <DialogDescription>
                        Actualiza los detalles de esta pieza de contenido.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" required defaultValue={content.title} />
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo</Label>
                                <Select name="type" defaultValue={content.type} required>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GRAFICA">Gráfica</SelectItem>
                                        <SelectItem value="INSTAGRAM_POST">Instagram Post</SelectItem>
                                        <SelectItem value="INSTAGRAM_REEL">Reel</SelectItem>
                                        <SelectItem value="INSTAGRAM_STORY">Historia</SelectItem>
                                        <SelectItem value="CAROUSEL">Carrusel</SelectItem>
                                        <SelectItem value="LIVE">Live</SelectItem>
                                        <SelectItem value="SEO">Post SEO</SelectItem>
                                        <SelectItem value="EMAIL">Mailing</SelectItem>
                                        <SelectItem value="ADS_CAMPAIGN">Campaña Ads</SelectItem>
                                        <SelectItem value="OTHER">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select name="status" defaultValue={content.status} required>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Borrador</SelectItem>
                                        <SelectItem value="REVIEW">Revisión</SelectItem>
                                        <SelectItem value="APPROVED">Aprobado</SelectItem>
                                        <SelectItem value="SCHEDULED">Programado</SelectItem>
                                        <SelectItem value="PUBLISHED">Publicado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Fecha de Publicación</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" defaultValue={content.description || ""} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mediaUrl">URL de Previsualización (Drive, YouTube, Imagen)</Label>
                        <Input id="mediaUrl" name="mediaUrl" defaultValue={content.mediaUrl || ""} onChange={handleUrlChange} />

                        <div className="aspect-video w-full mt-2 rounded-lg border border-border/50 overflow-hidden relative">
                            <MediaPreview url={previewUrl} type={content.type} />

                            {selectedFile && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl(content.mediaUrl);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>

                        {!selectedFile && (
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-10 border border-border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Upload className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">O sube un archivo local</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        )}
                        {selectedFile && !selectedFile.type.startsWith('image/') && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-secondary/20 rounded">
                                <FileIcon className="h-4 w-4" />
                                <span className="truncate flex-1">{selectedFile.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="links">Link Final (Opcional)</Label>
                        <Input id="links" name="links" defaultValue={content.links || ""} placeholder="https://..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
