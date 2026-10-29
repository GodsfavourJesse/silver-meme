"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getMarketplaceListingDetails,
    searchMarketplace,
} from "@/app/services/user/marketplace/marketplace.service";
import type { MarketplaceSearchResult } from "@/app/types/user/marketplace.types";
import type { VehicleDetailsResponse } from "@/app/types/user/vehicle-details.types";
import { getErrorMessage } from "@/app/lib/user/vehicle/vehicle-details-format";

export function useVehicleDetails(listingId: string) {
    const [details, setDetails] = useState<VehicleDetailsResponse | null>(null);

    const [similarVehicles, setSimilarVehicles] = useState<
        MarketplaceSearchResult[]
    >([]);

    const [loading, setLoading] = useState(true);

    const [pageError, setPageError] = useState("");

    const loadDetails = useCallback(async () => {
        setLoading(true);
        setPageError("");
        setDetails(null);
        setSimilarVehicles([]);

        try {
            const response = await getMarketplaceListingDetails(listingId);

            if (!response.success || !response.data?.listing) {
                throw new Error(
                    response.message ?? "Unable to load this vehicle.",
                );
            }

            const vehicle = response.data;

            setDetails(vehicle);

            /*
             * Similar vehicles use the existing marketplace
             * search API. The current listing is excluded below.
             */
            try {
                const searchResponse = await searchMarketplace({
                    makeId: vehicle.make.id,
                    limit: 8,
                    page: 1,
                    sort: "relevance",
                });

                setSimilarVehicles(
                    searchResponse.data.listings
                        .filter((item) => item.listing.id !== vehicle.listing.id)
                        .slice(0, 4),
                );
            } catch {
                /*
                 * Similar vehicles are supplementary.
                 * Their failure must not break the details page.
                 */
                setSimilarVehicles([]);
            }
        } catch (error) {
            setPageError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        void loadDetails();
    }, [loadDetails]);

    return {
        details,
        similarVehicles,
        loading,
        pageError,
        reload: loadDetails,
    };
}