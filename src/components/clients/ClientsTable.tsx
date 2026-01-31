import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight, Copy } from "lucide-react";
import { ClientActions } from "@/components/clients/ClientActions";
import { CopyRutButton } from "@/components/clients/CopyRutButton";

async function getClients() {
    try {
        const clients = await db.client.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { projects: true }
                }
            }
        });
        return clients;
    } catch (error) {
        console.error("Error fetching clients:", error);
        return [];
    }
}

export async function ClientsTable() {
    const clients = await getClients();

    if (clients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <p>No se encontraron clientes.</p>
                <p className="text-sm">Agrega tu primer cliente para comenzar.</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[300px]">Cliente</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Proyectos</TableHead>
                            <TableHead>Industria</TableHead>
                            <TableHead>Fecha de Ingreso</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.id} className="hover:bg-muted/50 transition-colors border-border/50">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <Link href={`/clients/${client.id}`} className="font-semibold hover:underline decoration-primary underline-offset-4">
                                                {client.name}
                                            </Link>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                {client.taxId ? (
                                                    <CopyRutButton rut={client.taxId} />
                                                ) : (
                                                    <span className="opacity-50">Sin RUT</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'} className={client.status === 'ACTIVE' ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20" : ""}>
                                        {client.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span>{client._count.projects} Activos</span>
                                    </div>
                                </TableCell>
                                <TableCell>{client.industry || '-'}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {format(new Date(client.createdAt), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ClientActions client={client} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border/50">
                {clients.map((client) => (
                    <Link key={client.id} href={`/clients/${client.id}`}>
                        <div className="flex items-center gap-3 p-4 hover:bg-muted/50 active:bg-muted transition-colors">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold truncate">{client.name}</p>
                                    <Badge
                                        variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}
                                        className={`text-[10px] px-1.5 py-0 h-5 ${client.status === 'ACTIVE' ? "bg-emerald-500/15 text-emerald-500" : ""}`}
                                    >
                                        {client.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {client.industry || 'Sin industria'} • {client._count.projects} proyecto{client._count.projects !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
