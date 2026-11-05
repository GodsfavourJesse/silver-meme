"use client";

import NextTopLoader from "nextjs-toploader";

export default function GlobalLoadingBar() {
    return (
        <NextTopLoader
            color="#1491FF"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #1491FF, 0 0 5px #1491FF"
            zIndex={99999}
        />
    );
}