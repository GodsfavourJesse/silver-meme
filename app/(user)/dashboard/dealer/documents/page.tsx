"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DealerDocumentsPage from "@/app/components/userComponents/dealer/documents/DealerDocumentsPage";

function DealerDocumentsRoute() {
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("applicationId") ?? "";

    return <DealerDocumentsPage applicationId={applicationId} />;
}

export default function DealerDocumentsRoutePage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen animate-pulse bg-[#F8F7FC] p-5">
                    <div className="mx-auto max-w-7xl space-y-5">
                        <div className="h-12 w-64 rounded-xl bg-gray-200" />
                        <div className="h-64 rounded-3xl bg-gray-200" />
                    </div>
                </main>
            }
        >
            <DealerDocumentsRoute />
        </Suspense>
    );
}