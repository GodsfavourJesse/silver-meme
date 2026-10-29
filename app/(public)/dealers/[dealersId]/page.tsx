"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

import PublicDealerProfileClient from "./PublicDealerProfileClient";

function DealerProfileRouteContent() {
    const params = useParams<{ dealerId: string }>();
    const dealerId = params?.dealerId;

    if (!dealerId || typeof dealerId !== "string") {
        return <DealerProfileLoading />;
    }

    return <PublicDealerProfileClient dealerId={dealerId} />;
}

function DealerProfileLoading() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F7FB] px-5">
            <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#7008E7] text-2xl font-black text-white shadow-xl shadow-purple-200">
                    K
                </div>

                <div className="mt-5 h-5 w-36 animate-pulse rounded-lg bg-gray-200" />

                <div className="mt-2 h-3 w-48 animate-pulse rounded-lg bg-gray-100" />

                <p className="mt-5 text-xs font-medium text-gray-400">
                    Loading dealer profile...
                </p>
            </div>
        </main>
    );
}

export default function PublicDealerProfilePage() {
    return (
        <Suspense fallback={<DealerProfileLoading />}>
            <DealerProfileRouteContent />
        </Suspense>
    );
}