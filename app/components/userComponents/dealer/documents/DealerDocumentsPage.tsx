"use client";

import { useEffect, useState } from "react";

import DealerDocumentsMobile from "./DealerDocumentsMobile";
import DealerDocumentsDesktop from "./DealerDocumentsDesktop";

interface DealerDocumentsPageProps {
    applicationId: string;
}

export default function DealerDocumentsPage({
    applicationId,
}: DealerDocumentsPageProps) {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 767px)");

        const updateViewport = () => {
            setIsMobile(mediaQuery.matches);
        };

        updateViewport();
        
        mediaQuery.addEventListener("change", updateViewport);

        return () => {
            mediaQuery.removeEventListener("change", updateViewport);
        };
    }, []);

    if (isMobile === null) {
        return (
            <main className="min-h-screen animate-pulse bg-[#F8F7FC] p-5">
                <div className="mx-auto max-w-7xl space-y-5">
                <div className="h-12 w-64 rounded-xl bg-gray-200" />
                <div className="h-36 rounded-3xl bg-gray-200" />
                <div className="h-64 rounded-3xl bg-gray-200" />
                </div>
            </main>
        );
    }

    return isMobile ? (
        <DealerDocumentsMobile 
            applicationId={applicationId} 
        />
    ) : (
        <DealerDocumentsDesktop 
            applicationId={applicationId} 
        />
    );
}