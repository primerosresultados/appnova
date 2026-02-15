"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Toggle paid/unpaid for a fixed cost (employee) or agreement (contract).
 * When marking as PAID:
 *   - EMPLOYEE → creates an EXPENSE transaction (salary)
 *   - CONTRACT → creates an INCOME transaction (agreement amount)
 * When marking as UNPAID:
 *   - Deletes the auto-created transaction
 */
export async function toggleMonthlyPayment(data: {
    year: number;
    month: number;
    refType: "EMPLOYEE" | "CONTRACT";
    refId: string;
    paid: boolean;
}) {
    try {
        // Get the first account to attach the transaction to
        const defaultAccount = await db.account.findFirst({ orderBy: { createdAt: "asc" } });
        if (!defaultAccount) {
            return { success: false, message: "No hay cuentas registradas" };
        }

        // Build unique key
        const where = {
            year_month_refType_refId: {
                year: data.year,
                month: data.month,
                refType: data.refType,
                refId: data.refId,
            },
        };

        if (data.paid) {
            // === MARKING AS PAID → Create transaction ===
            let transactionData: {
                amount: number;
                type: string;
                category: string;
                description: string;
                date: Date;
                status: string;
                accountId: string;
                clientId?: string;
            };

            // Build the transaction date for this month (1st day of the month)
            const txDate = new Date(data.year, data.month, 15); // mid-month

            if (data.refType === "EMPLOYEE") {
                const employee = await db.employee.findUnique({ where: { id: data.refId } });
                if (!employee) return { success: false, message: "Empleado no encontrado" };

                transactionData = {
                    amount: employee.salary,
                    type: "EXPENSE",
                    category: "Nómina",
                    description: `Sueldo ${employee.name}`,
                    date: txDate,
                    status: "COMPLETED",
                    accountId: defaultAccount.id,
                };
            } else {
                // CONTRACT
                const contract = await db.contract.findUnique({
                    where: { id: data.refId },
                    include: { client: true },
                });
                if (!contract) return { success: false, message: "Acuerdo no encontrado" };

                const monthlyAmount = contract.frequency === "MONTHLY"
                    ? contract.amount
                    : contract.frequency === "ANNUALLY"
                        ? contract.amount / 12
                        : contract.amount;

                transactionData = {
                    amount: monthlyAmount,
                    type: "INCOME",
                    category: "Acuerdo Comercial",
                    description: `${contract.title} - ${contract.client?.name || ""}`,
                    date: txDate,
                    status: "COMPLETED",
                    accountId: defaultAccount.id,
                    clientId: contract.clientId,
                };
            }

            // Create transaction
            const newTx = await db.transaction.create({ data: transactionData });

            // Update account balance
            if (transactionData.type === "INCOME") {
                await db.account.update({
                    where: { id: defaultAccount.id },
                    data: { balance: { increment: transactionData.amount } },
                });
            } else {
                await db.account.update({
                    where: { id: defaultAccount.id },
                    data: { balance: { decrement: transactionData.amount } },
                });
            }

            // Upsert MonthlyPayment with transactionId
            await db.monthlyPayment.upsert({
                where,
                update: { paid: true, transactionId: newTx.id },
                create: {
                    year: data.year,
                    month: data.month,
                    refType: data.refType,
                    refId: data.refId,
                    paid: true,
                    transactionId: newTx.id,
                },
            });
        } else {
            // === MARKING AS UNPAID → Delete transaction ===
            const existing = await db.monthlyPayment.findUnique({ where });
            if (existing?.transactionId) {
                // Find the transaction to restore account balance
                const tx = await db.transaction.findUnique({ where: { id: existing.transactionId } });
                if (tx) {
                    // Reverse the balance change
                    if (tx.type === "INCOME") {
                        await db.account.update({
                            where: { id: tx.accountId },
                            data: { balance: { decrement: tx.amount } },
                        });
                    } else {
                        await db.account.update({
                            where: { id: tx.accountId },
                            data: { balance: { increment: tx.amount } },
                        });
                    }
                    await db.transaction.delete({ where: { id: existing.transactionId } });
                }
            }

            // Update MonthlyPayment
            await db.monthlyPayment.upsert({
                where,
                update: { paid: false, transactionId: null },
                create: {
                    year: data.year,
                    month: data.month,
                    refType: data.refType,
                    refId: data.refId,
                    paid: false,
                },
            });
        }

        revalidatePath("/finance");
        return { success: true };
    } catch (error: any) {
        console.error("[toggleMonthlyPayment]", error?.message);
        return { success: false, message: "Error al actualizar" };
    }
}

export async function getMonthlyPayments(year: number, month: number) {
    try {
        const records = await db.monthlyPayment.findMany({
            where: { year, month },
        });
        const map: Record<string, boolean> = {};
        for (const r of records) {
            map[`${r.refType}-${r.refId}`] = r.paid;
        }
        return map;
    } catch (error: any) {
        console.error("[getMonthlyPayments]", error?.message);
        return {};
    }
}
