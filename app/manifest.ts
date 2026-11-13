import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "KARMASS | Buy and Sell Cars",
        short_name: "KARMASS",
        description: "Discover cars, compare vehicles, and connect with sellers on KARMASS.",
        start_url: "/dashboard",
        scope: "/",
        display: "standalone",
        background_color: "#F6F9FC",
        theme_color: "#1491FF",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
                purpose: "any",
            },
        ],
    };
}
