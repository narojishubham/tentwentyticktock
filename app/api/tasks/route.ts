import { Task, sampleProjects, sampleWorkTypes } from "@/app/types/task";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

function generateSampleTasks(timesheetId: string, startDate: string, endDate: string): Task[] {
    const tasks: Task[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const numTasks = Math.floor(Math.random() * 3) + 1; // 1-3 tasks per day

        for (let i = 0; i < numTasks; i++) {
            tasks.push({
                id: uuidv4(),
                timesheetId,
                date: dateStr,
                description: "Homepage Development",
                typeOfWork: sampleWorkTypes[0],
                hours: 4,
                project: sampleProjects[Math.floor(Math.random() * sampleProjects.length)],
            });
        }
    }

    return tasks;
}

const tasksStore: Map<string, Task[]> = new Map();

function getTasksForTimesheet(timesheetId: string, status?: string, startDate?: string, endDate?: string): Task[] {
    if (!tasksStore.has(timesheetId) && startDate && endDate) {
        if (status === "missing") {
            tasksStore.set(timesheetId, []);
        } else {
            tasksStore.set(timesheetId, generateSampleTasks(timesheetId, startDate, endDate));
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
    const tasks = getTasksForTimesheet(
        timesheetId,
        status || undefined,
        startDate || undefined,
        endDate || undefined
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
