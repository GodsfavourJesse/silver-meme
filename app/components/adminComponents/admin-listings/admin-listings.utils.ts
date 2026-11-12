import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    XCircle,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type { PendingListing } from "./admin-listings.types";


/**
 * Format monetary values.
 */
export function formatMoney(
    value: string | number,
    currency = "NGN",
): string {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return `${currency} ${value}`;
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${value}`;
    }
}

/**
 * Generate a readable vehicle label.
 */
export function vehicleLabel(item: PendingListing): string {
    return [
        item.vehicleVariant?.year,
        item.vehicleMake?.name,
        item.vehicleModel?.name,
        item.vehicleGeneration?.name,
        item.vehicleVariant?.name,
    ]
        .filter(Boolean)
        .join(" ");
}

/**
 * Determine whether a listing can be approved.
 *
 * Every listing image must pass image verification.
 */
export function canApprove(item: PendingListing): boolean {
    return (
        item.images.length > 0 &&
        item.images.every(
            (image) => image.imageCheckStatus === "PASSED",
        )
    );
}

/**
 * Get image verification counts.
 */
export function imageCounts(item: PendingListing) {
    return {
        total: item.images.length,

        passed: item.images.filter(
            (image) => image.imageCheckStatus === "PASSED",
        ).length,

        pending: item.images.filter(
            (image) => image.imageCheckStatus === "PENDING",
        ).length,

        review: item.images.filter(
            (image) => image.imageCheckStatus === "REVIEW",
        ).length,

        failed: item.images.filter(
            (image) => image.imageCheckStatus === "FAILED",
        ).length,
    };
}

/**
 * Get the visual status configuration for an image.
 */
export function imageStatus(status: string): {
    label: string;
    Icon: LucideIcon;
    className: string;
} {
    switch (status) {
        case "PASSED":
            return {
                label: "Passed",
                Icon: CheckCircle2,
                className:
                    "border-emerald-200 bg-emerald-50 text-emerald-700",
            };

        case "FAILED":
            return {
                label: "Failed",
                Icon: XCircle,
                className:
                    "border-red-200 bg-red-50 text-red-700",
            };

        case "REVIEW":
            return {
                label: "Needs review",
                Icon: AlertTriangle,
                className:
                    "border-amber-200 bg-amber-50 text-amber-700",
            };

        default:
            return {
                label: "Scanning",
                Icon: Clock3,
                className:
                    "border-sky-200 bg-sky-50 text-sky-700",
            };
    }
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || null;

/**
 * Generate an authenticated backend image endpoint.
 *
 * The browser retrieves images through the KARMASS API.
 * Cloudinary URLs and storage credentials are never exposed.
 */
export function imageUrl(
    listingId?: string | null,
    imageId?: string | null,
): string | null {
    if (!API_BASE_URL || !listingId || !imageId) {
        return null;
    }

    return [
        API_BASE_URL,
        "admin/listings/moderation",
        encodeURIComponent(listingId),
        "images",
        encodeURIComponent(imageId),
    ].join("/");
}