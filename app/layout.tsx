import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { QueryProvider } from "./providers/query-provider";
import { Toaster } from "sonner";
import GlobalLoadingBar from "./components/GlobalLoadingBar";

const outfit = localFont({
    src: "./fonts/outfit/Outfit-Variable.woff2",
    variable: "--font-outfit",
    display: "swap",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: {
        default: "KARMASS | Buy and Sell Cars",
        template: "%s | KARMASS",
    },
    description:
        "Discover cars, compare vehicles, and connect with sellers on KARMASS, your automotive marketplace.",
    applicationName: "KARMASS",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "KARMASS",
    },
    keywords: [
        "KARMASS",
        "cars for sale in Nigeria",
        "buy cars in Nigeria",
        "sell cars in Nigeria",
        "used cars",
        "car marketplace",
        "automotive marketplace",
    ],
    robots: {
        index: true,
        follow: true,
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#1491FF",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={outfit.variable}>
            <body suppressHydrationWarning>
                <GlobalLoadingBar />

                <QueryProvider>
                    {children}
                </QueryProvider>

                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}

