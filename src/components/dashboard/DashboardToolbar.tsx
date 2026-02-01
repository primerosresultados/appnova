"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter } from "lucide-react";

export function DashboardToolbar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPeriod = searchParams.get("period") || "30d";

    const handlePeriodChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("period", value);
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 bg-card backdrop-blur-sm p-1 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border-r border-border/50">
                <Filter className="h-4 w-4" />
                <span className="font-medium hidden sm:inline-block">Filtrar por:</span>
            </div>

            <Select value={currentPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[180px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0 h-9">
                    <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7d">Últimos 7 días</SelectItem>
                    <SelectItem value="30d">Últimos 30 días</SelectItem>
                    <SelectItem value="90d">Últimos 3 meses</SelectItem>
                    <SelectItem value="12m">Último año</SelectItem>
                    <SelectItem value="all">Todo el tiempo</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
