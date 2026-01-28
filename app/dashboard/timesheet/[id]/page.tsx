"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Timesheet, formatDateRange } from "@/app/types/timesheet";
import { Task } from "@/app/types/task";
import TaskModal from "@/app/components/timesheet/TaskModal";

interface TasksByDate {
    [date: string]: Task[];
}

export default function TimesheetDetailPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const timesheetId = params.id as string;

    const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [totalHours, setTotalHours] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState("");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const fetchTimesheet = useCallback(async () => {
        const res = await fetch(`/api/timesheets?page=1&limit=100`);
        if (res.ok) {
            const data = await res.json();
            const ts = data.data.find((t: Timesheet) => t.id === timesheetId);
            if (ts) {
                setTimesheet(ts);
                return ts;
            }
        }
        return null;
    }, [timesheetId]);

    const fetchTasks = useCallback(async (ts: Timesheet) => {
        const res = await fetch(
            `/api/tasks?timesheetId=${ts.id}&startDate=${ts.startDate}&endDate=${ts.endDate}&status=${ts.status}&hours=${ts.hours}`
        );
        if (res.ok) {
            const data = await res.json();
            setTasks(data.tasks);
            setTotalHours(data.totalHours);
        }
    }, []);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/login");
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            const ts = await fetchTimesheet();
            if (ts) {
                await fetchTasks(ts);
            }
            setIsLoading(false);
        };

        loadData();
    }, [session, status, router, fetchTimesheet, fetchTasks]);

    const tasksByDate: TasksByDate = {};
    if (timesheet) {
        const start = new Date(timesheet.startDate);
        const end = new Date(timesheet.endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            tasksByDate[dateStr] = tasks.filter(t => t.date === dateStr);
        }
    }

    const formatDayLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    };

    const handleSaveTask = async (taskData: Omit<Task, "id" | "timesheetId">) => {
        const isEditing = !!selectedTask;
        const url = isEditing ? `/api/tasks?id=${selectedTask.id}` : '/api/tasks';
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...taskData,
                timesheetId,
            }),
        });

        if (res.ok) {
            const savedTask = await res.json();
            if (timesheet) {
                // Calculate new total hours to sync with timesheet
                const updatedTasks = isEditing
                    ? tasks.map(t => t.id === selectedTask.id ? savedTask : t)
                    : [...tasks, savedTask];

                const newTotalHours = updatedTasks.reduce((sum, t) => sum + t.hours, 0);

                // Update timesheet on server to keep dashboard in sync
                await fetch(`/api/timesheets?id=${timesheet.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hours: newTotalHours }),
                });

                await fetchTasks(timesheet);
                await fetchTimesheet();
            }
            setIsModalOpen(false);
            setSelectedTask(null);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const res = await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
        if (res.ok && timesheet) {
            const updatedTasks = tasks.filter(t => t.id !== taskId);
            const newTotalHours = updatedTasks.reduce((sum, t) => sum + t.hours, 0);

            // Update timesheet on server to keep dashboard in sync
            await fetch(`/api/timesheets?id=${timesheet.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hours: newTotalHours }),
            });

            await fetchTasks(timesheet);
            await fetchTimesheet();
        }
        setActiveMenu(null);
    };

    const openCreateModal = (date: string) => {
        setModalDate(date);
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setModalDate(task.date);
        setSelectedTask(task);
        setIsModalOpen(true);
        setActiveMenu(null);
    };

    const progressPercent = Math.min((totalHours / 40) * 100, 100);

    if (status === "loading" || isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!timesheet) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <p className="text-gray-500">Timesheet not found</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            This week&apos;s timesheet
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {formatDateRange(timesheet.startDate, timesheet.endDate)}
                        </p>
                    </div>

                    <div className="flex-1 max-w-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative mb-8">
                                {/* Tooltip */}
                                <div
                                    className="absolute bottom-full mb-2 transform -translate-x-1/2 flex flex-col items-center z-10"
                                    style={{ left: `${progressPercent}%` }}
                                >
                                    <div className="bg-white border border-gray-100 px-7 py-2 rounded-lg shadow-md text-sm font-semibold text-gray-900 whitespace-nowrap">
                                        {totalHours}/40 hrs
                                    </div>
                                    <div className="w-2.5 h-2.5 bg-white border-r border-b border-gray-100 transform rotate-45 -mt-1.5 shadow-sm"></div>
                                </div>

                                {/* Progress Bar Track */}
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-700 ease-out rounded-full ${progressPercent >= 100 ? 'bg-green-500' : 'bg-[#FF7F3E]'
                                            }`}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-400 mb-8">100%</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 space-y-6">
                    {Object.entries(tasksByDate).map(([date, dayTasks]) => (
                        <div key={date} className="border-t border-gray-100 pt-4">
                            <div className="flex items-start gap-8">

                                <div className="w-16 flex-shrink-0">
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatDayLabel(date)}
                                    </span>
                                </div>

                                <div className="flex-1 space-y-2">
                                    {dayTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 group"
                                        >
                                            <span className="text-sm text-gray-700">{task.description}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-500">{task.hours} hrs</span>
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                                    {task.project}
                                                </span>

                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveMenu(activeMenu === task.id ? null : task.id)}
                                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <circle cx="6" cy="12" r="2" />
                                                            <circle cx="12" cy="12" r="2" />
                                                            <circle cx="18" cy="12" r="2" />
                                                        </svg>
                                                    </button>

                                                    {activeMenu === task.id && (
                                                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                                                            <button
                                                                onClick={() => openEditModal(task)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTask(task.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => openCreateModal(date)}
                                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add new task
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                }}
                onSave={handleSaveTask}
                date={modalDate}
                initialData={selectedTask}
            />
        </div>
    );
}
