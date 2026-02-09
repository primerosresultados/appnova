import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FinanceContent } from "@/components/finance/FinanceContent";

function FinanceSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    <Skeleton className="md:col-span-4 h-96 rounded-xl" />
                    <Skeleton className="md:col-span-8 h-96 rounded-xl" />
                </div>
            </div>
        </div>
    )
}

export default function FinancePage() {
    return (
        <Suspense fallback={<FinanceSkeleton />}>
            <FinanceContent />
        </Suspense>
    );
}
