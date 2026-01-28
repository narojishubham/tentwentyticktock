export interface Task {
    id: string;
    timesheetId: string;
    date: string; // ISO date
    description: string;
    typeOfWork: string;
    hours: number;
    project: string;
}

// Sample projects for demo
export const sampleProjects = [
    "Project Name",
    "Homepage Development",
    "API Integration",
    "UI/UX Design",
    "Backend Services",
    "Mobile App",
];

// Sample work types for demo
export const sampleWorkTypes = [
    "Bug fixes",
    "Feature Development",
    "Meetings",
    "Research",
    "Documentation",
    "Testing",
];
