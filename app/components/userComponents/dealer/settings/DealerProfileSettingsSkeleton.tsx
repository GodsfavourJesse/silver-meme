"use client";

export default function DealerProfileSettingsSkeleton() {
    return (
        <main className="min-h-screen bg-[#F8F7FC] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-7xl animate-pulse space-y-6">
                <div className="h-8 w-52 rounded-lg bg-gray-200" />

                <div className="h-40 rounded-2xl bg-gray-200 sm:h-56 lg:h-72" />

                <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <div className="h-72 rounded-2xl bg-gray-200" />
                    <div className="h-72 rounded-2xl bg-gray-200" />
                </div>
            </div>
        </main>
    );
}