import Header from "@/app/components/layout/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
                {children}
            </main>
            <div className="w-full px-6 pb-6">
                <footer className="max-w-7xl mx-auto bg-white text-center text-sm text-gray-500 rounded-lg shadow-sm border border-gray-200 p-6">
                    © 2024 tentwenty. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
