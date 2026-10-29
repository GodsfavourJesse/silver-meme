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
            className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="h-5 w-40 animate-pulse rounded-md bg-slate-100" />

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />

                    <div className="space-y-4">
                        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-100" />
                        <div className="h-6 w-1/3 animate-pulse rounded-lg bg-slate-100" />
                        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
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