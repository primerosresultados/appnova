import { db } from "@/lib/db";
import { TransactionsTable } from "@/components/finance/TransactionsTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { unstable_cache } from "next/cache";

const getCachedTransactions = unstable_cache(
    async () => {
        return db.transaction.findMany({
            orderBy: { date: 'desc' },
            include: { account: true },
            take: 200,
        });
    },
    ['transactions-list'],
    { revalidate: 30 }
);

async function getTransactions() {
    return getCachedTransactions();
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
