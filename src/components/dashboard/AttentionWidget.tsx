import { getAttentionItems } from "@/app/actions/dashboard-actions";
import { AttentionCenter } from "@/components/dashboard/AttentionCenter";

export async function AttentionWidget() {
    const attentionItems = await getAttentionItems();

    return (
        <AttentionCenter
            overdueTasks={attentionItems.overdueTasks}
            pendingInvoices={attentionItems.pendingInvoices}
            urgentProjects={attentionItems.urgentProjects}
        />
    );
}
