import { NewEmployeeDialog } from "@/components/finance/NewEmployeeDialog";
import { EmployeeActions } from "@/components/finance/EmployeeActions";
import { AgreementActions } from "@/components/finance/AgreementActions";
import { ProcessPayrollDialog } from "@/components/finance/ProcessPayrollDialog";
import { Users, User } from "lucide-react";

import { NewTransactionDialog } from "@/components/finance/NewTransactionDialog";
import { NewAccountDialog } from "@/components/finance/NewAccountDialog";
import { NewAgreementDialog } from "@/components/finance/NewAgreementDialog";
import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Wallet, FileText, ArrowUpRight, ArrowDownRight, Handshake, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { InvoicingTab } from "@/components/finance/InvoicingTab";
import { MonthlyFinanceView } from "@/components/finance/MonthlyFinanceView";
import { getMonthlyPayments } from "@/app/finance/actions";

async function getFinanceData() {
    try {
        const [
            accounts,
            transactions,
            contracts,
            clients,
            employees,
            allFinancialRecords,
            allMonthlyPayments
        ] = await Promise.all([
            db.account.findMany({
                select: { id: true, name: true, type: true, balance: true }
            }),
            db.transaction.findMany({
                orderBy: { date: 'desc' },
                take: 200,
                select: {
                    id: true,
                    type: true,
                    amount: true,
                    description: true,
                    category: true,
                    date: true,
                    status: true,
                    clientId: true,
                    client: { select: { name: true } },
                }
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
                take: 50,
                include: { client: true }
            }),
            db.monthlyPayment.findMany()
        ]);

        const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
        const monthlySalaries = employees.reduce((sum, emp) => sum + emp.salary, 0);

        // Build a map of all monthly payments
        const paymentMap: Record<string, boolean> = {};
        for (const p of allMonthlyPayments) {
            paymentMap[`${p.year}-${p.month}-${p.refType}-${p.refId}`] = p.paid;
        }

        return {
            accounts,
            transactions,
            totalBalance,
            clients,
            allFinancialRecords,
            contracts,
            employees,
            monthlySalaries,
            paymentMap,
        };
    } catch (error) {
        console.error("Error fetching finance data:", error);
        return {
            accounts: [],
            transactions: [],
            totalBalance: 0,
            allFinancialRecords: [],
            contracts: [],
            clients: [],
            employees: [],
            monthlySalaries: 0,
            paymentMap: {} as Record<string, boolean>,
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
                    <p className="text-muted-foreground mt-2">Control mensual de ingresos, egresos y costos fijos.</p>
                </div>
                <div className="flex gap-3">
                    <NewTransactionDialog accounts={data.accounts} />
                </div>
            </div>

            <Tabs defaultValue="monthly" className="space-y-8">
                <TabsList className="w-full flex justify-start bg-secondary/30 border-b-0 rounded-xl h-12 p-1 gap-1 flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <TabsTrigger value="monthly" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-4 md:px-8 h-10 transition-all font-medium whitespace-nowrap">Resumen Mensual</TabsTrigger>
                    <TabsTrigger value="invoices" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-4 md:px-8 h-10 transition-all font-medium whitespace-nowrap">Facturación</TabsTrigger>
                    <TabsTrigger value="agreements" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-4 md:px-8 h-10 transition-all font-medium whitespace-nowrap">Acuerdos Comerciales</TabsTrigger>
                    <TabsTrigger value="hr" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-4 md:px-8 h-10 transition-all font-medium whitespace-nowrap">Recursos Humanos</TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                    <MonthlyFinanceView
                        transactions={JSON.parse(JSON.stringify(data.transactions))}
                        contracts={JSON.parse(JSON.stringify(data.contracts))}
                        employees={JSON.parse(JSON.stringify(data.employees))}
                        accounts={JSON.parse(JSON.stringify(data.accounts))}
                        totalBalance={data.totalBalance}
                        initialPayments={data.paymentMap}
                    />
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
