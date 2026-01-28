export type TimesheetStatus = "completed" | "incomplete" | "missing";

export interface Timesheet {
    id: string;
    week: number;
    startDate: string;
    endDate: string;
    hours: number;
    status: TimesheetStatus;
}

export function calculateStatus(hours: number): TimesheetStatus {
    if (hours === 0) return "missing";
    if (hours >= 40) return "completed";
    return "incomplete";
}

export function formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    const startFormatted = start.toLocaleDateString('en-GB', { day: 'numeric' });
    const endFormatted = end.toLocaleDateString('en-GB', formatOptions);

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        return `${startFormatted} - ${endFormatted}`;
    }

    const startFull = start.toLocaleDateString('en-GB', formatOptions);
    return `${startFull} - ${endFormatted}`;
}