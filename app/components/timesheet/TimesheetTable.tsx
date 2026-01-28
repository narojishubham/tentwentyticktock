"use client";

import { useRouter } from "next/navigation";
import { Timesheet, TimesheetStatus, formatDateRange } from "@/app/types/timesheet";

interface Props {
    timesheets: Timesheet[];
    onView: (ts: Timesheet) => void;
    onUpdate: (ts: Timesheet) => void;
    onCreate: (ts: Timesheet) => void;
    onSort?: (column: string) => void;
    currentSort?: { column: string; direction: "asc" | "desc" };
}

const statusConfig: Record<TimesheetStatus, { label: string; className: string }> = {
    completed: {
        label: "COMPLETED",
        className: "bg-green-100 text-green-700 border border-green-200",
    },
    incomplete: {
        label: "INCOMPLETE",
        className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    },
    missing: {
        label: "MISSING",
        className: "bg-red-100 text-red-700 border border-red-200",
    },
};

function SortIcon({ active, direction }: { active?: boolean; direction?: "asc" | "desc" }) {
    if (!active) return (
        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
    return (
        <svg className={`w-3 h-3 text-blue-600 transition-transform ${direction === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
}

export default function TimesheetTable({
    timesheets,
    onView,
    onUpdate,
    onCreate,
    onSort,
    currentSort
}: Props) {
    const router = useRouter();

    const handleRowClick = (ts: Timesheet) => {
        router.push(`/dashboard/timesheet/${ts.id}`);
    };

    const getActionButton = (ts: Timesheet, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        switch (ts.status) {
            case "completed":
                onView(ts);
                break;
            case "incomplete":
                onUpdate(ts);
                break;
            case "missing":
                onCreate(ts);
                break;
        }
    };

    const getActionLabel = (status: TimesheetStatus) => {
        switch (status) {
            case "completed": return "View";
            case "incomplete": return "Update";
            case "missing": return "Create";
        }
    };

    if (timesheets.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                No timesheets found matching your filters.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th
                            className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => onSort?.("week")}
                        >
                            <div className="flex items-center gap-1">
                                Week #
                                <SortIcon active={currentSort?.column === "week"} direction={currentSort?.direction} />
                            </div>
                        </th>
                        <th
                            className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => onSort?.("date")}
                        >
                            <div className="flex items-center gap-1">
                                Date
                                <SortIcon active={currentSort?.column === "date"} direction={currentSort?.direction} />
                            </div>
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                                Status
                                <SortIcon active={currentSort?.column === "status"} direction={currentSort?.direction} />
                            </div>
                        </th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {timesheets.map((ts, index) => {
                        const statusStyle = statusConfig[ts.status];
                        return (
                            <tr
                                key={ts.id}
                                onClick={() => handleRowClick(ts)}
                                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${index === timesheets.length - 1 ? "border-b-0" : ""
                                    }`}
                            >
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                    {ts.week}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {formatDateRange(ts.startDate, ts.endDate)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded ${statusStyle.className}`}>
                                        {statusStyle.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => handleRowClick(ts)}
                                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                    >
                                        {getActionLabel(ts.status)}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}