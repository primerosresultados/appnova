import { db } from "@/lib/db";
import { TransactionsTable } from "@/components/finance/TransactionsTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Force dynamic to ensure fresh data
export const dynamic = 'force-dynamic';

async function getTransactions() {
    const transactions = await db.transaction.findMany({
        orderBy: { date: 'desc' },
        include: { account: true }
    });
    return transactions;
}

export default async function TransactionsPage() {
    const transactions = await getTransactions();

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500 pb-10">
            <div className="flex items-center gap-4">
                <Link href="/finance">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Movimientos</h1>
                    <p className="text-muted-foreground">Historial completo de transacciones.</p>
                </div>
            </div>

            <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
                <TransactionsTable initialTransactions={transactions} />
            </Suspense>
        </div>
    );
}
