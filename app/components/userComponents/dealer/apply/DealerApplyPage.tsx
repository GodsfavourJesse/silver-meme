"use client";

import { useEffect, useState } from "react";
import DealerApplyMobile from "./DealerApplyMobile";
import DealerApplyDesktop from "./DealerApplyDesktop";

export default function DealerApplyPage() {
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
            <div className="min-h-screen bg-[#faf8ff] animate-pulse" />
        );
    }

    return isMobile ? (
        <DealerApplyMobile />
    ) : (
        <DealerApplyDesktop />
    );
}