import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsSkeleton() {
    return (
        <div className="grid gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-12">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-card backdrop-blur-sm border-border/50">
                    <CardContent className="p-4 md:p-6 flex items-center gap-3 md:gap-6">
                        <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl" />
                        <div className="flex flex-col gap-2 w-full">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function CalendarSkeleton() {
    return (
        <div className="my-4 md:my-6">
            <Card className="bg-card border-border/50 h-[600px] w-full p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2 h-full">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <Skeleton key={i} className="h-full w-full rounded-md" />
                    ))}
                </div>
            </Card>
        </div>
    );
}

export function ActivitySkeleton() {
    return (
        <Card className="bg-card backdrop-blur-sm border-border/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="space-y-3 md:space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 md:gap-4 p-2">
                            <Skeleton className="h-8 w-8 md:h-9 md:w-9 rounded-full" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function AttentionSkeleton() {
    return (
        <Card className="bg-card/90 border-red-500/20 shadow-sm overflow-hidden">
            <CardHeader className="py-2 px-3 md:py-3 md:px-4 bg-red-500/5 border-b border-red-500/10">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 space-y-3">
                {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </CardContent>
        </Card>
    );
}

export function IncomeChartSkeleton() {
    return (
        <Card className="lg:col-span-4 bg-card backdrop-blur-sm border-border/50">
            <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between space-y-0 relative">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="p-2 md:pl-2">
                <Skeleton className="h-[200px] md:h-[300px] w-full rounded-lg" />
            </CardContent>
        </Card>
    );
}
