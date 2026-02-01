import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Globe, FileText, CreditCard, AlertCircle, Plus, LayoutDashboard, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { EditClientSheet } from "@/components/clients/EditClientSheet";
import { NewFinancialRecordDialog } from "@/components/clients/NewFinancialRecordDialog";

interface ClientPageProps {
    params: {
        id: string;
    }
}

async function getClient(id: string) {
    return await db.client.findUnique({
        where: { id },
        include: {
            projects: true,
            financialRecords: {
                orderBy: { date: 'desc' }
            },
            clientNotes: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });
}

// Define params type compatible with Next.js 15+
type Params = Promise<{ id: string }>;

export default async function ClientPage(props: { params: Params }) {
    const params = await props.params;
    const client = await getClient(params.id);

    if (!client) {
        notFound();
    }

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Link href="/clients" className="hover:text-primary transition-colors">Clientes</Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">{client.name}</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {client.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/50 border border-border/50">
                            <Building2 className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium">{client.company || "Sin empresa"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{client.email}</span>
                        </div>
                        <Badge variant="outline" className={client.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}>
                            {client.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="h-10 border-border/50 bg-background/50 backdrop-blur-sm" asChild>
                        <Link href={`/clients/${client.id}/report`} target="_blank">
                            <FileText className="h-4 w-4 mr-2" /> Reporte
                        </Link>
                    </Button>
                    <EditClientSheet client={client} />
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-secondary/30 p-1 rounded-xl h-12">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-8 h-10 transition-all font-medium">Resumen</TabsTrigger>
                    <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-8 h-10 transition-all font-medium">Finanzas</TabsTrigger>
                    <TabsTrigger value="records" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-8 h-10 transition-all font-medium">Registros Importantes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="grid gap-8 md:grid-cols-12">
                        {/* Contact Info Card */}
                        <Card className="md:col-span-4 bg-card/30 backdrop-blur-md border border-border/40 shadow-xl overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <CardHeader className="pb-6 relative border-b border-border/30">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Información de Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-7 pt-6 relative">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-muted-foreground/50 tracking-[0.2em]">Teléfono</label>
                                    <div className="text-base font-semibold flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary border border-primary/10">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        {client.phone || "No registrado"}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-muted-foreground/50 tracking-[0.2em]">Sitio Web</label>
                                    <p className="text-base font-semibold truncate">
                                        {client.website ? (
                                            <a href={client.website} target="_blank" className="flex items-center gap-3 text-primary hover:text-primary/80 transition-all group/link">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                                    <Globe className="h-4 w-4" />
                                                </div>
                                                <span className="underline decoration-primary/30 underline-offset-4 group-hover/link:decoration-primary">{client.website.replace(/^https?:\/\//, '')}</span>
                                            </a>
                                        ) : "No registrado"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-muted-foreground/50 tracking-[0.2em]">Industria</label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                                            <LayoutDashboard className="h-4 w-4" />
                                        </div>
                                        <p className="text-base font-semibold">{client.industry || "General"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Projects Card */}
                        <Card className="md:col-span-8 bg-card/30 backdrop-blur-md border border-border/40 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-125" />
                            <CardHeader className="pb-6 border-b border-border/30">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Proyectos Activos</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {client.projects.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        {client.projects.map((p: any) => (
                                            <Link
                                                key={p.id}
                                                href={`/projects/${p.id}`}
                                                className="flex flex-col gap-3 p-5 rounded-2xl bg-secondary/20 border border-border/30 hover:border-primary/40 hover:bg-secondary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all transform hover:-translate-y-1.5 group"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate pr-2">{p.name}</h3>
                                                    <Badge variant="outline" className="text-[10px] h-5 bg-background shadow-sm px-2 border-primary/20">{p.status}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                    <Calendar className="h-3.5 w-3.5 text-primary/60" />
                                                    <span>Actualizado {format(new Date(p.updatedAt), 'dd MMM')}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/30 rounded-[2rem] bg-secondary/5 group-hover:bg-secondary/10 transition-colors">
                                        <div className="h-16 w-16 rounded-2xl bg-secondary/40 flex items-center justify-center mb-6 shadow-inner">
                                            <LayoutDashboard className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground">Comienza el viaje</h3>
                                        <p className="text-muted-foreground text-sm max-w-[200px] mt-2">No hay proyectos asociados a este cliente todavía.</p>
                                        <Button variant="outline" size="sm" className="mt-8 h-10 px-6 rounded-full border-primary/30 hover:border-primary" asChild>
                                            <Link href="/projects">
                                                <Plus className="h-4 w-4 mr-2" /> Crear Primer Proyecto
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="billing" className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="bg-card/30 backdrop-blur-md border border-border/40 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <CreditCard className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-8 border-b border-border/30">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80 flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-primary" /> Información Financiera
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="grid md:grid-cols-3 gap-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Razón Social / Tax ID</label>
                                    <p className="text-xl font-black text-foreground">{client.taxId || "—"}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Dirección de Facturación</label>
                                    <p className="text-lg font-bold leading-tight">{client.billingAddress || "—"}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Correo Administrativo</label>
                                    <p className="text-xl font-black text-primary truncate underline decoration-primary/20 underline-offset-4">{client.billingEmail || client.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/30 backdrop-blur-md border border-border/40 shadow-xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-8 border-b border-border/30 bg-secondary/5 px-8">
                            <div>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Historial Financiero</CardTitle>
                                <CardDescription className="text-xs font-semibold text-muted-foreground mt-1">Compromisos de pago y registros históricos.</CardDescription>
                            </div>
                            <NewFinancialRecordDialog clientId={client.id} />
                        </CardHeader>
                        <CardContent className="p-0">
                            {client.financialRecords.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-28 text-center bg-secondary/2">
                                    <div className="h-20 w-20 rounded-3xl bg-secondary/20 flex items-center justify-center mb-6 border border-border/20 shadow-inner">
                                        <CreditCard className="h-10 w-10 text-muted-foreground/10" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">Sin deudas pendientes</h3>
                                    <p className="text-xs text-muted-foreground/60 max-w-[250px] mt-2 font-medium">No se han registrado transacciones o promesas de pago para este cliente.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/20">
                                    {client.financialRecords.map((record: any) => (
                                        <div key={record.id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-primary/[0.02] transition-colors border-l-4 border-l-transparent hover:border-l-primary/40">
                                            <div className="space-y-2">
                                                <h4 className="font-extrabold text-base tracking-tight">{record.description}</h4>
                                                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {format(new Date(record.date), 'dd MMM, yyyy')}</span>
                                                    <Badge variant="secondary" className="px-2 py-0 text-[9px] h-4 bg-secondary font-black border-none">{record.type}</Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-foreground tracking-tighter">${record.amount.toLocaleString()}</p>
                                                    <Badge variant="outline" className={`text-[10px] h-5 mt-2 font-black border-2 px-3 ${record.status === 'COMPLETED' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/5 text-amber-500 border-amber-500/20'}`}>
                                                        {record.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="records" className="animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="bg-card/30 backdrop-blur-md border border-border/40 shadow-xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-8 bg-secondary/5 border-b border-border/30 px-8">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80 flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-primary" /> Bitácora de Cliente
                            </CardTitle>
                            <Button size="sm" className="h-10 rounded-xl px-6 bg-foreground text-background hover:bg-foreground/90 font-bold"><Plus className="h-4 w-4 mr-2" /> Nueva Nota</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {client.clientNotes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <div className="h-20 w-20 rounded-3xl bg-secondary/20 flex items-center justify-center mb-6 border border-border/20 shadow-inner">
                                        <FileText className="h-10 w-10 text-muted-foreground/10" />
                                    </div>
                                    <h3 className="text-lg font-bold">Bitácora Vacía</h3>
                                    <p className="text-xs text-muted-foreground/60 max-w-[220px] mt-2 font-medium">Registra aquí acuerdos, llamadas telefónicas o hitos importantes del seguimiento.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/20">
                                    {client.clientNotes.map((note: any) => (
                                        <div key={note.id} className="p-8 space-y-4 hover:bg-primary/[0.01] transition-colors border-l-4 border-l-transparent hover:border-l-primary/40 relative group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(new Date(note.createdAt), 'PPpp')}
                                                    {note.isImportant && (
                                                        <Badge className="bg-orange-500 text-white border-none text-[8px] h-4 font-black shadow-lg shadow-orange-500/20 px-2 ml-2">
                                                            PRIORIDAD
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap font-medium">{note.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
