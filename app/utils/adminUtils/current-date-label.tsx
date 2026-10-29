"use client";

import { useEffect, useState } from "react";

export function CurrentDateLabel() {
    const [label, setLabel] = useState("");

    useEffect(() => {
        setLabel(
            new Intl.DateTimeFormat("en-NG", {
                dateStyle: "full",
            }).format(new Date()),
        );
    }, []);

    return <>{label || "KARMASS administration"}</>;
}
