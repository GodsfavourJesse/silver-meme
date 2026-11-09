"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getFeaturedMarketplaceListings,
    searchMarketplace,
} from "@/app/services/user/marketplace/marketplace.service";

import type {
    MarketplaceSearchResult,
} from "@/app/types/user/marketplace.types";

const HOMEPAGE_LATEST_LIMIT = 6;
const HOMEPAGE_FEATURED_LIMIT = 12;

const LOAD_ERROR =
    "Unable to load vehicles. Please check your connection and try again.";

export function useHomepageVehicles() {
    const [featuredVehicles, setFeaturedVehicles] = useState<
        MarketplaceSearchResult[]
    >([]);

    const [latestVehicles, setLatestVehicles] = useState<
        MarketplaceSearchResult[]
    >([]);

    const [featuredLoading, setFeaturedLoading] = useState(true);
    const [latestLoading, setLatestLoading] = useState(true);

    const [featuredError, setFeaturedError] = useState("");
    const [latestError, setLatestError] = useState("");

    const [featuredRetryCount, setFeaturedRetryCount] = useState(0);
    const [latestRetryCount, setLatestRetryCount] = useState(0);

    /* ---------------------------------------------------------
       FEATURED VEHICLES
    --------------------------------------------------------- */

    useEffect(() => {
        let active = true;

        async function loadFeatured() {
            setFeaturedLoading(true);
            setFeaturedError("");

            try {
                const response =
                    await getFeaturedMarketplaceListings({
                        page: 1,
                        limit: HOMEPAGE_FEATURED_LIMIT,
                    });

                if (!active) return;

                setFeaturedVehicles(
                    response.data.listings ?? [],
                );
            } catch {
                if (!active) return;

                setFeaturedError(LOAD_ERROR);
            } finally {
                if (active) {
                    setFeaturedLoading(false);
                }
            }
        }

        void loadFeatured();

        return () => {
            active = false;
        };
    }, [featuredRetryCount]);

    /* ---------------------------------------------------------
       LATEST VEHICLES
    --------------------------------------------------------- */

    useEffect(() => {
        let active = true;

        async function loadLatest() {
            setLatestLoading(true);
            setLatestError("");

            try {
                const response = await searchMarketplace({
                    page: 1,
                    limit: HOMEPAGE_LATEST_LIMIT,
                    sort: "newest",
                });

                if (!active) return;

                setLatestVehicles(
                    response.data.listings ?? [],
                );
            } catch {
                if (!active) return;

                setLatestError(LOAD_ERROR);
            } finally {
                if (active) {
                    setLatestLoading(false);
                }
            }
        }

        void loadLatest();

        return () => {
            active = false;
        };
    }, [latestRetryCount]);

    /* ---------------------------------------------------------
       RETRY
    --------------------------------------------------------- */

    const retryFeatured = useCallback(() => {
        setFeaturedRetryCount((current) => current + 1);
    }, []);

    const retryLatest = useCallback(() => {
        setLatestRetryCount((current) => current + 1);
    }, []);

    return {
        featuredVehicles,
        featuredLoading,
        featuredError,
        retryFeatured,

        latestVehicles,
        latestLoading,
        latestError,
        retryLatest,
    };
}