"use client";

import { useState, useEffect, useActionState, useOptimistic, startTransition } from "react";
import { createResource, deleteResource } from "@/app/projects/resource-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Plus, Trash2, ExternalLink, Lightbulb, Link as LinkIcon, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ReferenceCard } from "./ReferenceCard";

interface Resource {
    id: string;
    name: string;
    type: string; // IDEA, LINK, etc.
    url: string | null;
    content: string | null;
}

interface CreativitiesTabProps {
    projectId: string;
    resources: Resource[];
}

const initialState = {
    message: "",
    success: false
};

export function CreativitiesTab({ projectId, resources }: CreativitiesTabProps) {
    const [state, formAction, isPending] = useActionState(createResource, initialState);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"IDEA" | "LINK">("IDEA");
    const [content, setContent] = useState("");

    const [optimisticResources, addOptimisticResource] = useOptimistic(
        resources,
        (state, newResource: Resource) => [...state, newResource]
    );

    useEffect(() => {
        if (state.success) {
            toast.success("Elemento agregado correctamente");
            setContent("");
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state]);

    const handleFormSubmit = async (formData: FormData) => {
        const newResource: Resource = {
            id: Math.random().toString(), // Temp ID
            name: formData.get("name") as string,
            type: formData.get("type") as string,
            url: formData.get("url") as string || null,
            content: formData.get("content") as string || null,
        };

        startTransition(() => {
            addOptimisticResource(newResource);
        });

        setIsDialogOpen(false);
        formAction(formData);
    };

    const ideas = optimisticResources.filter(r => r.type === "IDEA");
    const refLinks = optimisticResources.filter(r => r.type === "LINK");

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar este elemento?")) {
            await deleteResource(id, projectId);
            toast.success("Eliminado");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        Creatividad & Referencias
                    </h3>
                    <p className="text-sm text-muted-foreground">Espacio para lluvia de ideas y referencias visuales.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setActiveTab("IDEA")}>
                            <Plus className="h-4 w-4 mr-2" /> Nueva Idea / Ref
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Elemento Creativo</DialogTitle>
                            <DialogDescription>
                                Guarda una idea rápida o un enlace de inspiración.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex gap-2 mb-4 bg-muted p-1 rounded-lg">
                            <Button
                                variant={activeTab === "IDEA" ? "default" : "ghost"}
                                className="flex-1"
                                onClick={() => setActiveTab("IDEA")}
                                type="button"
                            >
                                <Lightbulb className="mr-2 h-4 w-4" /> Idea
                            </Button>
                            <Button
                                variant={activeTab === "LINK" ? "default" : "ghost"}
                                className="flex-1"
                                onClick={() => setActiveTab("LINK")}
                                type="button"
                            >
                                <LinkIcon className="mr-2 h-4 w-4" /> Enlace
                            </Button>
                        </div>

                        <form action={handleFormSubmit} className="space-y-4">
                            <input type="hidden" name="projectId" value={projectId} />
                            <input type="hidden" name="type" value={activeTab} />

                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input name="name" required placeholder={activeTab === "IDEA" ? "Ej: Concepto minimalista" : "Ej: Pinterest Board"} />
                            </div>

                            {activeTab === "IDEA" ? (
                                <div className="space-y-2">
                                    <Label>Descripción de la Idea</Label>
                                    <RichTextEditor value={content} onChange={setContent} placeholder="Describe la idea con formato..." className="min-h-[150px]" />
                                    <input type="hidden" name="content" value={content} />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>URL de Referencia</Label>
                                    <Input name="url" required placeholder="https://..." />
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="submit">Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Ideas Column */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" /> Ideas
                    </h4>
                    {ideas.length === 0 && (
                        <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <Lightbulb className="h-8 w-8 mb-2" />
                            <span className="text-sm">Sin ideas registradas</span>
                        </div>
                    )}
                    {ideas.map(idea => (
                        <Card key={idea.id} className="relative group hover:border-primary/50 transition-colors">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 text-muted-foreground hover:text-destructive transition-opacity"
                                onClick={() => handleDelete(idea.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{idea.name}</CardTitle>
                                <CardDescription className="text-xs">
                                    Creado el {new Date().toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="text-sm text-foreground/80 prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4"
                                    dangerouslySetInnerHTML={{ __html: idea.content || '' }}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Links Column */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> Referencias
                    </h4>
                    {refLinks.length === 0 && (
                        <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <LinkIcon className="h-8 w-8 mb-2" />
                            <span className="text-sm">Sin referencias</span>
                        </div>
                    )}
                    <div className="grid gap-6">
                        {refLinks.map(link => (
                            <ReferenceCard key={link.id} link={link} onDelete={handleDelete} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
