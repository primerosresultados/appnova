export const dynamic = 'force-dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Key, Plug, Shield, User, Users, Webhook, Palette } from "lucide-react";

import { getUsers } from "@/app/actions/user-actions";
import { getOrganizationSettings } from "@/app/actions/organization-actions";
import { MembersTab } from "@/components/settings/MembersTab";
import { BrandTab } from "@/components/settings/BrandTab";
import { MetaConnectionCard } from "@/components/settings/MetaConnectionCard";

export default async function SettingsPage() {
    const users = await getUsers();
    const orgSettings = await getOrganizationSettings();

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* ... header ... */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">Administra las preferencias de tu espacio de trabajo y equipo.</p>
            </div>

            <Tabs defaultValue="members" className="w-full space-y-6">
                <TabsList className="bg-muted w-full justify-start rounded-xl h-auto p-1 gap-1 flex-wrap">
                    <TabsTrigger value="members" className="rounded-lg border-0 px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                        <Users className="h-4 w-4" /> Miembros
                    </TabsTrigger>
                    <TabsTrigger value="brand" className="rounded-lg border-0 px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                        <Palette className="h-4 w-4" /> Marca
                    </TabsTrigger>
                    <TabsTrigger value="connections" className="rounded-lg border-0 px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                        <Plug className="h-4 w-4" /> Conexiones
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg border-0 px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                        <Bell className="h-4 w-4" /> Notificaciones
                    </TabsTrigger>
                    <TabsTrigger value="api" className="rounded-lg border-0 px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                        <Webhook className="h-4 w-4" /> API & Keys
                    </TabsTrigger>
                </TabsList>

                {/* --- MEMBERS TAB --- */}
                <TabsContent value="members" className="space-y-4">
                    <MembersTab users={users} />
                </TabsContent>

                {/* --- BRAND TAB --- */}
                <TabsContent value="brand" className="space-y-4">
                    {/* @ts-ignore */}
                    <BrandTab initialData={orgSettings.data} />
                </TabsContent>

                {/* --- CONNECTIONS TAB --- */}
                <TabsContent value="connections" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <MetaConnectionCard />

                        {/* Placeholder cards for future integrations */}
                        <Card className="bg-card border-border/50 opacity-50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Google Ads</CardTitle>
                                <Plug className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-muted-foreground">Próximamente</div>
                                <p className="text-xs text-muted-foreground mt-1">Integración con Google Ads</p>
                                <Button variant="outline" size="sm" className="mt-4 w-full" disabled>Conectar</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- NOTIFICATIONS TAB --- */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card className="bg-card border-border/50">
                        <CardHeader>
                            <CardTitle>Preferencias de Email</CardTitle>
                            <CardDescription>Elige qué correos quieres recibir.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Resumen Semanal</Label>
                                    <p className="text-sm text-muted-foreground">Recibe un resumen de la actividad de tus proyectos.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Nuevas Tareas</Label>
                                    <p className="text-sm text-muted-foreground">Cuando se te asigne una nueva tarea.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- API TAB --- */}
                <TabsContent value="api" className="space-y-4">
                    <Card className="bg-card border-border/50">
                        <CardHeader>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>Gestiona tus llaves de acceso para integraciones personalizadas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Llave Pública</Label>
                                <div className="flex gap-2">
                                    <Input value="pk_test_51Mz..." readOnly className="font-mono bg-muted" />
                                    <Button variant="outline" size="icon"><Key className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <Button variant="destructive">Revocar todas las llaves</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
