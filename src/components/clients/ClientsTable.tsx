import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { ClientActions } from "@/components/clients/ClientActions";

async function getClients() {
    // Artificial delay to test Suspense if needed
    // await new Promise(resolve => setTimeout(resolve, 2000));
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
}

export async function ClientsTable() {
    const clients = await getClients();

    return (
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
                {clients.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                            No se encontraron clientes. Agrega tu primer cliente para comenzar.
                        </TableCell>
                    </TableRow>
                ) : (
                    clients.map((client) => (
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
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{client.website || 'No website'}</div>
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
                    ))
                )}
            </TableBody>
        </Table>
    );
}
