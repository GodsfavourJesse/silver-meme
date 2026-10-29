import type {
    ListingStatus,
    ListingSummary,
    SellerListingItem,
} from "@/app/types/user/listings/listing.types";

import {
    DEFAULT_IMAGE_STATUS_LABEL,
    DEFAULT_IMAGE_STATUS_STYLE,
    EDITABLE_STATUSES,
    IMAGE_STATUS_LABELS,
    IMAGE_STATUS_STYLES,
    REACTIVATABLE_STATUSES,
    STATUS_FILTERS,
    SUBMITTABLE_STATUSES,
    type DashboardFilter,
} from "./my-listings.contants";

type ImageAnalysis = NonNullable<SellerListingItem["imageAnalysis"]>;

/* -------------------------------------------------------------------------- */
/*  Generic                                                                   */
/* -------------------------------------------------------------------------- */

/** Joins the given values with `separator`, skipping empty ones. */
function joinPresent(
    values: Array<string | null | undefined>,
    separator: string,
): string {
    return values
        .filter((value): value is string => Boolean(value?.trim()))
        .join(separator);
}

export function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
}

/* -------------------------------------------------------------------------- */
/*  Formatting                                                                */
/* -------------------------------------------------------------------------- */

export function formatStatus(status: ListingStatus): string {
    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatPrice(price: string | number, currency: string): string {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return `${currency} ${price}`;
    }

    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString("en-NG")}`;
    }
}

export function formatDate(dateValue: string | undefined): string {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

/* -------------------------------------------------------------------------- */
/*  Listing details                                                           */
/* -------------------------------------------------------------------------- */

export function getListingLocation(item: SellerListingItem): string {
    const { city, state, country } = item.listing;

    return joinPresent([city, state, country], ", ");
}

export function getVehicleName(item: SellerListingItem): string {
    return joinPresent(
        [
            item.vehicleMake?.name,
            item.vehicleModel?.name,
            item.vehicleGeneration?.name,
            item.vehicleVariant?.name,
        ],
        " ",
    );
}

export function matchesSearch(item: SellerListingItem, query: string): boolean {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    const searchableText = joinPresent(
        [
            item.listing.title,
            item.vehicleMake?.name,
            item.vehicleModel?.name,
            item.vehicleGeneration?.name,
            item.vehicleVariant?.name,
            item.listing.city,
            item.listing.state,
            item.listing.status,
        ],
        " ",
    ).toLowerCase();

    return searchableText.includes(normalizedQuery);
}

/* -------------------------------------------------------------------------- */
/*  Status & permissions                                                      */
/* -------------------------------------------------------------------------- */

export function getStatusCount(
    summary: ListingSummary,
    status: DashboardFilter,
): number {
    if (status === "ALL") {
        return summary.total;
    }

    return summary[status] ?? 0;
}

export const canEdit = (status: ListingStatus) =>
    EDITABLE_STATUSES.includes(status);

export const canSubmit = (status: ListingStatus) =>
    SUBMITTABLE_STATUSES.includes(status);

export const canReactivate = (status: ListingStatus) =>
    REACTIVATABLE_STATUSES.includes(status);

export const canMarkSold = (status: ListingStatus) => status === "APPROVED";

export const canRestore = (status: ListingStatus) => status === "DELETED";

export const canDelete = (status: ListingStatus) => status !== "DELETED";

/* -------------------------------------------------------------------------- */
/*  Summary cards                                                             */
/* -------------------------------------------------------------------------- */

export function getSummaryCards(summary: ListingSummary) {
    return [
        {
            label: "Total listings",
            value: summary.total,
            description: "All listing statuses",
            className: "text-slate-900",
        },
        {
            label: "Live listings",
            value: summary.APPROVED,
            description: "Approved by KARMASS",
            className: "text-emerald-700",
        },
        {
            label: "Pending review",
            value: summary.PENDING_REVIEW,
            description: "Awaiting a decision",
            className: "text-amber-700",
        },
        {
            label: "Drafts",
            value: summary.DRAFT,
            description: "Not yet submitted",
            className: "text-slate-600",
        },
    ];
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                               */
/* -------------------------------------------------------------------------- */

export function getEmptyStateCopy(
    searchQuery: string,
    activeFilter: DashboardFilter,
): { title: string; description: string } {
    if (searchQuery) {
        return {
            title: "No matching listings",
            description: "Try another vehicle name, model, or location.",
        };
    }

    if (activeFilter === "ALL") {
        return {
            title: "Your marketplace starts here",
            description:
                "Create your first vehicle listing and manage its progress from this dashboard.",
        };
    }

    const filterLabel = STATUS_FILTERS.find(
        (filter) => filter.value === activeFilter,
    )?.label.toLowerCase();

    return {
        title: `No ${filterLabel} yet`,
        description: "Listings that match this status will appear here.",
    };
}

/* -------------------------------------------------------------------------- */
/*  Image analysis                                                            */
/* -------------------------------------------------------------------------- */

export function getImageStatusLabel(status: string): string {
    return IMAGE_STATUS_LABELS[status] ?? DEFAULT_IMAGE_STATUS_LABEL;
}

export function getImageStatusStyles(status: string): string {
    return IMAGE_STATUS_STYLES[status] ?? DEFAULT_IMAGE_STATUS_STYLE;
}

export function hasPendingImageAnalysis(items: SellerListingItem[]): boolean {
    return items.some((item) => (item.imageAnalysis?.pending ?? 0) > 0);
}

export function getImageAnalysisMessage(item: SellerListingItem): string {
    const analysis = item.imageAnalysis;

    if (!analysis || analysis.total === 0) {
        return "No vehicle photos have been uploaded yet.";
    }

    if (analysis.pending > 0) {
        return `${analysis.pending} ${
            analysis.pending === 1 ? "image is" : "images are"
        } awaiting analysis.`;
    }

    if (analysis.failed > 0) {
        return `${analysis.failed} ${
            analysis.failed === 1 ? "image needs" : "images need"
        } attention.`;
    }

    if (analysis.review > 0) {
        return `${analysis.review} ${
            analysis.review === 1 ? "image needs" : "images need"
        } manual review.`;
    }

    if (analysis.passed === analysis.total) {
        return "All uploaded images have passed their checks.";
    }

    return "Image analysis status is available below.";
}

export function getImageStatCards(analysis: ImageAnalysis) {
    return [
        {
            label: "Pending",
            value: analysis.pending,
            style: "bg-amber-50 text-amber-700",
        },
        {
            label: "Passed",
            value: analysis.passed,
            style: "bg-emerald-50 text-emerald-700",
        },
        {
            label: "Review",
            value: analysis.review,
            style: "bg-orange-50 text-orange-700",
        },
        {
            label: "Failed",
            value: analysis.failed,
            style: "bg-red-50 text-red-700",
        },
    ];
}
