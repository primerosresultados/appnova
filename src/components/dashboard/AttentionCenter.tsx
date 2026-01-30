"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, CheckCircle2, DollarSign, Clock, ArrowRight, Wallet } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface AttentionCenterProps {
    overdueTasks: any[];
    pendingInvoices: any[];
    urgentProjects: any[];
}

export function AttentionCenter({ overdueTasks, pendingInvoices, urgentProjects }: AttentionCenterProps) {
    const totalItems = overdueTasks.length + pendingInvoices.length + urgentProjects.length;

    if (totalItems === 0) {
        return (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        Todo en Orden
                    </CardTitle>
                    <CardDescription>No hay tareas urgentes ni pagos pendientes.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 border-l-4 border-l-amber-500/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-amber-500">
                            <AlertCircle className="h-5 w-5" />
                            Requiere Atención
                        </CardTitle>
                        <CardDescription>Tienes {totalItems} asuntos pendientes importantes.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Pending Invoices */}
                {pendingInvoices.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Wallet className="h-4 w-4" /> Pagos Pendientes
                        </h4>
                        <div className="space-y-2">
                            {pendingInvoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-full bg-red-500/10 text-red-500">
                                            <DollarSign className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{invoice.description || 'Ingreso sin descripción'}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(invoice.date), 'dd MMM', { locale: es })}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-red-500">{formatCurrency(invoice.amount)}</p>
                                        <Badge variant="outline" className="text-[9px] h-4 border-red-500/20 text-red-500">Pendiente</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Overdue Tasks */}
                {overdueTasks.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Tareas Vencidas
                        </h4>
                        <div className="space-y-2">
                            {overdueTasks.map((task) => (
                                <Link key={task.id} href={`/tasks/${task.id}`}>
                                    <div className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50 hover:bg-accent/40 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-500">
                                                <AlertCircle className="h-3 w-3" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium group-hover:text-amber-500 transition-colors">{task.title}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {task.project.name} • <span className="text-red-400">Venció {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale: es })}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Urgent Projects */}
                {urgentProjects.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Proyectos por Vencer
                        </h4>
                        <div className="space-y-2">
                            {urgentProjects.map((project) => (
                                <Link key={project.id} href={`/projects/${project.id}`}>
                                    <div className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50 hover:bg-accent/40 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-500">
                                                <Calendar className="h-3 w-3" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium group-hover:text-blue-500 transition-colors">{project.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Entrega: {format(new Date(project.dueDate), 'dd MMM', { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
