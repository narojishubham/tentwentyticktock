"use client";

import { useState, useEffect } from "react";
import { Task, sampleProjects, sampleWorkTypes } from "@/app/types/task";

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: Omit<Task, "id" | "timesheetId">) => void;
    date: string;
    initialData?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSave, date, initialData }: TaskModalProps) {
    const [project, setProject] = useState(sampleProjects[0]);
    const [typeOfWork, setTypeOfWork] = useState(sampleWorkTypes[0]);
    const [description, setDescription] = useState("");
    const [hours, setHours] = useState(12);

    useEffect(() => {
        if (initialData) {
            setProject(initialData.project);
            setTypeOfWork(initialData.typeOfWork);
            setDescription(initialData.description);
            setHours(initialData.hours);
        } else {
            setProject(sampleProjects[0]);
            setTypeOfWork(sampleWorkTypes[0]);
            setDescription("");
            setHours(12);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            date,
            project,
            typeOfWork,
            description,
            hours,
        });
    };

    return (
        <div className="fixed inset-0 bg-[#374151]/70 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-[700px] h-[670px] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[#1F2937]">
                        {initialData ? "Edit Entry" : "Add New Entry"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 flex-1">
                    {/* Project Selection */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-semibold text-[#374151] mb-1">
                            Select Project *
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </label>
                        <select
                            value={project}
                            onChange={(e) => setProject(e.target.value)}
                            className="w-[364px] h-[42px] px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer text-[#111827]"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                        >
                            {sampleProjects.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type of Work */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-semibold text-[#374151] mb-1">
                            Type of Work *
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </label>
                        <select
                            value={typeOfWork}
                            onChange={(e) => setTypeOfWork(e.target.value)}
                            className="w-[364px] h-[42px] px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer text-[#111827]"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                        >
                            {sampleWorkTypes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Task Description */}
                    <div>
                        <label className="text-sm font-semibold text-[#374151] mb-1 block">
                            Task description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Write text here ..."
                            className="w-[500px] min-h-[140px] p-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-700 placeholder-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">A note for extra info</p>
                    </div>

                    {/* Hours */}
                    <div>
                        <label className="text-sm font-semibold text-[#374151] mb-1 block">
                            Hours *
                        </label>
                        <div className="flex items-center w-max bg-white border border-gray-200 rounded-lg overflow-hidden h-[42px]">
                            <button
                                onClick={() => setHours(prev => Math.max(0, prev - 1))}
                                className="w-12 h-full flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-100"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <input
                                type="text"
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value) || 0)}
                                className="w-16 h-full text-center text-gray-700 font-medium focus:outline-none"
                            />
                            <button
                                onClick={() => setHours(prev => prev + 1)}
                                className="w-12 h-full flex items-center justify-center hover:bg-gray-50 transition-colors border-l border-gray-100"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-6 border-t border-gray-100 bg-white">
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            className="flex-1 h-12 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-all shadow-sm active:scale-[0.98]"
                        >
                            {initialData ? "Save changes" : "Add entry"}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 h-12 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
