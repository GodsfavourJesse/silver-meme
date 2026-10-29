import type { Metadata } from "next";

import { MarketplaceSearchProvider } from "@/app/context/user/MarketplaceSearchProvider";

import { DesktopMarketplace } from "../../components/userComponents/marketplace/Desktop/DesktopMarketplace";
import { MobileMarketplace } from "../../components/userComponents/public/Mobile/MobileMarketplace";

export const metadata: Metadata = {
    title: "Find Cars for Sale | KARMASS",
    description:
        "Explore cars for sale across Nigeria. Search vehicles, compare prices, and discover listings from sellers and dealers on KARMASS.",
};

export default function MarketplacePage() {
    return (
        <MarketplaceSearchProvider>
            <div className="hidden md:block">
                <DesktopMarketplace />
            </div>

            <div className="block md:hidden">
                <MobileMarketplace />
            </div>
        </MarketplaceSearchProvider>
    );
}