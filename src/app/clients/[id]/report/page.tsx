
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Building2, Mail, Phone, Globe, CreditCard, LayoutDashboard } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ReportPageProps {
    params: Promise<{ id: string }>;
}

async function getClientData(id: string) {
    return await db.client.findUnique({
        where: { id },
        include: {
            projects: {
                include: {
                    tasks: true
                }
            },
            financialRecords: {
                orderBy: { date: 'desc' }
            },
            clientNotes: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });
}

export default async function ClientReportPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const client = await getClientData(params.id);

    if (!client) return notFound();

    const totalRevenue = client.financialRecords
        .filter(r => r.type === 'PAYMENT' && r.status === 'COMPLETED')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingRevenue = client.financialRecords
        .filter(r => r.status === 'PENDING')
        .reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white text-black print:p-0 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-bold uppercase tracking-tight">{client.company || client.name}</h1>
                    <p className="text-lg text-gray-600 mt-1">Reporte de Estado del Cliente</p>
                </div>
                <div className="text-right">
                    <p className="font-bold">Nova Partners</p>
                    <p className="text-sm text-gray-500">{format(new Date(), 'dd MMM, yyyy')}</p>
                </div>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-1">Información General</h3>
                    <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-semibold text-gray-600">Cliente:</span>
                            <span>{client.name}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-semibold text-gray-600">Empresa:</span>
                            <span>{client.company || "-"}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-semibold text-gray-600">Industria:</span>
                            <span>{client.industry || "-"}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-semibold text-gray-600">Estado:</span>
                            <span className="uppercase font-bold">{client.status}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-1">Contacto y Facturación</h3>
                    <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-semibold text-gray-600">Email:</span>
                            <span>{client.email || "-"}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-semibold text-gray-600">Tax ID:</span>
                            <span>{client.taxId || "-"}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-semibold text-gray-600">Dirección:</span>
                            <span>{client.billingAddress || "-"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="mb-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Resumen Financiero</h3>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-sm text-gray-500">Total Facturado & Cobrado</p>
                        <p className="text-3xl font-black text-emerald-600">${totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pendiente de Pago</p>
                        <p className="text-3xl font-black text-amber-600">${pendingRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Projects */}
            <div className="mb-12">
                <h3 className="text-lg font-bold uppercase tracking-wider mb-6 border-b-2 border-black pb-2">Proyectos Activos</h3>
                {client.projects.length === 0 ? (
                    <p className="text-gray-500 italic">No hay proyectos activos.</p>
                ) : (
                    <div className="space-y-6">
                        {client.projects.map(project => (
                            <div key={project.id} className="border border-gray-200 rounded-lg p-5 page-break-inside-avoid">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-xl font-bold">{project.name}</h4>
                                    <Badge variant="outline" className="text-black border-black">{project.status}</Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                    <div>
                                        <span className="font-semibold block">Prioridad:</span> {project.priority}
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Presupuesto:</span> ${project.budget?.toLocaleString() || "0"}
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Tareas:</span> {project.tasks.length}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Print Footer */}
            <div className="fixed bottom-8 left-0 right-0 text-center text-xs text-gray-400 print:block hidden">
                Generado por Nova Partners OS - {new Date().toLocaleDateString()}
            </div>
        </div>
    );
}
