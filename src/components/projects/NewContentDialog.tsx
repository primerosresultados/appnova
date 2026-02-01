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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { createContent } from "@/app/projects/content-actions";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { uploadFile } from "@/app/actions/upload-actions";
import { Upload, X, FileIcon, ImageIcon } from "lucide-react";

import { MediaPreview } from "./MediaPreview";

interface NewContentDialogProps {
    projectId: string;
}

export function NewContentDialog({ projectId }: NewContentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState<Date>();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

        // Handle File Upload
        if (selectedFile) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", selectedFile);
            const uploadResult = await uploadFile(uploadFormData);

            if (uploadResult.success && uploadResult.url) {
                formData.set("fileUrl", uploadResult.url);
                if (selectedFile.type.startsWith('image/') && !formData.get("mediaUrl")) {
                    formData.set("mediaUrl", uploadResult.url);
                }
            } else {
                toast.error("Error al subir archivo");
                setIsSubmitting(false);
                return;
            }
        }

        const result = await createContent(projectId, formData);

        if (result.success) {
            toast.success("Contenido creado correctamente");
            setOpen(false);
            setDate(undefined);
            setPreviewUrl(null);
            setSelectedFile(null);
        } else {
            toast.error("Error al crear contenido");
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Contenido
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Contenido</DialogTitle>
                    <DialogDescription>
                        Planifica una nueva pieza de contenido para el proyecto.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" required placeholder="Ej: Post Lanzamiento" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Select name="type" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INSTAGRAM_POST">Instagram Post</SelectItem>
                                <SelectItem value="INSTAGRAM_REEL">Instagram Reel</SelectItem>
                                <SelectItem value="INSTAGRAM_STORY">Instagram Story</SelectItem>
                                <SelectItem value="SEO">Artículo SEO</SelectItem>
                                <SelectItem value="ADS_CAMPAIGN">Campaña Ads</SelectItem>
                                <SelectItem value="EMAIL">Email Marketing</SelectItem>
                                <SelectItem value="OTHER">Otro</SelectItem>
                            </SelectContent>
                        </Select>
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
                        <Textarea id="description" name="description" placeholder="Detalles del contenido..." />
                    </div>

                    <div className="grid gap-2">
                        <Label>URL de Previsualización (Drive, YouTube, Imagen)</Label>
                        <Input id="mediaUrl" name="mediaUrl" placeholder="https://..." onChange={handleUrlChange} />

                        <div className="aspect-video w-full mt-2 rounded-lg border border-border/50 overflow-hidden relative">
                            <MediaPreview url={previewUrl} />

                            {selectedFile && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
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
                                    <input type="file" className="hidden" onChange={handleFileChange} />
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
                        <Input id="links" name="links" placeholder="https://..." />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Crear Contenido"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
