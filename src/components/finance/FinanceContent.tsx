import { NewEmployeeDialog } from "@/components/finance/NewEmployeeDialog";
import { EmployeeActions } from "@/components/finance/EmployeeActions";
import { AgreementActions } from "@/components/finance/AgreementActions";
import { ProcessPayrollDialog } from "@/components/finance/ProcessPayrollDialog";
import { Users, User } from "lucide-react";

import { NewTransactionDialog } from "@/components/finance/NewTransactionDialog";
import { NewAccountDialog } from "@/components/finance/NewAccountDialog";
import { NewAgreementDialog } from "@/components/finance/NewAgreementDialog";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Wallet, FileText, ArrowUpRight, ArrowDownRight, Handshake, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { InvoicingTab } from "@/components/finance/InvoicingTab";

// Cache finance data for 30 seconds
const getCachedFinanceData = unstable_cache(
    async () => {
        const [
            accounts,
            recentTransactions,
            incomeThisMonth,
            expensesThisMonth,
            contracts,
            clients,
            employees,
            allFinancialRecords
        ] = await Promise.all([

            db.account.findMany({
                select: { id: true, name: true, type: true, balance: true }
            }),
            db.transaction.findMany({
                take: 8,
                orderBy: { date: 'desc' },
                select: {
                    id: true,
                    type: true,
                    amount: true,
                    description: true,
                    category: true,
                    date: true
                }
            }),
            db.transaction.aggregate({
                where: { type: 'INCOME' },
                _sum: { amount: true }
            }),
            db.transaction.aggregate({
                where: { type: 'EXPENSE' },
                _sum: { amount: true }
            }),
            db.contract.findMany({
                include: { client: true },
                orderBy: { createdAt: 'desc' }
            }),
            db.client.findMany({
                select: { id: true, name: true },
                orderBy: { name: 'asc' }
            }),
            db.employee.findMany({
                orderBy: { createdAt: 'desc' },
                where: { status: 'ACTIVE' }
            }),
            db.financialRecord.findMany({
                orderBy: { date: 'desc' },
                where: { type: 'INVOICE' },
                include: { client: true }
            })
        ]);

        const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

        // Calculate active contract income with "Day 5" logic
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const activeContracts = contracts.filter(c =>
            c.status === 'ACTIVE' &&
            new Date(c.startDate) <= now &&
            (!c.endDate || new Date(c.endDate) >= now)
        );

        let monthlyContractIncome = 0;
        let incomeByDay5 = 0;

        activeContracts.forEach(contract => {
            const startDate = new Date(contract.startDate);
            const startDay = startDate.getDate();
            const startMonth = startDate.getMonth();
            const startYear = startDate.getFullYear();

            // Frequency factor
            let amount = 0;
            if (contract.frequency === 'MONTHLY') {
                amount = contract.amount;
            } else if (contract.frequency === 'ANNUALLY') {
                amount = contract.amount / 12;
            }

            // Recurring monthly income base
            monthlyContractIncome += amount;

            // Day 5 collection pool
            if (startDay <= 5) {
                incomeByDay5 += amount;
            }
        });

        // Calculate Monthly Salaries
        const monthlySalaries = employees.reduce((sum, emp) => sum + emp.salary, 0);

        return {
            accounts,
            recentTransactions,
            totalBalance,
            income: (incomeThisMonth._sum.amount || 0) + monthlyContractIncome,
            expenses: (expensesThisMonth._sum.amount || 0) + monthlySalaries,
            incomeByDay5,
            clients,
            pendingTax: 0,
            allFinancialRecords: allFinancialRecords,
            contracts,
            employees,
            monthlySalaries
        };
    },
    ['finance-data-v2'], // Bump cache key
    { revalidate: 30 }
);

async function getFinanceData() {
    try {
        return await getCachedFinanceData();
    } catch (error) {
        console.error("Error fetching finance data:", error);
        return {
            accounts: [],
            recentTransactions: [],
            totalBalance: 0,
            income: 0,
            expenses: 0,
            pendingTax: 0,
            allFinancialRecords: [],
            contracts: [],
            clients: [],
            employees: [],
            monthlySalaries: 0,
            incomeByDay5: 0
        };
    }
}

