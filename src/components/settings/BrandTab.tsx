"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Palette, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadFile } from "@/app/actions/upload-actions";
import { updateOrganizationSettings } from "@/app/actions/organization-actions";
import { toast } from "react-hot-toast";
import { Separator } from "@/components/ui/separator";

interface BrandTabProps {
    initialData: any;
}

// Helper to apply theme changes immediately without page reload
function applyThemeToDOM(settings: { primaryColor?: string; primaryTextColor?: string; sidebarColor?: string; sidebarTextColor?: string; borderRadius?: string }) {
    const root = document.documentElement;
    if (settings.sidebarColor) {
        root.style.setProperty('--sidebar', settings.sidebarColor);
    }
    if (settings.primaryColor) {
        root.style.setProperty('--primary', settings.primaryColor);
    }
    if (settings.primaryTextColor) {
        root.style.setProperty('--primary-foreground', settings.primaryTextColor);
    }
    if (settings.sidebarTextColor) {
        root.style.setProperty('--sidebar-muted-custom', settings.sidebarTextColor);
        root.style.setProperty('--sidebar-foreground', settings.sidebarTextColor);
    }
    if (settings.borderRadius) {
        root.style.setProperty('--radius', settings.borderRadius);
    }
}

export function BrandTab({ initialData }: BrandTabProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "");
    const [logoDarkUrl, setLogoDarkUrl] = useState(initialData?.logoDarkUrl || "");
    const [primaryColor, setPrimaryColor] = useState(initialData?.primaryColor || "#6366f1");
    const [primaryTextColor, setPrimaryTextColor] = useState(initialData?.primaryTextColor || "#ffffff");
    const [sidebarColor, setSidebarColor] = useState(initialData?.sidebarColor || "#0a0a0a");
    const [sidebarTextColor, setSidebarTextColor] = useState(initialData?.sidebarTextColor || "#ffffff");
    const [borderRadius, setBorderRadius] = useState(initialData?.borderRadius || "0.5rem");

    // Sync state when initialData changes (e.g. after router.refresh())
    useEffect(() => {
        if (initialData) {
            if (initialData.logoUrl !== undefined) setLogoUrl(initialData.logoUrl || "");
            if (initialData.logoDarkUrl !== undefined) setLogoDarkUrl(initialData.logoDarkUrl || "");
            if (initialData.primaryColor) setPrimaryColor(initialData.primaryColor);
            if (initialData.primaryTextColor) setPrimaryTextColor(initialData.primaryTextColor);
            if (initialData.sidebarColor) setSidebarColor(initialData.sidebarColor);
            if (initialData.sidebarTextColor) setSidebarTextColor(initialData.sidebarTextColor);
            if (initialData.borderRadius) setBorderRadius(initialData.borderRadius);
        }
    }, [initialData]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isDark: boolean = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await uploadFile(formData);
            if (result.success && result.url) {
                // Update local state immediately
                if (isDark) {
                    setLogoDarkUrl(result.url);
                } else {
                    setLogoUrl(result.url);
                }
                // Auto-save to database so sidebar updates immediately
                const savePayload: Record<string, string> = isDark
                    ? { logoDarkUrl: result.url }
                    : { logoUrl: result.url };
                await updateOrganizationSettings(savePayload);
                toast.success("Logo actualizado");
                // Refresh server data so sidebar picks up the new logo
                router.refresh();
            } else {
                toast.error(result.error || "Error al subir el logo");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión al subir el archivo");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await updateOrganizationSettings({
                logoUrl,
                logoDarkUrl,
                primaryColor,
                primaryTextColor,
                sidebarColor,
                sidebarTextColor,
                borderRadius
            });

            if (result.success) {
                toast.success("Configuración de marca actualizada");
                // Apply theme changes immediately to the DOM (no page reload needed)
                applyThemeToDOM({ primaryColor, primaryTextColor, sidebarColor, sidebarTextColor, borderRadius });
                // Soft-refresh server data without full hydration cycle
                router.refresh();
            } else {
                toast.error("Error al guardar los cambios");
            }
        } catch (error) {
            toast.error("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const radiusOptions = [
        { value: "0rem", label: "0" },
        { value: "0.3rem", label: "Pequeño" },
        { value: "0.5rem", label: "Medio" },
        { value: "0.75rem", label: "Grande" },
        { value: "1.0rem", label: "Extra Grande" },
        { value: "1.5rem", label: "Completo" },
    ];

    return (
        <div className="space-y-6">
            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle>Identidad de Marca</CardTitle>
                    <CardDescription>Personaliza el logo y los colores de tu organización.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Logos Section */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Light Mode Logo */}
                        <div className="space-y-4">
                            <Label>Logo (Modo Claro)</Label>
                            <div className="border-2 border-dashed border-border/50 rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-background/50 hover:bg-accent/5 transition-colors">
                                {logoUrl ? (
                                    <div className="relative h-20 w-fit p-2 bg-white rounded-lg shadow-sm">
                                        <img src={logoUrl} alt="Logo Light" className="h-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                        <ImageIcon className="h-8 w-8" />
                                    </div>
                                )}
                                <div className="flex flex-col items-center gap-2">
                                    <Label htmlFor="logo-light" className="cursor-pointer">
                                        <div className="flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                                            <Upload className="h-4 w-4" /> Subir Logo
                                        </div>
                                        <Input
                                            id="logo-light"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleUpload(e, false)}
                                            disabled={loading}
                                        />
                                    </Label>
                                    <span className="text-xs text-muted-foreground">Recomendado: PNG transparente</span>
                                </div>
                            </div>
                        </div>

                        {/* Dark Mode Logo */}
                        <div className="space-y-4">
                            <Label>Logo (Modo Oscuro)</Label>
                            <div className="border-2 border-dashed border-border/50 rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-slate-950 hover:bg-slate-900 transition-colors">
                                {logoDarkUrl ? (
                                    <div className="relative h-20 w-fit p-2 bg-transparent rounded-lg">
                                        <img src={logoDarkUrl} alt="Logo Dark" className="h-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="h-20 w-20 rounded-lg bg-white/10 flex items-center justify-center text-muted-foreground">
                                        <ImageIcon className="h-8 w-8" />
                                    </div>
                                )}
                                <div className="flex flex-col items-center gap-2">
                                    <Label htmlFor="logo-dark" className="cursor-pointer">
                                        <div className="flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                                            <Upload className="h-4 w-4" /> Subir Logo Oscuro
                                        </div>
                                        <Input
                                            id="logo-dark"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleUpload(e, true)}
                                            disabled={loading}
                                        />
                                    </Label>
                                    <span className="text-xs text-muted-foreground">Recomendado: Blanco o Claro</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Colors Section */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label>Color Primario</Label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-12 w-12 rounded-lg border shadow-sm transition-transform cursor-pointer hover:scale-105 active:scale-95"
                                    style={{ backgroundColor: primaryColor }}
                                    onClick={() => document.getElementById('primary-color-picker')?.click()}
                                />
                                <div className="flex-1 max-w-xs">
                                    <div className="relative">
                                        <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="primary-color-picker"
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="pl-9 h-10 w-full cursor-pointer"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground uppercase">
                                            {primaryColor}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Este color se usará para botones, enlaces y elementos destacados.</p>
                        </div>

                        <div className="space-y-4">
                            <Label>Texto sobre Primario</Label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-12 w-12 rounded-lg border shadow-sm transition-transform cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center text-xs font-bold"
                                    style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                                    onClick={() => document.getElementById('primary-text-color-picker')?.click()}
                                >
                                    Aa
                                </div>
                                <div className="flex-1 max-w-xs">
                                    <div className="relative">
                                        <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="primary-text-color-picker"
                                            type="color"
                                            value={primaryTextColor}
                                            onChange={(e) => setPrimaryTextColor(e.target.value)}
                                            className="pl-9 h-10 w-full cursor-pointer"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground uppercase">
                                            {primaryTextColor}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Color del texto en botones y elementos con fondo primario.</p>
                        </div>

                        <div className="space-y-4">
                            <Label>Fondo del Sidebar</Label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-12 w-12 rounded-lg border shadow-sm transition-transform cursor-pointer hover:scale-105 active:scale-95"
                                    style={{ backgroundColor: sidebarColor }}
                                    onClick={() => document.getElementById('sidebar-color-picker')?.click()}
                                />
                                <div className="flex-1 max-w-xs">
                                    <div className="relative">
                                        <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="sidebar-color-picker"
                                            type="color"
                                            value={sidebarColor}
                                            onChange={(e) => setSidebarColor(e.target.value)}
                                            className="pl-9 h-10 w-full cursor-pointer"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground uppercase">
                                            {sidebarColor}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Color de fondo para el menú lateral.</p>
                        </div>

                        <div className="space-y-4">
                            <Label>Texto Menú (No Seleccionado)</Label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-12 w-12 rounded-lg border shadow-sm transition-transform cursor-pointer hover:scale-105 active:scale-95"
                                    style={{ backgroundColor: sidebarTextColor }}
                                    onClick={() => document.getElementById('sidebar-text-color-picker')?.click()}
                                />
                                <div className="flex-1 max-w-xs">
                                    <div className="relative">
                                        <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="sidebar-text-color-picker"
                                            type="color"
                                            value={sidebarTextColor}
                                            onChange={(e) => setSidebarTextColor(e.target.value)}
                                            className="pl-9 h-10 w-full cursor-pointer"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground uppercase">
                                            {sidebarTextColor}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Color del texto para los items del menú que no están activos.</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Radius Section */}
                    <div className="space-y-4">
                        <Label>Radio del Borde</Label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {radiusOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    variant="outline"
                                    className={`h-10 w-full ${borderRadius === option.value ? 'ring-2 ring-primary border-primary' : ''}`}
                                    style={{ borderRadius: option.value }}
                                    onClick={() => setBorderRadius(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Define qué tan redondeados se verán los botones y tarjetas.</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={loading} className="min-w-[120px]">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
