import type { Metadata } from "next";
import { DesktopHome } from "../components/userComponents/public/Desktop/DesktopHome";
import { MobileHome } from "../components/userComponents/public/Mobile/MobileHome";

export const metadata: Metadata = {
    title: "KARMASS | Discover, Buy and Sell Cars",
    description:
        "Discover cars, compare vehicles, and connect with sellers and verified dealers on KARMASS, your vehicle marketplace.",
    applicationName: "KARMASS",
    openGraph: {
        title: "KARMASS | Discover, Buy and Sell Cars",
        description:
            "Find your next car or connect with buyers for your vehicle on KARMASS.",
        siteName: "KARMASS",
        type: "website",
    },
};

export default function HomePage() {
    return (
        <>
            <div className="hidden md:block">
                <DesktopHome />
            </div>
            
            <div className="block md:hidden">
                <MobileHome />
            </div>
        </>
    );
}