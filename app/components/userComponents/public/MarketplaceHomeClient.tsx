"use client";

import { useMarketplaceSearch } from "@/app/hooks/user/useMarketplaceSearch";
import { DesktopHome } from "./Desktop/DesktopHome";
import { MobileHome } from "./Mobile/MobileHome";

export type MarketplaceHomeState = ReturnType<
    typeof useMarketplaceSearch
>;

export function MarketplaceHomeClient() {
    const marketplace = useMarketplaceSearch();

    return (
        <>
            <div className="hidden md:block">
                <DesktopHome marketplace={marketplace} />
            </div>

            <div className="block md:hidden">
                <MobileHome marketplace={marketplace} />
            </div>
        </>
    );
}