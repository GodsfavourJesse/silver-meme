import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./providers/query-provider";
import { Toaster } from "sonner";

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
    title: {
        default: "KARMASS | Buy and Sell Cars",
        template: "%s | KARMASS",
    },
    description: "Discover cars, compare vehicles, and connect with sellers on KARMASS, your automotive marketplace.",
    applicationName: "KARMASS",
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
    themeColor: "#0a0912",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return ( 
        <html 
            lang="en" 
            className={outfit.variable}
        > 
            <body suppressHydrationWarning>
                <QueryProvider>
                    {children}
                </QueryProvider>

                <Toaster position="top-right" richColors />
            </body> 
        </html>
    );
}
