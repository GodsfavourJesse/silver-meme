"use client";

import {
    createContext,
    useContext,
    type ReactNode,
} from "react";

import { useMarketplaceSearch } from "@/app/hooks/user/useMarketplaceSearch";

type MarketplaceSearchContextValue = ReturnType<
    typeof useMarketplaceSearch
>;

const MarketplaceSearchContext =
    createContext<MarketplaceSearchContextValue | null>(null);

interface MarketplaceSearchProviderProps {
    children: ReactNode;
}

export function MarketplaceSearchProvider({
    children,
}: MarketplaceSearchProviderProps) {
    const marketplaceSearch = useMarketplaceSearch();

    return (
        <MarketplaceSearchContext.Provider value={marketplaceSearch}>
            {children}
        </MarketplaceSearchContext.Provider>
    );
}

export function useSharedMarketplaceSearch() {
    const context = useContext(MarketplaceSearchContext);

    if (!context) {
        throw new Error(
            "useSharedMarketplaceSearch must be used within MarketplaceSearchProvider.",
        );
    }

    return context;
}