export async function FinanceContent() {
    const data = await getFinanceData();

    return (
        <div className="space-y-4 md:space-y-8 animate-in fade-in-50 duration-500 pb-20 w-full max-w-[100vw] overflow-x-hidden px-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Finanzas
                    </h1>
                    <p className="text-muted-foreground mt-2">Visión global de flujo de caja, contratos y obligaciones fiscales.</p>
                </div>
                <div className="flex gap-3">
                    <NewTransactionDialog accounts={data.accounts} />
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="w-full flex justify-start bg-secondary/30 border-b-0 rounded-xl h-12 p-1 gap-1 flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-4 md:px-8 h-10 transition-all font-medium whitespace-nowrap">Resumen</TabsTrigger>
                    <TabsTrigger value="invoices" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-4 md:px-8 h-10 transition-all font-medium whitespace-nowrap">Facturación</TabsTrigger>
                    <TabsTrigger value="agreements" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-4 md:px-8 h-10 transition-all font-medium whitespace-nowrap">Acuerdos Comerciales</TabsTrigger>
                    <TabsTrigger value="hr" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-4 md:px-8 h-10 transition-all font-medium whitespace-nowrap">Recursos Humanos</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                    {/* KPI Cards */}
                    <div className="grid gap-4 md:gap-6 md:grid-cols-4">
                        {/* ... Existing KPI Cards ... */}
                        <Card className="bg-card border border-border/40 shadow-lg overflow-hidden relative group hover:border-emerald-500/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Saldo Total</CardTitle>
                                <Wallet className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.totalBalance.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <span className="text-emerald-500 flex items-center font-medium"><TrendingUp className="h-3 w-3 mr-0.5" /> +2.5%</span> vs mes anterior
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border border-border/40 shadow-lg overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ingresos (Mes)</CardTitle>
                                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.income.toLocaleString()}</div>
                                <div className="flex flex-col gap-1 mt-2">
                                    <div className="flex items-center justify-between text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md border border-emerald-500/20">
                                        <span className="font-medium uppercase">Base Mensual (Día 5):</span>
                                        <span className="font-bold">${data.incomeByDay5.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight pl-1">
                                        Acumulado {format(new Date(), 'MMMM', { locale: es })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border border-border/40 shadow-lg overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Egresos (Mes)</CardTitle>
                                <ArrowDownRight className="h-4 w-4 text-rose-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.expenses.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">Gastos e incluyendo nómina ({data.monthlySalaries > 0 ? `$${data.monthlySalaries.toLocaleString()}` : '$0'})</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border border-border/40 shadow-lg overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <FileText className="h-12 w-12" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">IVA Pendiente (F29)</CardTitle>
                                <DollarSign className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-500">${data.pendingTax.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">Estimado a pagar</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-12">
                        {/* ... Accounts and Transactions ... */}
                        {/* Accounts List */}
                        <Card className="md:col-span-4 bg-card border border-border/40 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Cuentas</CardTitle>
                                <CardDescription>Saldos disponibles por cuenta.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.accounts.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground text-sm">No hay cuentas registradas.</div>
                                ) : (
                                    data.accounts.map(account => (
                                        <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Wallet className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{account.name}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">{account.type}</div>
                                                </div>
                                            </div>
                                            <div className="font-bold text-sm">${account.balance.toLocaleString()}</div>
                                        </div>
                                    ))
                                )}
                                <NewAccountDialog />
                            </CardContent>
                        </Card>

                        {/* Recent Transactions */}
                        <Card className="md:col-span-8 bg-card border border-border/40 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Ultimos Movimientos</CardTitle>
                                    <CardDescription>Registro de ingresos y egresos recientes.</CardDescription>
                                </div>
                                <Link href="/finance/transactions">
                                    <Button variant="ghost" size="sm">Ver Todo</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {data.recentTransactions.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p>No hay transacciones recientes.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {data.recentTransactions.map(t => (
                                            <div key={t.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors group gap-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {t.type === 'INCOME' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm group-hover:text-primary transition-colors truncate">{t.description || "Sin descripción"}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                                                            <span className="shrink-0">{format(new Date(t.date), 'dd MMM', { locale: es })}</span>
                                                            <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                                                            <Badge variant="outline" className="text-[9px] h-4 py-0 shrink-0">{t.category}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="invoices" className="animate-in slide-in-from-bottom-2 duration-500">
                    <InvoicingTab invoices={data.allFinancialRecords} />
                </TabsContent>

                {/* Acuerdos Comerciales Tab */}
                <TabsContent value="agreements" className="animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="bg-card backdrop-blur-md border border-border/40 shadow-xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/30 bg-secondary/5 px-8">
                            <div>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80 flex items-center gap-3">
                                    <Handshake className="h-5 w-5 text-primary" />
                                    Acuerdos Comerciales
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-1">
                                    Contratos y acuerdos de servicio con clientes.
                                </CardDescription>
                            </div>
                            <NewAgreementDialog clients={data.clients} />
                        </CardHeader>
                        <CardContent className="p-0">
                            {data.contracts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="h-16 w-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4 border border-border/20">
                                        <Handshake className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-lg font-bold">Sin Acuerdos</h3>
                                    <p className="text-xs text-muted-foreground/60 max-w-[220px] mt-2">
                                        No hay acuerdos comerciales registrados todavía.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/20">
                                    {data.contracts.map((contract: any) => (
                                        <div key={contract.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-base flex items-center gap-2">
                                                    {contract.title}
                                                    <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${contract.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        contract.status === 'TERMINATED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        }`}>
                                                        {contract.status === 'TERMINATED' ? 'TERMINADO' : contract.status}
                                                    </Badge>
                                                </h4>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {contract.client?.name || "Sin cliente"}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(contract.startDate), 'dd MMM yyyy', { locale: es })}
                                                        {contract.endDate && ` - ${format(new Date(contract.endDate), 'dd MMM yyyy', { locale: es })}`}
                                                    </span>
                                                    {contract.frequency && (
                                                        <Badge variant="secondary" className="text-[9px] h-4">
                                                            {contract.frequency}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xl font-black tracking-tight">${contract.amount.toLocaleString()}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                        {contract.frequency === 'MONTHLY' ? 'Mensual' :
                                                            contract.frequency === 'ANNUALLY' ? 'Anual' : 'Total'}
                                                    </p>
                                                </div>
                                                <AgreementActions contract={contract} clients={data.clients} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Recursos Humanos Tab */}
                <TabsContent value="hr" className="animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="bg-card backdrop-blur-md border border-border/40 shadow-xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/30 bg-secondary/5 px-8">
                            <div>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80 flex items-center gap-3">
                                    <Users className="h-5 w-5 text-primary" />
                                    Recursos Humanos (Nómina)
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-1">
                                    Gestión de colaboradores y sueldos mensuales.
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <ProcessPayrollDialog
                                    accounts={data.accounts}
                                    totalMonthlySalary={data.monthlySalaries}
                                    activeEmployeeCount={data.employees.length}
                                />
                                <NewEmployeeDialog />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {data.employees.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="h-16 w-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4 border border-border/20">
                                        <Users className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-lg font-bold">Sin Colaboradores</h3>
                                    <p className="text-xs text-muted-foreground/60 max-w-[220px] mt-2">
                                        No hay colaboradores registrados en la nómina.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/20">
                                    {data.employees.map((employee: any) => (
                                        <div key={employee.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-base flex items-center gap-2">
                                                    {employee.name}
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-secondary/30">
                                                        {employee.position}
                                                    </Badge>
                                                </h4>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Inicio: {format(new Date(employee.startDate), 'dd MMM yyyy', { locale: es })}
                                                    </span>
                                                    {employee.email && (
                                                        <span>{employee.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xl font-black tracking-tight">${employee.salary.toLocaleString()}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                        Sueldo Mensual
                                                    </p>
                                                </div>
                                                <EmployeeActions employee={employee} />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-4 bg-muted/20 flex justify-end items-center border-t border-border/20">
                                        <div className="text-right">
                                            <span className="text-xs font-medium text-muted-foreground uppercase mr-2">Total Nómina:</span>
                                            <span className="text-lg font-bold">${data.monthlySalaries.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
