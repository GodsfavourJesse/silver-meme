"use client";

import { useEffect, useState } from "react";

/** Render a stable server/client placeholder, then resolve the browser year. */
export function CurrentYear() {
    const [year, setYear] = useState<number | null>(null);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return <>{year ?? ""}</>;
}
