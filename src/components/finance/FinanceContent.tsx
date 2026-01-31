import { NewTransactionDialog } from "@/components/finance/NewTransactionDialog";
import { NewAccountDialog } from "@/components/finance/NewAccountDialog";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Wallet, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

async function getFinanceData() {
    try {
        // Parallelize queries for better performance
        const [
            accounts,
            recentTransactions,
            incomeThisMonth,
            expensesThisMonth,
            taxPayload,
            allFinancialRecords
        ] = await Promise.all([
            db.account.findMany(),
            db.transaction.findMany({
                take: 10,
                orderBy: { date: 'desc' },
                include: { account: true }
            }),
            db.transaction.aggregate({
                where: { type: 'INCOME' },
                _sum: { amount: true }
            }),
            db.transaction.aggregate({
                where: { type: 'EXPENSE' },
                _sum: { amount: true }
            }),
            db.transaction.aggregate({
                where: { isTaxable: true, type: 'INCOME' },
                _sum: { taxAmount: true }
            }),
            // OPTIMIZATION: Limit to last 50 records instead of all
            db.financialRecord.findMany({
                take: 50,
                orderBy: { date: 'desc' },
                include: { client: { select: { name: true } } }
            })
        ]);

        const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

        return {
            accounts,
            recentTransactions,
            totalBalance,
            income: incomeThisMonth._sum.amount || 0,
            expenses: expensesThisMonth._sum.amount || 0,
            pendingTax: taxPayload._sum.taxAmount || 0,
            allFinancialRecords
        };
    } catch (error) {
        console.error("Error fetching finance data:", error);
        return {
            accounts: [],
            recentTransactions: [],
            totalBalance: 0,
            income: 0,
            expenses: 0,
            pendingTax: 0,
            allFinancialRecords: []
        };
    }
}

export async function FinanceContent() {
    const data = await getFinanceData();

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500 pb-10">
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
                <TabsList className="bg-secondary/30 p-1 rounded-xl h-12">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-8 h-10 transition-all font-medium">Resumen</TabsTrigger>
                    <TabsTrigger value="invoices" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md px-8 h-10 transition-all font-medium">Facturación</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                    {/* KPI Cards */}
                    <div className="grid gap-6 md:grid-cols-4">
                        <Card className="bg-card/50 border border-border/40 shadow-lg overflow-hidden relative group hover:border-emerald-500/30 transition-colors">
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

                        <Card className="bg-card/50 border border-border/40 shadow-lg overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ingresos (Mes)</CardTitle>
                                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.income.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">Acumulado {format(new Date(), 'MMMM', { locale: es })}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border border-border/40 shadow-lg overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Egresos (Mes)</CardTitle>
                                <ArrowDownRight className="h-4 w-4 text-rose-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.expenses.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">Gastos operativos y costos</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border border-border/40 shadow-lg overflow-hidden relative">
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
                        {/* Accounts List */}
                        <Card className="md:col-span-4 bg-card/50 border border-border/40 shadow-lg">
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
                        <Card className="md:col-span-8 bg-card/50 border border-border/40 shadow-lg">
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
                                            <div key={t.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {t.type === 'INCOME' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm group-hover:text-primary transition-colors">{t.description || "Sin descripción"}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <span>{format(new Date(t.date), 'dd MMM, HH:mm', { locale: es })}</span>
                                                            <span className="w-1 h-1 rounded-full bg-border" />
                                                            <Badge variant="outline" className="text-[9px] h-4 py-0">{t.category}</Badge>
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
                    <Card className="bg-card/50 border border-border/40 shadow-lg overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Control de Facturación</CardTitle>
                            <CardDescription>Historial completo de facturas y estados de pago.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.allFinancialRecords.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <h3 className="text-lg font-medium">No hay registros de facturación</h3>
                                    <p className="max-w-xs mx-auto mt-2">Registra facturas y pagos desde la ficha de cada cliente.</p>
                                </div>
                            ) : (
                                <div className="rounded-md border border-border/40">
                                    <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary/20 border-b border-border/40">
                                        <div className="col-span-3">Cliente</div>
                                        <div className="col-span-4">Descripción</div>
                                        <div className="col-span-2">Fecha</div>
                                        <div className="col-span-3 text-right">Monto / Estado</div>
                                    </div>
                                    <div className="divide-y divide-border/20">
                                        {data.allFinancialRecords.map((record: any) => (
                                            <div key={record.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors">
                                                <div className="col-span-3 font-medium text-sm truncate">{record.client?.name || "Sin cliente"}</div>
                                                <div className="col-span-4 text-sm text-muted-foreground truncate">{record.description}</div>
                                                <div className="col-span-2 text-xs text-muted-foreground">{format(new Date(record.date), 'dd MMM yyyy', { locale: es })}</div>
                                                <div className="col-span-3 text-right space-y-1">
                                                    <div className="font-bold">${record.amount.toLocaleString()}</div>
                                                    <Badge variant="outline" className={`text-[9px] h-4 py-0 ${record.status === 'FACTURA_PAGADA' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        record.status.includes('FACTURA') ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        }`}>
                                                        {record.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
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
