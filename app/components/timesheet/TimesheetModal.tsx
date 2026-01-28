"use client";

import { z } from "zod";
import { useEffect } from "react";
import { Timesheet } from "@/app/types/timesheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const schema = z.object({
    week: z.number().min(1),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    hours: z.number().min(0).max(168),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onClose: () => void;
    onSave: (data: FormData) => void;
    initialData?: Partial<Timesheet>;
}

export default function TimesheetModal({ onClose, onSave, initialData }: Props) {
    const isViewMode = initialData?.status === "completed";

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            week: initialData?.week || 1,
            startDate: initialData?.startDate || new Date().toISOString().split("T")[0],
            endDate: initialData?.endDate || new Date().toISOString().split("T")[0],
            hours: initialData?.hours || 0,
        },
    });

    useEffect(() => {
        reset({
            week: initialData?.week || 1,
            startDate: initialData?.startDate || new Date().toISOString().split("T")[0],
            endDate: initialData?.endDate || new Date().toISOString().split("T")[0],
            hours: initialData?.hours || 0,
        });
    }, [initialData, reset]);

    const getTitle = () => {
        if (!initialData) return "Add Timesheet";
        if (isViewMode) return "View Timesheet";
        return initialData.status === "missing" ? "Create Timesheet Entry" : "Update Timesheet";
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">{getTitle()}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Week #
                            </label>
                            <input
                                type="number"
                                {...register("week", { valueAsNumber: true })}
                                disabled={isViewMode}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            {errors.week && <p className="text-red-500 text-sm mt-1">{errors.week.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    {...register("startDate")}
                                    disabled={isViewMode}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    {...register("endDate")}
                                    disabled={isViewMode}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Hours
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                {...register("hours", { valueAsNumber: true })}
                                disabled={isViewMode}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            {errors.hours && <p className="text-red-500 text-sm mt-1">{errors.hours.message}</p>}
                            <p className="text-xs text-gray-500 mt-1">
                                {isViewMode ? "" : "Enter 40 hours for completed status"}
                            </p>
                        </div>

                        {initialData?.status && (
                            <div className="bg-gray-50 rounded-lg px-4 py-3">
                                <span className="text-sm text-gray-600">Current Status: </span>
                                <span className={`text-sm font-medium ${initialData.status === "completed" ? "text-green-600" :
                                        initialData.status === "incomplete" ? "text-yellow-600" :
                                            "text-red-600"
                                    }`}>
                                    {initialData.status.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {isViewMode ? "Close" : "Cancel"}
                        </button>
                        {!isViewMode && (
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Save
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}