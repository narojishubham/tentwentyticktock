"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Timesheet } from "../types/timesheet";
import TimesheetTable from "../components/timesheet/TimesheetTable";
import TimesheetFilters from "../components/timesheet/TimesheetFilters";
import Pagination from "../components/ui/Pagination";
import TimesheetModal from "../components/timesheet/TimesheetModal";

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 5,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState<{
        status?: string;
        startDate?: string;
        endDate?: string;
    }>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sort, setSort] = useState<{ column: string; direction: "asc" | "desc" }>({
        column: "week",
        direction: "desc",
    });

    const [dateRangeValue, setDateRangeValue] = useState("all");

    const fetchTimesheets = useCallback(async () => {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.set("page", pagination.page.toString());
        params.set("limit", pagination.limit.toString());

        if (filters.status) params.set("status", filters.status);
        if (filters.startDate) params.set("startDate", filters.startDate);
        if (filters.endDate) params.set("endDate", filters.endDate);

        const res = await fetch(`/api/timesheets?${params.toString()}`);
        if (res.ok) {
            const data = await res.json();
            setTimesheets(data.data);
            setPagination(prev => ({
                ...prev,
                total: data.pagination.total,
                totalPages: data.pagination.totalPages,
            }));
        }
        setIsLoading(false);
    }, [pagination.page, pagination.limit, filters]);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/login");
        } else {
            fetchTimesheets();
        }
    }, [session, status, router, fetchTimesheets]);

    const handleFilterChange = (newFilters: typeof filters, dateRangeKey?: string) => {
        setFilters(newFilters);
        if (dateRangeKey) setDateRangeValue(dateRangeKey);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSort = (column: string) => {
        setSort(prev => ({
            column,
            direction: prev.column === column && prev.direction === "desc" ? "asc" : "desc",
        }));
    };

    const sortedTimesheets = [...timesheets].sort((a, b) => {
        const { column, direction } = sort;
        let comparison = 0;
        if (column === "week") comparison = a.week - b.week;
        if (column === "date") comparison = a.startDate.localeCompare(b.startDate);
        if (column === "status") comparison = a.status.localeCompare(b.status);
        return direction === "asc" ? comparison : -comparison;
    });

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handleLimitChange = (limit: number) => {
        setPagination(prev => ({ ...prev, limit, page: 1 }));
    };

    const handleView = (ts: Timesheet) => {
        setEditingTimesheet(ts);
        setIsModalOpen(true);
    };

    const handleUpdate = (ts: Timesheet) => {
        setEditingTimesheet(ts);
        setIsModalOpen(true);
    };

    const handleCreate = (ts: Timesheet) => {
        setEditingTimesheet(ts);
        setIsModalOpen(true);
    };

    const handleSave = async (ts: Partial<Timesheet>) => {
        const method = editingTimesheet ? "PUT" : "POST";
        const url = editingTimesheet ? `/api/timesheets?id=${editingTimesheet.id}` : "/api/timesheets";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ts),
        });

        if (res.ok) {
            fetchTimesheets();
            setIsModalOpen(false);
            setEditingTimesheet(null);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Timesheets
                </h1>

                <TimesheetFilters
                    currentStatus={filters.status || "all"}
                    currentDateRange={dateRangeValue}
                    onFilterChange={handleFilterChange}
                />

                <TimesheetTable
                    timesheets={sortedTimesheets}
                    onView={handleView}
                    onUpdate={handleUpdate}
                    onCreate={handleCreate}
                    onSort={handleSort}
                    currentSort={sort}
                />

                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                />
            </div>

            {isModalOpen && (
                <TimesheetModal
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingTimesheet(null);
                    }}
                    onSave={handleSave}
                    initialData={editingTimesheet || undefined}
                />
            )}
        </div>
    );
}