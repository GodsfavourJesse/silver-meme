import { Suspense } from "react";
import type { Metadata } from "next";

import { VehicleDetailsPage } from "@/app/components/userComponents/vehicle-details/VehicleDetailspage";

export const metadata: Metadata = {
    title: "Vehicle Details | KARMASS",
    description:
        "Explore vehicle specifications, photos, seller information, and buying safety guidance on KARMASS.",
};

interface VehicleDetailsRouteProps {
    params: Promise<{
        listingId: string;
    }>;
}

function VehicleDetailsFallback() {
    return (
        <main
            aria-busy="true"
            aria-label="Loading vehicle details"
            className="min-h-screen bg-[#F7F9FC] px-4 pb-12 pt-6 sm:px-6 lg:px-10"
        >
            <div className="mx-auto max-w-[1440px]">
                {/* Breadcrumb placeholder */}
                <div className="mb-7 h-4 w-44 animate-pulse rounded bg-slate-200/80" />

                <div className="grid gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(350px,0.85fr)] lg:gap-10">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200/70 sm:rounded-3xl" />

                        <div className="hidden rounded-2xl border border-slate-200 bg-white p-6 lg:block">
                            <div className="mb-5 h-5 w-40 animate-pulse rounded bg-slate-200" />

                            <div className="grid grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-12 animate-pulse rounded-lg bg-slate-100"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                            <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />

                            <div className="mt-5 h-9 w-1/2 animate-pulse rounded bg-slate-200" />

                            <div className="mt-5 flex gap-3">
                                <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
                                <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />
                            </div>

                            <div className="mt-7 h-12 w-full animate-pulse rounded-xl bg-blue-100" />
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

                            <div className="mt-5 flex items-center gap-3">
                                <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />

                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

async function VehicleDetailsContent({
    params,
}: VehicleDetailsRouteProps) {
    const { listingId } = await params;

    return <VehicleDetailsPage listingId={listingId} />;
}

export default function VehicleDetailsRoute({
    params,
}: VehicleDetailsRouteProps) {
    return (
        <Suspense fallback={<VehicleDetailsFallback />}>
            <VehicleDetailsContent params={params} />
        </Suspense>
    );
}