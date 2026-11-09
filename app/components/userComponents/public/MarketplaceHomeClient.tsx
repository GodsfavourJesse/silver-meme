"use client";

import { useHomepageVehicles } from "@/app/hooks/user/homepage/useHomePageVehicles";
import { DesktopHome } from "./Desktop/DesktopHome";
import { MobileHome } from "./Mobile/MobileHome";

export function MarketplaceHomeClient() {
    const homepageVehicles = useHomepageVehicles();

    return (
        <>
            <div className="hidden md:block">
                <DesktopHome
                    homepageVehicles={homepageVehicles}
                />
            </div>

            <div className="block md:hidden">
                <MobileHome
                    homepageVehicles={homepageVehicles}
                />
            </div>
        </>
    );
}