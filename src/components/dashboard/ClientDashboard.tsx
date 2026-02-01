"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getClientProjects } from "@/app/actions/client-actions";
import { getUserSession } from "@/app/actions/auth-actions"; // Or pass as prop
import { Skeleton } from "@/components/ui/skeleton";

export function ClientDashboard() {
    const [projects, setProjects] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const [sessionUser, projectsResult] = await Promise.all([
                getUserSession(),
                getClientProjects()
            ]);

            setUser(sessionUser);
            if (projectsResult.success && projectsResult.data) {
                setProjects(projectsResult.data);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Welcome Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                    Hola, {user?.name?.split(' ')[0] || 'Cliente'}
                </h1>
                <p className="text-muted-foreground text-lg">
                    Bienvenido a tu panel de proyectos. Aquí encontrarás el estado y progreso de tus servicios.
                </p>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Tus Proyectos Activos</h2>
                </div>

                {projects.length === 0 ? (
                    <Card className="border-dashed py-12 flex flex-col items-center justify-center text-center bg-muted/30">
                        <FolderKanban className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">No tienes proyectos activos</h3>
                        <p className="text-muted-foreground">Comunícate con tu ejecutivo si crees que esto es un error.</p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Link href={`/projects/${project.id}`} key={project.id} className="group">
                                <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm group-hover:border-primary/20 cursor-pointer overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                                <FolderKanban className="h-5 w-5" />
                                            </div>
                                            <Badge variant="secondary" className="bg-secondary/50">
                                                {project.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <CardTitle className="mt-4 text-xl group-hover:text-primary transition-colors">{project.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            Revisa el estado de las tareas, hitos y entregables.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                                            Ver detalles <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions / Tips */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-500" /> Comunicación
                        </CardTitle>
                        <CardDescription>
                            Para consultas urgentes, utiliza el canal de comunicación directa en la sección de "Mensajes" dentro de tu proyecto.
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Aprobaciones
                        </CardTitle>
                        <CardDescription>
                            Puedes revisar y aprobar contenido pendiente directamente desde la pestaña "Contenido" en cada proyecto.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
