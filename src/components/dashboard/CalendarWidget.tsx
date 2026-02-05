import { getCalendarEvents } from "@/app/actions/dashboard-actions";
import { MasterCalendar } from "@/components/dashboard/MasterCalendar";

export async function CalendarWidget() {
    const calendarData = await getCalendarEvents();

    return (
        <div className="my-4 md:my-6">
            <MasterCalendar
                events={calendarData.events}
                users={calendarData.users}
            />
        </div>
    );
}
