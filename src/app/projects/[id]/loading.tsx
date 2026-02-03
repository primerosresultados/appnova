import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectLoading() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_350px] h-[calc(100vh-4rem)] w-full gap-0 overflow-hidden">
            {/* Main Content Skeleton */}
            <div className="h-full overflow-y-auto space-y-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>

                {/* Content Cards Skeleton */}
                <div className="grid gap-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="h-full hidden xl:block border-l border-border p-4 space-y-6">
                <Skeleton className="h-8 w-40" />
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}
