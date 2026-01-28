import { Timesheet, calculateStatus } from "@/app/types/timesheet";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

function getWeekStart(year: number, weekNumber: number): Date {
    const jan1 = new Date(year, 0, 1);
    const daysToMonday = (8 - jan1.getDay()) % 7;
    const firstMonday = new Date(year, 0, 1 + daysToMonday);
    const targetMonday = new Date(firstMonday);
    targetMonday.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
    return targetMonday;
}

function generateSampleTimesheets(): Timesheet[] {
    const samples: Timesheet[] = [];
    const year = 2024;

    for (let week = 1; week <= 99; week++) {
        const startDate = getWeekStart(year, week);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 4);

        let hours: number;
        if (week % 5 === 0) {
            hours = 0;
        } else if (week % 3 === 0) {
            hours = 20 + Math.floor(Math.random() * 15);
        } else {
            hours = 40;
        }

        samples.push({
            id: uuidv4(),
            week,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            hours,
            status: calculateStatus(hours),
        });
    }

    return samples;
}

let timesheets: Timesheet[] = generateSampleTimesheets();

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    const status = searchParams.get("status");
    const startDateFilter = searchParams.get("startDate");
    const endDateFilter = searchParams.get("endDate");

    let filtered = [...timesheets];

    if (status && status !== "all") {
        filtered = filtered.filter(ts => ts.status === status);
    }

    if (startDateFilter && endDateFilter) {
        const filterStart = new Date(startDateFilter);
        const filterEnd = new Date(endDateFilter);

        filtered = filtered.filter(ts => {
            const tsStart = new Date(ts.startDate);
            const tsEnd = new Date(ts.endDate);
            return tsStart <= filterEnd && tsEnd >= filterStart;
        });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
        data: paginated,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        }
    });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const hours = body.hours || 0;
    const newTs: Timesheet = {
        id: uuidv4(),
        ...body,
        status: calculateStatus(hours),
    };
    timesheets.push(newTs);
    return NextResponse.json(newTs);
}

export async function PUT(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    const body = await req.json();
    const index = timesheets.findIndex((ts) => ts.id === id);
    if (index !== -1) {
        const hours = body.hours !== undefined ? body.hours : timesheets[index].hours;
        timesheets[index] = {
            ...timesheets[index],
            ...body,
            status: calculateStatus(hours),
        };
        return NextResponse.json(timesheets[index]);
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
}