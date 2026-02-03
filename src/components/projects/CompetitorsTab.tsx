"use client";

import { useState, useActionState } from "react";
import { createCompetitor, deleteCompetitor } from "@/app/projects/competitor-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, Trash2, ExternalLink, Globe } from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

interface Competitor {
    id: string;
    name: string;
    website: string | null;
    description: string | null;
    competitiveAdvantages: string | null;
    metaAdsUrl: string | null;
    googleAdsUrl: string | null;
    products: string | null;
    services: string | null;
    pricing: string | null;
    offers: string | null;
}

interface CompetitorsTabProps {
    projectId: string;
    competitors: Competitor[];
}

const initialState = {
    message: "",
    success: false
};

export function CompetitorsTab({ projectId, competitors }: CompetitorsTabProps) {
    const [state, formAction] = useActionState(createCompetitor, initialState);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar este competidor?")) {
            const result = await deleteCompetitor(id, projectId);
            if (result.success) {
                toast.success("Competidor eliminado");
            } else {
                toast.error(result.message);
            }
        }
    };

    // Parse JSON safely
    const parseJSON = (str: string | null) => {
        if (!str) return [];
        try {
            return JSON.parse(str);
        } catch {
            return [];
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Target className="h-5 w-5 text-red-500" />
                        Competencia
                    </h3>
                    <p className="text-sm text-muted-foreground">Monitorea a tus principales competidores y su estrategia.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Agregar Competidor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Agregar Competidor</DialogTitle>
                            <DialogDescription>
                                Registra información clave sobre la competencia.
                            </DialogDescription>
                        </DialogHeader>

                        <form action={formAction} className="space-y-4">
                            <input type="hidden" name="projectId" value={projectId} />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del Competidor *</Label>
                                    <Input id="name" name="name" required placeholder="Ej: Competidor ABC" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Sitio Web</Label>
                                    <Input id="website" name="website" type="url" placeholder="https://..." />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea id="description" name="description" placeholder="Breve descripción del competidor..." rows={2} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="competitiveAdvantages">Ventajas Competitivas</Label>
                                <Textarea id="competitiveAdvantages" name="competitiveAdvantages" placeholder="¿Qué hace mejor este competidor?" rows={3} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="metaAdsUrl">📘 Enlace Anuncios Meta</Label>
                                    <Input id="metaAdsUrl" name="metaAdsUrl" type="url" placeholder="Meta Ads Library URL" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="googleAdsUrl">🔍 Enlace Anuncios Google</Label>
                                    <Input id="googleAdsUrl" name="googleAdsUrl" type="url" placeholder="Google Ads Transparency URL" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="products">Productos (JSON)</Label>
                                <Textarea
                                    id="products"
                                    name="products"
                                    placeholder={'[{"name":"Producto 1","price":"$100","description":"..."}]'}
                                    rows={2}
                                    className="font-mono text-xs"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="services">Servicios (JSON)</Label>
                                <Textarea
                                    id="services"
                                    name="services"
                                    placeholder={'[{"name":"Servicio 1","price":"$50/mes"}]'}
                                    rows={2}
                                    className="font-mono text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pricing">Estructura de Precios</Label>
                                    <Textarea id="pricing" name="pricing" placeholder="Describe la estrategia de precios..." rows={2} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="offers">Ofertas Actuales</Label>
                                    <Textarea id="offers" name="offers" placeholder="¿Qué promociones tienen activas?" rows={2} />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit">Guardar Competidor</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {competitors.length === 0 ? (
                <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <Target className="h-8 w-8 mb-2" />
                    <span className="text-sm">Sin competidores registrados</span>
                </div>
            ) : (
                <div className="grid gap-4">
                    {competitors.map((comp) => {
                        const products = parseJSON(comp.products);
                        const services = parseJSON(comp.services);

                        return (
                            <Card key={comp.id} className="relative group hover:border-primary/50 transition-colors">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity"
                                    onClick={() => handleDelete(comp.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <CardHeader>
                                    <div className="flex items-start justify-between pr-8">
                                        <div>
                                            <CardTitle className="text-lg">{comp.name}</CardTitle>
                                            {comp.website && (
                                                <a
                                                    href={comp.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                                                >
                                                    <Globe className="h-3 w-3" />
                                                    {comp.website}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {comp.description && (
                                        <CardDescription className="mt-2">{comp.description}</CardDescription>
                                    )}
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {comp.competitiveAdvantages && (
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                            <h4 className="font-semibold text-sm mb-1 text-amber-700 dark:text-amber-400">💪 Ventajas Competitivas</h4>
                                            <p className="text-sm">{comp.competitiveAdvantages}</p>
                                        </div>
                                    )}

                                    {(comp.metaAdsUrl || comp.googleAdsUrl) && (
                                        <div className="flex gap-2">
                                            {comp.metaAdsUrl && (
                                                <a
                                                    href={comp.metaAdsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-md hover:bg-blue-500/20 transition-colors"
                                                >
                                                    📘 Ver Anuncios Meta <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {comp.googleAdsUrl && (
                                                <a
                                                    href={comp.googleAdsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-md hover:bg-green-500/20 transition-colors"
                                                >
                                                    🔍 Ver Anuncios Google <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {products.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-sm mb-2">Productos</h4>
                                                <div className="space-y-1">
                                                    {products.map((prod: any, i: number) => (
                                                        <div key={i} className="text-sm flex justify-between items-center bg-muted/50 px-2 py-1 rounded">
                                                            <span>{prod.name}</span>
                                                            <Badge variant="outline" className="text-xs">{prod.price}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {services.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-sm mb-2">Servicios</h4>
                                                <div className="space-y-1">
                                                    {services.map((serv: any, i: number) => (
                                                        <div key={i} className="text-sm flex justify-between items-center bg-muted/50 px-2 py-1 rounded">
                                                            <span>{serv.name}</span>
                                                            <Badge variant="outline" className="text-xs">{serv.price}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {(comp.pricing || comp.offers) && (
                                        <div className="grid md:grid-cols-2 gap-3 pt-2 border-t">
                                            {comp.pricing && (
                                                <div>
                                                    <h4 className="font-semibold text-xs text-muted-foreground mb-1">PRECIOS</h4>
                                                    <p className="text-sm">{comp.pricing}</p>
                                                </div>
                                            )}
                                            {comp.offers && (
                                                <div>
                                                    <h4 className="font-semibold text-xs text-muted-foreground mb-1">OFERTAS</h4>
                                                    <p className="text-sm">{comp.offers}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
