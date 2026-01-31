"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTransaction(formData: FormData) {
    try {
        const amount = parseFloat(formData.get("amount") as string);
        const type = formData.get("type") as string;
        const category = formData.get("category") as string;
        const description = formData.get("description") as string;
        const accountId = formData.get("accountId") as string;
        const date = formData.get("date") as string; // ISO string

        if (!amount || !type || !accountId) {
            return { success: false, error: "Faltan campos requeridos" };
        }

        // 1. Create Transaction
        const transaction = await db.transaction.create({
            data: {
                amount,
                type,
                category,
                description,
                accountId,
                date: new Date(date),
                status: "COMPLETED", // For now, assume immediate completion
            },
        });

        // 2. Update Account Balance
        const account = await db.account.findUnique({ where: { id: accountId } });
        if (account) {
            let newBalance = account.balance;
            if (type === "INCOME") {
                newBalance += amount;
            } else {
                newBalance -= amount;
            }

            await db.account.update({
                where: { id: accountId },
                data: { balance: newBalance },
            });
        }

        revalidatePath("/finance");
        return { success: true, data: transaction };
    } catch (error) {
        console.error("Error creating transaction:", error);
        return { success: false, error: "Error al crear la transacción" };
    }
}

export async function createAccount(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const balance = parseFloat(formData.get("balance") as string);

    if (!name || isNaN(balance)) {
        return { success: false, message: "Nombre y saldo válidos requeridos" };
    }

    try {
        await db.account.create({
            data: {
                name,
                type: (type as any) || "BANK",
                balance
            }
        });

        revalidatePath("/finance");
        return { success: true, message: "Cuenta creada exitosamente" };
    } catch (error) {
        console.error("Error creating account:", error);
        return { success: false, message: "Error al crear la cuenta" };
    }
}

export async function deleteTransaction(id: string) {
    if (!id) return { success: false, message: "ID requerido" };

    try {
        // 1. Get transaction to revert balance
        const transaction = await db.transaction.findUnique({
            where: { id },
            include: { account: true }
        });

        if (!transaction) return { success: false, message: "Transacción no encontrada" };

        // 2. Revert Balance
        // If it was INCOME, we SUBTRACT. If EXPENSE, we ADD.
        let newBalance = transaction.account.balance;
        if (transaction.type === 'INCOME') {
            newBalance -= transaction.amount;
        } else {
            newBalance += transaction.amount;
        }

        await db.account.update({
            where: { id: transaction.accountId },
            data: { balance: newBalance }
        });

        // 3. Delete
        await db.transaction.delete({ where: { id } });

        revalidatePath("/finance");
        revalidatePath("/finance/transactions");
        return { success: true, message: "Transacción eliminada" };

    } catch (error) {
        console.error("Error deleting transaction:", error);
        return { success: false, message: "Error al eliminar transacción" };
    }
}


export async function createContract(prevState: any, formData: FormData) {
    const title = formData.get("title") as string;
    const clientId = formData.get("clientId") as string;
    const amountStr = formData.get("amount") as string;
    const frequency = formData.get("frequency") as string; // MONTHLY, ANNUALLY, ONE_OFF
    const startDateStr = formData.get("startDate") as string; // ISO
    const endDateStr = formData.get("endDate") as string; // ISO or empty
    const description = formData.get("description") as string;

    if (!title || !clientId || !amountStr || !startDateStr) {
        return { success: false, message: "Título, cliente, monto y fecha de inicio son requeridos" };
    }

    try {
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) return { success: false, message: "Monto inválido" };

        await db.contract.create({
            data: {
                title,
                clientId,
                amount,
                frequency: frequency || null,
                startDate: new Date(startDateStr),
                endDate: endDateStr ? new Date(endDateStr) : null,
                description: description || null,
                status: "ACTIVE"
            }
        });

        revalidatePath("/finance");
        return { success: true, message: "Acuerdo comercial creado correctamente" };
    } catch (error) {
        console.error("Error creating contract:", error);
        return { success: false, message: "Error al crear el acuerdo" };
    }
}


