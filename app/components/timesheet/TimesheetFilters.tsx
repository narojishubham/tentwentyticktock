"use client";

import { useState } from "react";

interface FilterProps {
    currentStatus?: string;
    currentDateRange?: string;
    onFilterChange: (filters: {
        status?: string;
        startDate?: string;
        endDate?: string;
    }, dateRangeKey?: string) => void;
}

export default function TimesheetFilters({
    currentStatus = "all",
    currentDateRange = "all",
    onFilterChange
}: FilterProps) {
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);

    const statusOptions = [
        { value: "all", label: "All Statuses" },
        { value: "completed", label: "Completed" },
        { value: "incomplete", label: "Incomplete" },
        { value: "missing", label: "Missing" },
    ];

    // Generate date range options (last 4 weeks, this month, last month, custom)
    const getDateRangeOptions = () => {
        const today = new Date();
        const options = [
            { value: "all", label: "All Time", startDate: "", endDate: "" },
        ];

        // This week
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay() + 1);
        const thisWeekEnd = new Date(thisWeekStart);
        thisWeekEnd.setDate(thisWeekStart.getDate() + 4);
        options.push({
            value: "this-week",
            label: "This Week",
            startDate: thisWeekStart.toISOString().split("T")[0],
            endDate: thisWeekEnd.toISOString().split("T")[0],
        });

        // Last 4 weeks
        const fourWeeksAgo = new Date(today);
        fourWeeksAgo.setDate(today.getDate() - 28);
        options.push({
            value: "last-4-weeks",
            label: "Last 4 Weeks",
            startDate: fourWeeksAgo.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
        });

        // This month
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        options.push({
            value: "this-month",
            label: "This Month",
            startDate: thisMonthStart.toISOString().split("T")[0],
            endDate: thisMonthEnd.toISOString().split("T")[0],
        });

        // Last month
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        options.push({
            value: "last-month",
            label: "Last Month",
            startDate: lastMonthStart.toISOString().split("T")[0],
            endDate: lastMonthEnd.toISOString().split("T")[0],
        });

        // Q1 2024
        options.push({
            value: "q1-2024",
            label: "Q1 2024",
            startDate: "2024-01-01",
            endDate: "2024-03-31",
        });

        return options;
    };

    const dateRangeOptions = getDateRangeOptions();

    const handleStatusChange = (value: string) => {
        setIsStatusOpen(false);
        const currentDateOption = dateRangeOptions.find(o => o.value === currentDateRange);
        onFilterChange({
            status: value === "all" ? undefined : value,
            startDate: currentDateOption?.startDate || undefined,
            endDate: currentDateOption?.endDate || undefined,
        }, currentDateRange);
    };

    const handleDateRangeChange = (value: string) => {
        setIsDateOpen(false);
        const option = dateRangeOptions.find(o => o.value === value);
        onFilterChange({
            status: currentStatus === "all" ? undefined : currentStatus,
            startDate: option?.startDate || undefined,
            endDate: option?.endDate || undefined,
        }, value);
    };

    return (
        <div className="flex gap-3 mb-6">
            {/* Date Range Filter */}
            <div className="relative">
                <button
                    onClick={() => {
                        setIsDateOpen(!isDateOpen);
                        setIsStatusOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors min-w-[140px]"
                >
                    <span>{dateRangeOptions.find(o => o.value === currentDateRange)?.label || "Date Range"}</span>
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isDateOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
                        {dateRangeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleDateRangeChange(option.value)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${currentDateRange === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Status Filter */}
            <div className="relative">
                <button
                    onClick={() => {
                        setIsStatusOpen(!isStatusOpen);
                        setIsDateOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors min-w-[120px]"
                >
                    <span>{statusOptions.find(o => o.value === currentStatus)?.label || "Status"}</span>
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isStatusOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleStatusChange(option.value)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${currentStatus === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
