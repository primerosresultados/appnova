export const dynamic = 'force-dynamic';
import { Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { NewClientSheet } from "@/components/clients/NewClientSheet";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { Skeleton } from "@/components/ui/skeleton";

function ClientsTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-4 w-[100px]" />
                    ))}
                </div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-3 w-[100px]" />
                        </div>
                    </div>
                    <Skeleton className="h-5 w-[80px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            ))}
        </div>
    )
}

export default function ClientsPage() {
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
                    <Suspense fallback={<div className="p-6"><ClientsTableSkeleton /></div>}>
                        <ClientsTable />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}

