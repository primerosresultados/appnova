import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <div className="space-y-2 mt-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-7">
                <div className="lg:col-span-4 rounded-xl border bg-card p-6 h-[400px]">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-full w-full rounded-lg" />
                    </div>
                </div>
                <div className="lg:col-span-3 rounded-xl border bg-card p-6 h-[400px]">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1 flex-1">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
