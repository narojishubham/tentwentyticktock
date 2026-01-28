import { Task, sampleProjects, sampleWorkTypes } from "@/app/types/task";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

function generateSampleTasks(timesheetId: string, startDate: string, endDate: string, targetHours: number): Task[] {
    const tasks: Task[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
    }

    if (targetHours <= 0) return [];

    let remainingHours = targetHours;
    // Distribute hours across days
    while (remainingHours > 0) {
        const date = dates[Math.floor(Math.random() * dates.length)];
        const hours = Math.min(remainingHours, Math.random() < 0.3 ? 8 : 4);

        tasks.push({
            id: uuidv4(),
            timesheetId,
            date,
            description: "Work Engagement",
            typeOfWork: sampleWorkTypes[Math.floor(Math.random() * sampleWorkTypes.length)],
            hours,
            project: sampleProjects[Math.floor(Math.random() * sampleProjects.length)],
        });
        remainingHours -= hours;
    }

    return tasks;
}

const tasksStore: Map<string, Task[]> = new Map();

function getTasksForTimesheet(
    timesheetId: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    targetHours?: number
): Task[] {
    if (!tasksStore.has(timesheetId) && startDate && endDate) {
        if (status === "missing") {
            tasksStore.set(timesheetId, []);
        } else {
            const hours = targetHours !== undefined ? targetHours : 40;
            tasksStore.set(timesheetId, generateSampleTasks(timesheetId, startDate, endDate, hours));
        }
    }
    return tasksStore.get(timesheetId) || [];
}

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const timesheetId = searchParams.get("timesheetId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!timesheetId) {
        return NextResponse.json({ error: "timesheetId required" }, { status: 400 });
    }

    const status = searchParams.get("status");
    const hoursParam = searchParams.get("hours");
    const targetHours = hoursParam ? parseFloat(hoursParam) : undefined;

    const tasks = getTasksForTimesheet(
        timesheetId,
        status || undefined,
        startDate || undefined,
        endDate || undefined,
        targetHours
    );

    const totalHours = tasks.reduce((sum, t) => sum + t.hours, 0);

    return NextResponse.json({
        tasks,
        totalHours,
    });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { timesheetId, date, description, hours, project, typeOfWork } = body;

    if (!timesheetId || !date || !description) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTask: Task = {
        id: uuidv4(),
        timesheetId,
        date,
        description,
        typeOfWork,
        hours: hours || 0,
        project: project || "Project Name",
    };

    const tasks = tasksStore.get(timesheetId) || [];
    tasks.push(newTask);
    tasksStore.set(timesheetId, tasks);

    return NextResponse.json(newTask);
}

export async function PUT(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    const body = await req.json();

    if (!id) {
        return NextResponse.json({ error: "Task id required" }, { status: 400 });
    }

    // Find and update the task
    for (const [timesheetId, tasks] of tasksStore.entries()) {
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...body };
            tasksStore.set(timesheetId, tasks);
            return NextResponse.json(tasks[index]);
        }
    }

    return NextResponse.json({ error: "Task not found" }, { status: 404 });
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Task id required" }, { status: 400 });
    }

    // Find and delete the task
    for (const [timesheetId, tasks] of tasksStore.entries()) {
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            const deleted = tasks.splice(index, 1)[0];
            tasksStore.set(timesheetId, tasks);
            return NextResponse.json(deleted);
        }
    }

    return NextResponse.json({ error: "Task not found" }, { status: 404 });
}
