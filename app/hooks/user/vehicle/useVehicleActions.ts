"use client";

import { useEffect, useState } from "react";

import {
    addListingToFavorites,
    getListingFavoriteStatus,
    recordMarketplaceListingShare,
    removeListingFromFavorites,
} from "@/app/services/user/marketplace/marketplace.service";
import { getErrorMessage, isAuthenticationError } from "@/app/lib/user/vehicle/vehicle-details-format";

interface UseVehicleActionsOptions {
    listingId: string | null;
    title: string;
}

/**
 * Favourite and share actions share one error channel, so the
 * page shows a single message area for both.
 */
export function useVehicleActions({
    listingId,
    title,
}: UseVehicleActionsOptions) {
    const [favorite, setFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [shareMessage, setShareMessage] = useState("");
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        if (!listingId) {
            return;
        }

        const id = listingId;

        let cancelled = false;

        async function loadFavoriteStatus() {
            try {
                const response = await getListingFavoriteStatus(id);

                if (!cancelled) {
                    setFavorite(response.data.favorited);
                }
            } catch {
                /*
                 * Signed-out visitors simply see the vehicle as
                 * not saved. The status is not essential.
                 */
            }
        }

        void loadFavoriteStatus();

        return () => {
            cancelled = true;
        };
    }, [listingId]);

    async function toggleFavorite() {
        if (!listingId || favoriteLoading) {
            return;
        }

        setActionError("");
        setFavoriteLoading(true);

        try {
            if (favorite) {
                await removeListingFromFavorites(listingId);

                setFavorite(false);
            } else {
                await addListingToFavorites(listingId);

                setFavorite(true);
            }
        } catch (error) {
            if (isAuthenticationError(error)) {
                setActionError("Sign in to save vehicles to your favourites.");
            } else {
                setActionError(getErrorMessage(error));
            }
        } finally {
            setFavoriteLoading(false);
        }
    }

    async function share() {
        if (!listingId) {
            return;
        }

        setShareMessage("");
        setActionError("");

        const url = window.location.href;

        try {
            if (typeof navigator.share === "function") {
                await navigator.share({
                    title,
                    text: `View this vehicle on KARMASS: ${title}`,
                    url,
                });

                setShareMessage("Vehicle sharing opened.");

                try {
                    await recordMarketplaceListingShare(listingId, "OTHER");
                } catch {
                    /*
                     * Sharing must still work if analytics
                     * cannot be recorded.
                     */
                }

                return;
            }

            await navigator.clipboard.writeText(url);

            setShareMessage("Vehicle link copied to your clipboard.");

            try {
                await recordMarketplaceListingShare(listingId, "COPY_LINK");
            } catch {
                /*
                 * Copying the link is the primary user action.
                 * Analytics failure is non-blocking.
                 */
            }
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                return;
            }

            setActionError(
                "Unable to share the vehicle. You can copy the page address from your browser.",
            );
        }
    }

    return {
        favorite,
        favoriteLoading,
        shareMessage,
        actionError,
        toggleFavorite,
        share,
    };
}