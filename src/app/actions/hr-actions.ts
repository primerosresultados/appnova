"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function createEmployee(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const position = formData.get("position") as string;
    const salary = parseFloat(formData.get("salary") as string);
    const startDate = formData.get("startDate") as string;
    const email = formData.get("email") as string; // Optional
    const phone = formData.get("phone") as string; // Optional

    if (!name || !position || isNaN(salary) || !startDate) {
        return { success: false, message: "Faltan campos obligatorios" };
    }

    try {
        await db.employee.create({
            data: {
                name,
                position,
                salary,
                startDate: new Date(startDate),
                email: email || null,
                phone: phone || null,
                status: "ACTIVE"
            }
        });

        revalidatePath("/finance");
        return { success: true, message: "Colaborador agregado correctamente" };
    } catch (error) {
        console.error("Error creating employee:", error);
        return { success: false, message: "Error al crear colaborador" };
    }
}

export async function updateEmployee(prevState: any, formData: FormData) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const position = formData.get("position") as string;
    const salary = parseFloat(formData.get("salary") as string);
    const status = formData.get("status") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!id || !name || !position || isNaN(salary)) {
        return { success: false, message: "Información inválida" };
    }

    try {
        await db.employee.update({
            where: { id },
            data: {
                name,
                position,
                salary,
                status,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                email: email || null,
                phone: phone || null
            }
        });

        revalidatePath("/finance");
        return { success: true, message: "Colaborador actualizado" };
    } catch (error) {
        console.error("Error updating employee:", error);
        return { success: false, message: "Error al actualizar" };
    }
}

export async function deleteEmployee(id: string) {
    try {
        await db.employee.delete({ where: { id } });
        revalidatePath("/finance");
        return { success: true, message: "Colaborador eliminado" };
    } catch (error) {
        return { success: false, message: "Error al eliminar" };
    }
}

export async function processPayroll(accountId: string, date: Date) {
    if (!accountId) return { success: false, message: "Cuenta requerida" };

    try {
        const employees = await db.employee.findMany({
            where: { status: "ACTIVE" }
        });

        if (employees.length === 0) {
            return { success: false, message: "No hay empleados activos" };
        }

        const account = await db.account.findUnique({ where: { id: accountId } });
        if (!account) return { success: false, message: "Cuenta no encontrada" };

        let totalAmount = 0;
        const monthName = format(date, 'MMMM yyyy', { locale: es });

        // Create transactions in a transaction (prisma transaction)
        await db.$transaction(async (tx) => {
            for (const emp of employees) {
                await tx.transaction.create({
                    data: {
                        amount: emp.salary,
                        type: "EXPENSE",
                        category: "Nómina",
                        description: `Sueldo ${monthName} - ${emp.name}`,
                        accountId: accountId,
                        date: date,
                        status: "COMPLETED",
                    }
                });
                totalAmount += emp.salary;
            }

            // Update Account Balance
            await tx.account.update({
                where: { id: accountId },
                data: {
                    balance: {
                        decrement: totalAmount
                    }
                }
            });
        });

        revalidatePath("/finance");
        return { success: true, message: `Nómina procesada. Total: $${totalAmount.toLocaleString()}` };

    } catch (error) {
        console.error("Error processing payroll:", error);
        return { success: false, message: "Error al procesar nómina" };
    }
}
