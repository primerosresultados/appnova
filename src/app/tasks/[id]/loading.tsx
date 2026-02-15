import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TaskDetailLoading() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 md:-m-8">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 animate-in fade-in-50 duration-300">
                {/* Header skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-7 w-[250px]" />
                            <Skeleton className="h-6 w-[120px]" />
                            <Skeleton className="h-5 w-[60px]" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-4 w-[100px]" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Deadline Progress */}
                        <Skeleton className="h-16 w-full rounded-lg" />

                        {/* Description Card */}
                        <Card className="bg-card border-border/50">
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <Skeleton className="h-4 w-24 mb-3" />
                                    <Skeleton className="h-24 w-full rounded-lg" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Skeleton className="h-4 w-20 mb-2" />
                                        <Skeleton className="h-14 w-full rounded-lg" />
                                    </div>
                                    <div>
                                        <Skeleton className="h-4 w-28 mb-2" />
                                        <Skeleton className="h-14 w-full rounded-lg" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar skeleton */}
                    <div className="lg:col-span-1">
                        <Card className="h-[600px] flex flex-col bg-card border-border/50">
                            <CardHeader className="pb-3 border-b border-border/50">
                                <Skeleton className="h-5 w-40" />
                            </CardHeader>
                            <CardContent className="flex-1 p-4 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-3 w-20" />
                                            <Skeleton className="h-16 w-full rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
