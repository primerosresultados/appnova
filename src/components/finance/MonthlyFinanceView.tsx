"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleMonthlyPayment } from "@/app/finance/actions";
import {
    ChevronLeft, ChevronRight, Wallet, ArrowUpRight, ArrowDownRight, TrendingUp,
    Clock, CheckCircle2, Users, Handshake, DollarSign, Building2, Circle
} from "lucide-react";

interface MonthlyFinanceViewProps {
    transactions: any[];
    contracts: any[];
    employees: any[];
    accounts: any[];
    totalBalance: number;
    initialPayments: Record<string, boolean>; // "YEAR-MONTH-REFTYPE-REFID" -> paid
}

export function MonthlyFinanceView({ transactions, contracts, employees, accounts, totalBalance, initialPayments }: MonthlyFinanceViewProps) {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showFixedCosts, setShowFixedCosts] = useState(true);
    const [showAgreements, setShowAgreements] = useState(true);
    const [paymentStates, setPaymentStates] = useState<Record<string, boolean>>(initialPayments);
    const [pending, startTransition] = useTransition();

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Helper to get payment key
    const payKey = (refType: string, refId: string) => `${year}-${month}-${refType}-${refId}`;
    const isPaid = (refType: string, refId: string) => paymentStates[payKey(refType, refId)] === true;

    const handleTogglePaid = (refType: "EMPLOYEE" | "CONTRACT", refId: string) => {
        const key = payKey(refType, refId);
        const newPaid = !paymentStates[key];
        setPaymentStates(prev => ({ ...prev, [key]: newPaid }));
        startTransition(async () => {
            const result = await toggleMonthlyPayment({ year, month, refType, refId, paid: newPaid });
            if (result.success) {
                router.refresh();
            }
        });
    };

    // Filter transactions for current month
    const monthTransactions = useMemo(() => {
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d >= monthStart && d <= monthEnd;
        });
    }, [transactions, monthStart, monthEnd]);

    const monthIncome = monthTransactions.filter(t => t.type === "INCOME");
    const monthExpenses = monthTransactions.filter(t => t.type === "EXPENSE");
    const totalIncome = monthIncome.reduce((s: number, t: any) => s + t.amount, 0);
    const totalExpenses = monthExpenses.reduce((s: number, t: any) => s + t.amount, 0);

    const pendingIncome = monthIncome.filter(t => t.status === "PENDING");
    const pendingExpenses = monthExpenses.filter(t => t.status === "PENDING");
    const completedIncome = monthIncome.filter(t => t.status === "COMPLETED");
    const completedExpenses = monthExpenses.filter(t => t.status === "COMPLETED");

    const totalPendingIncome = pendingIncome.reduce((s: number, t: any) => s + t.amount, 0);
    const totalPendingExpenses = pendingExpenses.reduce((s: number, t: any) => s + t.amount, 0);
    const totalCompletedIncome = completedIncome.reduce((s: number, t: any) => s + t.amount, 0);
    const totalCompletedExpenses = completedExpenses.reduce((s: number, t: any) => s + t.amount, 0);

    // Active agreements for this month
    const activeContracts = useMemo(() => {
        return contracts.filter(c => {
            if (c.status !== "ACTIVE") return false;
            const start = new Date(c.startDate);
            const end = c.endDate ? new Date(c.endDate) : null;
            return start <= monthEnd && (!end || end >= monthStart);
        });
    }, [contracts, monthStart, monthEnd]);

    const contractIncome = activeContracts.reduce((s: number, c: any) => {
        if (c.frequency === "MONTHLY") return s + c.amount;
        if (c.frequency === "ANNUALLY") return s + c.amount / 12;
        return s;
    }, 0);

    // Fixed costs = salaries
    const monthlySalaries = employees.reduce((s: number, e: any) => s + e.salary, 0);

    // Paid/unpaid counts for fixed costs
    const paidEmployees = employees.filter((e: any) => isPaid("EMPLOYEE", e.id));
    const unpaidEmployees = employees.filter((e: any) => !isPaid("EMPLOYEE", e.id));
    const paidSalaries = paidEmployees.reduce((s: number, e: any) => s + e.salary, 0);
    const unpaidSalaries = unpaidEmployees.reduce((s: number, e: any) => s + e.salary, 0);

    // Paid/unpaid for contracts
    const paidContracts = activeContracts.filter((c: any) => isPaid("CONTRACT", c.id));
    const unpaidContracts = activeContracts.filter((c: any) => !isPaid("CONTRACT", c.id));
    const getContractMonthly = (c: any) => c.frequency === "MONTHLY" ? c.amount : c.frequency === "ANNUALLY" ? c.amount / 12 : c.amount;
    const paidContractAmount = paidContracts.reduce((s: number, c: any) => s + getContractMonthly(c), 0);
    const unpaidContractAmount = unpaidContracts.reduce((s: number, c: any) => s + getContractMonthly(c), 0);

    // Totals: only add UNPAID portions (paid items are already in transactions)
    const grandIncome = totalIncome + (showAgreements ? unpaidContractAmount : 0);
    const grandExpenses = totalExpenses + (showFixedCosts ? unpaidSalaries : 0);
    const difference = grandIncome - grandExpenses;

    return (
        <div className="space-y-6">
            {/* Month Navigator */}
            <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                    <h2 className="text-xl font-bold capitalize">{format(currentMonth, "MMMM yyyy", { locale: es })}</h2>
                    <p className="text-xs text-muted-foreground">Resumen financiero del mes</p>
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Main KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Saldo Total */}
                <Card className="border-border/40 overflow-hidden relative group hover:border-emerald-500/30 transition-colors">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="h-4 w-4 text-emerald-500" />
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Saldo Total</span>
                        </div>
                        <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
                    </CardContent>
                </Card>

                {/* Ingresos del mes */}
                <Card className="border-border/40 overflow-hidden hover:border-emerald-500/30 transition-colors">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Ingresos</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">${grandIncome.toLocaleString()}</p>
                        {totalPendingIncome > 0 && (
                            <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> ${totalPendingIncome.toLocaleString()} pendiente
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Egresos del mes */}
                <Card className="border-border/40 overflow-hidden hover:border-rose-500/30 transition-colors">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowDownRight className="h-4 w-4 text-rose-500" />
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Egresos</span>
                        </div>
                        <p className="text-2xl font-bold text-rose-500">${grandExpenses.toLocaleString()}</p>
                        {totalPendingExpenses > 0 && (
                            <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> ${totalPendingExpenses.toLocaleString()} pendiente
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Diferencia */}
                <Card className={cn("border-border/40 overflow-hidden transition-colors", difference >= 0 ? "hover:border-emerald-500/30" : "hover:border-rose-500/30")}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className={cn("h-4 w-4", difference >= 0 ? "text-emerald-500" : "text-rose-500")} />
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Diferencia</span>
                        </div>
                        <p className={cn("text-2xl font-bold", difference >= 0 ? "text-emerald-600" : "text-rose-500")}>
                            {difference >= 0 ? "+" : ""}${difference.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {difference >= 0 ? "Superávit" : "Déficit"} del mes
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Middle section: Pending + Completed breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ingresos breakdown */}
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4" />
                            Ingresos del Mes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-sm font-medium">Cobrados</span>
                            </div>
                            <span className="font-bold text-emerald-600">${totalCompletedIncome.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium">Pendientes de cobro</span>
                            </div>
                            <span className="font-bold text-amber-600">${totalPendingIncome.toLocaleString()}</span>
                        </div>
                        {pendingIncome.length > 0 && (
                            <div className="space-y-1 pt-1">
                                {pendingIncome.map((t: any) => (
                                    <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded bg-muted/30 text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                                            <span className="truncate">{t.description || t.category}</span>
                                            {t.client && <Badge variant="outline" className="text-[9px] h-4 shrink-0">{t.client.name}</Badge>}
                                        </div>
                                        <span className="font-bold text-emerald-600 shrink-0 ml-2">${t.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {showAgreements && paidContractAmount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <div className="flex items-center gap-2">
                                    <Handshake className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-medium">Acuerdos cobrados</span>
                                </div>
                                <span className="font-bold text-emerald-600">${paidContractAmount.toLocaleString()}</span>
                            </div>
                        )}
                        {showAgreements && unpaidContractAmount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                <div className="flex items-center gap-2">
                                    <Handshake className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium">Acuerdos pendientes de cobro</span>
                                </div>
                                <span className="font-bold text-blue-600">${unpaidContractAmount.toLocaleString()}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Egresos breakdown */}
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-rose-500 flex items-center gap-2">
                            <ArrowDownRight className="h-4 w-4" />
                            Egresos del Mes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-rose-500" />
                                <span className="text-sm font-medium">Pagados</span>
                            </div>
                            <span className="font-bold text-rose-600">${totalCompletedExpenses.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium">Pendientes de pago</span>
                            </div>
                            <span className="font-bold text-amber-600">${totalPendingExpenses.toLocaleString()}</span>
                        </div>
                        {pendingExpenses.length > 0 && (
                            <div className="space-y-1 pt-1">
                                {pendingExpenses.map((t: any) => (
                                    <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded bg-muted/30 text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                                            <span className="truncate">{t.description || t.category}</span>
                                        </div>
                                        <span className="font-bold text-rose-500 shrink-0 ml-2">${t.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {showFixedCosts && paidSalaries > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-medium">Nómina pagada</span>
                                </div>
                                <span className="font-bold text-emerald-600">${paidSalaries.toLocaleString()}</span>
                            </div>
                        )}
                        {showFixedCosts && unpaidSalaries > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-violet-500" />
                                    <span className="text-sm font-medium">Nómina pendiente</span>
                                </div>
                                <span className="font-bold text-violet-600">${unpaidSalaries.toLocaleString()}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom section: Toggles + Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Costos Fijos (Employees) with paid/unpaid per item */}
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-violet-600 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Costos Fijos
                            </CardTitle>
                            <Button
                                variant={showFixedCosts ? "default" : "outline"}
                                size="sm"
                                className="h-6 text-[10px] px-2"
                                onClick={() => setShowFixedCosts(!showFixedCosts)}
                            >
                                {showFixedCosts ? "Incluido ✓" : "Aplicar"}
                            </Button>
                        </div>
                        {employees.length > 0 && (
                            <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                    {paidEmployees.length} pagados · ${paidSalaries.toLocaleString()}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                                    {unpaidEmployees.length} pendientes · ${unpaidSalaries.toLocaleString()}
                                </Badge>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="pt-0">
                        {employees.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">Sin costos fijos registrados</p>
                        ) : (
                            <div className="space-y-1">
                                {employees.map((emp: any) => {
                                    const paid = isPaid("EMPLOYEE", emp.id);
                                    return (
                                        <div key={emp.id} className={cn(
                                            "flex items-center justify-between text-sm py-2 px-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
                                            paid
                                                ? "bg-emerald-500/5 border-emerald-500/20"
                                                : "bg-amber-500/5 border-amber-500/20"
                                        )}
                                            onClick={() => handleTogglePaid("EMPLOYEE", emp.id)}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {paid ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-amber-500 shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <span className={cn("truncate font-medium block text-sm", paid && "line-through opacity-60")}>{emp.name}</span>
                                                    <span className="text-[9px] text-muted-foreground">{paid ? "Pagado" : "Pendiente"}</span>
                                                </div>
                                            </div>
                                            <span className={cn("text-xs font-bold shrink-0", paid ? "text-emerald-600" : "text-amber-600")}>${emp.salary.toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Total</span>
                                    <span className="font-bold text-violet-600">${monthlySalaries.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Acuerdos del mes with paid/unpaid per item */}
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                <Handshake className="h-4 w-4" />
                                Acuerdos del Mes
                            </CardTitle>
                            <Button
                                variant={showAgreements ? "default" : "outline"}
                                size="sm"
                                className="h-6 text-[10px] px-2"
                                onClick={() => setShowAgreements(!showAgreements)}
                            >
                                {showAgreements ? "Incluido ✓" : "Aplicar"}
                            </Button>
                        </div>
                        {activeContracts.length > 0 && (
                            <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                    {paidContracts.length} cobrados · ${paidContractAmount.toLocaleString()}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                                    {unpaidContracts.length} pendientes · ${unpaidContractAmount.toLocaleString()}
                                </Badge>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="pt-0">
                        {activeContracts.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">Sin acuerdos activos este mes</p>
                        ) : (
                            <div className="space-y-1">
                                {activeContracts.map((c: any) => {
                                    const paid = isPaid("CONTRACT", c.id);
                                    const monthlyAmount = getContractMonthly(c);
                                    return (
                                        <div key={c.id} className={cn(
                                            "flex items-center justify-between text-sm py-2 px-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
                                            paid
                                                ? "bg-emerald-500/5 border-emerald-500/20"
                                                : "bg-amber-500/5 border-amber-500/20"
                                        )}
                                            onClick={() => handleTogglePaid("CONTRACT", c.id)}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {paid ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-amber-500 shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <span className={cn("truncate font-medium block", paid && "line-through opacity-60")}>{c.title}</span>
                                                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {c.client?.name} · {paid ? "Cobrado" : "Pendiente"}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={cn("text-xs font-bold shrink-0 ml-2", paid ? "text-emerald-600" : "text-amber-600")}>
                                                ${monthlyAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Total</span>
                                    <span className="font-bold text-blue-600">${contractIncome.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Cuentas */}
                <Card className="border-border/40">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Cuentas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {accounts.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">Sin cuentas registradas</p>
                        ) : (
                            <div className="space-y-2">
                                {accounts.map((acc: any) => (
                                    <div key={acc.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/10 last:border-b-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Wallet className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                                            <div className="min-w-0">
                                                <span className="truncate font-medium block">{acc.name}</span>
                                                <span className="text-[9px] text-muted-foreground uppercase">{acc.type}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold shrink-0">${acc.balance.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Total</span>
                                    <span className="font-bold">${totalBalance.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Monthly transactions */}
            <Card className="border-border/40">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Movimientos del Mes
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px]">{monthTransactions.length} registros</Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {monthTransactions.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p>Sin movimientos en {format(currentMonth, "MMMM yyyy", { locale: es })}</p>
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-[350px] overflow-y-auto scrollbar-none">
                            {monthTransactions.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={cn(
                                            "h-8 w-8 shrink-0 rounded-full flex items-center justify-center",
                                            t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                        )}>
                                            {t.type === "INCOME" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{t.description || "Sin descripción"}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <span>{format(new Date(t.date), "dd MMM", { locale: es })}</span>
                                                <Badge variant="outline" className="text-[9px] h-4 py-0">{t.category}</Badge>
                                                {t.status === "PENDING" && (
                                                    <Badge variant="secondary" className="text-[9px] h-4 py-0 bg-amber-500/10 text-amber-600">Pendiente</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn("font-bold text-sm", t.type === "INCOME" ? "text-emerald-500" : "text-rose-500")}>
                                        {t.type === "INCOME" ? "+" : "-"}${t.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
