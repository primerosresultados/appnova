import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Search, MoreHorizontal, FileText, ExternalLink } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewClientSheet } from "@/components/clients/NewClientSheet";

async function getClients() {
    const clients = await db.client.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { projects: true }
            }
        }
    });
    return clients;
}

export default async function ClientsPage() {
    const clients = await getClients();

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona tus relaciones con clientes y facturación.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar clientes..."
                            className="pl-9"
                        />
                    </div>
                    <NewClientSheet />
                </div>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-0">
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                                    <DropdownMenuItem>Editar Cliente</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Eliminar Cliente</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
