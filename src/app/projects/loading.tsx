import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-2 w-full" />
                            <div className="flex justify-between">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        </div>
                        <div className="flex justify-between pt-4 border-t">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
