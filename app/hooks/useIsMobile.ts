"use client";

import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            `(max-width: ${breakpoint - 1}px)`,
        );

        const updateViewport = () => {
            setIsMobile(mediaQuery.matches);
            setIsReady(true);
        };

        updateViewport();

        mediaQuery.addEventListener("change", updateViewport);

        return () => {
            mediaQuery.removeEventListener("change", updateViewport);
        };
    }, [breakpoint]);

    return {
        isMobile,
        isReady,
    };
}