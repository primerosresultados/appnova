"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowUpRight, ArrowDownRight, Search, Calendar as CalendarIcon, FilterX } from "lucide-react";
import { deleteTransaction } from "@/app/actions/finance-actions";
import { toast } from "react-hot-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface Transaction {
    id: string;
    description: string | null;
    amount: number;
    type: string;
    category: string;
    date: Date;
    account: {
        name: string;
    };
}

interface TransactionsTableProps {
    initialTransactions: Transaction[];
}

export function TransactionsTable({ initialTransactions }: TransactionsTableProps) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta transacción? Esto revertirá el saldo de la cuenta.")) return;

        const result = await deleteTransaction(id);
        if (result.success) {
            toast.success("Transacción eliminada");
            setTransactions(prev => prev.filter(t => t.id !== id));
        } else {
            toast.error(result.message || "Error al eliminar");
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch =
            (t.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.account.name.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (dateRange?.from) {
            const transactionDate = new Date(t.date);
            if (dateRange.to) {
                matchesDate = transactionDate >= dateRange.from && transactionDate <= dateRange.to;
            } else {
                // If only start date selected, strict match or just start filter? 
                // Usually range picker implies from-to. Let's assume inclusive start.
                matchesDate = transactionDate >= dateRange.from;
            }
        }

        return matchesSearch && matchesDate;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por descripción, categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                            {format(dateRange.to, "LLL dd, y", { locale: es })}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y", { locale: es })
                                    )
                                ) : (
                                    <span>Filtrar por fecha</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    {(searchTerm || dateRange) && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchTerm("");
                                setDateRange(undefined);
                            }}
                            className="px-2 lg:px-3"
                        >
                            <FilterX className="h-4 w-4 mr-2" />
                            Limpiar
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border border-border/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Cuenta</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No se encontraron transacciones.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransactions.map((t) => (
                                <TableRow key={t.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium text-xs text-muted-foreground">
                                        {format(new Date(t.date), "dd MMM yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell>{t.description || "—"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] h-5">{t.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{t.account.name}</TableCell>
                                    <TableCell className="text-right font-bold">
                                        <span className={t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}>
                                            {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(t.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
